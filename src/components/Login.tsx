import { ApiError, authApi } from '@/lib/api'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value.length > 0 && !validateEmail(value)) {
      setEmailError('이메일 형식에 맞지 않아요.')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    // 폼 제출 시 이메일 유효성 재검사
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
      const response = await authApi.login({ email, password })

      // 로그인 성공
      console.warn('로그인 성공:', response)
      onLoginSuccess()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.status === 400) {
          setLoginError('입력 정보를 확인해주세요.')
        } else {
          setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
      } else {
        setLoginError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
      }
      console.error('로그인 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white h-11 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 font-pretendard">
          로그인
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4">
        {/* Logo */}
        <div className="mt-16 mb-24">
          <h2 className="text-4xl font-extrabold text-black font-pretendard">
            LOGO
          </h2>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Input */}
            <div className="space-y-2">
              <div
                className={`bg-gray-100 rounded-lg p-3 transition-colors ${
                  emailError
                    ? 'border border-[#DB574F]'
                    : 'border border-transparent'
                }`}
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

            {/* Password Input */}
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
                    // Eye open icon
                    <path
                      d="M10 4C5.5 4 1.73 7.11 1 10c.73 2.89 4.5 6 9 6s8.27-3.11 9-6c-.73-2.89-4.5-6-9-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      fill="currentColor"
                    />
                  ) : (
                    // Eye closed icon
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
            {/* Login Error Message */}
            {loginError && (
              <div className="text-[#DB574F] text-sm font-pretendard text-center">
                {loginError}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium font-pretendard transition-colors mt-6 ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            {/* Signup Entry */}
            <div className="text-center mt-6">
              <Link
                to="/signup"
                className="text-gray-600 hover:text-gray-800 font-pretendard font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-1"
              >
                가입할래요!
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Login
