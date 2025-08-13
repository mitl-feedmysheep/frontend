import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress?: string
          jibunAddress?: string
          zonecode?: string
        }) => void
        width?: string
        height?: string
      }) => { embed: (el: HTMLElement) => void }
    }
  }
}

interface DaumPostcodeModalProps {
  open: boolean
  onClose: () => void
  onSelect: (data: { zonecode: string; address: string }) => void
}

function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve()
      return
    }

    const existing = document.querySelector(
      'script[src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]'
    ) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Daum Postcode script'))
      )
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Failed to load Daum Postcode script'))
    document.head.appendChild(script)
  })
}

const DaumPostcodeModal: React.FC<DaumPostcodeModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    let postcode: { embed: (el: HTMLElement) => void } | null = null
    const containerEl = containerRef.current

    const mount = async () => {
      await loadDaumPostcodeScript()

      if (!containerEl || !window.daum) return

      postcode = new window.daum.Postcode({
        oncomplete: (data: {
          roadAddress?: string
          jibunAddress?: string
          zonecode?: string
        }) => {
          const address = data.roadAddress || data.jibunAddress || ''
          const zonecode = data.zonecode || ''
          onSelect({ zonecode, address })
          onClose()
        },
        width: '100%',
        height: '100%',
      })

      if (containerEl) {
        postcode.embed(containerEl)
      }
    }

    mount()

    return () => {
      if (containerEl) {
        containerEl.innerHTML = ''
      }
    }
  }, [open, onClose, onSelect])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[92%] max-w-sm h-[78vh] rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-pretendard font-medium text-gray-800">
            우편번호 찾기
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  )
}

export default DaumPostcodeModal
