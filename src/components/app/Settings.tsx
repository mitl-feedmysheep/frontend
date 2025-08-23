import { authApi } from '@/lib/api'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Settings: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center h-[42px] bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-2 py-2 h-full"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#405347"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <span className="text-[#313331] font-semibold text-xl leading-tight tracking-[-0.02em] font-pretendard">
            설정
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 내 정보 */}
        <button
          onClick={() => navigate('/settings/account')}
          className="w-full bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between"
        >
          <span className="text-[#313331] text-base font-medium font-pretendard">
            내 정보
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

        {/* Divider */}
        <div className="h-0 border-t border-dashed border-[#E4E5E4]"></div>

        {/* 비밀번호 변경 */}
        <button
          onClick={() => navigate('/settings/password')}
          className="w-full bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between"
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
          className="w-full bg-white rounded-xl border border-[#E5E7E5] px-6 py-3 text-left"
        >
          <span className="text-[#DB574F] text-base font-medium font-pretendard">
            로그아웃
          </span>
        </button>
      </div>
    </div>
  )
}

export default Settings
