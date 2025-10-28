import { adminApi } from '@/lib/admin-api'
import { mediaApi } from '@/lib/api'
import { resizeImage } from '@/lib/utils'
import type { Visit } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function AdminVisitDetail() {
  const navigate = useNavigate()
  const { visitId } = useParams<{ visitId: string }>()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 심방 상세 정보 조회
  const fetchVisitDetail = useCallback(async () => {
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
  }, [visitId, navigate])

  useEffect(() => {
    fetchVisitDetail()
  }, [fetchVisitDetail])

  // 토스트 메시지 표시
  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }, [])

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || !visitId) return

      if (isUploading) {
        showToast('이미 업로드 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setIsUploading(true)

      let successCount = 0
      let failCount = 0

      try {
        // 각 파일을 개별적으로 업로드
        for (const file of Array.from(files)) {
          try {
            // 파일 검증
            if (!file.type.startsWith('image/')) {
              showToast(`${file.name}: 이미지 파일만 업로드 가능합니다.`)
              failCount++
              continue
            }

            const maxSize = 20 * 1024 * 1024 // 20MB
            if (file.size > maxSize) {
              showToast(`${file.name}: 파일 크기는 20MB 이하로 선택해주세요.`)
              failCount++
              continue
            }

            console.warn(`🔄 [${file.name}] Starting upload...`)

            // 1. 이미지 리사이징 (MEDIUM 크기만 - 500x500, 95% 품질)
            const resizedBlob = await resizeImage(file, 500, 500, 0.95)
            console.warn(
              `✅ [${file.name}] Resized to MEDIUM (${(resizedBlob.size / 1024).toFixed(1)}KB)`
            )

            // 2. Presigned URL 생성
            console.warn(
              `🔄 [${file.name}] Requesting presigned URLs for VISIT entity...`
            )
            const presignedData = await mediaApi.getPresignedUrls(
              'VISIT',
              visitId,
              file.name,
              file.type,
              file.size
            )
            console.warn(`✅ [${file.name}] Got presigned URLs:`, presignedData)

            // 3. MEDIUM 크기 파일 업로드
            const mediumUpload = presignedData.uploads.find(
              upload => upload.mediaType === 'MEDIUM'
            )
            if (!mediumUpload) {
              throw new Error('MEDIUM upload URL not found')
            }

            console.warn(`🔄 [${file.name}] Uploading to S3...`)
            await mediaApi.uploadFile(
              mediumUpload.uploadUrl,
              new File([resizedBlob], file.name, { type: file.type })
            )
            console.warn(`✅ [${file.name}] Uploaded to storage`)

            // 4. Complete 호출
            console.warn(`🔄 [${file.name}] Completing upload...`)
            await mediaApi.completeUpload('VISIT', visitId, [
              {
                mediaType: mediumUpload.mediaType,
                publicUrl: mediumUpload.publicUrl,
              },
            ])
            console.warn(`✅ [${file.name}] Upload completed`)

            // 5. 심방 정보 다시 조회하여 최신 medias 가져오기
            console.warn(`🔄 [${file.name}] Refreshing visit detail...`)
            await fetchVisitDetail()
            console.warn(`✅ [${file.name}] Visit refreshed with new medias`)

            successCount++
          } catch (error) {
            console.error(`❌ [${file.name}] Upload failed:`, error)
            if (error instanceof Error) {
              console.error(`❌ Error message: ${error.message}`)
              console.error(`❌ Error stack:`, error.stack)
            }
            showToast(`${file.name} 업로드에 실패했습니다.`)
            failCount++
          }
        }

        // 결과 메시지
        if (successCount > 0) {
          showToast(`이미지 ${successCount}개가 업로드되었습니다.`)
        } else if (failCount > 0) {
          showToast('이미지 업로드에 실패했습니다.')
        }
      } finally {
        setIsUploading(false)
        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [visitId, isUploading, showToast, fetchVisitDetail]
  )

  // 이미지 삭제 핸들러
  const handleImageDelete = useCallback(
    async (imageId: string) => {
      if (isUploading) {
        showToast('업로드 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }

      if (!confirm('이미지를 삭제하시겠습니까?')) {
        return
      }

      try {
        console.warn(`🔄 [Delete] Deleting image: ${imageId}`)

        // API로 이미지 삭제
        await mediaApi.deleteMediaById(imageId)

        console.warn(`✅ [Delete] Successfully deleted image: ${imageId}`)

        // 심방 정보 다시 조회하여 medias 업데이트
        await fetchVisitDetail()
        console.warn(`✅ [Delete] Visit refreshed after deletion`)

        showToast('이미지가 삭제되었습니다.')
      } catch (error) {
        console.error(`❌ [Delete] Failed to delete image:`, error)
        showToast('이미지 삭제에 실패했습니다.')
      }
    },
    [isUploading, showToast, fetchVisitDetail]
  )

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
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg font-pretendard text-sm">
            {toastMessage}
          </div>
        </div>
      )}

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
              value={`${visit.members?.length || 0}명`}
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

            {/* 사진 */}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 font-pretendard mb-2">
                    사진
                  </div>

                  {/* 숨겨진 파일 입력 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* 이미지 갤러리 */}
                  <div className="flex flex-wrap gap-2">
                    {visit.medias &&
                      visit.medias.length > 0 &&
                      visit.medias
                        .filter(media => media.mediaType === 'MEDIUM')
                        .map(media => (
                          <div
                            key={media.id}
                            className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
                          >
                            <img
                              src={media.accessURL || media.url}
                              alt="심방 사진"
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                            />
                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => handleImageDelete(media.id)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M9 3L3 9M3 3L9 9"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}

                    {/* 이미지 추가 버튼 */}
                    {!visit.medias || visit.medias.length === 0 ? (
                      /* 사진이 없을 때: 텍스트가 포함된 친근한 버튼 */
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors gap-0.5 px-1 ${
                          isUploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                        }`}
                      >
                        {isUploading ? (
                          /* 업로드 중일 때: 스피너 */
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500 text-[9px] font-pretendard leading-tight text-center">
                              업로드 중...
                            </span>
                          </div>
                        ) : (
                          /* 일반 상태: 텍스트 + 아이콘 */
                          <>
                            <span className="text-blue-600 text-[10px] font-pretendard leading-tight text-center">
                              심방 사진을
                            </span>
                            <span className="text-blue-600 text-[10px] font-pretendard leading-tight text-center">
                              추가해보세요!
                            </span>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M6 2V10M2 6H10"
                                stroke="#2563EB"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : (
                      /* 사진이 있을 때: 간단한 + 버튼 */
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                          isUploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                        }`}
                      >
                        {isUploading ? (
                          /* 업로드 중일 때: 스피너 */
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          /* 일반 상태: + 아이콘 */
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 5V19M5 12H19"
                              stroke="#2563EB"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
