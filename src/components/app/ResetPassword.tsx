import { useToast } from '@/components/common/ToastProvider'
import { ApiError, authApi, membersApi } from '@/lib/api'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // 단계 관리 (1: 이메일/이름 입력, 2: 인증 코드 입력, 3: 새 비밀번호 입력)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: 이메일과 이름
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [step1Error, setStep1Error] = useState('')
  const [step1Loading, setStep1Loading] = useState(false)

  // Step 2: 인증 코드
  const [verificationCode, setVerificationCode] = useState('')
  const [step2Error, setStep2Error] = useState('')
  const [step2Loading, setStep2Loading] = useState(false)

  // Step 3: 새 비밀번호
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [step3Loading, setStep3Loading] = useState(false)

  // 이메일 형식 검증
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

  // Step 1: 확인 코드 전송
  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setEmailError('이메일 형식에 맞지 않아요.')
      return
    }

    if (!name.trim()) {
      setStep1Error('이름을 입력해주세요.')
      return
    }

    setStep1Loading(true)
    setStep1Error('')

    try {
      // 먼저 이메일과 이름이 일치하는 회원인지 확인
      await membersApi.verifyMember(email, name)

      // 검증 성공 시 인증 코드 발송
      await authApi.sendPasswordResetCode(email)

      // Step 2로 이동
      setStep(2)
      showToast('인증 코드가 발송되었습니다.', 3000)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setStep1Error('이메일과 이름을 다시 한번 더 확인해주세요!')
        } else if (error.status === 400) {
          setStep1Error('이메일과 이름을 다시 한번 더 확인해주세요!')
        } else {
          setStep1Error('오류가 발생했습니다. 다시 시도해주세요.')
        }
      } else {
        setStep1Error('네트워크 오류가 발생했습니다.')
      }
      console.error('인증 코드 발송 오류:', error)
    } finally {
      setStep1Loading(false)
    }
  }

  // Step 2: 인증 코드 확인
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setStep2Error('인증 코드를 입력해주세요.')
      return
    }

    setStep2Loading(true)
    setStep2Error('')

    try {
      await authApi.confirmPasswordResetCode(email, verificationCode)

      // 토스트 메시지 표시 후 바로 Step 3로 이동
      showToast('이제 새로운 비밀번호로 변경해주세요!', 3000)
      setStep(3)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setStep2Error('인증 코드가 올바르지 않습니다.')
        } else {
          setStep2Error('오류가 발생했습니다. 다시 시도해주세요.')
        }
      } else {
        setStep2Error('네트워크 오류가 발생했습니다.')
      }
      console.error('인증 코드 확인 오류:', error)
    } finally {
      setStep2Loading(false)
    }
  }

  // Step 3: 비밀번호 일치 검증 (실시간)
  useEffect(() => {
    if (confirmPassword.length === 0 && newPassword.length === 0) {
      setPasswordError('')
      return
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
    } else if (newPassword && newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다.')
    } else {
      setPasswordError('')
    }
  }, [newPassword, confirmPassword])

  // Step 3: 비밀번호 변경
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return
    }

    setStep3Loading(true)
    setPasswordError('')

    try {
      await authApi.resetPassword(email, newPassword)

      // 로그인 화면으로 이동
      navigate('/login', { replace: true })
      setTimeout(() => {
        showToast('비밀번호가 변경되었어요.\n로그인을 해주세요.', 3500)
      }, 0)
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
      } else {
        setPasswordError('네트워크 오류가 발생했습니다.')
      }
      console.error('비밀번호 재설정 오류:', error)
    } finally {
      setStep3Loading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center h-[42px] bg-white sticky top-0 z-10">
        <button
          onClick={() => {
            if (step === 1) {
              navigate('/login')
            } else {
              setStep(prev => (prev - 1) as 1 | 2)
            }
          }}
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
            비밀번호 찾기
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Step 1: 이메일과 이름 입력 */}
      {step === 1 && (
        <div className="px-4 py-4 space-y-4">
          <div className="px-1 mb-6">
            <p className="text-[#313331] text-sm font-pretendard">
              가입하신 이메일 주소와 이름을 입력해주세요.
            </p>
          </div>

          <div className="px-1">
            <label className="block text-[#313331] text-sm font-pretendard mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일 주소 입력"
              className={`w-full p-2 bg-transparent outline-none border rounded ${emailError ? 'border-red-400' : 'border-[#E5E7E5]'}`}
            />
            {emailError && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                {emailError}
              </p>
            )}
          </div>

          <div className="px-1">
            <label className="block text-[#313331] text-sm font-pretendard mb-1">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름 입력"
              className="w-full p-2 bg-transparent outline-none border border-[#E5E7E5] rounded"
            />
          </div>

          {step1Error && (
            <p className="text-red-500 text-sm font-pretendard px-1">
              {step1Error}
            </p>
          )}

          <button
            onClick={handleSendCode}
            disabled={
              step1Loading || !email.trim() || !name.trim() || !!emailError
            }
            className="w-full bg-[#5F7B6D] text-white py-3 rounded-lg font-medium text-base font-pretendard disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {step1Loading && (
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
            {step1Loading ? '전송 중...' : '확인 코드 전송'}
          </button>
        </div>
      )}

      {/* Step 2: 인증 코드 입력 */}
      {step === 2 && (
        <div className="px-4 py-4 space-y-4">
          <div className="px-1 mb-6">
            <p className="text-[#313331] text-sm font-pretendard">
              입력하신 이메일로 발송된 인증 코드를 입력해주세요.
            </p>
          </div>

          <div className="px-1">
            <label className="block text-[#313331] text-sm font-pretendard mb-1">
              인증 코드
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              placeholder="인증 코드 입력"
              className="w-full p-2 bg-transparent outline-none border border-[#E5E7E5] rounded"
              maxLength={10}
            />
          </div>

          {step2Error && (
            <p className="text-red-500 text-sm font-pretendard px-1">
              {step2Error}
            </p>
          )}

          <button
            onClick={handleVerifyCode}
            disabled={step2Loading || !verificationCode.trim()}
            className="w-full bg-[#5F7B6D] text-white py-3 rounded-lg font-medium text-base font-pretendard disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {step2Loading && (
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
            {step2Loading ? '확인 중...' : '확인'}
          </button>
        </div>
      )}

      {/* Step 3: 새 비밀번호 입력 */}
      {step === 3 && (
        <div className="px-4 py-4 space-y-4">
          <div className="px-1 mb-6">
            <p className="text-[#313331] text-sm font-pretendard">
              새로운 비밀번호를 설정해주세요.
            </p>
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
                className={`w-full p-2 pr-9 bg-transparent outline-none border rounded ${passwordError && (newPassword.length < 8 || (confirmPassword && newPassword !== confirmPassword)) ? 'border-red-400' : 'border-[#E5E7E5]'}`}
                placeholder="8자 이상 입력"
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
                className={`w-full p-2 pr-9 bg-transparent outline-none border rounded ${passwordError && confirmPassword && newPassword !== confirmPassword ? 'border-red-400' : 'border-[#E5E7E5]'}`}
                placeholder="비밀번호 재입력"
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

          {passwordError && (
            <p className="text-red-500 text-sm font-pretendard px-1">
              {passwordError}
            </p>
          )}

          <button
            onClick={handleResetPassword}
            disabled={
              step3Loading ||
              !!passwordError ||
              !newPassword ||
              !confirmPassword ||
              newPassword.length < 8 ||
              newPassword !== confirmPassword
            }
            className="w-full bg-[#5F7B6D] text-white py-3 rounded-lg font-medium text-base font-pretendard disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {step3Loading && (
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
            {step3Loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ResetPassword
