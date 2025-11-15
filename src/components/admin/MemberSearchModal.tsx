import { adminApi } from '@/lib/admin-api'
import type { MemberSearchResponse } from '@/types'
import { useEffect, useState } from 'react'

interface MemberSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (memberIds: string[]) => void
  existingChurchMemberIds?: string[]
}

// API 응답을 UI용 타입으로 변환
interface MemberForSelection {
  id: string
  churchMemberId: string
  name: string
  gender: '남' | '여'
  birthday: string
  phone: string
}

// 선택된 멤버 정보
interface SelectedMember {
  id: string
  name: string
}

const convertApiResponseToMember = (
  apiMember: MemberSearchResponse
): MemberForSelection => {
  return {
    id: apiMember.memberId,
    churchMemberId: apiMember.churchMemberId,
    name: apiMember.name,
    gender: apiMember.sex === 'M' ? '남' : '여',
    birthday: apiMember.birthday,
    phone: apiMember.phone,
  }
}

function MemberSearchModal({
  isOpen,
  onClose,
  onSelect,
  existingChurchMemberIds = [],
}: MemberSearchModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState<MemberForSelection[]>([])
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([])

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setSearchQuery('')
      setMembers([])
      setSelectedMembers([])
    }
  }, [isOpen])

  // 검색 실행 함수
  const handleSearch = async () => {
    const query = inputValue.trim()

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

  // 멤버 선택 핸들러 (임시 선택)
  const handleSelectMember = (memberId: string, memberName: string) => {
    // 이미 선택된 멤버인지 확인
    if (selectedMembers.some(m => m.id === memberId)) {
      return
    }
    setSelectedMembers([...selectedMembers, { id: memberId, name: memberName }])
  }

  // 선택된 멤버 제거
  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId))
  }

  // 최종 추가하기
  const handleConfirm = () => {
    if (selectedMembers.length === 0) {
      return
    }
    const memberIds = selectedMembers.map(m => m.id)
    onSelect(memberIds)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 font-pretendard">
            교인 검색
          </h2>
          <button
            onClick={onClose}
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

        {/* 선택된 멤버 영역 */}
        {selectedMembers.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 font-pretendard">
                선택된 인원 ({selectedMembers.length}명)
              </span>
              <button
                onClick={() => setSelectedMembers([])}
                className="text-xs text-gray-500 hover:text-gray-700 font-pretendard"
              >
                전체 해제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(member => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm font-pretendard"
                >
                  <span>{member.name}</span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
              ))}
            </div>
          </div>
        )}

        {/* 검색창 */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이름, 전화번호를 입력해주세요."
              className="w-full px-4 py-3 pl-11 pr-20 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-pretendard text-base"
              disabled={isLoading}
              autoFocus
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
            {/* X 버튼 */}
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

          {/* 검색 결과 카운트 */}
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600 font-pretendard">
              검색 결과: {members.length}명
            </div>
          )}
        </div>

        {/* 검색 결과 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
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
          ) : members.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500 font-pretendard">
                {searchQuery
                  ? '멤버가 존재하지 않아요!'
                  : '검색어를 입력하고 검색 버튼을 눌러주세요.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => {
                const birth = new Date(member.birthday)
                const birthYear = birth.getFullYear().toString().slice(2)
                const month = birth.getMonth() + 1
                const day = birth.getDate()
                const isAlreadyAdded = existingChurchMemberIds.includes(member.churchMemberId)

                return (
                  <div
                    key={member.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    {isAlreadyAdded && (
                      <div className="text-red-500 text-xs mb-2 font-pretendard">
                        이미 추가된 참석 멤버입니다!
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 프로필 사진 */}
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                        {/* 기본 정보 */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 font-pretendard">
                              {member.name}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                member.gender === '남'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {member.gender}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 font-pretendard">
                            {birthYear}또래 · 🎂 {month}월 {day}일
                          </div>
                        </div>
                      </div>
                      {/* 선택 버튼 */}
                      <button
                        onClick={() =>
                          handleSelectMember(member.id, member.name)
                        }
                        disabled={isAlreadyAdded || selectedMembers.some(m => m.id === member.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors font-pretendard ${
                          isAlreadyAdded || selectedMembers.some(m => m.id === member.id)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {selectedMembers.some(m => m.id === member.id) ? (
                          <>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            선택됨
                          </>
                        ) : (
                          <>
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            선택
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 하단 추가하기 버튼 */}
        {selectedMembers.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors font-pretendard"
            >
              {selectedMembers.length}명 추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberSearchModal
