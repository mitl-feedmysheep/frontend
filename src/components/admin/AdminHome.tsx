import { useNavigate } from 'react-router-dom'
import DevelopingPlaceholder from './DevelopingPlaceholder'

function AdminHome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Profile Icon */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 font-pretendard">
            관리자
          </h1>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="설정"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#405347" strokeWidth="2" />
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="#405347"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M6.5 18.5C7.5 16.5 9.5 15 12 15C14.5 15 16.5 16.5 17.5 18.5"
                stroke="#405347"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <DevelopingPlaceholder title="홈 화면 준비 중" />
      </main>
    </div>
  )
}

export default AdminHome
