import React, { useEffect, useState } from 'react'

const UpdatePrompt: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
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
                setShowUpdate(true)
              }
            })
          }
        })
      })

      // 이미 대기 중인 Service Worker가 있는지 확인
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          setShowUpdate(true)
        }
      })
    }
  }, [])

  const handleUpdate = async () => {
    setUpdating(true)

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        // 대기 중인 Service Worker에게 메시지 전송
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })

        // 새 Service Worker가 활성화되면 페이지 새로고침
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
      }
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 z-50">
      <div className="flex items-center justify-between max-w-[420px] mx-auto">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🔄</span>
          <div>
            <h3 className="font-semibold text-sm">새 버전 사용 가능</h3>
            <p className="text-xs opacity-90">
              업데이트하면 최신 기능을 이용할 수 있습니다
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-sm text-blue-100 hover:text-white"
            disabled={updating}
          >
            나중에
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="px-4 py-2 bg-white text-blue-600 text-sm rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            {updating ? '업데이트 중...' : '업데이트'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdatePrompt
