import { authApi, churchesApi, groupsApi, membersApi } from '@/lib/api'
import type { Church, Group, User } from '@/types'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupDetail from './GroupDetail'

const Home: React.FC = () => {
  const { groupId } = useParams<{ groupId?: string }>()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [churchIndex, setChurchIndex] = useState(0)
  const [showChurchDropdown, setShowChurchDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // URL 파라미터에서 선택된 그룹 찾기
  const selectedGroup = groupId
    ? groups.find(group => group.id === groupId)
    : null

  // 로컬스토리지에서 교회 ID 가져오기/저장하기
  const getChurchId = (): string | null => {
    return localStorage.getItem('churchId')
  }

  const setChurchId = (churchId: string) => {
    localStorage.setItem('churchId', churchId)
    console.warn('💾 Saved church ID to localStorage:', churchId)
  }

  const handleLogout = () => {
    authApi.logout()
    window.location.reload()
  }

  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0)
    console.warn('📱 Page scrolled to top on Home mount')
  }, [])

  // 교회 목록 가져오기
  useEffect(() => {
    let mounted = true

    const fetchChurches = async () => {
      try {
        console.warn('🔄 Fetching churches from API...')
        const churchesData = await churchesApi.getMyChurches()
        console.warn('✅ Churches API response:', churchesData)

        if (mounted) {
          setChurches(churchesData)
          console.warn(`🏛️ Churches count: ${churchesData.length}`)

          if (churchesData.length > 0) {
            console.warn(
              '📋 Church names:',
              churchesData.map(c => c.name)
            )

            let currentChurchId = ''

            // 저장된 교회 ID가 있는지 확인하고 해당 교회를 선택
            const savedChurchId = getChurchId()
            if (savedChurchId) {
              const savedChurchIndex = churchesData.findIndex(
                church => church.id === savedChurchId
              )
              if (savedChurchIndex !== -1) {
                currentChurchId = savedChurchId
                setChurchIndex(savedChurchIndex)
                console.warn(
                  `🔄 Restored church: ${churchesData[savedChurchIndex].name} (index: ${savedChurchIndex})`
                )
              } else {
                // 저장된 교회 ID가 더 이상 유효하지 않으면 첫 번째 교회 선택
                currentChurchId = churchesData[0].id
                setChurchIndex(0)
                setChurchId(churchesData[0].id)
                console.warn(
                  `⚠️ Saved church ID not found, selecting first church: ${churchesData[0].name}`
                )
              }
            } else {
              // 저장된 교회가 없으면 첫 번째 교회 선택하고 저장
              currentChurchId = churchesData[0].id
              setChurchIndex(0)
              setChurchId(churchesData[0].id)
              console.warn(
                `🆕 No saved church, selecting first church: ${churchesData[0].name}`
              )
            }

            // 선택된 교회의 그룹 목록 가져오기
            try {
              console.warn(`🔄 Fetching groups for church: ${currentChurchId}`)
              const groupsData =
                await groupsApi.getGroupsByChurch(currentChurchId)
              console.warn('✅ Groups API response:', groupsData)

              if (mounted) {
                setGroups(groupsData)
                console.warn(`📊 Groups count: ${groupsData.length}`)
              }
            } catch (groupError) {
              console.error('❌ Failed to fetch groups:', groupError)
              if (mounted) {
                setGroups([])
              }
            }
          }

          if (mounted) {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch churches:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchChurches()

    return () => {
      mounted = false
    }
  }, [])

  // 교회가 변경될 때 그룹 다시 가져오기
  useEffect(() => {
    if (churches.length > 0 && churchIndex >= 0) {
      const currentChurch = churches[churchIndex]
      if (currentChurch) {
        const fetchGroupsForChurch = async () => {
          try {
            console.warn(
              `🔄 Church changed, fetching groups for: ${currentChurch.name} (${currentChurch.id})`
            )
            const groupsData = await groupsApi.getGroupsByChurch(
              currentChurch.id
            )
            console.warn('✅ Groups API response:', groupsData)
            setGroups(groupsData)
            console.warn(`📊 Groups count: ${groupsData.length}`)
          } catch (error) {
            console.error(
              '❌ Failed to fetch groups for changed church:',
              error
            )
            setGroups([])
          }
        }

        fetchGroupsForChurch()
      }
    }
  }, [churchIndex, churches])

  // 사용자 정보 가져오기
  useEffect(() => {
    let mounted = true

    const fetchUserInfo = async () => {
      try {
        console.warn('🔄 Fetching user info from API...')
        const userData = await membersApi.getMyInfo()
        console.warn('✅ User API response:', userData)

        if (mounted) {
          setUser(userData)
          console.warn(`👤 User loaded: ${userData.name}`)
        }
      } catch (error) {
        console.error('❌ Failed to fetch user info:', error)
      }
    }

    fetchUserInfo()

    return () => {
      mounted = false
    }
  }, [])

  // 드롭다운 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showChurchDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        console.warn('🖱️ Outside click detected, closing dropdown')
        setShowChurchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showChurchDropdown])

  // 선택된 교회 인덱스 변경 추적
  useEffect(() => {
    if (churches.length > 0) {
      const currentChurch = churches[churchIndex]
      console.warn(
        `🏛️ Church changed to: ${currentChurch?.name} (index: ${churchIndex}, id: ${currentChurch?.id})`
      )
    }
  }, [churchIndex, churches])

  // 그룹이 선택되면 GroupDetail 화면 표시
  if (selectedGroup) {
    return <GroupDetail group={selectedGroup} onBack={() => navigate('/')} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7E5] sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 relative">
          <div className="w-[30px] h-[31px] bg-[#E5E7E5] rounded flex-shrink-0 flex items-center justify-center">
            <div className="text-[#98A7A4] text-xs font-medium">📍</div>
          </div>
          {loading ? (
            <span className="text-[#20342F] font-bold text-base leading-none tracking-[-0.02em] font-pretendard">
              로딩 중...
            </span>
          ) : churches.length === 0 ? (
            <span className="text-[#20342F] font-bold text-base leading-none tracking-[-0.02em] font-pretendard">
              교회가 없습니다
            </span>
          ) : (
            <div className="flex items-center gap-1" ref={dropdownRef}>
              <button
                onClick={() =>
                  churches.length > 1 &&
                  setShowChurchDropdown(!showChurchDropdown)
                }
                className={`flex items-center gap-1 text-[#20342F] font-bold text-base leading-none tracking-[-0.02em] font-pretendard transition-all px-2 py-1 rounded-md ${
                  churches.length > 1
                    ? 'hover:bg-[#E5E7E5] cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <span>
                  {(() => {
                    const currentChurch = churches[churchIndex]
                    console.warn(
                      `🎯 Church index: ${churchIndex}, Church:`,
                      currentChurch
                    )
                    return currentChurch?.name || '교회 없음'
                  })()}
                </span>
                {churches.length > 1 && (
                  <svg
                    width="10"
                    height="5"
                    viewBox="0 0 10 5"
                    fill="none"
                    className={`transition-transform ${showChurchDropdown ? 'rotate-180' : ''}`}
                  >
                    <path d="M0 0L5 5L10 0H0Z" fill="#20342F" />
                  </svg>
                )}
              </button>

              {/* 드롭다운 메뉴 */}
              {showChurchDropdown && churches.length > 1 && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-30">
                  {churches.map((church, index) => (
                    <button
                      key={church.id}
                      onClick={e => {
                        e.stopPropagation() // 이벤트 버블링 방지
                        console.warn(
                          `🎯 User selected church: ${church.name} (index: ${index}, id: ${church.id})`
                        )
                        console.warn(
                          '🔄 Before update - churchIndex:',
                          churchIndex
                        )
                        setChurchIndex(index)
                        setChurchId(church.id) // 로컬스토리지에 교회 ID 저장
                        setShowChurchDropdown(false)
                        console.warn('✅ Church selection completed')
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-pretendard hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        index === churchIndex
                          ? 'bg-[#F5F7F5] text-[#20342F]'
                          : 'text-gray-700'
                      }`}
                    >
                      {church.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 bg-[#77907D] rounded flex items-center justify-center hover:bg-[#6a8173] transition-colors"
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M8 0C5.243 0 3 2.243 3 5v2H2C0.897 7 0 7.897 0 9v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2h-1V5c0-2.757-2.243-5-5-5zM5 5c0-1.654 1.346-3 3-3s3 1.346 3 3v2H5V5z"
              fill="white"
            />
          </svg>
        </button>
      </header>

      {/* Welcome Section */}
      <section className="bg-white">
        <div className="bg-white px-4 py-6 flex flex-col justify-center min-h-[160px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-[#313332] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard">
              <span className="text-[#70917C]">{user?.name || '사용자'}</span>
              님, 안녕하세요!
              <br />
              오늘은 어떤 하나님을 만나셨나요?
            </h2>
            <p className="text-[#20342F] font-light text-xs leading-relaxed tracking-[-0.02em] font-pretendard">
              하나님이여 사슴이 시냇물을 갈급함 같이 내 영혼이 주를 찾기에
              <br />
              갈급하니이다. (시편 41:1-2)
            </p>
          </div>
        </div>
      </section>

      {/* My Groups Section */}
      <section className="px-4 mt-6 mb-6 space-y-3">
        <h3 className="text-[#232323] font-bold text-xl leading-none tracking-[-0.02em] font-pretendard">
          내 소그룹
        </h3>
        {groups.length === 0 ? (
          // 그룹이 없을 때 표시할 UI (Figma 디자인 기준)
          <div className="w-full max-w-[328px] mx-auto bg-[#F5F7F5] border-2 border-dashed border-[#E4E5E4] rounded-3xl py-10 px-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#50675C] text-base font-normal font-pretendard leading-6 tracking-[-0.02em]">
                등록되어 있는 소그룹이 없어요..🥲
                <br />
                관리자에게 문의해주세요!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide scroll-smooth h-[195px] touch-pan-x">
            {groups.map(group => (
              <div key={group.id} className="flex-shrink-0">
                {/* Frame 173 - 바깥쪽 컨테이너 (gap: 10px) */}
                <div className="flex flex-col gap-2.5">
                  {/* Frame 187 - 실제 카드 */}
                  <button
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="bg-white border border-[#E5E7E5] shadow-sm rounded-[20px] pt-2 px-3 pb-4 w-[160px] h-[183px] flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#C2D0C9] transition-all cursor-pointer"
                  >
                    {/* Group Image */}
                    <div className="w-[143px] h-[107px]">
                      <div className="w-full h-full bg-[#E5E7E5] rounded-2xl flex items-center justify-center">
                        <div className="text-[#98A7A4] text-sm font-medium font-pretendard">
                          이미지
                        </div>
                      </div>
                    </div>

                    {/* Frame 195 - 정보 영역 컨테이너 (gap: 8px) */}
                    <div className="flex flex-col justify-center self-stretch gap-2">
                      {/* Frame 140 - 인원수와 위치를 가로로 배치 (gap: 8px) */}
                      <div className="flex items-center gap-2">
                        {/* Frame 139 - 인원수 (gap: 2px) */}
                        <div className="flex items-center gap-0.5 text-[#4B6050]">
                          {/* user-fill 아이콘 컨테이너 - 12x12, 정확한 위치 (x:2, y:0.5) */}
                          <div className="relative w-3 h-3 flex-shrink-0">
                            <svg
                              width="8"
                              height="10.5"
                              viewBox="0 0 8 10.5"
                              fill="#4B6050"
                              className="absolute"
                              style={{ left: '2px', top: '0.5px' }}
                            >
                              {/* 머리 */}
                              <circle cx="4" cy="2" r="1.5" />
                              {/* 몸통 */}
                              <path d="M4 4c-1.5 0-2.5 1-2.5 2.5v4h5v-4C6.5 5 5.5 4 4 4z" />
                            </svg>
                          </div>
                          <span className="text-xs font-normal font-pretendard leading-none">
                            -
                          </span>
                        </div>
                        {/* Frame 138 - 위치 (gap: 2px) */}
                        <div className="flex items-center gap-0.5 text-[#4B6050]">
                          {/* map-pin-2-fill 아이콘 컨테이너 - 12x12, 정확한 위치 (x:1.5, y:1) */}
                          <div className="relative w-3 h-3 flex-shrink-0">
                            <svg
                              width="9"
                              height="10.86"
                              viewBox="0 0 9 10.86"
                              fill="#4B6050"
                              className="absolute"
                              style={{ left: '1.5px', top: '1px' }}
                            >
                              <path d="M4.5 0C2.019 0 0 2.019 0 4.5S4.5 10.86 4.5 10.86 9 6.981 9 4.5C9 2.019 6.981 0 4.5 0zM4.5 6.75c-1.243 0-2.25-1.007-2.25-2.25S3.257 2.25 4.5 2.25 6.75 3.257 6.75 4.5 5.743 6.75 4.5 6.75z" />
                            </svg>
                          </div>
                          <span className="text-xs font-normal font-pretendard leading-none">
                            {group.description || '-'}
                          </span>
                        </div>
                      </div>
                      {/* 그룹명 */}
                      <h4 className="text-[#070908] font-semibold text-xl leading-none tracking-[-0.02em] font-pretendard text-left">
                        {group.name}
                      </h4>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
