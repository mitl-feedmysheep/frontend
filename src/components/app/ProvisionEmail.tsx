import { useToast } from '@/components/common/ToastProvider'
import { ApiError, authApi, membersApi } from '@/lib/api'
import { isValidEmail } from '@/lib/utils'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ProvisionEmailProps {
  variant?: 'user' | 'admin'
}

const ProvisionEmail: React.FC<ProvisionEmailProps> = ({
  variant = 'user',
}) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [changing, setChanging] = useState(false)
  const [sending, setSending] = useState(false)
  const [code, setCode] = useState('')
  const [codeChecking, setCodeChecking] = useState(false)
  const [codeError, setCodeError] = useState('')
  const { showToast } = useToast()
  const [emailSendOk, setEmailSendOk] = useState(false)
  const [emailSendError, setEmailSendError] = useState(false)
  const [emailVerifySuccess, setEmailVerifySuccess] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const focusEmailInput = () => {
    try {
      const el = emailInputRef.current
      if (!el) return
      el.focus()
      const len = el.value?.length ?? 0
      try {
        el.setSelectionRange(len, len)
      } catch (_e) {
        // ignore
      }
    } catch (_e) {
      // ignore
    }
  }

  // 이전 헤더 제거로 handleBack은 더 이상 사용하지 않음

  // 진입 토스트
  React.useEffect(() => {
    const step = localStorage.getItem('provision.step')
    // 초기 단계일 때만 안내 토스트 노출
    if (!step || step === 'email') {
      showToast('사용하시는 이메일로 변경해주세요 🙌', 3000)
    }
    // 토스트 여부와 무관하게 포커스 유지
    requestAnimationFrame(() => {
      if (step === 'code') {
        codeInputRef.current?.focus()
      } else {
        focusEmailInput()
      }
    })
  }, [showToast])

  // 진입 시 이메일 입력 포커스
  React.useEffect(() => {
    // 저장된 상태 복원
    try {
      const savedEmail = localStorage.getItem('provision.email')
      if (savedEmail) setEmail(savedEmail)
      const step = localStorage.getItem('provision.step')
      const verified = localStorage.getItem('provision.verified') === 'true'
      if (step === 'code' || verified) setEmailSendOk(true)
      if (verified) setEmailVerifySuccess(true)
    } catch (_e) {
      // ignore
    }

    // 단계에 따라 포커스 분기
    const step = localStorage.getItem('provision.step')
    if (step === 'code' && !emailVerifySuccess) {
      codeInputRef.current?.focus()
    } else {
      focusEmailInput()
    }
  }, [])

  const handleSendVerification = async () => {
    setEmailError('')
    setEmailSendError(false)
    setEmailSendOk(false)
    setEmailVerifySuccess(false)
    setCode('')
    setCodeError('')
    if (!isValidEmail(email)) return
    setSending(true)
    try {
      // 1) 이메일 사용 가능 여부 확인
      const apiBase = import.meta.env.VITE_API_BASE_URL as string
      const dupUrl = `${apiBase}/auth/availability/email?value=${encodeURIComponent(email)}`
      const dupRes = await fetch(dupUrl, { method: 'GET' })
      if (!dupRes.ok) throw new Error(`HTTP ${dupRes.status}`)
      const dupData = (await dupRes.json()) as { available: boolean }
      if (!dupData.available) {
        setEmailError('이미 등록된 이메일입니다.')
        return
      }

      // 2) 인증 메일 발송
      await authApi.sendEmailVerification(email)
      setEmailSendOk(true)
      // 상태 저장
      try {
        localStorage.setItem('provision.email', email)
        localStorage.setItem('provision.step', 'code')
      } catch (_e) {}
    } catch (e) {
      setEmailSendError(true)
      if (e instanceof ApiError && e.status === 409) {
        setEmailError('이미 등록된 이메일입니다.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleConfirmCode = async () => {
    setCodeError('')
    if (!code.trim()) return
    setCodeChecking(true)
    try {
      await authApi.confirmEmailVerification(email, code.trim())
      setEmailVerifySuccess(true)
      showToast('인증에 성공했어요.', 2000)
      // 토스트 중에도 커서 유지
      setTimeout(() => focusEmailInput(), 0)
      try {
        localStorage.setItem('provision.verified', 'true')
        localStorage.setItem('provision.step', 'confirmed')
      } catch (_e) {}
    } catch (_e) {
      setCodeError('인증에 실패했어요. 다시 시도해주세요.')
    } finally {
      setCodeChecking(false)
    }
  }

  const handleChange = async () => {
    setEmailError('')
    if (!isValidEmail(email)) {
      setEmailError('이메일 형식에 맞지 않아요.')
      return
    }
    setChanging(true)
    try {
      let token: string | undefined
      try {
        token = localStorage.getItem('provisionToken') || undefined
      } catch {
        token = undefined
      }
      await membersApi.changeEmail(email, token)
      try {
        sessionStorage.setItem(
          'login.toast',
          '이메일이 변경되었어요! 다시 로그인해주세요.'
        )
      } catch (_e) {
        // ignore sessionStorage failure
      }
      // 임시 토큰 및 진행상태 정리
      try {
        localStorage.removeItem('provisionToken')
        localStorage.removeItem('provisionPending')
        localStorage.removeItem('provision.email')
        localStorage.removeItem('provision.step')
        localStorage.removeItem('provision.verified')
      } catch (_e) {}
      authApi.logout()
      // 1초 지연 후 로그인 화면으로 이동 (변경 중 상태 유지)
      setTimeout(() => {
        try {
          window.location.replace('/login')
        } catch {
          navigate('/login', { replace: true })
        }
      }, 1000)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setEmailError('이미 등록된 이메일입니다.')
      } else {
        setEmailError('이메일 변경 중 오류가 발생했습니다.')
      }
      setChanging(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-sm px-6 pt-18 pb-24 space-y-5">
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              이메일
            </label>
            <div className="mt-1 flex items-end gap-2">
              <input
                type="email"
                value={email}
                ref={emailInputRef}
                onChange={e => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="이메일 주소를 입력하세요"
                className={`flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 ${
                  variant === 'admin'
                    ? 'focus:border-blue-900 caret-blue-900'
                    : 'focus:border-[#2F9E44] caret-[#2F9E44]'
                } placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard`}
              />
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={sending || !email || emailSendOk}
                className={`min-w-[90px] whitespace-nowrap justify-center px-3 py-1.5 rounded-full border text-[11px] font-pretendard flex items-center ${
                  emailSendOk
                    ? variant === 'admin'
                      ? 'border-blue-900 text-blue-900'
                      : 'border-[#43AE52] text-[#20342F]'
                    : 'border-[#C3CCC9] text-gray-600'
                } ${sending || emailSendOk ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-label="이메일 본인인증"
              >
                {sending ? (
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  '본인인증'
                )}
              </button>
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                {emailError}
              </p>
            )}
            {!sending && emailSendOk && (
              <p
                className={`mt-1 text-xs font-pretendard ${
                  variant === 'admin' ? 'text-blue-900' : 'text-[#2F9E44]'
                }`}
              >
                이메일이 발송되었어요.
              </p>
            )}
            {!sending && emailSendError && !emailSendOk && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                관리자에게 문의해주세요.
              </p>
            )}
          </div>

          {emailSendOk && (
            <div>
              <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
                인증 코드
              </label>
              <div className="mt-1 flex items-end gap-2">
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="이메일로 받은 코드를 입력하세요"
                  className={`flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 ${
                    variant === 'admin'
                      ? 'focus:border-blue-900 caret-blue-900'
                      : 'focus:border-[#2F9E44] caret-[#2F9E44]'
                  } placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard`}
                  ref={codeInputRef}
                />
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  disabled={!code.trim() || codeChecking || emailVerifySuccess}
                  className={`min-w-[90px] whitespace-nowrap justify-center px-3 py-1.5 rounded-full border text-[11px] font-pretendard flex items-center ${
                    emailVerifySuccess
                      ? variant === 'admin'
                        ? 'border-blue-900 text-blue-900'
                        : 'border-[#43AE52] text-[#20342F]'
                      : codeChecking
                        ? 'opacity-60 cursor-not-allowed border-[#C3CCC9] text-gray-400'
                        : 'border-[#C3CCC9] text-gray-600'
                  } ${emailVerifySuccess || codeChecking ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label="인증코드 확인"
                >
                  {codeChecking ? (
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : (
                    '확인'
                  )}
                </button>
              </div>
              {codeError && (
                <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                  {codeError}
                </p>
              )}
              {!codeChecking && emailVerifySuccess && (
                <p
                  className={`mt-1 text-xs font-pretendard ${
                    variant === 'admin' ? 'text-blue-900' : 'text-[#2F9E44]'
                  }`}
                >
                  인증에 성공했어요.
                </p>
              )}
            </div>
          )}

          {emailSendOk && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleChange}
                disabled={changing || !emailVerifySuccess}
                className={`w-full py-3 rounded-lg font-medium font-pretendard transition-colors ${
                  changing || !emailVerifySuccess
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : variant === 'admin'
                      ? 'bg-blue-900 text-white hover:bg-blue-800'
                      : 'bg-[#5F7B6D] text-white hover:bg-[#4A6356]'
                }`}
              >
                {changing ? '변경 중...' : '이메일 변경'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProvisionEmail
