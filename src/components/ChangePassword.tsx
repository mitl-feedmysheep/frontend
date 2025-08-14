import { ApiError, authApi, membersApi } from '@/lib/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastProvider'

const ChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentError, setCurrentError] = useState('')
  const { showToast } = useToast()

  // 비밀번호 일치 검증 (실시간)
  useEffect(() => {
    if (confirmPassword.length === 0 && newPassword.length === 0) {
      setError('')
      return
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
    } else if (newPassword && newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
    } else {
      setError('')
    }
  }, [newPassword, confirmPassword])

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setError('')
    setCurrentError('')
    try {
      setLoading(true)
      await membersApi.changePassword(currentPassword, newPassword)
      authApi.logout()
      localStorage.clear()
      navigate('/login', { replace: true })
      setTimeout(() => {
        showToast('비밀번호가 변경되었어요.\n로그인을 해주세요.', 3500)
      }, 0)
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        setCurrentError('비밀번호가 잘못되었어요. 다시 시도해주세요.')
      } else {
        setError('비밀번호 변경에 실패했습니다.')
      }
    } finally {
      setLoading(false)
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
            비밀번호 변경
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="px-1">
          <label className="block text-[#313331] text-sm font-pretendard mb-1">
            현재 비밀번호
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => {
                setCurrentPassword(e.target.value)
                if (currentError) setCurrentError('')
              }}
              className="w-full p-2 pr-9 bg-transparent outline-none border border-[#E5E7E5] rounded"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#949996]"
              aria-label={showCurrent ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showCurrent ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3L21 21"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.9 5.1C10.57 5.03 11.27 5 12 5c5 0 9 4 10 7-0.27.79-0.72 1.66-1.33 2.5M6.7 6.7C4.3 7.9 2.6 9.7 2 12c.42 1.54 1.78 3.3 3.62 4.73 1.43 1.12 3.08 1.87 4.38 2.08"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
          {currentError && (
            <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
              {currentError}
            </p>
          )}
        </div>
        <div className="px-1">
          <label className="block text-[#313331] text-sm font-pretendard mb-1">
            새 비밀번호
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={`w-full p-2 pr-9 bg-transparent outline-none border rounded ${error && (newPassword.length < 8 || (confirmPassword && newPassword !== confirmPassword)) ? 'border-red-400' : 'border-[#E5E7E5]'}`}
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#949996]"
              aria-label={showNew ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showNew ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3L21 21"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.9 5.1C10.57 5.03 11.27 5 12 5c5 0 9 4 10 7-0.27.79-0.72 1.66-1.33 2.5M6.7 6.7C4.3 7.9 2.6 9.7 2 12c.42 1.54 1.78 3.3 3.62 4.73 1.43 1.12 3.08 1.87 4.38 2.08"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="px-1">
          <label className="block text-[#313331] text-sm font-pretendard mb-1">
            새 비밀번호 확인
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full p-2 pr-9 bg-transparent outline-none border rounded ${error && confirmPassword && newPassword !== confirmPassword ? 'border-red-400' : 'border-[#E5E7E5]'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#949996]"
              aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showConfirm ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3L21 21"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.9 5.1C10.57 5.03 11.27 5 12 5c5 0 9 4 10 7-0.27.79-0.72 1.66-1.33 2.5M6.7 6.7C4.3 7.9 2.6 9.7 2 12c.42 1.54 1.78 3.3 3.62 4.73 1.43 1.12 3.08 1.87 4.38 2.08"
                    stroke="#949996"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#949996"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-pretendard px-1">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !!error}
          className="w-full bg-[#5F7B6D] text-white py-3 rounded-lg font-medium text-base font-pretendard disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="white"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? '변경 중...' : '변경하기'}
        </button>
      </div>
    </div>
  )
}

export default ChangePassword
