import { authApi } from '@/lib/api'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminSettings: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4 flex items-center justify-between h-[72px]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로 가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 font-pretendard absolute left-1/2 transform -translate-x-1/2">
            설정
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 비밀번호 변경 */}
        <button
          onClick={() => navigate('/settings/password')}
          className="w-full bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-[#313331] text-base font-medium font-pretendard">
            비밀번호 변경
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="#949996"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 로그아웃 */}
        <button
          onClick={() => {
            authApi.logout()
            localStorage.clear()
            navigate('/login', { replace: true })
          }}
          className="w-full bg-white rounded-xl border border-[#E5E7E5] px-6 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-[#DB574F] text-base font-medium font-pretendard">
            로그아웃
          </span>
        </button>
      </div>
    </div>
  )
}

export default AdminSettings
