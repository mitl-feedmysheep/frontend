import { useToast } from '@/components/common/ToastProvider'
import { adminApi } from '@/lib/admin-api'
import { ApiError } from '@/lib/api'
import { formatPhoneNumber } from '@/lib/utils'
import type { Church } from '@/types'
import React, { useEffect, useState } from 'react'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [churches, setChurches] = useState<Church[] | null>(null)
  const [selecting, setSelecting] = useState(false)
  const [selectError, setSelectError] = useState('')

  useEffect(() => {
    try {
      const keysToClear = ['admin.tempData', 'admin.sessionData']
      keysToClear.forEach(k => localStorage.removeItem(k))
      // 로그인 리다이렉트 토스트 (sessionStorage)
      const toastMsg = sessionStorage.getItem('login.toast')
      if (toastMsg) {
        sessionStorage.removeItem('login.toast')
        setTimeout(() => showToast(toastMsg, 3500), 0)
      }
    } catch (_err) {
      void 0
    }
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value.length > 0 && !validateEmail(value))
      setEmailError('이메일 형식에 맞지 않아요.')
    else setEmailError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!validateEmail(email)) {
      setEmailError('이메일 형식에 맞지 않아요.')
      return
    }
    if (!password.trim()) {
      setLoginError('비밀번호를 입력해주세요.')
      return
    }
    setIsLoading(true)
    try {
      const res = await adminApi.login({ email, password })
      if (res.isProvisioned) {
        try {
          localStorage.setItem('provisionPending', 'true')
        } catch (_e) {
          // ignore
        }
        window.location.assign('/provision/email')
        return
      }
      const list = await adminApi.getAdminChurches()
      if (Array.isArray(list) && list.length === 1) {
        await adminApi.selectChurch(list[0].id)
        onLoginSuccess()
        return
      }
      if (Array.isArray(list) && list.length > 1) {
        setChurches(list)
        return
      }
      setLoginError('접근 가능한 교회가 없습니다. 관리자에게 문의해주세요.')
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
        else if (error.status === 403)
          setLoginError('관리자 권한이 필요합니다.')
        else if (error.status === 400)
          setLoginError('입력 정보를 확인해주세요.')
        else setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      } else setLoginError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChurchSelect = async (churchId: string) => {
    setSelectError('')
    setSelecting(true)
    try {
      await adminApi.selectChurch(churchId)
      onLoginSuccess()
    } catch (error) {
      if (error instanceof ApiError)
        setSelectError('교회 선택 중 오류가 발생했습니다. 다시 시도해주세요.')
      else setSelectError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSelecting(false)
    }
  }

  // 이메일 프로비저닝(최초 설정) 시에는 라우터에서 /provision/email 경로로 전환함

  if (churches && churches.length > 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white h-11 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-semibold text-blue-900 font-pretendard">
            교회 선택
          </h1>
        </header>
        <main className="flex-1 flex flex-col items-center px-4">
          <div className="w-full max-w-md mt-10 space-y-4">
            {churches.map(church => (
              <button
                key={church.id}
                disabled={selecting}
                onClick={() => handleChurchSelect(church.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors bg-white hover:bg-gray-50 ${selecting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-900 font-semibold font-pretendard">
                      {church.name}
                    </div>
                    <div className="text-sm text-gray-600 font-pretendard">
                      {church.location}
                    </div>
                    {church.number && (
                      <div className="text-sm text-gray-500 font-pretendard">
                        {formatPhoneNumber(church.number)}
                      </div>
                    )}
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
            {selectError && (
              <div className="text-[#DB574F] text-sm font-pretendard text-center">
                {selectError}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white h-11 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-semibold text-blue-900 font-pretendard">
          로그인
        </h1>
      </header>
      <main className="flex-1 flex flex-col items-center px-4">
        <div className="mt-16 mb-20">
          <h2 className="text-4xl font-extrabold text-blue-900 font-pretendard">
            IntoTheHeaven
          </h2>
          <p className="text-center text-gray-600 mt-2 font-pretendard">
            관리자 전용
          </p>
        </div>
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <div
                className={`bg-gray-100 rounded-lg p-3 transition-colors ${emailError ? 'border border-[#DB574F]' : 'border border-transparent'}`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="이메일 주소 입력"
                  className="w-full bg-transparent text-gray-900 placeholder-gray-500 outline-none font-pretendard"
                  required
                />
              </div>
              {emailError && (
                <p className="text-[#DB574F] text-xs font-pretendard">
                  {emailError}
                </p>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none font-pretendard"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 p-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showPassword ? (
                    <path
                      d="M10 4C5.5 4 1.73 7.11 1 10c.73 2.89 4.5 6 9 6s8.27-3.11 9-6c-.73-2.89-4.5-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      fill="currentColor"
                    />
                  ) : (
                    <>
                      <path
                        d="M10 4C5.5 4 1.73 7.11 1 10c.73 2.89 4.5 6 9 6s8.27-3.11 9-6c-.73-2.89-4.5-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <line
                        x1="2"
                        y1="2"
                        x2="18"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {loginError && (
              <div className="text-[#DB574F] text-sm font-pretendard text-center">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium font-pretendard transition-colors mt-6 ${isLoading ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-800'} flex items-center justify-center gap-2`}
            >
              {isLoading && (
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
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AdminLogin
