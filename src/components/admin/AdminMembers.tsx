import { adminApi } from '@/lib/admin-api'
import type { MemberSearchResponse } from '@/types'
import { useEffect, useState } from 'react'

// 그룹 소속 정보 타입
interface GroupMembership {
  groupName: string
  role: '리더' | '서브리더' | '멤버'
}

// 더미 데이터 타입
interface Member {
  id: string
  name: string
  email: string
  gender: '남' | '여'
  birthday: string
  phone: string
  address: string
  description: string
  groups: GroupMembership[]
}

// API 응답을 UI용 Member 타입으로 변환
const convertApiResponseToMember = (
  apiMember: MemberSearchResponse
): Member => {
  return {
    id: apiMember.memberId,
    name: apiMember.name,
    email: apiMember.email,
    gender: apiMember.sex === 'M' ? '남' : '여',
    birthday: apiMember.birthday,
    phone: apiMember.phone,
    address: apiMember.address,
    description: apiMember.description,
    groups: apiMember.groups.map(g => ({
      groupName: g.groupName,
      role:
        g.role === 'LEADER'
          ? '리더'
          : g.role === 'SUB_LEADER'
            ? '서브리더'
            : '멤버',
    })),
  }
}

const STORAGE_KEY = 'admin-members-state'

function AdminMembers() {
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // SessionStorage에서 상태 복원
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.inputValue) setInputValue(parsed.inputValue)
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery)
        if (parsed.members) setMembers(parsed.members)
        if (parsed.selectedMember) setSelectedMember(parsed.selectedMember)
      } catch (error) {
        console.error('Failed to restore state:', error)
      }
    }
  }, [])

  // 상태 변경 시 SessionStorage에 저장
  useEffect(() => {
    const state = {
      inputValue,
      searchQuery,
      members,
      selectedMember,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [inputValue, searchQuery, members, selectedMember])

  // 검색 실행 함수
  const handleSearch = async () => {
    const query = inputValue.trim()

    // 빈 문자열 체크
    if (!query) {
      return
    }

    setIsLoading(true)
    try {
      const apiResponse = await adminApi.searchMembers(query)
      const convertedMembers = apiResponse.map(convertApiResponseToMember)
      setMembers(convertedMembers)
      setSearchQuery(query)
    } catch (error) {
      console.error('Failed to search members:', error)
      setMembers([])
      setSearchQuery(query)
    } finally {
      setIsLoading(false)
    }
  }

  // 엔터 키 핸들러
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 검색 결과 (API에서 받은 데이터 그대로 사용)
  const filteredMembers = members

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-screen-sm mx-auto px-4 py-4">
        {/* 검색창 */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이름, 전화번호를 입력해주세요."
              className="w-full px-4 py-3 pl-11 pr-20 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-pretendard text-base"
              disabled={isLoading}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {/* X 버튼 (입력값 지우기) */}
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-14 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 검색 결과 카운트 */}
        {searchQuery && (
          <div className="mb-3 text-sm text-gray-600 font-pretendard">
            검색 결과: {filteredMembers.length}명
          </div>
        )}

        {/* 멤버 카드 리스트 */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600 font-pretendard">검색 중...</p>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 font-pretendard">
                {searchQuery
                  ? '멤버가 존재하지 않아요!'
                  : '검색어를 입력하고 검색 버튼을 눌러주세요.'}
              </p>
            </div>
          ) : (
            filteredMembers.map(member => {
              const birth = new Date(member.birthday)
              const birthYear = birth.getFullYear().toString().slice(2) // 91
              const month = birth.getMonth() + 1
              const day = birth.getDate()

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 프로필 사진 */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                      {/* 기본 정보 */}
                      <div>
                        <div className="font-semibold text-gray-900 font-pretendard">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500 font-pretendard">
                          {birthYear}또래 · 🎂 {month}월 {day}일
                        </div>
                      </div>
                    </div>
                    {/* 화살표 아이콘 */}
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 상세 정보 모달 */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[75vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 font-pretendard">
                교인 정보
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="px-6 py-6 space-y-4">
              {/* 프로필 */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-200">
                {/* 프로필 사진 */}
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        selectedMember.gender === '남'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {selectedMember.gender}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 font-pretendard">
                      {selectedMember.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 font-pretendard mt-2">
                    {(() => {
                      const birth = new Date(selectedMember.birthday)
                      const birthYear = birth.getFullYear().toString().slice(2)
                      const month = birth.getMonth() + 1
                      const day = birth.getDate()

                      return `${birthYear}또래 · 🎂 ${month}월 ${day}일`
                    })()}
                  </p>
                </div>
              </div>

              {/* 소속 그룹 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700 font-pretendard">
                  소속 그룹
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.groups.length > 0 ? (
                    selectedMember.groups.map((group, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-pretendard ${
                          group.role === '리더'
                            ? 'bg-blue-100 text-blue-700'
                            : group.role === '서브리더'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{group.groupName}</span>
                        <span className="text-xs opacity-75">
                          · {group.role}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 font-pretendard">
                      소속 그룹 없음
                    </span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* 상세 정보 */}
              <div className="space-y-3">
                {/* 휴대폰 (전화 링크) */}
                <div className="flex py-2">
                  <div className="w-24 text-sm font-medium text-gray-500 font-pretendard">
                    휴대폰
                  </div>
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="flex-1 text-sm text-blue-600 font-pretendard hover:underline flex items-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {selectedMember.phone}
                  </a>
                </div>
                <InfoRow label="주소" value={selectedMember.address} />
                <InfoRow label="이메일" value={selectedMember.email} />
                <InfoRow label="설명" value={selectedMember.description} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 정보 행 컴포넌트
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex py-2">
    <div className="w-24 text-sm font-medium text-gray-500 font-pretendard">
      {label}
    </div>
    <div className="flex-1 text-sm text-gray-900 font-pretendard">{value}</div>
  </div>
)

export default AdminMembers
