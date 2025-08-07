import { ApiError, gatheringsApi, groupsApi } from '@/lib/api'
import type { GatheringDetail, GatheringMember, User } from '@/types'
import React, { useEffect, useRef, useState } from 'react'
import ToastNotification from './ToastNotification'

interface AttendanceCheckProps {
  onBack: () => void
  gatheringId: string
  groupId: string
}

const AttendanceCheck: React.FC<AttendanceCheckProps> = ({
  onBack,
  gatheringId,
  groupId,
}) => {
  const [gathering, setGathering] = useState<GatheringDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [_currentUserInGroup, setCurrentUserInGroup] = useState<User | null>(
    null
  )
  const [isCurrentUserLeader, setIsCurrentUserLeader] = useState(false)

  // 토스트 알림 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message)
    setIsToastVisible(true)
  }

  const hideToast = () => {
    setIsToastVisible(false)
  }

  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // 현재 사용자의 그룹 내 권한 정보 가져오기
  useEffect(() => {
    if (!groupId) return

    let mounted = true

    const fetchCurrentUserInGroup = async () => {
      try {
        const userData = await groupsApi.getMyInfoInGroup(groupId)

        if (mounted) {
          setCurrentUserInGroup(userData)
          setIsCurrentUserLeader(userData.role === 'LEADER')
        }
      } catch (error) {
        console.error('사용자 권한 정보 가져오기 실패:', error)
        if (mounted) {
          setCurrentUserInGroup(null)
          setIsCurrentUserLeader(false)
        }
      }
    }

    fetchCurrentUserInGroup()

    return () => {
      mounted = false
    }
  }, [groupId])

  // gatheringId가 변경될 때마다 스크롤을 최상위로
  useEffect(() => {
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
      const hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? '오후' : '오전'
      const displayHours = hours >= 12 ? hours - 12 : hours
      return `${ampm} ${displayHours}시 ${minutes}분`
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
    <>
      <ToastNotification
        message={toastMessage}
        isVisible={isToastVisible}
        onHide={hideToast}
        duration={3000}
      />

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

        {/* Meeting Details */}
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
            <div className="flex-1 p-1">
              <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
                {formatTime(gathering.startedAt)}
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
        <div className="flex-1 px-4 pt-4 pb-6">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-[#232323] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard">
              제목 뭘로 하지..
            </h2>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {gathering.gatheringMembers.map(member => (
              <MemberCard
                key={member.memberId}
                member={member}
                isExpanded={expandedMemberId === member.memberId}
                onToggle={() => {
                  setExpandedMemberId(
                    expandedMemberId === member.memberId
                      ? null
                      : member.memberId
                  )
                }}
                onChange={updatedMember => {
                  // gathering 상태 업데이트
                  const updatedMembers = gathering.gatheringMembers.map(m =>
                    m.memberId === updatedMember.memberId ? updatedMember : m
                  )
                  setGathering({
                    ...gathering,
                    gatheringMembers: updatedMembers,
                  })
                }}
                gatheringId={gatheringId}
                showToast={showToast}
                isReadOnly={!isCurrentUserLeader}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

interface MemberCardProps {
  member: GatheringMember
  isExpanded: boolean
  onToggle: () => void
  onChange: (member: GatheringMember) => void
  gatheringId: string
  showToast: (message: string) => void
  isReadOnly: boolean
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isExpanded,
  onToggle,
  onChange,
  gatheringId,
  showToast,
  isReadOnly,
}) => {
  const [prayerInputs, setPrayerInputs] = useState<string[]>([''])
  const [hasChanges, setHasChanges] = useState(false)
  const [localStory, setLocalStory] = useState(member.story ?? '')
  const [originalMember, setOriginalMember] = useState(member)
  const [worshipLoading, setWorshipLoading] = useState(false)
  const [gatheringLoading, setGatheringLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const storyTextareaRef = useRef<HTMLTextAreaElement>(null)

  // 초기 로드 시에만 originalMember 설정 (가장 먼저 실행)
  useEffect(() => {
    // member가 처음 로드될 때만 originalMember 설정
    if (member.memberId && !isInitialized) {
      setOriginalMember(member)
      setIsInitialized(true)
      setHasChanges(false)

      // 초기 데이터 설정
      setLocalStory(member.story ?? '')
      if (member.prayers && member.prayers.length > 0) {
        setPrayerInputs(member.prayers.map(prayer => prayer.prayerRequest))
      } else {
        setPrayerInputs([''])
      }
    }
  }, [member, isInitialized])

  // 데이터 업데이트는 초기 설정에서만 처리하고, 이후에는 사용자 입력으로만 변경

  // 텍스트 영역 자동 높이 조절 함수
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // 나눔 텍스트 영역 높이 조절
  useEffect(() => {
    if (storyTextareaRef.current) {
      adjustTextareaHeight(storyTextareaRef.current)
    }
  }, [localStory])

  // 초기화 완료 후 모든 텍스트 영역의 높이를 한 번 조절
  useEffect(() => {
    if (!isInitialized) return

    // 나눔 텍스트 영역 조절
    if (storyTextareaRef.current) {
      adjustTextareaHeight(storyTextareaRef.current)
    }

    // 기도제목 텍스트 영역들 조절 (짧은 지연 후)
    setTimeout(() => {
      const prayerTextareas = document.querySelectorAll(
        'textarea[placeholder*="기도제목"]'
      ) as NodeListOf<HTMLTextAreaElement>
      prayerTextareas.forEach(textarea => {
        adjustTextareaHeight(textarea)
      })
    }, 50)
  }, [isInitialized, prayerInputs])

  // 변경사항 감지 (출석 상태는 제외)
  useEffect(() => {
    // 초기화가 완료되지 않았으면 비교하지 않음
    if (!isInitialized || !originalMember.memberId) {
      return
    }

    const hasStoryChanges = localStory !== (originalMember.story ?? '')

    // 기도제목 변경사항 확인: 원본과 현재 입력값 비교
    const originalPrayers =
      originalMember.prayers?.map(p => p.prayerRequest) || []
    const currentPrayers = prayerInputs.filter(input => input.trim() !== '')

    // 배열 길이가 다르거나, 내용이 다른 경우 변경된 것으로 판단
    const hasPrayerChanges =
      originalPrayers.length !== currentPrayers.length ||
      originalPrayers.some(
        (original, index) => original !== currentPrayers[index]
      )

    setHasChanges(hasStoryChanges || hasPrayerChanges)
  }, [localStory, prayerInputs, originalMember, isInitialized])

  // 출석 상태 업데이트 (즉시 API 호출)
  const handleAttendanceChange = async (
    type: 'worship' | 'gathering',
    value: boolean
  ) => {
    try {
      // 개별 로딩 상태 설정
      if (type === 'worship') {
        setWorshipLoading(true)
      } else {
        setGatheringLoading(true)
      }

      // API 요청 데이터 준비 (현재 story와 prayers 포함)
      const updateData = {
        worshipAttendance:
          type === 'worship' ? value : member.worshipAttendance,
        gatheringAttendance:
          type === 'gathering' ? value : member.gatheringAttendance,
        story: localStory,
        prayers: prayerInputs
          .filter(input => input.trim() !== '')
          .map((input, idx) => ({
            prayerRequest: input,
            description: member.prayers[idx]?.description || '',
          })),
      }

      await gatheringsApi.updateMember(
        gatheringId,
        member.groupMemberId,
        updateData
      )

      // API 성공 후에만 UI 업데이트
      const updatedMember = {
        ...member,
        [type === 'worship' ? 'worshipAttendance' : 'gatheringAttendance']:
          value,
      }
      onChange(updatedMember)
    } catch (err) {
      console.error('출석 상태 업데이트 실패:', err)

      if (err instanceof ApiError) {
        alert(`출석 상태 업데이트 실패: ${err.message}`)
      } else {
        alert('출석 상태를 업데이트하는데 실패했습니다.')
      }
    } finally {
      // 개별 로딩 상태 해제
      if (type === 'worship') {
        setWorshipLoading(false)
      } else {
        setGatheringLoading(false)
      }
    }
  }

  const addPrayerInput = () => {
    setPrayerInputs([...prayerInputs, ''])
    // 빈 텍스트 추가는 저장 버튼을 표시하지 않음
  }

  const removePrayerInput = (index: number) => {
    const newPrayerInputs = prayerInputs.filter((_, i) => i !== index)
    // 최소 하나의 빈 입력란은 유지
    if (newPrayerInputs.length === 0) {
      setPrayerInputs([''])
    } else {
      setPrayerInputs(newPrayerInputs)
    }
    // 삭제 시에는 즉시 변경사항으로 감지되어 저장 버튼이 표시됨
  }

  const updatePrayerInput = (index: number, value: string) => {
    const newInputs = [...prayerInputs]
    newInputs[index] = value
    setPrayerInputs(newInputs)

    // prayers 배열 업데이트
    const updatedPrayers = newInputs
      .filter(input => input.trim() !== '')
      .map((input, idx) => ({
        id: member.prayers[idx]?.id || `temp-${idx}`,
        prayerRequest: input,
        description: member.prayers[idx]?.description || '',
        answered: member.prayers[idx]?.answered || false,
      }))

    onChange({ ...member, prayers: updatedPrayers })
  }

  const handleStoryChange = (value: string) => {
    setLocalStory(value)
    onChange({ ...member, story: value })
  }

  const handleSave = async () => {
    try {
      // API 요청 데이터 준비
      const updateData = {
        worshipAttendance: member.worshipAttendance,
        gatheringAttendance: member.gatheringAttendance,
        story: localStory,
        prayers: prayerInputs
          .filter(input => input.trim() !== '')
          .map((input, idx) => ({
            prayerRequest: input,
            description: member.prayers[idx]?.description || '',
          })),
      }

      // 즉시 저장 버튼 숨기기 및 토스트 표시
      setHasChanges(false)
      showToast(`${member.name}님의 나눔 내용이 저장되었어요`)

      const response = await gatheringsApi.updateMember(
        gatheringId,
        member.groupMemberId,
        updateData
      )

      // 서버 응답을 기반으로 상태 업데이트 (순서 보장)
      const updatedMember = {
        ...member,
        story: localStory,
        prayers: response.prayers, // 서버에서 반환된 순서 그대로 사용
      }

      onChange(updatedMember)

      // 저장 성공 후 originalMember 업데이트
      setOriginalMember(updatedMember)
    } catch (err) {
      console.error('멤버 정보 저장 실패:', err)

      // 실패시 저장 버튼 다시 표시
      setHasChanges(true)

      if (err instanceof ApiError) {
        alert(err.message)
      } else {
        alert('나눔 및 기도제목을 저장하는데 실패했습니다.')
      }
    }
  }

  const formatBirthday = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch {
      return ''
    }
  }

  return (
    <div
      className="bg-[#F5F7F5] rounded-2xl p-4 cursor-pointer"
      onClick={onToggle}
    >
      {/* Member Info Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Left: Profile and Name */}
        <div className="flex items-end gap-2">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-11 h-11 bg-[#E5E7E5] rounded-lg flex items-center justify-center"></div>
          </div>

          {/* Name and Birthday */}
          <div className="flex flex-col justify-end gap-0.5">
            <div className="text-[#20342F] font-medium text-2xl leading-tight font-pretendard">
              {member.name}
            </div>
            {member.birthday && (
              <div className="text-[#709180] font-normal text-xs leading-tight font-pretendard">
                {formatBirthday(member.birthday)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Attendance Checkboxes */}
        <div className="flex gap-3" onClick={e => e.stopPropagation()}>
          <label className="flex items-center gap-1 px-1 relative">
            <div className="relative">
              <input
                type="checkbox"
                checked={member.worshipAttendance}
                disabled={worshipLoading || isReadOnly}
                onChange={e => {
                  if (!isReadOnly) {
                    handleAttendanceChange('worship', e.target.checked)
                  }
                }}
                className="w-6 h-6 text-[#5F7B6D] rounded border-[#A5BAAF] border-1.5 disabled:opacity-50"
              />
              {worshipLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <span className="text-[#20342F] font-medium text-base leading-tight font-pretendard">
              예배
            </span>
          </label>
          <label className="flex items-center gap-1 px-1 relative">
            <div className="relative">
              <input
                type="checkbox"
                checked={member.gatheringAttendance}
                disabled={gatheringLoading || isReadOnly}
                onChange={e => {
                  if (!isReadOnly) {
                    handleAttendanceChange('gathering', e.target.checked)
                  }
                }}
                className="w-6 h-6 text-[#5F7B6D] rounded border-[#A5BAAF] border-1.5 disabled:opacity-50"
              />
              {gatheringLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <span className="text-[#20342F] font-medium text-base leading-tight font-pretendard">
              모임
            </span>
          </label>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4" onClick={e => e.stopPropagation()}>
          {/* Divider */}
          <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

          {/* Sharing Section */}
          <div className="space-y-2">
            <div className="text-[#5F7B6D] font-medium text-base leading-tight tracking-[0.025em] font-pretendard">
              나눔
            </div>
            <div className="bg-[#FEFFFE] rounded-lg p-2">
              <textarea
                ref={storyTextareaRef}
                value={localStory}
                onChange={e => !isReadOnly && handleStoryChange(e.target.value)}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement
                  adjustTextareaHeight(target)
                }}
                placeholder={
                  isReadOnly ? '내용이 없습니다.' : '나눔 내용을 적어주세요.'
                }
                readOnly={isReadOnly}
                className={`w-full p-1 text-[#405347] placeholder:text-[#A5BAAF] font-normal text-base leading-tight font-pretendard bg-transparent border-none outline-none resize-none ${
                  isReadOnly ? 'cursor-default' : ''
                }`}
                style={{ minHeight: '24px', height: '24px' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>

          {/* Prayer Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[#5F7B6D] font-medium text-base leading-tight tracking-[0.025em] font-pretendard">
                기도제목
              </div>
              {!isReadOnly && (
                <button
                  className="w-6 h-6 flex items-center justify-center"
                  onClick={addPrayerInput}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1.5C7.41421 1.5 7.75 1.83579 7.75 2.25V6.25H11.75C12.1642 6.25 12.5 6.58579 12.5 7C12.5 7.41421 12.1642 7.75 11.75 7.75H7.75V11.75C7.75 12.1642 7.41421 12.5 7 12.5C6.58579 12.5 6.25 12.1642 6.25 11.75V7.75H2.25C1.83579 7.75 1.5 7.41421 1.5 7C1.5 6.58579 1.83579 6.25 2.25 6.25H6.25V2.25C6.25 1.83579 6.58579 1.5 7 1.5Z"
                      fill="#5F7B6D"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Prayer Inputs */}
            {prayerInputs.map((input, index) => (
              <div key={index} className="bg-[#FEFFFE] rounded-lg p-2">
                <div className="flex items-start gap-2">
                  <textarea
                    value={input}
                    onChange={e =>
                      !isReadOnly && updatePrayerInput(index, e.target.value)
                    }
                    onInput={e => {
                      const target = e.target as HTMLTextAreaElement
                      adjustTextareaHeight(target)
                    }}
                    placeholder={
                      isReadOnly ? '내용이 없습니다.' : '기도제목을 적어주세요.'
                    }
                    readOnly={isReadOnly}
                    className={`flex-1 p-1 text-[#405347] placeholder:text-[#A5BAAF] font-normal text-base leading-tight font-pretendard bg-transparent border-none outline-none resize-none ${
                      isReadOnly ? 'cursor-default' : ''
                    }`}
                    style={{ minHeight: '24px', height: '24px' }}
                  />
                  {!isReadOnly && (
                    <button
                      onClick={() => removePrayerInput(index)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#A5BAAF] hover:text-[#5F7B6D] transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 2V1.5C6 1.22386 6.22386 1 6.5 1H9.5C9.77614 1 10 1.22386 10 1.5V2H13C13.2761 2 13.5 2.22386 13.5 2.5C13.5 2.77614 13.2761 3 13 3H12V13.5C12 14.3284 11.3284 15 10.5 15H5.5C4.67157 15 4 14.3284 4 13.5V3H3C2.72386 3 2.5 2.77614 2.5 2.5C2.5 2.22386 2.72386 2 3 2H6ZM5 3V13.5C5 13.7761 5.22386 14 5.5 14H10.5C10.7761 14 11 13.7761 11 13.5V3H5ZM7 5.5C7 5.22386 6.77614 5 6.5 5C6.22386 5 6 5.22386 6 5.5V11.5C6 11.7761 6.22386 12 6.5 12C6.77614 12 7 11.7761 7 11.5V5.5ZM10 5.5C10 5.22386 9.77614 5 9.5 5C9.22386 5 9 5.22386 9 5.5V11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5V5.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          {!isReadOnly && hasChanges && (
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full bg-[#5F7B6D] text-white py-3 rounded-lg font-medium text-base font-pretendard"
              >
                저장
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AttendanceCheck
