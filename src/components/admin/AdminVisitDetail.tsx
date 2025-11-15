import { adminApi } from '@/lib/admin-api'
import { mediaApi } from '@/lib/api'
import { resizeImage } from '@/lib/utils'
import type { Visit, VisitMember } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MemberSearchModal from './MemberSearchModal'

function AdminVisitDetail() {
  const navigate = useNavigate()
  const { visitId } = useParams<{ visitId: string }>()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 이미지 모달 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 멤버 관리 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)

  // 필드 수정 상태
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    date: '',
    startTime: '',
    endTime: '',
    place: '',
    expense: 0,
    notes: '',
  })
  const [hasVisitChanges, setHasVisitChanges] = useState(false)
  const [isSavingVisit, setIsSavingVisit] = useState(false)

  // 심방 상세 정보 조회
  const fetchVisitDetail = useCallback(async () => {
    if (!visitId) return

    try {
      setIsLoading(true)
      const data = await adminApi.getVisitDetail(visitId)
      console.warn('🔍 [Visit Detail] API Response:', data)
      console.warn('🔍 [Visit Detail] medias field:', data.medias)
      console.warn(
        '🔍 [Visit Detail] Full data structure:',
        JSON.stringify(data, null, 2)
      )
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

  // 이미지 모달 핸들러
  const openImageModal = (index: number) => {
    if (visit?.medias) {
      const mediumImages = visit.medias.filter(m => m.mediaType === 'MEDIUM')
      console.warn('🖼️ [Modal Open] Image index:', index)
      console.warn('🖼️ [Modal Open] Selected image:', mediumImages[index])
      console.warn('🖼️ [Modal Open] Image URL:', mediumImages[index]?.url)
    }
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setSelectedImageIndex(null)
  }

  const goToPrevImage = useCallback(() => {
    if (!visit?.medias) return

    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    } else if (selectedImageIndex !== null && visit.medias.length > 0) {
      setSelectedImageIndex(
        visit.medias.filter(m => m.mediaType === 'MEDIUM').length - 1
      ) // 마지막 이미지로
    }
  }, [selectedImageIndex, visit?.medias])

  const goToNextImage = useCallback(() => {
    if (!visit?.medias) return

    const mediumImages = visit.medias.filter(m => m.mediaType === 'MEDIUM')

    if (
      selectedImageIndex !== null &&
      selectedImageIndex < mediumImages.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1)
    } else if (selectedImageIndex !== null && mediumImages.length > 0) {
      setSelectedImageIndex(0) // 첫 번째 이미지로
    }
  }, [selectedImageIndex, visit?.medias])

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      if (e.key === 'Escape') {
        closeImageModal()
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage()
      } else if (e.key === 'ArrowRight') {
        goToNextImage()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isModalOpen, goToPrevImage, goToNextImage])

  // 멤버 추가 핸들러 (여러 명 추가 가능)
  const handleAddMembers = useCallback(
    async (memberIds: string[]) => {
      if (!visitId || memberIds.length === 0) return

      try {
        // 새로운 API로 한번에 여러 명 추가
        await adminApi.addVisitMembers(visitId, memberIds)

        showToast(`${memberIds.length}명이 추가되었습니다.`)

        // 심방 정보 다시 불러오기
        await fetchVisitDetail()
      } catch (error) {
        console.error('Failed to add members:', error)
        showToast('멤버 추가에 실패했습니다.')
      }
    },
    [visitId, showToast, fetchVisitDetail]
  )

  // 멤버 수정 핸들러
  const handleUpdateMember = useCallback(
    async (
      visitMemberId: string,
      data: {
        story?: string
        prayers?: Array<{
          id?: string
          prayerRequest: string
          description: string
        }>
      }
    ) => {
      if (!visitId) return

      try {
        await adminApi.updateVisitMember(visitId, visitMemberId, data)
        showToast('나눔 및 기도제목이 저장되었습니다.')
        // 심방 정보 다시 불러오기
        await fetchVisitDetail()
      } catch (error) {
        console.error('Failed to update member:', error)
        showToast('저장에 실패했습니다.')
      }
    },
    [visitId, showToast, fetchVisitDetail]
  )

  // 멤버 삭제 핸들러
  const handleDeleteMember = useCallback(
    async (visitMemberId: string, memberName: string) => {
      if (!visitId) return

      const confirmed = window.confirm(
        `${memberName}님을 이 심방에서 제거하시겠습니까?`
      )
      if (!confirmed) return

      try {
        await adminApi.deleteVisitMember(visitId, visitMemberId)
        showToast(`${memberName}님이 제거되었습니다.`)
        // 심방 정보 다시 불러오기
        await fetchVisitDetail()
        // 확장된 멤버 ID가 삭제된 멤버인 경우 초기화
        if (expandedMemberId === visitMemberId) {
          setExpandedMemberId(null)
        }
      } catch (error) {
        console.error('Failed to delete member:', error)
        showToast('멤버 제거에 실패했습니다.')
      }
    },
    [visitId, showToast, fetchVisitDetail, expandedMemberId]
  )

  // 필드 수정 시작
  const handleStartEdit = (field: string) => {
    if (!visit) return
    
    setEditingField(field)
    
    // 현재 값으로 초기화
    const startDate = new Date(visit.startedAt)
    const endDate = new Date(visit.endedAt)
    
    setEditValues({
      date: visit.date,
      startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      place: visit.place,
      expense: visit.expense,
      notes: visit.notes,
    })
  }

  // 필드 값 변경
  const handleEditValueChange = (field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value,
    }))
    setHasVisitChanges(true)
  }

  // 전체 수정사항 저장
  const handleSaveVisit = async () => {
    if (!visitId || !visit) return

    try {
      setIsSavingVisit(true)
      const startedAt = `${editValues.date}T${editValues.startTime}:00.000Z`
      const endedAt = `${editValues.date}T${editValues.endTime}:00.000Z`

      const updateData = {
        date: editValues.date,
        startedAt,
        endedAt,
        place: editValues.place,
        expense: editValues.expense,
        notes: editValues.notes,
      }

      // API 호출 - PUT /visits/admin/{visitId}
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/visits/admin/${visitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('authToken') || '',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update visit')
      }

      setEditingField(null)
      setHasVisitChanges(false)
      showToast('수정되었습니다.')
      await fetchVisitDetail()
    } catch (error) {
      console.error('Failed to update visit:', error)
      showToast('수정에 실패했습니다.')
    } finally {
      setIsSavingVisit(false)
    }
  }

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
            <EditableInfoRow
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
              fieldName="date"
              editingField={editingField}
              editValues={editValues}
              onStartEdit={handleStartEdit}
              onChange={handleEditValueChange}
              inputType="date"
            />

            {/* 시간 */}
            <div className="flex items-start gap-3">
              <div className="text-gray-400 flex-shrink-0">
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
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-20 text-sm font-medium text-gray-500 font-pretendard">
                    시간
                  </div>
                  <div className="flex-1">
                    {editingField === 'time' ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="time"
                          value={editValues.startTime}
                          onChange={e => handleEditValueChange('startTime', e.target.value)}
                          className="flex-1 px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard text-sm"
                          placeholder="입력 중..."
                        />
                        <span className="text-gray-500">~</span>
                        <input
                          type="time"
                          value={editValues.endTime}
                          onChange={e => handleEditValueChange('endTime', e.target.value)}
                          className="flex-1 px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard text-sm"
                          placeholder="입력 중..."
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEdit('time')}
                        className="text-sm text-gray-900 font-pretendard cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
                      >
                        {`${formatTime(visit.startedAt)} ~ ${formatTime(visit.endedAt)}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 장소 */}
            <EditableInfoRow
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
              fieldName="place"
              editingField={editingField}
              editValues={editValues}
              onStartEdit={handleStartEdit}
              onChange={handleEditValueChange}
              inputType="text"
            />

            {/* 비용 */}
            <EditableInfoRow
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
              fieldName="expense"
              editingField={editingField}
              editValues={editValues}
              onStartEdit={handleStartEdit}
              onChange={handleEditValueChange}
              inputType="number"
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
              value={`${visit.visitMembers?.length || 0}명`}
            />

            {/* 메모 */}
            <div className="pt-3 border-t border-gray-100">
              <EditableInfoRow
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                label="메모"
                value={visit.notes || '메모 없음'}
                fieldName="notes"
                editingField={editingField}
                editValues={editValues}
                onStartEdit={handleStartEdit}
                onChange={handleEditValueChange}
                inputType="textarea"
              />
            </div>

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
                <div className="flex-1 min-w-0">
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
                  <div
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide touch-pan-x -mx-1 px-1"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-x',
                      overscrollBehaviorX: 'contain',
                    }}
                  >
                    {visit.medias &&
                      visit.medias.length > 0 &&
                      visit.medias
                        .filter(m => m.mediaType === 'MEDIUM')
                        .map((m, index) => (
                          <div
                            key={m.id}
                            className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
                          >
                            <img
                              src={m.url}
                              alt="심방 사진"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openImageModal(index)}
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                            />
                            {/* 삭제 버튼 */}
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleImageDelete(m.id)
                              }}
                              className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M12 4L4 12M4 4L12 12"
                                  stroke="#9CA3AF"
                                  strokeWidth="2"
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
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors gap-0.5 px-1 ${
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
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
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

          {/* 저장 버튼 */}
          {hasVisitChanges && (
            <div className="pt-4">
              <button
                onClick={handleSaveVisit}
                disabled={isSavingVisit}
                className={`w-full ${
                  isSavingVisit ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2.5 rounded-lg font-medium text-base font-pretendard transition-colors`}
              >
                {isSavingVisit ? '저장 중...' : '수정'}
              </button>
            </div>
          )}
        </div>

        {/* 참석 멤버 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 font-pretendard flex items-center gap-2">
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
              참석 멤버 ({visit.visitMembers?.length || 0}명)
            </h2>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors font-pretendard"
            >
              + 멤버 추가
            </button>
          </div>

          {visit.visitMembers && visit.visitMembers.length > 0 ? (
            <div className="space-y-3">
              {visit.visitMembers.map(member => (
                <VisitMemberCard
                  key={member.id}
                  member={member}
                  isExpanded={expandedMemberId === member.id}
                  onToggle={() =>
                    setExpandedMemberId(
                      expandedMemberId === member.id ? null : member.id
                    )
                  }
                  onUpdate={handleUpdateMember}
                  onDelete={handleDeleteMember}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 font-pretendard text-sm">
              참석 멤버가 없습니다. 멤버를 추가해주세요.
            </div>
          )}
        </div>
      </main>

      {/* 이미지 모달 */}
      {isModalOpen &&
        selectedImageIndex !== null &&
        visit?.medias &&
        visit.medias.filter(m => m.mediaType === 'MEDIUM')[
          selectedImageIndex
        ] && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            {/* 모달 배경 클릭으로 닫기 */}
            <div className="absolute inset-0" onClick={closeImageModal} />

            {/* 모달 콘텐츠 */}
            <div className="relative max-w-screen-sm max-h-screen-sm mx-4">
              <img
                src={
                  visit.medias.filter(m => m.mediaType === 'MEDIUM')[
                    selectedImageIndex
                  ].url
                }
                alt="심방 사진"
                className="max-w-full max-h-full object-contain rounded-lg"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />

              {/* 닫기 버튼 */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* 이전/다음 버튼 (이미지가 2개 이상일 때만) */}
              {visit.medias.filter(m => m.mediaType === 'MEDIUM').length >
                1 && (
                <>
                  {/* 이전 버튼 */}
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M12.5 15L7.5 10L12.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* 다음 버튼 */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* 이미지 인덱스 표시 */}
              {visit.medias.filter(m => m.mediaType === 'MEDIUM').length >
                1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} /{' '}
                  {visit.medias.filter(m => m.mediaType === 'MEDIUM').length}
                </div>
              )}
            </div>
          </div>
        )}

      {/* 멤버 검색 모달 */}
      <MemberSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleAddMembers}
        existingChurchMemberIds={visit?.visitMembers.map(vm => vm.churchMemberId) || []}
      />
    </div>
  )
}

// VisitMemberCard 컴포넌트
interface VisitMemberCardProps {
  member: VisitMember
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (
    visitMemberId: string,
    data: {
      story?: string
      prayers?: Array<{
        id?: string
        prayerRequest: string
        description: string
      }>
    }
  ) => Promise<void>
  onDelete: (visitMemberId: string, memberName: string) => Promise<void>
}

const VisitMemberCard: React.FC<VisitMemberCardProps> = ({
  member,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [localStory, setLocalStory] = useState(member.story || '')
  const [prayerInputs, setPrayerInputs] = useState<
    Array<{ id: string; value: string }>
  >(
    member.prayers && member.prayers.length > 0
      ? member.prayers.map(p => ({ id: p.id, value: p.prayerRequest }))
      : [{ id: 'new', value: '' }]
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const lastInputRef = useRef<HTMLInputElement>(null)

  // 변경사항 감지
  useEffect(() => {
    const storyChanged = localStory !== (member.story || '')

    const originalPrayers = member.prayers?.map(p => p.prayerRequest) || []
    const currentPrayers = prayerInputs
      .filter(input => input.value.trim() !== '')
      .map(input => input.value)

    const prayersChanged =
      originalPrayers.length !== currentPrayers.length ||
      originalPrayers.some(
        (original, index) => original !== currentPrayers[index]
      )

    setHasChanges(storyChanged || prayersChanged)
  }, [localStory, prayerInputs, member.story, member.prayers])

  // 기도제목 추가
  const handleAddPrayer = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newId = `new-${Date.now()}`
    setPrayerInputs([...prayerInputs, { id: newId, value: '' }])
    // 즉시 새로운 input에 focus (키보드 유지)
    requestAnimationFrame(() => {
      lastInputRef.current?.focus({ preventScroll: true })
    })
  }

  // 기도제목 변경
  const handlePrayerChange = (id: string, value: string) => {
    setPrayerInputs(
      prayerInputs.map(input => (input.id === id ? { ...input, value } : input))
    )
  }

  // 기도제목 삭제
  const handleRemovePrayer = (id: string) => {
    if (prayerInputs.length === 1) {
      setPrayerInputs([{ id: 'new', value: '' }])
    } else {
      setPrayerInputs(prayerInputs.filter(input => input.id !== id))
    }
  }

  // 저장
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const prayers = prayerInputs
        .filter(input => input.value.trim() !== '')
        .map(input => {
          const originalPrayer = member.prayers?.find(p => p.id === input.id)
          return {
            id: input.id.startsWith('new') ? undefined : input.id,
            prayerRequest: input.value,
            description: originalPrayer?.description || '',
          }
        })

      await onUpdate(member.id, {
        story: localStory.trim() || undefined,
        prayers: prayers.length > 0 ? prayers : undefined,
      })
    } catch (error) {
      console.error('Failed to save member data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="border border-gray-200 rounded-lg pt-4 px-4 pb-1 bg-gray-50 cursor-pointer"
      onClick={onToggle}
    >
      {/* 멤버 이름 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-blue-600 font-pretendard">
              {member.memberName.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 font-pretendard text-base">
                {member.memberName}
              </span>
              {member.sex && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    member.sex === 'M'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {member.sex === 'M' ? '남' : '여'}
                </span>
              )}
              {member.birthday && (
                <span className="text-xs text-gray-500 font-pretendard">
                  {String(new Date(member.birthday).getFullYear()).slice(-2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete(member.id, member.memberName)
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* 펼침/접힘 버튼 (하단 가운데) */}
      <div className="flex justify-center mt-1">
        <div className="w-5 h-5 flex items-center justify-center text-gray-400 pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            )}
          </svg>
        </div>
      </div>

      {/* 확장된 콘텐츠 */}
      {isExpanded && (
        <div
          className="mt-4 px-2 pb-2 space-y-4"
          onClick={e => e.stopPropagation()}
        >
          {/* 나눔 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-pretendard">
              나눔 내용
            </label>
            <textarea
              value={localStory}
              onChange={e => setLocalStory(e.target.value)}
              placeholder="이 사람과 나눈 이야기를 기록해주세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-pretendard text-sm resize-none"
              rows={3}
            />
          </div>

          {/* 기도제목 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 font-pretendard">
                기도제목
              </label>
              <button
                type="button"
                onMouseDown={handleAddPrayer}
                onTouchStart={handleAddPrayer}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium font-pretendard"
              >
                + 추가
              </button>
            </div>
            <div className="space-y-3">
              {prayerInputs.map((input, index) => (
                <div key={input.id} className="flex gap-2">
                  <input
                    ref={index === prayerInputs.length - 1 ? lastInputRef : null}
                    type="text"
                    value={input.value}
                    onChange={e => handlePrayerChange(input.id, e.target.value)}
                    placeholder={`기도제목 ${index + 1}`}
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-pretendard text-sm"
                  />
                  {prayerInputs.length > 1 && (
                    <button
                      onClick={() => handleRemovePrayer(input.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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
                </div>
              ))}
            </div>
          </div>

          {/* 저장 버튼 */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-pretendard"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          )}
        </div>
      )}
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

// EditableInfoRow 컴포넌트
const EditableInfoRow = ({
  icon,
  label,
  value,
  fieldName,
  editingField,
  editValues,
  onStartEdit,
  onChange,
  inputType = 'text',
}: {
  icon: React.ReactNode
  label: string
  value: string
  fieldName: string
  editingField: string | null
  editValues: any
  onStartEdit: (field: string) => void
  onChange: (field: string, value: any) => void
  inputType?: 'text' | 'number' | 'date' | 'time' | 'textarea'
}) => {
  const isEditing = editingField === fieldName

  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="flex items-start gap-4">
          <div className="w-20 text-sm font-medium text-gray-500 font-pretendard">
            {label}
          </div>
          <div className="flex-1">
            {isEditing ? (
              inputType === 'textarea' ? (
                <textarea
                  autoFocus
                  value={editValues[fieldName]}
                  onChange={e => onChange(fieldName, e.target.value)}
                  onFocus={e => {
                    // 커서를 텍스트의 맨 뒤로 이동
                    const len = e.target.value.length
                    e.target.setSelectionRange(len, len)
                  }}
                  className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard text-sm"
                  rows={3}
                  placeholder="입력 중..."
                />
              ) : inputType === 'number' ? (
                <input
                  autoFocus
                  type="tel"
                  inputMode="numeric"
                  value={editValues[fieldName]}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    onChange(fieldName, value === '' ? 0 : parseInt(value))
                  }}
                  className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard text-sm"
                  placeholder="입력 중..."
                />
              ) : (
                <input
                  autoFocus
                  type={inputType}
                  value={editValues[fieldName]}
                  onChange={e => onChange(fieldName, e.target.value)}
                  className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-pretendard text-sm"
                  placeholder="입력 중..."
                />
              )
            ) : (
              <div
                onClick={() => onStartEdit(fieldName)}
                className="text-sm text-gray-900 font-pretendard cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
              >
                {value}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminVisitDetail
