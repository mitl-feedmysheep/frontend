import { useEffect, useState } from 'react'

interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  canInstall: () => Promise<void>
  isUpdateAvailable: boolean
  updateApp: () => void
}

export const usePWA = (): PWAState => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 설치 가능 상태 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 앱 설치 상태 체크
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkInstallStatus()

    // Service Worker 업데이트 감지
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setIsUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const canInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstallable(false)
        setIsInstalled(true)
      }

      setDeferredPrompt(null)
    }
  }

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  return {
    isOnline,
    isInstallable,
    isInstalled,
    canInstall,
    isUpdateAvailable,
    updateApp,
  }
}

// 오프라인 저장소를 위한 유틸리티 함수들
export const offlineStorage = {
  // 오프라인에서 작성한 데이터 저장
  saveOfflineData: (key: string, data: any) => {
    try {
      const offlineData = JSON.parse(
        localStorage.getItem('offlineData') || '{}'
      )
      offlineData[key] = {
        data,
        timestamp: Date.now(),
        synced: false,
      }
      localStorage.setItem('offlineData', JSON.stringify(offlineData))
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  },

  // 오프라인 데이터 가져오기
  getOfflineData: (key?: string) => {
    try {
      const offlineData = JSON.parse(
        localStorage.getItem('offlineData') || '{}'
      )
      return key ? offlineData[key] : offlineData
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return key ? null : {}
    }
  },

  // 동기화 완료 처리
  markAsSynced: (key: string) => {
    try {
      const offlineData = JSON.parse(
        localStorage.getItem('offlineData') || '{}'
      )
      if (offlineData[key]) {
        offlineData[key].synced = true
        localStorage.setItem('offlineData', JSON.stringify(offlineData))
      }
    } catch (error) {
      console.error('Failed to mark as synced:', error)
    }
  },

  // 동기화되지 않은 데이터 가져오기
  getUnsyncedData: () => {
    try {
      const offlineData = JSON.parse(
        localStorage.getItem('offlineData') || '{}'
      )
      return Object.entries(offlineData)
        .filter(([_, item]: [string, any]) => !item.synced)
        .reduce((acc, [key, item]) => ({ ...acc, [key]: item }), {})
    } catch (error) {
      console.error('Failed to get unsynced data:', error)
      return {}
    }
  },

  // 오프라인 데이터 삭제
  clearOfflineData: (key?: string) => {
    try {
      if (key) {
        const offlineData = JSON.parse(
          localStorage.getItem('offlineData') || '{}'
        )
        delete offlineData[key]
        localStorage.setItem('offlineData', JSON.stringify(offlineData))
      } else {
        localStorage.removeItem('offlineData')
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error)
    }
  },
}
