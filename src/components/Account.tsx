import { ApiError, membersApi } from '@/lib/api'
import type { User } from '@/types'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Account: React.FC = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchMe = async () => {
      try {
        setLoading(true)
        const me = await membersApi.getMyInfo()
        if (mounted) setUser(me)
      } catch (err) {
        console.error('계정 정보 조회 실패:', err)
        if (mounted) {
          if (err instanceof ApiError) setError(err.message)
          else setError('계정 정보를 불러오는데 실패했습니다.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMe()
    return () => {
      mounted = false
    }
  }, [])

  const formatBirthday = (dateString?: string): string => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}.${m}.${d}`
    } catch {
      return dateString
    }
  }

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
            계정
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center text-[#709180] text-sm font-pretendard">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm font-pretendard">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                이름
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {user?.name || '-'}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                이메일
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {user?.email || '-'}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                성별
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {user?.sex === 'M' ? '남' : user?.sex === 'F' ? '여' : '-'}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                생년월일
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {formatBirthday(user?.birthday)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                번호
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {user?.phone || '-'}
              </span>
            </div>

            {/* 비밀번호 변경 버튼 제거 (설정 화면으로 이동) */}
          </>
        )}
      </div>
    </div>
  )
}

export default Account
