import { ApiError, gatheringsApi } from '@/lib/api'
import type { GatheringDetail, GatheringMember } from '@/types'
import React, { useEffect, useState } from 'react'

interface AttendanceCheckProps {
  onBack: () => void
  gatheringId: string
}

const AttendanceCheck: React.FC<AttendanceCheckProps> = ({
  onBack,
  gatheringId,
}) => {
  const [gathering, setGathering] = useState<GatheringDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    // 모바일에서 더 확실한 스크롤 리셋
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // gatheringId가 변경될 때마다 스크롤을 최상위로
  useEffect(() => {
    // 모바일에서 더 확실한 스크롤 리셋
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [gatheringId])

  useEffect(() => {
    const fetchGatheringDetail = async () => {
      try {
        setLoading(true)
        const data = await gatheringsApi.getDetail(gatheringId)
        setGathering(data)
      } catch (err) {
        console.error('모임 상세 정보 조회 실패:', err)
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('모임 정보를 불러오는데 실패했습니다.')
        }
      } finally {
        setLoading(false)
        // 데이터 로딩 완료 후 스크롤을 최상위로 (DOM 렌더링 후)
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        }, 100)
      }
    }

    fetchGatheringDetail()
  }, [gatheringId])

  // 날짜 포맷팅 함수들
  const formatDateToKorean = (dateString: string): string => {
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
    } catch {
      return dateString
    }
  }

  const formatTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#405347] font-pretendard">
            모임 정보를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  if (error || !gathering) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 font-pretendard mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#5F7B6D] text-white rounded-lg font-pretendard"
          >
            이전으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center h-[42px] bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
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
          <span className="text-[#405347] font-medium text-base leading-tight font-pretendard">
            오늘의 기록
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Meeting Details - 항상 최상단에 표시 */}
      <div className="bg-white px-5 py-4 space-y-3">
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
          <div className="flex-1">
            <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard p-1">
              {formatDateToKorean(gathering.date)}
            </div>
          </div>
        </div>

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
          <div className="flex-1 p-1">
            <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
              {gathering.place}
            </div>
          </div>
        </div>

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
          <div className="flex-1 flex items-center gap-2 p-1">
            <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
              {formatTime(gathering.startedAt)}
            </div>
            <span className="text-[#000000] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
              ~
            </span>
            <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
              {formatTime(gathering.endedAt)}
            </div>
          </div>
        </div>

        {/* Description Field (if exists) */}
        {gathering.description && gathering.description.trim() && (
          <>
            {/* Divider */}
            <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

            <div className="flex items-start gap-1">
              <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center mt-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M15 2.25H3C2.17157 2.25 1.5 2.92157 1.5 3.75V14.25C1.5 15.0784 2.17157 15.75 3 15.75H15C15.8284 15.75 16.5 15.0784 16.5 14.25V3.75C16.5 2.92157 15.8284 2.25 15 2.25ZM15 14.25H3V3.75H15V14.25ZM4.5 6H13.5V7.5H4.5V6ZM4.5 9H13.5V10.5H4.5V9ZM4.5 12H10.5V13.5H4.5V12Z"
                    fill="#8AA594"
                  />
                </svg>
              </div>
              <div className="flex-1 p-1">
                <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard whitespace-pre-line">
                  {gathering.description}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-6">
        {/* Members List */}
        <div className="space-y-3">
          {gathering.gatheringMembers.map(member => (
            <MemberItem
              key={member.memberId}
              member={member}
              onChange={updatedMember => {
                // TODO: 출석 상태 업데이트 로직
                console.warn('Member updated:', updatedMember)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface MemberItemProps {
  member: GatheringMember
  onChange: (member: GatheringMember) => void
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onChange }) => {
  return (
    <div className="bg-[#F5F7F5] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#405347] font-medium text-base font-pretendard">
          {member.name}
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={member.worshipAttendance}
              onChange={e =>
                onChange({ ...member, worshipAttendance: e.target.checked })
              }
              className="w-4 h-4 text-[#5F7B6D] rounded"
            />
            <span className="text-sm text-[#405347] font-pretendard">예배</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={member.gatheringAttendance}
              onChange={e =>
                onChange({ ...member, gatheringAttendance: e.target.checked })
              }
              className="w-4 h-4 text-[#5F7B6D] rounded"
            />
            <span className="text-sm text-[#405347] font-pretendard">모임</span>
          </label>
        </div>
      </div>

      <textarea
        value={member.story}
        onChange={e => onChange({ ...member, story: e.target.value })}
        placeholder="나눔 내용을 입력하세요..."
        className="w-full h-20 p-3 border border-[#E5E7E5] rounded-lg resize-none text-sm text-[#405347] placeholder:text-[#A5BAAF] font-pretendard"
      />
    </div>
  )
}

export default AttendanceCheck
