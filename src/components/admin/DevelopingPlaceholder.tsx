import React from 'react'

interface DevelopingPlaceholderProps {
  title?: string
  description?: string
}

const DevelopingPlaceholder: React.FC<DevelopingPlaceholderProps> = ({
  title = '개발 중입니다',
  description = '더 나은 서비스를 위해 페이지를 준비하고 있습니다.\n조금만 기다려주세요!',
}) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.7 6.30003L16.85 8.45003C17.25 8.85003 17.25 9.48003 16.85 9.88003L10.7 16.03C10.5 16.23 10.23 16.34 9.95 16.34H7.7V14.09C7.7 13.81 7.81 13.54 8.01 13.34L14.16 7.19003C14.3 7.05003 14.55 6.15003 14.7 6.30003ZM19.07 4.93003L20.49 6.35003C20.88 6.74003 20.88 7.37003 20.49 7.76003L18.34 9.91003C18.15 10.1 17.84 10.1 17.65 9.91003L15.5 7.76003C15.31 7.57003 15.31 7.26003 15.5 7.07003L17.65 4.92003C18.04 4.53003 18.67 4.53003 19.06 4.92003H19.07ZM17 19H7C5.9 19 5 18.1 5 17V7C5 6.72 5.22 6.5 5.5 6.5H13.04C13.32 6.5 13.54 6.28 13.54 6C13.54 5.72 13.32 5.5 13.04 5.5H5.5C4.67 5.5 4 6.17 4 7V17C4 18.66 5.34 20 7 20H17C18.66 20 20 18.66 20 17V9.46003C20 9.18003 19.78 8.96003 19.5 8.96003C19.22 8.96003 19 9.18003 19 9.46003V17C19 18.1 18.1 19 17 19Z"
            fill="#9CA3AF"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 font-pretendard mb-2 text-center">
        {title}
      </h2>
      <p className="text-gray-500 font-pretendard text-sm text-center whitespace-pre-line leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default DevelopingPlaceholder

