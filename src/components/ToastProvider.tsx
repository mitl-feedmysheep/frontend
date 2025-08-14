import React, { createContext, useCallback, useContext, useState } from 'react'
import ToastNotification from './ToastNotification'

interface ToastContextValue {
  showToast: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [duration, setDuration] = useState<number | undefined>(3000)

  const showToast = useCallback((msg: string, ms = 3000) => {
    setMessage(msg)
    setDuration(ms)
    setIsVisible(true)
  }, [])

  const handleHide = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification
        message={message}
        isVisible={isVisible}
        onHide={handleHide}
        duration={duration}
      />
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
