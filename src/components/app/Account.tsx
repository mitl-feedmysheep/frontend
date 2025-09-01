import { useToast } from '@/components/common/ToastProvider'
import { ApiError, membersApi } from '@/lib/api'
import type { User } from '@/types'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FixedBottomButton from './FixedBottomButton'

const Account: React.FC = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [sex, setSex] = useState<'M' | 'F' | ''>('')
  const [birthDateInput, setBirthDateInput] = useState('') // YYYY.MM.DD
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchMe = async () => {
      try {
        setLoading(true)
        const me = await membersApi.getMyInfo()
        if (mounted) {
          setUser(me)
          // 편집 초기값 세팅
          setName(me.name || '')
          setSex(me.sex === 'M' || me.sex === 'F' ? me.sex : '')
          // 서버 birthday는 ISO 혹은 YYYY-MM-DD 가정 → 화면 입력용 YYYY.MM.DD 로
          try {
            const date = new Date(me.birthday)
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, '0')
            const d = String(date.getDate()).padStart(2, '0')
            setBirthDateInput(`${y}.${m}.${d}`)
          } catch {
            // 실패 시 원문 보정 시도
            const digits = (me.birthday || '').replace(/\D/g, '').slice(0, 8)
            let formatted = digits
            if (digits.length > 4)
              formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`
            if (digits.length > 6)
              formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
            setBirthDateInput(formatted)
          }
          setPhone(me.phone || '')
        }
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

  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`
    }
    if (digits.length > 6) {
      formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
    }
    setBirthDateInput(formatted)
  }

  const handleSave = async () => {
    if (!user) return
    // 유효성 간단 체크
    const birthDigits = birthDateInput.replace(/\D/g, '')
    if (birthDigits.length !== 8) {
      showToast('생년월일 8자리를 입력해주세요')
      return
    }
    if (!name.trim()) {
      showToast('이름을 입력해주세요')
      return
    }
    if (sex !== 'M' && sex !== 'F') {
      showToast('성별을 선택해주세요')
      return
    }
    if (!/^\d{7,}$/.test(phone.replace(/\D/g, ''))) {
      showToast('번호는 숫자만 입력해주세요')
      return
    }

    const birthday = `${birthDigits.slice(0, 4)}-${birthDigits.slice(4, 6)}-${birthDigits.slice(6, 8)}`

    try {
      setSaving(true)
      const updated = await membersApi.updateMyInfo({
        id: user.id,
        name: name.trim(),
        sex,
        birthday,
        phone: phone.replace(/\D/g, ''),
      })
      setUser(updated)
      setIsEditing(false)
      showToast('내 정보가 변경되었어요')
    } catch (err) {
      console.error('내 정보 저장 실패:', err)
      if (err instanceof ApiError) showToast(err.message)
      else showToast('저장에 실패했어요')
    } finally {
      setSaving(false)
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

      <div className="px-4 py-4 pb-24 space-y-3">
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
            {/* 이름 */}
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[#313331] text-base font-medium font-pretendard">
                  이름
                </span>
                {!isEditing ? (
                  <span className="text-[#313331] text-sm font-pretendard">
                    {user?.name || '-'}
                  </span>
                ) : (
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-[#313331] text-sm font-pretendard text-right outline-none w-1/2"
                    maxLength={30}
                  />
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3 flex items-center justify-between">
              <span className="text-[#313331] text-base font-medium font-pretendard">
                이메일
              </span>
              <span className="text-[#313331] text-sm font-pretendard">
                {user?.email || '-'}
              </span>
            </div>
            {/* 성별 */}
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#313331] text-base font-medium font-pretendard">
                  성별
                </span>
                {!isEditing ? (
                  <span className="text-[#313331] text-sm font-pretendard">
                    {user?.sex === 'M' ? '남' : user?.sex === 'F' ? '여' : '-'}
                  </span>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSex('M')}
                      className={`px-3 py-1 rounded-full border ${sex === 'M' ? 'bg-[#5F7B6D] text-white border-[#5F7B6D]' : 'border-[#E5E7E5] text-[#313331]'}`}
                    >
                      남
                    </button>
                    <button
                      onClick={() => setSex('F')}
                      className={`px-3 py-1 rounded-full border ${sex === 'F' ? 'bg-[#5F7B6D] text-white border-[#5F7B6D]' : 'border-[#E5E7E5] text-[#313331]'}`}
                    >
                      여
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* 생년월일 */}
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[#313331] text-base font-medium font-pretendard">
                  생년월일
                </span>
                {!isEditing ? (
                  <span className="text-[#313331] text-sm font-pretendard">
                    {formatBirthday(user?.birthday)}
                  </span>
                ) : (
                  <input
                    value={birthDateInput}
                    onChange={e => handleBirthDateChange(e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="text-[#313331] text-sm font-pretendard text-right outline-none w-28"
                    placeholder="YYYY.MM.DD"
                  />
                )}
              </div>
            </div>
            {/* 번호 */}
            <div className="bg-white rounded-xl border border-[#E5E7E5] px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[#313331] text-base font-medium font-pretendard">
                  번호
                </span>
                {!isEditing ? (
                  <span className="text-[#313331] text-sm font-pretendard">
                    {user?.phone || '-'}
                  </span>
                ) : (
                  <input
                    value={phone}
                    onChange={e =>
                      setPhone(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="text-[#313331] text-sm font-pretendard text-right outline-none w-40"
                    placeholder="숫자만"
                  />
                )}
              </div>
            </div>

            {/* 비밀번호 변경 버튼 제거 (설정 화면으로 이동) */}
          </>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      {!loading && !error && (
        <FixedBottomButton
          text={isEditing ? '저장하기' : '변경하기'}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          loading={saving}
        />
      )}
    </div>
  )
}

export default Account
