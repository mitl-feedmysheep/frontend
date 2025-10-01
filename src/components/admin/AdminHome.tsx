import { useNavigate } from 'react-router-dom'

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
              />
            </svg>
          </button>
        </div>
      </div>

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 font-pretendard mb-2">
              관리자 대시보드
            </h2>
            <p className="text-gray-600 font-pretendard text-sm">
              교회 관리 시스템에 오신 것을 환영합니다.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-gray-500 text-xs font-pretendard mb-1">
              전체 교인
            </div>
            <div className="text-2xl font-bold text-gray-900 font-pretendard">
              -
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-gray-500 text-xs font-pretendard mb-1">
              소모임 수
            </div>
            <div className="text-2xl font-bold text-gray-900 font-pretendard">
              -
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminHome
