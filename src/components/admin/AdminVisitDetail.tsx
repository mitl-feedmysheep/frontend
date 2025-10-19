import { adminApi } from '@/lib/admin-api'
import type { Visit } from '@/types'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function AdminVisitDetail() {
  const navigate = useNavigate()
  const { visitId } = useParams<{ visitId: string }>()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 심방 상세 정보 조회
  const fetchVisitDetail = async () => {
    if (!visitId) return

    try {
      setIsLoading(true)
      const data = await adminApi.getVisitDetail(visitId)
      setVisit(data)
    } catch (error) {
      console.error('Failed to fetch visit detail:', error)
      alert('심방 정보를 불러오는데 실패했습니다.')
      navigate('/visit')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitDetail()
  }, [visitId])

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`
  }

  // 시간 포맷팅
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
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
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 font-pretendard">
            심방 정보를 찾을 수 없습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-screen-sm mx-auto px-4 py-4">
        {/* 헤더 with 뒤로가기 */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/visit')}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-pretendard">
              심방 상세
            </h1>
          </div>
        </div>

        {/* 기본 정보 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
          <h2 className="text-base font-bold text-gray-900 font-pretendard mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            기본 정보
          </h2>

          <div className="space-y-3">
            {/* 날짜 */}
            <InfoRow
              icon={
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              label="날짜"
              value={formatDate(visit.date)}
            />

            {/* 시간 */}
            <InfoRow
              icon={
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="시간"
              value={`${formatTime(visit.startedAt)} ~ ${formatTime(visit.endedAt)}`}
            />

            {/* 장소 */}
            <InfoRow
              icon={
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              label="장소"
              value={visit.place}
            />

            {/* 비용 */}
            <InfoRow
              icon={
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="비용"
              value={`${visit.expense.toLocaleString()}원`}
            />

            {/* 참석 인원 */}
            <InfoRow
              icon={
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              label="참석 인원"
              value={`${visit.memberCount}명`}
            />

            {/* 메모 */}
            {visit.notes && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 font-pretendard mb-1">
                      메모
                    </div>
                    <div className="text-sm text-gray-900 font-pretendard whitespace-pre-wrap">
                      {visit.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 참석 멤버 섹션 */}
        {visit.members && visit.members.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
            <h2 className="text-base font-bold text-gray-900 font-pretendard mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              참석 멤버 ({visit.members.length}명)
            </h2>

            <div className="space-y-4">
              {visit.members.map((member, index) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* 멤버 이름 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600 font-pretendard">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 font-pretendard">
                      {member.memberName}
                    </span>
                  </div>

                  {/* 스토리 */}
                  {member.story && (
                    <div className="mb-3 pl-10">
                      <div className="text-xs font-medium text-gray-500 font-pretendard mb-1">
                        나눔 내용
                      </div>
                      <div className="text-sm text-gray-700 font-pretendard whitespace-pre-wrap bg-gray-50 rounded p-2">
                        {member.story}
                      </div>
                    </div>
                  )}

                  {/* 기도 제목 */}
                  {member.prayers && member.prayers.length > 0 && (
                    <div className="pl-10">
                      <div className="text-xs font-medium text-gray-500 font-pretendard mb-2">
                        기도 제목 ({member.prayers.length}개)
                      </div>
                      <div className="space-y-2">
                        {member.prayers.map(prayer => (
                          <div
                            key={prayer.id}
                            className="bg-blue-50 rounded p-3 relative"
                          >
                            {/* 응답 여부 뱃지 */}
                            {prayer.isAnswered && (
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-pretendard">
                                  <svg
                                    className="w-3 h-3"
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
                                  응답됨
                                </span>
                              </div>
                            )}

                            <div className="text-sm font-medium text-gray-900 font-pretendard mb-1 pr-16">
                              {prayer.prayerRequest}
                            </div>
                            {prayer.description && (
                              <div className="text-xs text-gray-600 font-pretendard">
                                {prayer.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// InfoRow 컴포넌트
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 flex-shrink-0">{icon}</div>
    <div className="flex-1 flex items-start gap-4">
      <div className="w-20 text-sm font-medium text-gray-500 font-pretendard">
        {label}
      </div>
      <div className="flex-1 text-sm text-gray-900 font-pretendard">
        {value}
      </div>
    </div>
  </div>
)

export default AdminVisitDetail
