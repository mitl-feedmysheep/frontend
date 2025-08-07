import React, { useEffect, useState } from 'react'

interface ToastNotificationProps {
  message: string
  isVisible: boolean
  onHide: () => void
  duration?: number // 기본 3초
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onHide,
  duration = 3000,
}) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      const timer = setTimeout(() => {
        onHide()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      // 애니메이션이 끝난 후 렌더링 중단
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // 애니메이션 시간과 맞춤

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onHide])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-[#5F7B6D] text-white px-4 py-3 rounded-lg shadow-lg max-w-sm mx-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">😊</span>
          <span className="font-pretendard text-sm leading-tight">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ToastNotification
