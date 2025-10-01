import React from 'react'

interface FixedBottomButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

const FixedBottomButton: React.FC<FixedBottomButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const isDisabled = disabled || loading

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-4 bg-white ${className}`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full transition-colors rounded-xl px-4 py-4 shadow-sm ${
          !isDisabled
            ? 'bg-[#5F7B6D] hover:bg-[#4A6356] cursor-pointer'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span
            className={`font-medium text-base leading-tight font-pretendard ${
              !isDisabled ? 'text-white' : 'text-gray-500'
            }`}
          >
            {loading ? '처리 중...' : text}
          </span>
        </div>
      </button>
    </div>
  )
}

export default FixedBottomButton
