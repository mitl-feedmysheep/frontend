import { groupsApi } from '@/lib/api'
import type { Gathering, Group, User } from '@/types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface GroupDetailProps {
  groupId: string
  onBack: () => void
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [groupError, setGroupError] = useState('')
  const [members, setMembers] = useState<User[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [currentUserInGroup, setCurrentUserInGroup] = useState<User | null>(
    null
  )
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [allGatherings, setAllGatherings] = useState<Gathering[]>([])
  const [gatheringsLoading, setGatheringsLoading] = useState(true)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)

  const monthDropdownRef = useRef<HTMLDivElement>(null)

  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Group 정보 가져오기
  useEffect(() => {
    let mounted = true

    const fetchGroupInfo = async () => {
      try {
        setGroupLoading(true)
        setGroupError('')

        const churchId = localStorage.getItem('churchId')
        if (!churchId) {
          console.error(
            'churchId not found in localStorage. Redirecting to home.'
          )
          if (mounted) {
            setGroupError('교회 정보가 없습니다. 홈으로 돌아갑니다.')
            navigate('/', { replace: true })
          }
          return
        }

        // localStorage에서 groups 찾기
        const savedGroups = localStorage.getItem('groups')
        let foundGroup: Group | undefined = undefined

        if (savedGroups) {
          try {
            const groups: Group[] = JSON.parse(savedGroups)
            foundGroup = groups.find(g => g.id === groupId)
          } catch (error) {
            console.error('Failed to parse groups from localStorage:', error)
          }
        }

        // localStorage에 없으면 API에서 가져오기
        if (!foundGroup) {
          console.warn(
            `Group ${groupId} not found in localStorage, fetching all groups for church ${churchId} from API...`
          )
          const groups = await groupsApi.getGroupsByChurch(churchId)
          localStorage.setItem('groups', JSON.stringify(groups))
          foundGroup = groups.find(g => g.id === groupId)
        }

        if (mounted) {
          if (foundGroup) {
            setGroup(foundGroup)
            setGroupError('')
          } else {
            console.error('Group not found after fetching:', groupId)
            setGroupError('그룹을 찾을 수 없습니다.')
            navigate('/', { replace: true })
          }
          setGroupLoading(false)
        }
      } catch (error) {
        console.error('Error fetching group info:', error)
        if (mounted) {
          setGroupError('그룹 정보를 불러오는데 실패했습니다.')
          setGroupLoading(false)
        }
      }
    }

    fetchGroupInfo()

    return () => {
      mounted = false
    }
  }, [groupId, navigate])

  // 오늘이 생일인지 확인하는 함수
  const isTodayBirthday = (birthday: string | null | undefined): boolean => {
    if (!birthday) return false

    const today = new Date()
    const birthDate = new Date(birthday)

    return (
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() === birthDate.getDate()
    )
  }

  // 리더인지 확인하는 함수
  const isLeader = (role: string | null | undefined): boolean => {
    return role === 'LEADER'
  }

  // 이름에서 성을 제거하고 이름만 반환하는 함수
  const getFirstName = (fullName: string): string => {
    // 한국어 이름은 보통 성이 1글자, 이름이 2글자
    // 3글자 이상인 경우 첫 글자를 성으로 간주하고 나머지를 이름으로 처리
    if (fullName.length >= 2) {
      return fullName.slice(1) // 첫 글자(성) 제거
    }
    return fullName // 1글자인 경우 그대로 반환
  }

  // 날짜 포맷 변환 함수 (2022-01-01 → 2022.1.1)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 0부터 시작하므로 +1
      const day = date.getDate()
      return `${year}.${month}.${day}`
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString // 에러 시 원본 반환
    }
  }

  // 그룹 시작일부터 현재까지의 월 리스트 생성 (전체 옵션 포함)
  const generateMonthList = useCallback((): {
    year: number | null
    month: number | null
    label: string
  }[] => {
    if (!group?.startDate) {
      return [{ year: null, month: null, label: '전체' }]
    }

    try {
      const startDate = new Date(group.startDate)
      const currentDate = new Date()
      const months: {
        year: number | null
        month: number | null
        label: string
      }[] = []

      // 전체 옵션을 맨 위에 추가
      months.push({
        year: null,
        month: null,
        label: '전체',
      })

      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      while (current <= end) {
        const year = current.getFullYear()
        const month = current.getMonth() + 1
        const shortYear = year.toString().slice(-2) // 2022 → 22
        months.push({
          year,
          month,
          label: `${shortYear}년 ${month}월`,
        })
        current.setMonth(current.getMonth() + 1)
      }

      // 전체가 맨 위에 있고, 나머지는 최신순으로 정렬
      const allOption = months.shift() // "전체" 옵션 제거
      const sortedMonths = months.reverse() // 최신순으로 정렬
      return [allOption!, ...sortedMonths] // "전체"를 맨 앞에 다시 추가
    } catch (error) {
      console.error('Month list generation error:', error)
      return [
        { year: null, month: null, label: '전체' },
        {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          label: '현재',
        },
      ]
    }
  }, [group?.startDate])

  const monthList = useMemo(() => generateMonthList(), [generateMonthList])
  const selectedMonth = monthList[selectedMonthIndex]
  const selectedYear = selectedMonth?.year
  const selectedMonthNumber = selectedMonth?.month

  // 전체 기도제목 개수 계산
  const totalPrayerRequests = useMemo(() => {
    return allGatherings.reduce(
      (total, gathering) => total + gathering.totalPrayerRequestCount,
      0
    )
  }, [allGatherings])

  // 현재 유저가 이 그룹에서 LEADER인지 확인
  const isCurrentUserLeader = useMemo(() => {
    if (!currentUserInGroup) {
      return false
    }

    const isLeader = currentUserInGroup.role === 'LEADER'

    console.warn(`👑 Current user leader status in group ${group?.id}:`, {
      userId: currentUserInGroup.id,
      userName: currentUserInGroup.name,
      role: currentUserInGroup.role,
      isLeader,
    })

    return isLeader
  }, [currentUserInGroup, group?.id])

  // 현재 그룹에서의 유저 정보 가져오기
  useEffect(() => {
    if (!group?.id) return

    let mounted = true

    const fetchCurrentUserInGroup = async () => {
      try {
        console.warn(`🔄 Fetching current user info in group: ${group.id}`)
        const userData = await groupsApi.getMyInfoInGroup(group.id)
        console.warn('✅ Current user in group API response:', userData)

        if (mounted) {
          setCurrentUserInGroup(userData)
        }
      } catch (error) {
        console.error('❌ Error fetching current user in group:', error)
        if (mounted) {
          setCurrentUserInGroup(null)
        }
      }
    }

    fetchCurrentUserInGroup()

    return () => {
      mounted = false
    }
  }, [group?.id])

  // 멤버 목록 가져오기
  useEffect(() => {
    if (!group?.id) return

    let mounted = true

    const fetchMembers = async () => {
      try {
        console.warn(`🔄 Fetching members for group: ${group.id}`)
        const membersData = await groupsApi.getGroupMembers(group.id)
        console.warn('✅ Members API response:', membersData)

        if (mounted) {
          setMembers(membersData)
          console.warn(`👥 Members count: ${membersData.length}`)
        }
      } catch (error) {
        console.error('❌ Error fetching members:', error)
        if (mounted) {
          setMembers([])
        }
      } finally {
        if (mounted) {
          setMembersLoading(false)
        }
      }
    }

    fetchMembers()

    return () => {
      mounted = false
    }
  }, [group?.id])

  // 선택된 월의 모임 목록 가져오기
  useEffect(() => {
    if (!group?.id) return

    let mounted = true

    const fetchGatherings = async () => {
      try {
        setGatheringsLoading(true)
        console.warn(
          `🔄 Fetching gatherings for group: ${group.id}, filter: ${selectedYear ? `${selectedYear}-${selectedMonthNumber}` : '전체'}`
        )
        const gatheringsData = await groupsApi.getGroupGatherings(group.id)
        console.warn('✅ Gatherings API response:', gatheringsData)

        if (mounted) {
          // 전체 모임 데이터 저장
          setAllGatherings(gatheringsData)

          // 🔍 디버깅: API 데이터 상세 로그
          console.warn('🔍 Raw gatherings data:', gatheringsData)
          gatheringsData.forEach((gathering, index) => {
            const gatheringDate = new Date(gathering.date)
            console.warn(`🔍 Gathering ${index + 1}:`, {
              id: gathering.id,
              name: gathering.name,
              date: gathering.date,
              place: gathering.place,
              parsedDate: gatheringDate,
              year: gatheringDate.getFullYear(),
              month: gatheringDate.getMonth() + 1,
              day: gatheringDate.getDate(),
            })
          })

          console.warn(
            `🔍 Selected filter: ${selectedYear ? `${selectedYear}-${selectedMonthNumber}` : '전체'}`
          )

          // 전체 선택 시 모든 모임 표시, 특정 월 선택 시 해당 월만 필터링
          const filteredGatherings =
            selectedYear && selectedMonthNumber
              ? gatheringsData.filter(gathering => {
                  const gatheringDate = new Date(gathering.date)
                  const matchesYear =
                    gatheringDate.getFullYear() === selectedYear
                  const matchesMonth =
                    gatheringDate.getMonth() + 1 === selectedMonthNumber

                  console.warn(`🔍 Filter check for ${gathering.name}:`, {
                    gatheringYear: gatheringDate.getFullYear(),
                    selectedYear,
                    matchesYear,
                    gatheringMonth: gatheringDate.getMonth() + 1,
                    selectedMonth: selectedMonthNumber,
                    matchesMonth,
                    finalMatch: matchesYear && matchesMonth,
                  })

                  return matchesYear && matchesMonth
                })
              : gatheringsData // 전체 선택 시 모든 데이터 표시

          setGatherings(filteredGatherings)
          console.warn(
            `📅 Filtered gatherings count for ${selectedYear ? `${selectedYear}-${selectedMonthNumber}` : '전체'}: ${filteredGatherings.length}`
          )
          console.warn(`📊 Total gatherings count: ${gatheringsData.length}`)
        }
      } catch (error) {
        console.error('❌ Error fetching gatherings:', error)
        if (mounted) {
          setGatherings([])
          setAllGatherings([])
        }
      } finally {
        if (mounted) {
          setGatheringsLoading(false)
        }
      }
    }

    fetchGatherings()

    return () => {
      mounted = false
    }
  }, [group?.id, selectedYear, selectedMonthNumber])

  // 월 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMonthDropdown(false)
      }
    }

    if (showMonthDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMonthDropdown])

  interface Meeting {
    id: number
    type: string
    date: string
    hasContent: boolean
    gathering?: Gathering // 실제 모임 데이터 (선택적)
  }

  const MeetingCard = ({
    meeting,
    onClick,
  }: {
    meeting: Meeting
    onClick?: () => void
  }) => {
    const getCardStyle = () => {
      switch (meeting.type) {
        case 'affordance':
          return 'bg-[#F5F7F5] border-2 border-dashed border-[#C2D0C9]'
        case 'fill':
          return 'bg-[#F5F7F5] border border-[#A5BAAF]'
        case 'empty':
          return 'bg-[#F5F7F5] border border-[#A5BAAF]'
        default:
          return 'bg-[#F5F7F5]'
      }
    }

    // 날짜를 "12일 금요일" 형태로 포맷팅
    const formatMeetingDate = (dateString: string): string => {
      try {
        const date = new Date(dateString)
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
        return `${day}일 ${weekDay}`
      } catch (error) {
        console.error('Date formatting error:', error)
        return dateString
      }
    }

    if (meeting.type === 'affordance') {
      return (
        <button
          onClick={() => {
            console.warn('Navigating to create meeting')
            navigate(`/group/${groupId}/create`)
          }}
          className={`${getCardStyle()} rounded-2xl w-full h-[69px] flex items-center justify-center px-5 py-3 hover:border-[#A5BAAF] transition-colors cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M2.75 20.24L7.67 18.77L18.54 7.9C19.15 7.29 19.15 6.31 18.54 5.7L16.3 3.46C15.69 2.85 14.71 2.85 14.1 3.46L3.23 14.33L1.76 19.25C1.68 19.52 1.72 19.81 1.87 20.04C2.02 20.27 2.27 20.42 2.54 20.42C2.61 20.42 2.68 20.41 2.75 20.24ZM15.17 4.53L17.41 6.77L15.64 8.54L13.4 6.3L15.17 4.53ZM4.38 15.46L12.33 7.51L14.57 9.75L6.62 17.7L4.38 15.46Z"
                  fill="#5F7B69"
                />
              </svg>
            </div>
            <span className="text-[#313331] font-medium text-sm">
              모임 내용을 작성해주세요!
            </span>
          </div>
        </button>
      )
    }

    // fill 또는 empty 타입인 경우
    const gathering = meeting.gathering

    // fill 타입이고 onClick이 있으면 클릭 가능한 버튼으로, 아니면 일반 div로
    const Component = meeting.type === 'fill' && onClick ? 'button' : 'div'
    const clickHandler =
      meeting.type === 'fill' && onClick ? onClick : undefined
    const hoverStyles =
      meeting.type === 'fill' && onClick
        ? 'hover:bg-[#E8ECE8] hover:border-[#8AA594] cursor-pointer'
        : ''

    return (
      <Component
        onClick={clickHandler}
        className={`${getCardStyle()} ${hoverStyles} rounded-2xl w-full min-h-[69px] flex items-center gap-3 px-5 py-3 transition-colors`}
      >
        {/* 왼쪽: 모임 이름 및 날짜 - 왼쪽 정렬로 변경 */}
        <div className="w-[98px] flex flex-col items-start">
          <div className="text-[#40534A] font-light text-xs leading-tight tracking-[-0.02em] font-pretendard text-left">
            {gathering?.name || `${meeting.id}번째 모임`}
          </div>
          <div className="text-[#40534A] font-medium text-xl leading-tight tracking-[-0.02em] font-pretendard text-left">
            {gathering
              ? formatMeetingDate(gathering.date)
              : formatMeetingDate(meeting.date)}
          </div>
        </div>

        {/* 중간: 세로 점선 */}
        <div className="w-0 h-10 border-r border-dashed border-[#A5BAAF]"></div>

        {/* 오른쪽: 모임 정보 */}
        <div className="flex-1 flex flex-col gap-2">
          {/* 상단: 아이콘들과 숫자들 - 1px 간격 */}
          <div className="flex gap-px">
            {/* 예배참석 수 */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  {/* 십자가 모양: 세로선이 더 길고 가로선이 위쪽에 */}
                  <path
                    d="M6 0.5V11.5M2.5 4H9.5"
                    stroke="#4B6050"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[#4B6050] font-normal text-xs leading-none tracking-[-0.02em] font-pretendard w-[20px] text-left">
                {meeting.type === 'fill' && gathering
                  ? gathering.totalWorshipAttendanceCount
                  : '0'}
              </span>
            </div>

            {/* 모임참석 수 */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 2C6.83 2 7.5 2.67 7.5 3.5S6.83 5 6 5S4.5 4.33 4.5 3.5S5.17 2 6 2ZM6 6.5C7.33 6.5 10 7.17 10 8.5V10H2V8.5C2 7.17 4.67 6.5 6 6.5Z"
                    fill="#4B6050"
                  />
                </svg>
              </div>
              <span className="text-[#4B6050] font-normal text-xs leading-none tracking-[-0.02em] font-pretendard w-[20px] text-left">
                {meeting.type === 'fill' && gathering
                  ? gathering.totalGatheringAttendanceCount
                  : '0'}
              </span>
            </div>

            {/* 위치 */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1C7.66 1 9 2.34 9 4C9 6.5 6 11 6 11S3 6.5 3 4C3 2.34 4.34 1 6 1ZM6 2.5C5.17 2.5 4.5 3.17 4.5 4S5.17 5.5 6 5.5S7.5 4.83 7.5 4S6.83 2.5 6 2.5Z"
                    fill="#4B6050"
                  />
                </svg>
              </div>
              <span
                className={`font-normal text-xs leading-none tracking-[-0.02em] font-pretendard ${
                  meeting.type === 'fill' ? 'text-[#4B6050]' : 'text-[#A5BAAF]'
                }`}
              >
                {gathering?.place ||
                  (meeting.type === 'fill' ? '꿈의 교육관 1층' : '-')}
              </span>
            </div>
          </div>

          {/* 하단: 모임 설명 - 십자가와 세로 정렬, 엔터 표시, 여러 줄 지원 */}
          {meeting.type === 'fill' &&
            gathering &&
            gathering.description &&
            gathering.description.trim() && (
              <div className="text-[#4B6050] font-normal text-xs leading-tight tracking-[-0.02em] font-pretendard whitespace-pre-line text-left">
                {gathering.description}
              </div>
            )}

          {meeting.type === 'empty' && (
            <div className="text-[#A5BAAF] font-normal text-xs leading-none tracking-[-0.02em] font-pretendard">
              이날은 특이사항이 없는 날이네요:)
            </div>
          )}
        </div>
      </Component>
    )
  }

  // 그룹 로딩 중인 경우
  if (groupLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#405347] font-pretendard">
            그룹 정보를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // 그룹 에러가 있는 경우
  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 font-pretendard mb-4">
            {groupError || '그룹을 찾을 수 없습니다.'}
          </p>
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
      <header className="flex items-center justify-between h-[42px] bg-white">
        {/* Left Accessory */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-2 h-full w-[130px]"
        >
          <div className="w-6 h-6 bg-white flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.71 5.71L14.29 4.29L7.29 11.29C6.9 11.68 6.9 12.32 7.29 12.71L14.29 19.71L15.71 18.29L9.41 12L15.71 5.71Z"
                fill="#000000"
              />
            </svg>
          </div>
        </button>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center h-full">
          <h1 className="text-[#313331] font-semibold text-xl leading-none tracking-[-0.02em] font-pretendard">
            {group.name}
          </h1>
        </div>

        {/* Right Accessory */}
        <div className="w-[130px] h-full"></div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {/* Members Section */}
        <div className="mb-8">
          {/* Members Header */}
          <div className="flex items-center gap-1 mb-[22px]">
            <span className="text-[#313331] font-medium text-sm leading-none tracking-[-0.02em] font-pretendard">
              {group.name} 멤버
            </span>
            <span className="text-[#389629] font-medium text-sm leading-none tracking-[-0.02em] font-pretendard">
              {membersLoading ? '-' : members.length}
            </span>
          </div>

          {/* Members Grid */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide touch-pan-x pb-2">
            {membersLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-[#709180] text-sm font-pretendard">
                  멤버 로딩 중...
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-[#709180] text-sm font-pretendard">
                  멤버가 없습니다
                </div>
              </div>
            ) : (
              members.map(member => (
                <div key={member.id} className="flex-shrink-0 relative">
                  <div className="w-11 h-11 bg-[#E5E7E5] rounded-lg flex items-center justify-center">
                    <span className="text-[#313331] font-medium text-sm font-pretendard">
                      {getFirstName(member.name)}
                    </span>
                  </div>

                  {/* 오른쪽 하단 아이콘들 */}
                  <div className="absolute bottom-0 right-0">
                    {/* 리더 기도하는 손 이모지 (리더인 경우) */}
                    {isLeader(member.role) && (
                      <div className="absolute bottom-0 right-0 text-xs">
                        🤲
                      </div>
                    )}

                    {/* 생일케이크 이모지 (오늘이 생일인 경우) */}
                    {isTodayBirthday(member.birthday) && (
                      <div
                        className={`absolute bottom-0 text-xs ${
                          isLeader(member.role) ? 'right-4' : 'right-0'
                        }`}
                      >
                        🎂
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Group Info Section */}
        <div className="mb-6">
          <p className="text-[#709180] font-normal text-xs leading-tight tracking-[-0.02em] font-pretendard mb-1">
            {formatDate(group.startDate)} ~ {formatDate(group.endDate)}
          </p>
          <h2 className="text-[#313331] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard">
            지금까지 총{' '}
            <span className="text-[#70917C]">{allGatherings.length}번</span>의
            모임과{' '}
            <span className="text-[#70917C]">{totalPrayerRequests}개</span>의
            <br />
            기도제목이 쌓였어요!
          </h2>
        </div>

        {/* Meetings Section */}
        <div>
          {/* Meetings Header */}
          <div className="mb-2">
            <div className="relative" ref={monthDropdownRef}>
              <button
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="flex items-center gap-2 hover:bg-[#F5F7F5] px-2 py-1 rounded-md transition-colors"
              >
                <h3 className="text-[#313331] font-bold text-xl leading-none tracking-[-0.02em] font-pretendard">
                  {selectedMonth?.label || '로딩중...'}
                </h3>
                <div className="bg-white rounded p-[3px] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M4.5 7.5L9 12L13.5 7.5"
                      stroke="#313332"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Month Dropdown */}
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E7E5] rounded-lg shadow-lg z-30 min-w-[120px] max-h-48 overflow-y-auto">
                  {monthList.map((month, index) => (
                    <button
                      key={`${month.year}-${month.month}`}
                      onClick={() => {
                        setSelectedMonthIndex(index)
                        setShowMonthDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-pretendard hover:bg-[#F5F7F5] first:rounded-t-lg last:rounded-b-lg ${
                        index === selectedMonthIndex
                          ? 'bg-[#E5E7E5] text-[#70917C]'
                          : 'text-[#313331]'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meetings List */}
          <div className="space-y-3">
            {gatheringsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-[#709180] text-sm font-pretendard">
                  모임 로딩 중...
                </div>
              </div>
            ) : (
              <>
                {/* 모임 추가하기 카드 (LEADER일 때만 표시) */}
                {isCurrentUserLeader && (
                  <MeetingCard
                    key="affordance"
                    meeting={{
                      id: 0,
                      type: 'affordance',
                      date: '',
                      hasContent: false,
                    }}
                  />
                )}

                {/* 실제 모임 데이터 */}
                {gatherings.map((gathering, index) => (
                  <MeetingCard
                    key={gathering.id}
                    meeting={{
                      id: index + 1,
                      type: 'fill',
                      date: gathering.date,
                      hasContent: true,
                      gathering: gathering, // 추가 정보를 위해 원본 gathering 데이터도 포함
                    }}
                    onClick={() => {
                      console.warn('Navigating to gathering:', gathering.id)
                      // 스크롤을 최상위로 리셋하고 네비게이션 (모바일에서 더 확실하게)
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                      document.documentElement.scrollTop = 0
                      document.body.scrollTop = 0
                      navigate(`/group/${groupId}/gathering/${gathering.id}`)
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupDetail
