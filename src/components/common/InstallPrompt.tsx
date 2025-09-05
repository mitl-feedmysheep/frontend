import React, { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // iOS 디바이스 체크
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // 앱이 이미 설치되었는지 체크
    const checkIfInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true

      if (isStandalone) {
        setShowPrompt(false)
        return true
      }
      return false
    }

    // beforeinstallprompt 이벤트 리스너 (Android/Desktop용)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)

      // 이미 설치되었는지 체크
      if (!checkIfInstalled()) {
        setShowPrompt(true)
      }
    }

    // iOS인 경우 설치 안내를 바로 표시 (이미 설치되지 않았다면)
    if (iOS && !checkIfInstalled()) {
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const { outcome } = await deferredPrompt.userChoice
      console.log(`사용자 선택: ${outcome}`)

      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 7일 후에 다시 표시
    localStorage.setItem(
      'installPromptDismissed',
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
  }

  // 이미 해제했고 7일이 안 지났으면 표시하지 않음
  useEffect(() => {
    const dismissedTime = localStorage.getItem('installPromptDismissed')
    if (dismissedTime && Date.now() < parseInt(dismissedTime)) {
      setShowPrompt(false)
    }
  }, [])

  if (!showPrompt) return null

  return (
    <>
      {/* iOS용 설치 안내 */}
      {isIOS && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-50">
          <div className="flex items-center justify-between max-w-[420px] mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">홈 화면에 추가</h3>
                <p className="text-xs text-gray-600">
                  Safari 공유 버튼 → "홈 화면에 추가"
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Android/Desktop용 설치 프롬프트 */}
      {!isIOS && deferredPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-50">
          <div className="flex items-center justify-between max-w-[420px] mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">앱으로 설치</h3>
                <p className="text-xs text-gray-600">
                  더 빠르고 편리하게 사용하세요
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                나중에
              </button>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-green-800 text-white text-sm rounded-lg hover:bg-green-900"
              >
                설치
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InstallPrompt
