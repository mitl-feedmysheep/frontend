import { adminApi } from '@/lib/admin-api'
import type { VisitListResponse } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminVisit() {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<VisitListResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

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

  // 현재 시간에서 2시간 후 시간 반환
  const getTimeAfter2Hours = () => {
    const now = new Date()
    now.setHours(now.getHours() + 2)
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 폼 상태
  const [formData, setFormData] = useState({
    date: getToday(),
    startTime: getCurrentTime(),
    endTime: getTimeAfter2Hours(),
    place: '',
    expense: 0,
    notes: '',
  })

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

  // 심방 기록 조회
  const fetchVisits = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getAllVisits()

      if (!Array.isArray(data)) {
        setVisits([])
        return
      }

      // 최신순 정렬 (date가 optional이므로 안전하게 처리)
      const sortedData = data.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })
      setVisits(sortedData)
    } catch (error) {
      console.error('Failed to fetch visits:', error)
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        ) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.')
        } else if (
          error.message.includes('403') ||
          error.message.includes('Forbidden')
        ) {
          alert('접근 권한이 없습니다. 관리자에게 문의해주세요.')
        } else {
          alert('심방 기록을 불러오는데 실패했습니다.')
        }
      }
      setVisits([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  // 심방 생성
  const handleCreateVisit = async () => {
    try {
      setIsCreating(true)

      // 날짜와 시간을 합쳐서 ISO 형식으로 변환
      const startedAt = `${formData.date}T${formData.startTime}:00.000Z`
      const endedAt = `${formData.date}T${formData.endTime}:00.000Z`

      const visitData = {
        date: formData.date,
        startedAt,
        endedAt,
        place: formData.place,
        expense: formData.expense,
        notes: formData.notes,
      }

      await adminApi.createVisit(visitData)
      setShowCreateModal(false)
      // 폼 초기화
      setFormData({
        date: getToday(),
        startTime: getCurrentTime(),
        endTime: getTimeAfter2Hours(),
        place: '',
        expense: 0,
        notes: '',
      })
      // 목록 새로고침
      fetchVisits()
    } catch (error) {
      console.error('Failed to create visit:', error)
      alert('심방 기록 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}.${month}.${day}`
  }

  // 시간 포맷팅
  const formatTime = (dateTimeString?: string) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-screen-sm mx-auto px-4 py-4">
        {/* 헤더 */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 font-pretendard">
            심방 관리
          </h1>
          <p className="text-sm text-gray-600 font-pretendard mt-1">
            심방 기록을 관리하고 조회합니다.
          </p>
        </div>

        {/* 심방 기록 리스트 */}
        <div className="space-y-3">
          {/* 심방 기록 추가 카드 */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-center gap-2 text-white">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-semibold font-pretendard text-base">
                심방 기록 추가
              </span>
            </div>
          </div>

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
                <p className="text-gray-600 font-pretendard">로딩 중...</p>
              </div>
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500 font-pretendard">
                심방 기록이 없습니다.
              </p>
            </div>
          ) : (
            visits.map(visit => (
              <div
                key={visit.id}
                onClick={() => navigate(`/visit/${visit.id}`)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 날짜 및 시간 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 font-pretendard">
                        {formatDate(visit.date)}
                      </span>
                      {visit.startedAt && visit.endedAt && (
                        <span className="text-sm text-gray-500 font-pretendard">
                          {formatTime(visit.startedAt)} -{' '}
                          {formatTime(visit.endedAt)}
                        </span>
                      )}
                    </div>
                    {/* 장소 */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 font-pretendard mb-2">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{visit.place || '장소 미입력'}</span>
                    </div>
                    {/* 메모 미리보기 */}
                    {visit.notes && (
                      <div className="text-sm text-gray-500 font-pretendard mb-2 line-clamp-1">
                        {visit.notes}
                      </div>
                    )}
                    {/* 참석 인원 및 비용 */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded font-pretendard">
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        {visit.memberCount || 0}명
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded font-pretendard">
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {(visit.expense || 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  {/* 화살표 */}
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
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
            ))
          )}
        </div>
      </main>

      {/* 생성 모달 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 font-pretendard">
                심방 기록 추가
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
              {/* 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-pretendard mb-1">
                  날짜
                </label>
                <div className="relative">
                  {/* 한국어 날짜 표시 */}
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-pretendard">
                    {formatDateToKorean(formData.date)}
                  </div>
                  {/* 숨겨진 date picker */}
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-pretendard mb-1">
                  시간
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard"
                  />
                  <span className="text-gray-500 font-pretendard">~</span>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard"
                  />
                </div>
              </div>

              {/* 장소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-pretendard mb-1">
                  장소
                </label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={e =>
                    setFormData({ ...formData, place: e.target.value })
                  }
                  placeholder="심방 장소를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard"
                />
              </div>

              {/* 비용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-pretendard mb-1">
                  비용 (원)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.expense === 0 ? '' : formData.expense}
                  onFocus={e => {
                    if (formData.expense === 0) {
                      e.target.value = ''
                    }
                  }}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setFormData({
                      ...formData,
                      expense: value === '' ? 0 : parseInt(value),
                    })
                  }}
                  onBlur={e => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, expense: 0 })
                    }
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard"
                />
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-pretendard mb-1">
                  메모
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="메모를 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard resize-none"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-pretendard"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateVisit}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-pretendard disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isCreating ? '생성 중...' : '생성'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVisit
