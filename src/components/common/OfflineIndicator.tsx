import React, { useEffect, useState } from 'react'

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 온라인 상태에서는 아무것도 표시하지 않음
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 z-50">
      <div className="flex items-center justify-center max-w-[420px] mx-auto">
        <div className="flex items-center space-x-2">
          <span className="animate-pulse">📴</span>
          <span className="text-sm font-medium">오프라인 모드</span>
        </div>
      </div>
    </div>
  )
}

export default OfflineIndicator
