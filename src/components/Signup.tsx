import useLocalStorage from '@/hooks/useLocalStorage'
import { ApiError, authApi } from '@/lib/api'
import type { SignupRequest } from '@/types'
import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DaumPostcodeModal from './DaumPostcodeModal'
import { useToast } from './ToastProvider'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useLocalStorage<string>('signup.name', '')
  const [birthDate, setBirthDate] = useLocalStorage<string>(
    'signup.birthDate',
    ''
  )
  const [gender, setGender] = useLocalStorage<'남' | '여' | ''>(
    'signup.gender',
    ''
  )
  const [phone, setPhone] = useLocalStorage<string>('signup.phone', '')
  const [email, setEmail] = useLocalStorage<string>('signup.email', '')
  const [password, setPassword] = useLocalStorage<string>('signup.password', '')
  const [passwordConfirm, setPasswordConfirm] = useLocalStorage<string>(
    'signup.passwordConfirm',
    ''
  )
  const [postcode, setPostcode] = useLocalStorage<string>('signup.postcode', '')
  const [address1, setAddress1] = useLocalStorage<string>('signup.address1', '')
  const [address2, setAddress2] = useLocalStorage<string>('signup.address2', '')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneDupLoading, setPhoneDupLoading] = useState(false)
  const [phoneChecked, setPhoneChecked] = useLocalStorage<boolean>(
    'signup.phoneChecked',
    false
  )
  const [phoneDuplicate, setPhoneDuplicate] = useLocalStorage<boolean>(
    'signup.phoneDuplicate',
    false
  )
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false)
  const [emailVerifySuccess, setEmailVerifySuccess] = useLocalStorage<boolean>(
    'signup.emailVerifySuccess',
    false
  )
  const [emailDupError, setEmailDupError] = useState('')
  const [emailSendOk, setEmailSendOk] = useLocalStorage<boolean>(
    'signup.emailSendOk',
    false
  )
  const [emailSendError, setEmailSendError] = useState(false)
  const [verificationCode, setVerificationCode] = useLocalStorage<string>(
    'signup.verificationCode',
    ''
  )
  const [codeConfirmLoading, setCodeConfirmLoading] = useState(false)
  const [codeConfirmError, setCodeConfirmError] = useState(false)
  const [showPostcode, setShowPostcode] = useState(false)
  const address2Ref = useRef<HTMLInputElement>(null)
  // removed: emailDupLoading, emailDupSuccess
  const { showToast } = useToast()

  const canProceed = useMemo(() => {
    const birthDigits = birthDate.replace(/\D/g, '')
    const allFilled =
      name.trim() &&
      gender &&
      birthDigits.length === 8 &&
      phone.trim() &&
      email.trim() &&
      password.trim() &&
      passwordConfirm.trim() &&
      postcode.trim() &&
      address1.trim()

    return (
      Boolean(allFilled) &&
      emailRegex.test(email) &&
      password.length >= 8 &&
      password === passwordConfirm &&
      phoneChecked &&
      !phoneDuplicate &&
      emailVerifySuccess
    )
  }, [
    name,
    gender,
    birthDate,
    phone,
    email,
    password,
    passwordConfirm,
    postcode,
    address1,
    phoneChecked,
    phoneDuplicate,
    emailVerifySuccess,
  ])

  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
    }
    setBirthDate(formatted)
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/login')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!canProceed) return
    setIsLoading(true)
    try {
      // birthDate: YYYY.MM.DD -> YYYY-MM-DD
      const birthDigits = birthDate.replace(/\D/g, '')
      const birthFormatted = `${birthDigits.slice(0, 4)}-${birthDigits.slice(4, 6)}-${birthDigits.slice(6, 8)}`

      const payload: SignupRequest = {
        password,
        name,
        email,
        birthdate: birthFormatted,
        sex: gender === '남' ? 'M' : 'F',
        phone,
        address: `${postcode} ${address1} ${address2}`.trim(),
      }

      await authApi.signup(payload)
      // 회원가입 완료 시 로컬스토리지의 회원가입 관련 키들 정리
      try {
        const keysToClear = [
          'signup.name',
          'signup.birthDate',
          'signup.gender',
          'signup.phone',
          'signup.email',
          'signup.password',
          'signup.passwordConfirm',
          'signup.postcode',
          'signup.address1',
          'signup.address2',
          'signup.emailSendOk',
          'signup.verificationCode',
          'signup.phoneChecked',
          'signup.phoneDuplicate',
          'signup.emailVerifySuccess',
        ]
        keysToClear.forEach(k => localStorage.removeItem(k))
      } catch (cleanupError) {
        console.warn(
          'Failed to clear signup draft from localStorage',
          cleanupError
        )
      }
      navigate('/login', { replace: true })
      // 라우팅 후에도 유지되는 전역 토스트
      setTimeout(() => {
        showToast('회원가입이 완료되었어요🙌\n로그인을 해주세요.', 3500)
      }, 0)
    } catch (error) {
      console.error('Signup failed', error)
      // TODO: 에러 메시지 UI 필요 시 추가
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneDupCheck = async () => {
    if (!phone.trim()) return
    setPhoneDupLoading(true)
    setPhoneChecked(false)
    setPhoneDuplicate(false)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL
      const url = `${apiBase}/auth/availability/phone?value=${encodeURIComponent(phone)}`
      const response = await fetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = (await response.json()) as { available: boolean }
      const isDuplicate = !data.available
      setPhoneDuplicate(isDuplicate)
      setPhoneChecked(true)
    } finally {
      setPhoneDupLoading(false)
    }
  }

  // 이메일로 인증 코드 발송
  const handleEmailVerify = async () => {
    setEmailDupError('')
    setEmailSendError(false)
    setEmailSendOk(false)
    if (!emailRegex.test(email)) return
    setEmailVerifyLoading(true)
    setEmailVerifySuccess(false)
    try {
      // 1) 이메일 사용 가능 여부 확인
      const apiBase = import.meta.env.VITE_API_BASE_URL
      const dupUrl = `${apiBase}/auth/availability/email?value=${encodeURIComponent(email)}`
      const dupRes = await fetch(dupUrl, { method: 'GET' })
      if (!dupRes.ok) {
        throw new Error(`HTTP ${dupRes.status}`)
      }
      const dupData = (await dupRes.json()) as { available: boolean }
      if (!dupData.available) {
        setEmailDupError('이미 등록된 이메일입니다.')
        return
      }

      // 2) 사용 가능하면 인증 메일 발송
      await authApi.sendEmailVerification(email)
      setEmailSendOk(true)
    } catch (error) {
      setEmailSendError(true)
      if (error instanceof ApiError && error.status === 409) {
        setEmailDupError('이미 등록된 이메일입니다.')
      }
    } finally {
      setEmailVerifyLoading(false)
    }
  }

  // 인증 코드 확인
  const handleConfirmCode = async () => {
    if (!verificationCode.trim()) return
    setCodeConfirmLoading(true)
    setCodeConfirmError(false)
    try {
      await authApi.confirmEmailVerification(email, verificationCode.trim())
      setEmailVerifySuccess(true)
    } catch (_error) {
      setEmailVerifySuccess(false)
      setCodeConfirmError(true)
    } finally {
      setCodeConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top App Bar (no native status bar) */}
      <header className="h-12 flex items-center border-b border-gray-200 px-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-3 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
          aria-label="뒤로가기"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 text-center -ml-6">
          <h1 className="text-[17px] font-pretendard font-medium text-gray-900">
            회원가입
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm px-6 pt-6 pb-24 space-y-5"
        >
          {/* Name + Gender inline */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              이름
            </label>
            <div className="mt-1 flex items-end gap-3">
              <input
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="이름이 뭐에요?"
                className="flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('남')}
                  className={`px-4 py-1.5 rounded-full border ${
                    gender === '남'
                      ? 'border-[#43AE52] text-[#20342F]'
                      : 'border-[#C3CCC9] text-gray-600'
                  } text-[10px] font-pretendard`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => setGender('여')}
                  className={`px-4 py-1.5 rounded-full border ${
                    gender === '여'
                      ? 'border-[#43AE52] text-[#20342F]'
                      : 'border-[#C3CCC9] text-gray-600'
                  } text-[10px] font-pretendard`}
                >
                  여
                </button>
              </div>
            </div>
            {/* 이메일 중복 오류는 이메일 입력 섹션 아래에서 표시 */}
          </div>

          {/* Birthdate */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              생년월일
            </label>
            <input
              name="birthDate"
              value={birthDate}
              onChange={e => handleBirthDateChange(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="ex) 1990.10.19"
              className="w-full mt-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
            />
          </div>

          {/* Phone with chips */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              전화번호
            </label>
            <div className="mt-1 flex items-end gap-3">
              <input
                name="phone"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value)
                  setPhoneChecked(false)
                  setPhoneDuplicate(false)
                }}
                inputMode="tel"
                pattern="[0-9]*"
                placeholder="ex) 01037484562"
                className="flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
              />
              <button
                type="button"
                onClick={handlePhoneDupCheck}
                disabled={phoneDupLoading || !phone.trim()}
                className={`min-w-[90px] whitespace-nowrap justify-center px-3 py-1.5 rounded-full border text-[11px] font-pretendard flex items-center ${
                  phoneDupLoading || !phone.trim()
                    ? 'border-[#C3CCC9] text-gray-400 cursor-not-allowed opacity-70'
                    : phoneChecked && !phoneDuplicate
                      ? 'border-[#43AE52] text-[#20342F]'
                      : 'border-[#C3CCC9] text-gray-600'
                }`}
                aria-label="전화번호 중복확인"
              >
                {phoneDupLoading ? (
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
                  '중복확인'
                )}
              </button>
            </div>
            {!phoneDupLoading && phoneChecked && phoneDuplicate && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                이미 등록된 전화번호입니다.
              </p>
            )}
            {!phoneDupLoading && phoneChecked && !phoneDuplicate && (
              <p className="mt-1 text-xs text-[#2F9E44] font-pretendard">
                사용할 수 있는 번호입니다.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              이메일
            </label>
            <div className="mt-1 flex items-end gap-2">
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (!e.target.value) {
                    setEmailVerifySuccess(false)
                  }
                  setEmailSendOk(false)
                  setEmailSendError(false)
                  setVerificationCode('')
                  setCodeConfirmError(false)
                  setEmailDupError('')
                }}
                placeholder="이메일주소를 써주세요!"
                className="flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
              />
              {/* 이메일은 본인인증 시 중복검사 수행 */}
              <button
                type="button"
                onClick={handleEmailVerify}
                disabled={!emailRegex.test(email) || emailVerifyLoading}
                className={`min-w-[90px] whitespace-nowrap justify-center px-3 py-1.5 rounded-full border text-[11px] font-pretendard flex items-center ${
                  emailSendOk || emailVerifySuccess
                    ? 'border-[#43AE52] text-[#20342F]'
                    : 'border-[#C3CCC9] text-gray-600'
                } ${emailVerifyLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-label="이메일 본인인증"
              >
                {emailVerifyLoading ? (
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
            {/* Email duplicate error */}
            {!emailVerifyLoading && emailDupError && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                {emailDupError}
              </p>
            )}
            {/* Email send result messages */}
            {!emailVerifyLoading && emailSendOk && (
              <p className="mt-1 text-xs text-[#2F9E44] font-pretendard">
                이메일이 발송되었어요.
              </p>
            )}
            {!emailVerifyLoading && emailSendError && !emailSendOk && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                관리자에게 문의해주세요.
              </p>
            )}

            {/* Verification code input: show only after send success */}
            {emailSendOk && (
              <div className="mt-3 flex items-end gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  placeholder="이메일로 받은 코드를 붙여넣기"
                  className="flex-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
                />
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  disabled={!verificationCode.trim() || codeConfirmLoading}
                  className={`min-w-[90px] whitespace-nowrap justify-center px-3 py-1.5 rounded-full border text-[11px] font-pretendard flex items-center ${
                    emailVerifySuccess
                      ? 'border-[#43AE52] text-[#20342F]'
                      : !verificationCode.trim() || codeConfirmLoading
                        ? 'border-[#C3CCC9] text-gray-400 cursor-not-allowed opacity-70'
                        : 'border-[#C3CCC9] text-gray-600'
                  }`}
                  aria-label="인증코드 확인"
                >
                  {codeConfirmLoading ? (
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
            )}
            {/* Code confirm result messages */}
            {!codeConfirmLoading && emailVerifySuccess && (
              <p className="mt-1 text-xs text-[#2F9E44] font-pretendard">
                인증에 성공했어요.
              </p>
            )}
            {!codeConfirmLoading && codeConfirmError && !emailVerifySuccess && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                인증에 실패했어요. 다시 시도해주세요.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full mt-1 pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
            />
            {password && password.length < 8 && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                새 비밀번호는 8자 이상이어야 합니다.
              </p>
            )}
          </div>

          {/* Password Confirm */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호가 맞는지 확인해주세요!"
              className={`w-full mt-1 pb-1 border-b placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard ${
                passwordConfirm && passwordConfirm !== password
                  ? 'border-[#DB574F]'
                  : 'border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44]'
              }`}
            />
            {passwordConfirm && passwordConfirm !== password && (
              <p className="mt-1 text-xs text-[#DB574F] font-pretendard">
                비밀번호가 일치하지 않아요.
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] text-[#C3CCC9] font-pretendard font-medium">
              주소
            </label>
            <div className="mt-1 space-y-4">
              <div className="flex items-end gap-3">
                <input
                  name="postcode"
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  placeholder="우편번호"
                  readOnly
                  aria-readonly
                  className="w-32 pb-1 border-b border-[#C3CCC9] bg-gray-50 text-gray-700 placeholder-[#C3CCC9] text-[17px] outline-none font-pretendard"
                />
                <button
                  type="button"
                  onClick={() => setShowPostcode(true)}
                  className="px-3 py-1.5 rounded-full border border-[#C3CCC9] text-[10px] text-gray-600 font-pretendard"
                >
                  우편번호 찾기
                </button>
              </div>
              <input
                name="address1"
                value={address1}
                onChange={e => setAddress1(e.target.value)}
                placeholder="주소를 찾아주세요"
                readOnly
                aria-readonly
                className="w-full pb-1 border-b border-[#C3CCC9] bg-gray-50 text-gray-700 placeholder-[#C3CCC9] text-[17px] outline-none font-pretendard"
              />
              <input
                name="address2"
                value={address2}
                onChange={e => setAddress2(e.target.value)}
                placeholder="상세주소를 입력해주세요"
                ref={address2Ref}
                className="w-full pb-1 border-b border-[#C3CCC9] focus:border-b-2 focus:border-[#2F9E44] caret-[#2F9E44] placeholder-[#C3CCC9] text-[17px] text-gray-900 outline-none font-pretendard"
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="h-1" />

          <div className="h-1" />
        </form>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
        <div className="max-w-sm mx-auto px-6 py-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!canProceed || isLoading}
            className={`w-full py-3 rounded-[20px] font-pretendard text-[17px] shadow ${
              !canProceed || isLoading
                ? 'bg-[#98A7A4] text-white cursor-not-allowed'
                : 'bg-[#43AE52] text-white active:translate-y-[1px]'
            }`}
          >
            다음
          </button>
          <div className="text-center mt-3">
            <span className="text-sm text-gray-600 font-pretendard">
              이미 계정이 있으신가요?{' '}
            </span>
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-pretendard font-medium"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
      {/* Daum Postcode Modal */}
      <DaumPostcodeModal
        open={showPostcode}
        onClose={() => setShowPostcode(false)}
        onSelect={({ zonecode, address }) => {
          setPostcode(zonecode)
          setAddress1(address)
          setShowPostcode(false)
          setTimeout(() => address2Ref.current?.focus(), 0)
        }}
      />
    </div>
  )
}

export default Signup
