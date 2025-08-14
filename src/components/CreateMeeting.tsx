import React, { useEffect, useState } from 'react'
import { ApiError, gatheringsApi } from '../lib/api'
import { convertKSTtoUTC } from '../lib/utils'
import type { CreateGatheringRequest } from '../types'
import AutoGrowInput from './AutoGrowInput'
import FixedBottomButton from './FixedBottomButton'

interface CreateMeetingProps {
  onBack: () => void
  groupId: string
  onNext: (gatheringId: string) => void
}

const CreateMeeting: React.FC<CreateMeetingProps> = ({
  onBack,
  groupId,
  onNext,
}) => {
  // 오늘 날짜를 기본값으로 설정
  const getToday = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 현재 시간을 HH:mm 형식으로 반환
  const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 현재 시간에서 1시간 30분 후 시간 반환
  const getTimeAfter90Minutes = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 90) // 90분 추가
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    date: getToday(),
    place: '',
    startTime: getCurrentTime(), // 기본값: 현재 시간
    endTime: getTimeAfter90Minutes(), // 기본값: 1시간 30분 후
    notes: '',
  })

  // 에러 상태 관리
  const [timeError, setTimeError] = useState('')

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false)

  // 한국어 날짜 포맷팅 함수
  const formatDateToKorean = (dateString: string): string => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      const weekDays = [
        '일요일',
        '월요일',
        '화요일',
        '수요일',
        '목요일',
        '금요일',
        '토요일',
      ]
      const weekDay = weekDays[date.getDay()]

      return `${year}년 ${month}월 ${day}일 ${weekDay}`
    } catch (_error) {
      return dateString
    }
  }

  // 날짜에서 주차 계산하는 함수
  const getWeekOfMonth = (dateString: string): number => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth()

      // 해당 월의 첫 번째 날
      const firstDay = new Date(year, month, 1)

      // 해당 날짜까지의 일수
      const dayOfMonth = date.getDate()

      // 첫 번째 날의 요일 (0: 일요일, 6: 토요일)
      const firstDayOfWeek = firstDay.getDay()

      // 주차 계산: (날짜 + 첫째날 요일 - 1) / 7 + 1
      const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfWeek) / 7)

      return weekOfMonth
    } catch (_error) {
      return 1 // 에러 시 1주차로 기본값
    }
  }

  // 년월주차 포맷 생성 함수
  const formatWeekFormat = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const year = String(date.getFullYear()).slice(-2)
      const month = date.getMonth() + 1
      const week = getWeekOfMonth(dateString)

      return `${year}년 ${month}월 ${week}주차`
    } catch (_error) {
      return '2025년 1월 1주차' // 에러 시 기본값
    }
  }

  // 시간을 분 단위로 변환하는 함수
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  // 분을 시간 형식으로 변환하는 함수
  const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  // 폼 유효성 검사 함수
  const validateForm = (data: typeof formData): string => {
    if (!data.date) return '날짜를 선택해주세요.'
    if (!data.place || data.place.trim() === '')
      return '모임 장소를 입력해주세요.'
    if (!data.startTime) return '시작 시간을 선택해주세요.'
    if (!data.endTime) return '종료 시간을 선택해주세요.'

    const startMinutes = timeToMinutes(data.startTime)
    const endMinutes = timeToMinutes(data.endTime)

    if (startMinutes >= endMinutes) {
      return '시작 시간은 종료 시간보다 빨라야 합니다.'
    }

    return ''
  }

  // 버튼 활성화 여부 확인
  const isFormValid = (): boolean => {
    return validateForm(formData) === ''
  }

  // 컴포넌트 마운트 시 초기 validation 실행
  useEffect(() => {
    const errorMessage = validateForm(formData)
    setTimeError(errorMessage)
  }, []) // 빈 의존성 배열로 마운트 시에만 실행

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // 시간 관련 필드가 변경될 때마다 검증
      if (field === 'startTime' || field === 'endTime') {
        const errorMessage = validateForm(newData)
        setTimeError(errorMessage)

        // 시작 시간이 변경되었을 때, 끝나는 시간이 시작 시간보다 이르거나 같으면 자동 조정
        if (field === 'startTime') {
          const startMinutes = timeToMinutes(value)
          const endMinutes = timeToMinutes(newData.endTime)

          if (endMinutes <= startMinutes) {
            // 시작 시간보다 1시간 후로 설정
            newData.endTime = minutesToTime(startMinutes + 60)
          }
        }
      } else {
        // 다른 필드 변경 시에도 전체 검증
        const errorMessage = validateForm(newData)
        setTimeError(errorMessage)
      }

      return newData
    })
  }

  const handleNext = async () => {
    if (!isFormValid() || isLoading) return

    try {
      setIsLoading(true)

      const gatheringData: CreateGatheringRequest = {
        groupId,
        name: formatWeekFormat(formData.date),
        description: formData.notes || '',
        date: formData.date,
        startedAt: convertKSTtoUTC(formData.date, formData.startTime),
        endedAt: convertKSTtoUTC(formData.date, formData.endTime),
        place: formData.place,
      }

      const response = await gatheringsApi.create(gatheringData)

      // API 호출 성공 시 다음 화면으로 이동
      onNext(response.id)
    } catch (error) {
      console.error('모임 생성 실패:', error)

      if (error instanceof ApiError) {
        setTimeError(error.message)
      } else {
        setTimeError('모임 생성에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center h-[42px] bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-2 h-full"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.5 6L9.5 12L15.5 18"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-[#313331] font-semibold text-xl leading-tight tracking-[-0.02em] font-pretendard">
            모임 내용
          </h1>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-5 pt-4 pb-24 space-y-3">
        {/* Date Field */}
        <div className="flex items-center gap-1">
          <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M14.25 3H13.5V1.5C13.5 1.08579 13.1642 0.75 12.75 0.75C12.3358 0.75 12 1.08579 12 1.5V3H6V1.5C6 1.08579 5.66421 0.75 5.25 0.75C4.83579 0.75 4.5 1.08579 4.5 1.5V3H3.75C2.50736 3 1.5 4.00736 1.5 5.25V14.25C1.5 15.4926 2.50736 16.5 3.75 16.5H14.25C15.4926 16.5 16.5 15.4926 16.5 14.25V5.25C16.5 4.00736 15.4926 3 14.25 3ZM15 14.25C15 14.6642 14.6642 15 14.25 15H3.75C3.33579 15 3 14.6642 3 14.25V6.75H15V14.25Z"
                fill="#8AA594"
              />
            </svg>
          </div>
          <div className="flex-1 relative">
            {/* 한국어 날짜 표시 */}
            <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard p-1">
              {formatDateToKorean(formData.date)}
            </div>
            {/* 숨겨진 date picker */}
            <input
              type="date"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* 날짜 에러 메시지 */}
        {timeError && timeError.includes('날짜') && (
          <div className="px-5 mt-2">
            <p className="text-red-500 text-sm font-pretendard">{timeError}</p>
          </div>
        )}

        {/* Divider */}
        <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

        {/* Place Field */}
        <div className="flex items-center gap-1">
          <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5C6.51472 1.5 4.5 3.51472 4.5 6C4.5 9.75 9 16.5 9 16.5C9 16.5 13.5 9.75 13.5 6C13.5 3.51472 11.4853 1.5 9 1.5ZM9 8.25C7.75736 8.25 6.75 7.24264 6.75 6C6.75 4.75736 7.75736 3.75 9 3.75C10.2426 3.75 11.25 4.75736 11.25 6C11.25 7.24264 10.2426 8.25 9 8.25Z"
                fill="#8AA594"
              />
            </svg>
          </div>
          <div className="flex-1 bg-white border-0 p-1 rounded">
            <input
              type="text"
              value={formData.place}
              onChange={e => handleInputChange('place', e.target.value)}
              className="w-full text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard bg-transparent border-0 outline-none"
              placeholder="모임 장소를 입력해주세요"
            />
          </div>
        </div>

        {/* 장소 에러 메시지 */}
        {timeError && timeError.includes('장소') && (
          <div className="px-5 mt-2">
            <p className="text-red-500 text-sm font-pretendard">{timeError}</p>
          </div>
        )}

        {/* Divider */}
        <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

        {/* Time Field */}
        <div className="flex items-center gap-1">
          <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1422 4.85775 16.5 9 16.5C13.1422 16.5 16.5 13.1422 16.5 9C16.5 4.85775 13.1422 1.5 9 1.5ZM9 15C5.6865 15 3 12.3135 3 9C3 5.6865 5.6865 3 9 3C12.3135 3 15 5.6865 15 9C15 12.3135 12.3135 15 9 15ZM9.75 5.25V9L12.75 10.875C13.0425 11.0625 13.125 11.4375 12.9375 11.73C12.8325 11.895 12.6525 11.985 12.465 11.985C12.36 11.985 12.2475 11.955 12.15 11.895L8.85 9.795C8.64 9.66 8.25 9.345 8.25 8.985V5.25C8.25 4.8375 8.5875 4.5 9 4.5C9.4125 4.5 9.75 4.8375 9.75 5.25Z"
                fill="#8AA594"
              />
            </svg>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <input
                type="time"
                value={formData.startTime}
                onChange={e => handleInputChange('startTime', e.target.value)}
                className="w-full p-1 text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard border-none outline-none bg-transparent"
              />
            </div>
            <span className="text-[#000000] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard px-2">
              ~
            </span>
            <div className="flex-1">
              <input
                type="time"
                value={formData.endTime}
                min={formData.startTime}
                onChange={e => handleInputChange('endTime', e.target.value)}
                className="w-full p-1 text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard border-none outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* 시간 에러 메시지 */}
        {timeError &&
          !timeError.includes('장소') &&
          !timeError.includes('날짜') && (
            <div className="px-5 mt-2">
              <p className="text-red-500 text-sm font-pretendard">
                {timeError}
              </p>
            </div>
          )}

        {/* Divider */}
        <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

        {/* Notes Field */}
        <div className="flex items-start gap-1">
          <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center mt-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5L11.09 5.26L15.18 5.82L12.09 8.78L12.82 12.84L9 10.77L5.18 12.84L5.91 8.78L2.82 5.82L6.91 5.26L9 1.5Z"
                stroke="#8AA594"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex-1 bg-white border-0 p-1 rounded">
            <AutoGrowInput
              value={formData.notes}
              onChange={next =>
                handleInputChange('notes', next.replace(/\n/g, ' '))
              }
              placeholder="특이사항"
              className="border-none"
              inputClassName="rounded bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <FixedBottomButton
        text="다음"
        onClick={handleNext}
        disabled={!isFormValid()}
        loading={isLoading}
      />
    </div>
  )
}

export default CreateMeeting
