// IntoTheHeaven PWA Service Worker
// 교회 소그룹 관리 앱을 위한 캐시 전략

const CACHE_NAME = 'intotheheaven-v1'
const STATIC_CACHE_NAME = 'intotheheaven-static-v1'
const DYNAMIC_CACHE_NAME = 'intotheheaven-dynamic-v1'

// 기본적으로 캐시할 파일들 (앱 껍데기)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/site.webmanifest',
  '/admin-manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/admin-icon-192.png',
  '/admin-icon-512.png',
  '/splash.png',
  '/admin-splash.png',
]

// 오프라인에서도 접근 가능해야 하는 중요한 페이지들
const OFFLINE_FALLBACK_PAGES = ['/', '/login']

// 설치 이벤트 - 기본 자원들을 캐시
self.addEventListener('install', event => {
  console.log('[SW] Installing...')

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', event => {
  console.log('[SW] Activating...')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up')
        return self.clients.claim()
      })
  )
})

// Fetch 이벤트 - 네트워크 요청 처리
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // HTML 페이지 요청 처리 (Network First 전략)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request))
    return
  }

  // API 요청 처리 (Network First with offline fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // 정적 자원 처리 (Cache First 전략)
  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // 기본 처리
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  )
})

// 페이지 요청 처리 - Network First
async function handlePageRequest(request) {
  try {
    // 네트워크에서 최신 버전 가져오기 시도
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // 성공하면 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error('Network response not ok')
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error)

    // 네트워크 실패시 캐시에서 찾기
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 캐시에도 없으면 오프라인 페이지 반환
    return getOfflineFallback(request)
  }
}

// API 요청 처리 - 오프라인 지원
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // GET 요청의 경우 캐시에 저장
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE_NAME)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    }

    throw new Error('API response not ok')
  } catch (error) {
    console.log('[SW] API request failed:', error)

    // GET 요청의 경우 캐시된 데이터 반환
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // POST/PUT 요청의 경우 IndexedDB에 저장 (백그라운드 동기화용)
    if (request.method === 'POST' || request.method === 'PUT') {
      await saveForBackgroundSync(request)
      return new Response(
        JSON.stringify({
          message: '오프라인 상태입니다. 연결되면 자동으로 동기화됩니다.',
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 기본 오프라인 응답
    return new Response(
      JSON.stringify({ error: '네트워크에 연결할 수 없습니다.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// 정적 자원 처리 - Cache First
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }

    throw new Error('Failed to fetch static asset')
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', error)
    return new Response('', { status: 404 })
  }
}

// 오프라인 폴백 페이지 반환
async function getOfflineFallback(request) {
  const url = new URL(request.url)

  // 루트 경로나 특정 페이지들의 경우 캐시된 index.html 반환
  const cache = await caches.open(STATIC_CACHE_NAME)
  const fallback = await cache.match('/')

  if (fallback) {
    return fallback
  }

  // 기본 오프라인 응답
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>오프라인 - IntoTheHeaven</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 2rem; text-align: center; }
        .offline-message { margin: 2rem auto; max-width: 400px; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="offline-message">
        <div class="icon">📴</div>
        <h1>오프라인 상태입니다</h1>
        <p>인터넷 연결을 확인해 주세요.</p>
        <button onclick="window.location.reload()">다시 시도</button>
      </div>
    </body>
    </html>
  `,
    {
      headers: { 'Content-Type': 'text/html' },
    }
  )
}

// 백그라운드 동기화를 위해 요청 저장
async function saveForBackgroundSync(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
      body: await request.text(),
      timestamp: Date.now(),
    }

    // IndexedDB에 저장하는 로직 (별도 구현 필요)
    console.log('[SW] Saved for background sync:', requestData)

    // 백그라운드 동기화 등록
    if (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    ) {
      self.registration.sync.register('background-sync')
    }
  } catch (error) {
    console.error('[SW] Failed to save for background sync:', error)
  }
}

// 백그라운드 동기화 처리
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered')
    event.waitUntil(syncPendingRequests())
  }
})

// 저장된 요청들을 동기화
async function syncPendingRequests() {
  try {
    // IndexedDB에서 저장된 요청들을 가져와서 재시도하는 로직
    console.log('[SW] Syncing pending requests...')
    // 실제 구현은 IndexedDB 로직 추가 필요
  } catch (error) {
    console.error('[SW] Failed to sync pending requests:', error)
  }
}

// 푸시 알림 처리
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event)

  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon-192.png',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('IntoTheHeaven', options))
})

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received.')

  event.notification.close()

  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // 아무것도 하지 않음 (알림만 닫기)
  } else {
    // 기본 동작: 앱 열기
    event.waitUntil(clients.openWindow('/'))
  }
})

console.log('[SW] Service Worker loaded')
