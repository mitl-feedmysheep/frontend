import ToastNotification from '@/components/common/ToastNotification'
import {
  ApiError,
  gatheringsApi,
  groupsApi,
  mediaApi,
  prayersApi,
} from '@/lib/api'
import { convertKSTtoUTC, formatWeekFormat, resizeImage } from '@/lib/utils'
import type { GatheringDetail, GatheringMember, User } from '@/types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
// removed navigate usage after moving Manage button to GroupDetail
import AutoGrowInput from './AutoGrowInput'

interface SmallGatheringProps {
  onBack: () => void
  gatheringId: string
  groupId: string
}

const SmallGathering: React.FC<SmallGatheringProps> = ({
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
  const [isCurrentUserSubLeader, setIsCurrentUserSubLeader] = useState(false)
  const [isSavingMeeting, setIsSavingMeeting] = useState(false)
  const [meetingError, setMeetingError] = useState('')
  const [meetingForm, setMeetingForm] = useState({
    date: '',
    place: '',
    startTime: '',
    endTime: '',
    description: '',
    leaderComment: '',
  })
  const [hasMeetingEdits, setHasMeetingEdits] = useState(false)
  const [editingMeetingField, setEditingMeetingField] = useState<
    null | 'date' | 'place' | 'time' | 'description' | 'leaderComment'
  >(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const placeInputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)

  const canEditMeeting = isCurrentUserLeader || isCurrentUserSubLeader

  // 토스트 알림 표시 함수
  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setIsToastVisible(true)
  }, [])

  const hideToast = () => {
    setIsToastVisible(false)
  }

  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // 이미지 갤러리 상태 및 핸들러 (SmallGathering 컴포넌트 레벨)
  const [gatheringImages, setGatheringImages] = useState<
    Array<{
      id: string
      url: string
      name: string
    }>
  >([])
  const gatheringFileInputRef = useRef<HTMLInputElement>(null)

  // 업로드 상태 관리
  const [isUploading, setIsUploading] = useState(false)
  const [_uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  ) // 파일별 진행률

  // gathering.medias를 gatheringImages로 매핑
  useEffect(() => {
    if (!gathering?.medias) {
      setGatheringImages([])
      return
    }

    // MEDIUM 타입 이미지만 필터링
    const images = gathering.medias
      .filter(media => media.mediaType === 'MEDIUM')
      .map(media => ({
        id: media.id,
        url: media.accessURL || media.url,
        name: `image_${media.id}`,
      }))

    console.warn(
      `📁 [Loading] Found ${images.length} images from gathering.medias`
    )
    setGatheringImages(images)
  }, [gathering?.medias])

  // 이미지 갤러리 핸들러 함수들
  const handleImageSelect = () => {
    gatheringFileInputRef.current?.click()
  }

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      if (isUploading) {
        showToast('이미 업로드 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }

      setIsUploading(true)

      try {
        // 각 파일을 개별적으로 업로드
        for (const file of Array.from(files)) {
          const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

          try {
            // 파일 검증
            if (!file.type.startsWith('image/')) {
              showToast(`${file.name}: 이미지 파일만 업로드 가능합니다.`)
              continue
            }

            const maxSize = 20 * 1024 * 1024 // 20MB
            if (file.size > maxSize) {
              showToast(`${file.name}: 파일 크기는 20MB 이하로 선택해주세요.`)
              continue
            }

            // 진행률 초기화
            setUploadProgress(prev => ({ ...prev, [fileId]: 10 }))

            console.warn(`🔄 [${file.name}] Starting upload...`)

            // 1. 이미지 리사이징 (MEDIUM 크기만 - 500x500, 95% 품질)
            const resizedBlob = await resizeImage(file, 500, 500, 0.95)
            setUploadProgress(prev => ({ ...prev, [fileId]: 30 }))
            console.warn(
              `✅ [${file.name}] Resized to MEDIUM (${(resizedBlob.size / 1024).toFixed(1)}KB)`
            )

            // 2. Presigned URL 생성
            const presignedData = await mediaApi.getPresignedUrls(
              'GATHERING',
              gatheringId,
              file.name,
              file.type,
              file.size
            )
            setUploadProgress(prev => ({ ...prev, [fileId]: 50 }))
            console.warn(`✅ [${file.name}] Got presigned URLs`)

            // 3. MEDIUM 크기 파일 업로드
            const mediumUpload = presignedData.uploads.find(
              upload => upload.mediaType === 'MEDIUM'
            )
            if (!mediumUpload) {
              throw new Error('MEDIUM upload URL not found')
            }

            await mediaApi.uploadFile(
              mediumUpload.uploadUrl,
              new File([resizedBlob], file.name, { type: file.type })
            )
            setUploadProgress(prev => ({ ...prev, [fileId]: 80 }))
            console.warn(`✅ [${file.name}] Uploaded to storage`)

            // 4. Complete 호출
            const completeResult = await mediaApi.completeUpload(
              'GATHERING',
              gatheringId,
              [
                {
                  mediaType: mediumUpload.mediaType,
                  publicUrl: mediumUpload.publicUrl,
                },
              ]
            )
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
            console.warn(
              `✅ [${file.name}] Upload completed:`,
              completeResult.medias[0]
            )

            // 5. 업로드 성공 - gathering 다시 fetch하여 최신 medias 가져오기
            console.warn(`✅ [${file.name}] Successfully uploaded to gallery`)

            // gathering 다시 조회하여 medias 업데이트
            try {
              const updatedGathering =
                await gatheringsApi.getDetail(gatheringId)
              setGathering(updatedGathering)
              console.warn(
                `✅ [${file.name}] Gathering refreshed with new medias`
              )
            } catch (error) {
              console.error('Failed to refresh gathering:', error)
              // 실패해도 업로드는 성공했으므로 계속 진행
            }
          } catch (error) {
            console.error(`❌ [${file.name}] Upload failed:`, error)
            const errorMessage =
              error instanceof ApiError
                ? error.message
                : `${file.name} 업로드에 실패했습니다.`
            showToast(errorMessage)
          } finally {
            // 개별 파일 진행률 제거
            setUploadProgress(prev => {
              const { [fileId]: _, ...rest } = prev
              return rest
            })
          }
        }
      } finally {
        setIsUploading(false)
        // 파일 입력 초기화
        if (gatheringFileInputRef.current) {
          gatheringFileInputRef.current.value = ''
        }
      }
    },
    [gatheringId, isUploading, showToast]
  )

  const handleImageDelete = useCallback(
    async (imageId: string) => {
      if (isUploading) {
        showToast('업로드 중입니다. 잠시 후 다시 시도해주세요.')
        return
      }

      try {
        console.warn(`🔄 [Delete] Deleting image: ${imageId}`)

        // API로 이미지 삭제
        await mediaApi.deleteMediaById(imageId)

        console.warn(`✅ [Delete] Successfully deleted image: ${imageId}`)

        // gathering 다시 조회하여 medias 업데이트
        try {
          const updatedGathering = await gatheringsApi.getDetail(gatheringId)
          setGathering(updatedGathering)
          console.warn(`✅ [Delete] Gathering refreshed after deletion`)
        } catch (error) {
          console.error('Failed to refresh gathering:', error)
          // 실패하면 로컬 상태만 업데이트
          setGatheringImages(prev => prev.filter(img => img.id !== imageId))
        }

        showToast('이미지가 삭제되었습니다.')
      } catch (error) {
        console.error(`❌ [Delete] Failed to delete image:`, error)
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : '이미지 삭제에 실패했습니다.'
        showToast(errorMessage)
      }
    },
    [gatheringId, isUploading, showToast]
  )

  // 이미지 모달 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 이미지 모달 핸들러
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setIsModalOpen(false)
    setSelectedImageIndex(null)
  }

  const goToPrevImage = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    } else if (selectedImageIndex !== null && gatheringImages.length > 0) {
      setSelectedImageIndex(gatheringImages.length - 1) // 마지막 이미지로
    }
  }, [selectedImageIndex, gatheringImages.length])

  const goToNextImage = useCallback(() => {
    if (
      selectedImageIndex !== null &&
      selectedImageIndex < gatheringImages.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1)
    } else if (selectedImageIndex !== null && gatheringImages.length > 0) {
      setSelectedImageIndex(0) // 첫 번째 이미지로
    }
  }, [selectedImageIndex, gatheringImages.length])

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

  // 컴포넌트 언마운트 시 임시 이미지 URL 정리
  useEffect(() => {
    return () => {
      gatheringImages.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      })
    }
  }, [gatheringImages])

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
          setIsCurrentUserSubLeader(userData.role === 'SUB_LEADER')
          console.warn('[SmallGathering] my group role:', userData.role)
        }
      } catch (error) {
        console.error('사용자 권한 정보 가져오기 실패:', error)
        if (mounted) {
          setCurrentUserInGroup(null)
          setIsCurrentUserLeader(false)
          setIsCurrentUserSubLeader(false)
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
        // 초기 편집 폼 값 설정
        const toHM = (iso: string) => {
          try {
            const d = new Date(iso)
            const hh = String(d.getHours()).padStart(2, '0')
            const mm = String(d.getMinutes()).padStart(2, '0')
            return `${hh}:${mm}`
          } catch {
            return '00:00'
          }
        }
        setMeetingForm({
          date: data.date,
          place: data.place || '',
          startTime: toHM(data.startedAt),
          endTime: toHM(data.endedAt),
          description: (data.description || '').trim(),
          leaderComment: (data.leaderComment || '').trim(),
        })
        setHasMeetingEdits(false)
        setMeetingError('')
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

  // 모임 편집 폼 변경 핸들러 및 유효성 검사
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const validateMeetingForm = (form: typeof meetingForm): string => {
    if (!form.date) return '날짜를 선택해주세요.'
    if (!form.place || form.place.trim() === '') return '장소를 입력해주세요.'
    if (!form.startTime) return '시작 시간을 선택해주세요.'
    if (!form.endTime) return '종료 시간을 선택해주세요.'
    if (timeToMinutes(form.startTime) >= timeToMinutes(form.endTime)) {
      return '시작 시간은 종료 시간보다 빨라야 합니다.'
    }
    return ''
  }

  // formatWeekFormat 은 CreateMeeting에서 export 된 것을 사용

  const handleMeetingFormChange = (
    field: keyof typeof meetingForm,
    value: string
  ) => {
    setMeetingForm(prev => {
      const next = { ...prev, [field]: value }
      setMeetingError(validateMeetingForm(next))
      if (gathering) {
        const original = {
          date: gathering.date,
          place: gathering.place || '',
          startTime: (() => {
            const d = new Date(gathering.startedAt)
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          })(),
          endTime: (() => {
            const d = new Date(gathering.endedAt)
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          })(),
          description: (gathering.description || '').trim(),
          leaderComment: (gathering.leaderComment || '').trim(),
        }
        setHasMeetingEdits(
          original.date !== next.date ||
            original.place !== next.place ||
            original.startTime !== next.startTime ||
            original.endTime !== next.endTime ||
            original.description !== next.description ||
            original.leaderComment !== next.leaderComment
        )
      }
      return next
    })
  }

  const handleSaveMeeting = async () => {
    if (!gathering || !canEditMeeting) return
    const errMsg = validateMeetingForm(meetingForm)
    if (errMsg) {
      setMeetingError(errMsg)
      return
    }
    try {
      setIsSavingMeeting(true)
      const payload = {
        name: formatWeekFormat(meetingForm.date),
        date: meetingForm.date,
        place: meetingForm.place.trim(),
        startedAt: convertKSTtoUTC(meetingForm.date, meetingForm.startTime),
        endedAt: convertKSTtoUTC(meetingForm.date, meetingForm.endTime),
        description: meetingForm.description.trim(),
        leaderComment: meetingForm.leaderComment.trim(),
      }
      const response = await gatheringsApi.update(gathering.id, payload)
      // 기존 멤버 목록 유지하면서 헤더 정보만 갱신
      setGathering(prev =>
        prev
          ? {
              ...prev,
              name: response.name,
              date: response.date,
              place: response.place,
              startedAt: response.startedAt,
              endedAt: response.endedAt,
              description: response.description,
              leaderComment: response.leaderComment,
            }
          : prev
      )
      setHasMeetingEdits(false)
      setMeetingError('')
      showToast('모임 정보가 저장되었어요')
    } catch (err) {
      console.error('모임 정보 저장 실패:', err)
      if (err instanceof ApiError) {
        setMeetingError(err.message)
        alert(err.message)
      } else {
        setMeetingError('모임 정보를 저장하는데 실패했습니다.')
        alert('모임 정보를 저장하는데 실패했습니다.')
      }
    } finally {
      setIsSavingMeeting(false)
    }
  }

  // 편집 진입 시 즉시 포커스/피커 열기
  useEffect(() => {
    if (editingMeetingField === 'date') {
      const el = dateInputRef.current
      if (el) {
        el.focus()
        ;(el as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
        setTimeout(() => {
          try {
            ;(
              el as HTMLInputElement & { showPicker?: () => void }
            ).showPicker?.()
          } catch (_error) {
            // ignore
          }
        }, 0)
      }
    }
    if (editingMeetingField === 'place') {
      const el = placeInputRef.current
      if (el) {
        el.focus()
        const val = el.value
        el.value = ''
        el.value = val
      }
    }
    if (editingMeetingField === 'time') {
      const el = startTimeRef.current
      if (el) {
        el.focus()
        ;(el as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
      }
    }
  }, [editingMeetingField])

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
            <div
              className="flex-1 relative"
              onClick={() => {
                if (!canEditMeeting) return
                setEditingMeetingField('date')
              }}
            >
              <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard p-1">
                {formatDateToKorean(
                  editingMeetingField === 'date' && meetingForm.date
                    ? meetingForm.date
                    : gathering.date
                )}
              </div>
              {/* 편집 시 달력 입력 */}
              {canEditMeeting && editingMeetingField === 'date' && (
                <input
                  ref={dateInputRef}
                  type="date"
                  value={meetingForm.date}
                  onChange={e =>
                    handleMeetingFormChange('date', e.target.value)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              )}
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
            <div
              className="flex-1 p-1"
              onClick={() => {
                if (!canEditMeeting) return
                setEditingMeetingField('place')
              }}
            >
              {canEditMeeting && editingMeetingField === 'place' ? (
                <input
                  ref={placeInputRef}
                  type="text"
                  value={meetingForm.place}
                  onChange={e =>
                    handleMeetingFormChange('place', e.target.value)
                  }
                  className="w-full text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard bg-transparent border-b border-[#C2D0C7] outline-none"
                  placeholder="모임 장소를 입력해주세요"
                />
              ) : (
                <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
                  {gathering.place}
                </div>
              )}
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
            <div
              className="flex-1 p-1"
              onClick={() => {
                if (!canEditMeeting) return
                setEditingMeetingField('time')
              }}
            >
              {canEditMeeting && editingMeetingField === 'time' ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={startTimeRef}
                    type="time"
                    value={meetingForm.startTime}
                    onChange={e =>
                      handleMeetingFormChange('startTime', e.target.value)
                    }
                    className="w-[130px] p-1 text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard bg-transparent border-b border-[#C2D0C7] outline-none"
                  />
                  <span className="text-[#000000] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard px-1">
                    ~
                  </span>
                  <input
                    ref={endTimeRef}
                    type="time"
                    value={meetingForm.endTime}
                    onChange={e =>
                      handleMeetingFormChange('endTime', e.target.value)
                    }
                    className="w-[130px] p-1 text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard bg-transparent border-b border-[#C2D0C7] outline-none"
                  />
                </div>
              ) : (
                <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard">
                  {`${formatTime(gathering.startedAt)} ~ ${formatTime(gathering.endedAt)}`}
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
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
              <div
                className="flex-1 p-1"
                onClick={() => {
                  if (!canEditMeeting) return
                  setEditingMeetingField('description')
                }}
              >
                {canEditMeeting && editingMeetingField === 'description' ? (
                  <AutoGrowInput
                    value={meetingForm.description}
                    onChange={next =>
                      handleMeetingFormChange(
                        'description',
                        next.replace(/\n/g, ' ')
                      )
                    }
                    placeholder="특이사항"
                    className="border-none"
                    inputClassName="rounded bg-transparent"
                    autoFocus
                  />
                ) : (
                  <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard whitespace-pre-line">
                    {(gathering.description || '').trim() || ''}
                  </div>
                )}
              </div>
            </div>

            {/* Leader/Admin Comments */}
            <div className="space-y-2 pt-1">
              {/* Divider */}
              <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>
              {/* Leader Comment (editable for leader only) */}
              <div className="flex items-center gap-1">
                <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M4 3h10a1 1 0 011 1v7.5a1 1 0 01-1 1H8l-3.5 2.5V12H4a1 1 0 01-1-1V4a1 1 0 011-1z"
                      fill="#8AA594"
                    />
                  </svg>
                </div>
                <div
                  className="flex-1 p-1"
                  onClick={() => {
                    if (!canEditMeeting) return
                    setEditingMeetingField('leaderComment')
                  }}
                >
                  {canEditMeeting && editingMeetingField === 'leaderComment' ? (
                    <AutoGrowInput
                      value={meetingForm.leaderComment}
                      onChange={next =>
                        handleMeetingFormChange(
                          'leaderComment',
                          next.replace(/\n/g, ' ')
                        )
                      }
                      placeholder="코멘트를 작성해주세요."
                      className="border-none"
                      inputClassName="rounded bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <div className="text-[#405347] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard whitespace-pre-line">
                      {(gathering.leaderComment || '').trim() || '리더 코멘트'}
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-0 border-t border-dashed border-[#C2D0C7]"></div>
              {/* Admin Comment (read-only) */}
              <div className="flex items-center gap-1">
                <div className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9 1.5l2.09 3.76 4.09.56-3.09 2.96.73 4.06L9 10.77 5.18 12.84l.73-4.06L2.82 5.82l4.09-.56L9 1.5z"
                      stroke="#8AA594"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="flex-1 p-1">
                  <div className="text-[#709180] font-normal text-base leading-tight tracking-[-0.02em] font-pretendard whitespace-pre-line">
                    {(gathering.adminComment || '').trim() || '목회자 코멘트'}
                  </div>
                </div>
              </div>
            </div>
          </>

          {/* 에러 메시지 */}
          {meetingError && (
            <div className="px-1 pt-1">
              <p className="text-red-500 text-sm font-pretendard">
                {meetingError}
              </p>
            </div>
          )}

          {/* Save Button for Meeting Edits - moved under description */}
          {canEditMeeting && hasMeetingEdits && (
            <div className="pt-2">
              <button
                onClick={handleSaveMeeting}
                disabled={!!meetingError || isSavingMeeting}
                className={`w-full ${
                  !!meetingError || isSavingMeeting
                    ? 'bg-[#A5BAAF]'
                    : 'bg-[#5F7B6D]'
                } text-white py-2.5 rounded-lg font-medium text-base font-pretendard`}
              >
                {isSavingMeeting ? '저장 중...' : '수정'}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-6">
          {/* 이미지 갤러리 섹션 */}
          <div className="mb-2">
            {/* 숨겨진 파일 입력 */}
            <input
              ref={gatheringFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 이미지 갤러리 */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {gatheringImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#F5F7F5]"
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openImageModal(index)}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  {/* 삭제 버튼 */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleImageDelete(image.id)
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

              {/* 이미지 추가 버튼 - 사진 유무에 따라 다른 스타일 */}
              {gatheringImages.length === 0 ? (
                /* 사진이 없을 때: 텍스트가 포함된 친근한 버튼 */
                <button
                  onClick={handleImageSelect}
                  disabled={isUploading}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors gap-0.5 px-1 ${
                    isUploading
                      ? 'border-[#E5E7E5] bg-[#F9F9F9] cursor-not-allowed'
                      : 'border-[#C2D0C7] bg-[#F5F7F5] hover:border-[#5F7B6D] hover:bg-[#F0F4F2]'
                  }`}
                >
                  {isUploading ? (
                    /* 업로드 중일 때: 스피너 */
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-4 h-4 border-2 border-[#709180] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[#98A7A4] text-[9px] font-pretendard leading-tight text-center">
                        업로드 중...
                      </span>
                    </div>
                  ) : (
                    /* 일반 상태: 텍스트 + 아이콘 */
                    <>
                      <span className="text-[#709180] text-[10px] font-pretendard leading-tight text-center">
                        오늘의 모임을
                      </span>
                      <span className="text-[#709180] text-[10px] font-pretendard leading-tight text-center">
                        추억해보세요!
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 2V10M2 6H10"
                          stroke="#5F7B6D"
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
                  onClick={handleImageSelect}
                  disabled={isUploading}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                    isUploading
                      ? 'border-[#E5E7E5] bg-[#F9F9F9] cursor-not-allowed'
                      : 'border-[#C2D0C7] bg-[#F5F7F5] hover:border-[#5F7B6D] hover:bg-[#F0F4F2]'
                  }`}
                >
                  {isUploading ? (
                    /* 업로드 중일 때: 스피너 */
                    <div className="w-6 h-6 border-2 border-[#709180] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    /* 일반 상태: + 아이콘 */
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="#5F7B6D"
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

          {/* Title */}
          <div className="mb-4">
            <h2 className="text-[#232323] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard">
              오늘의 기록
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
                isReadOnly={!canEditMeeting}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {isModalOpen &&
        selectedImageIndex !== null &&
        gatheringImages[selectedImageIndex] && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            {/* 모달 배경 클릭으로 닫기 */}
            <div className="absolute inset-0" onClick={closeImageModal} />

            {/* 모달 콘텐츠 */}
            <div className="relative max-w-screen-sm max-h-screen-sm mx-4">
              <img
                src={gatheringImages[selectedImageIndex].url}
                alt={gatheringImages[selectedImageIndex].name}
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
              {gatheringImages.length > 1 && (
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
              {gatheringImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {gatheringImages.length}
                </div>
              )}
            </div>
          </div>
        )}
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
  type PrayerInput = { id: string; value: string }
  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const [prayerInputs, setPrayerInputs] = useState<PrayerInput[]>([
    { id: makeId(), value: '' },
  ])
  const [hasChanges, setHasChanges] = useState(false)
  const [localStory, setLocalStory] = useState(member.story ?? '')
  const [localGoal, setLocalGoal] = useState(member.goal ?? '')
  const [shouldFocusNewPrayer, setShouldFocusNewPrayer] = useState(false)
  const [originalMember, setOriginalMember] = useState(member)
  const [worshipLoading, setWorshipLoading] = useState(false)
  const [gatheringLoading, setGatheringLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const storyTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPulseHint, setShowPulseHint] = useState(false)
  const [deletingPrayerIds, setDeletingPrayerIds] = useState<
    Record<string, boolean>
  >({})

  // 초기 로드 시에만 originalMember 설정 (가장 먼저 실행)
  useEffect(() => {
    // member가 처음 로드될 때만 originalMember 설정
    if (member.memberId && !isInitialized) {
      setOriginalMember(member)
      setIsInitialized(true)
      setHasChanges(false)

      // 초기 데이터 설정
      setLocalStory(member.story ?? '')
      setLocalGoal(member.goal ?? '')
      if (member.prayers && member.prayers.length > 0) {
        setPrayerInputs(
          member.prayers.map(p => ({
            id: p.id || makeId(),
            value: p.prayerRequest || '',
          }))
        )
      } else {
        setPrayerInputs([{ id: 'new', value: '' }])
      }
    }
  }, [member, isInitialized])

  // 데이터 업데이트는 초기 설정에서만 처리하고, 이후에는 사용자 입력으로만 변경

  // 텍스트 영역 자동 높이 조절 함수 (한 줄 유지하다가 줄바꿈 시에만 증가)
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    if (!element) return
    const cs = window.getComputedStyle(element)
    const paddingTop = parseFloat(cs.paddingTop || '0')
    const paddingBottom = parseFloat(cs.paddingBottom || '0')
    const lineHeight = parseFloat(cs.lineHeight || '24') || 24

    // 높이 초기화 후 실제 콘텐츠 높이 계산
    element.style.height = 'auto'
    const contentHeight = Math.max(
      0,
      element.scrollHeight - paddingTop - paddingBottom
    )

    // 한 줄 기준: lineHeight. 줄바꿈 발생 전에는 정확히 한 줄 높이 유지
    const rows =
      contentHeight > lineHeight + 1 ? Math.ceil(contentHeight / lineHeight) : 1
    const newHeight = rows * lineHeight + paddingTop + paddingBottom
    element.style.height = `${newHeight}px`
  }

  // 나눔 텍스트 영역 높이 조절 (레이아웃 완료 후 보정)
  useEffect(() => {
    const el = storyTextareaRef.current
    if (!el) return
    // 첫 번째 프레임에 적용
    requestAnimationFrame(() => adjustTextareaHeight(el))
    // 레이아웃 안정화를 위해 한 번 더 적용
    const t = setTimeout(() => adjustTextareaHeight(el), 100)
    return () => clearTimeout(t)
  }, [localStory])

  // 초기화 완료 후 모든 텍스트 영역의 높이를 한 번 조절
  useEffect(() => {
    if (!isInitialized) return

    // 나눔 텍스트 영역 조절 (지연 적용)
    if (storyTextareaRef.current) {
      const el = storyTextareaRef.current
      setTimeout(() => adjustTextareaHeight(el), 100)
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

  // 새 기도제목 추가 시 1회성 포커스 후 플래그 해제
  useEffect(() => {
    if (!shouldFocusNewPrayer) return
    const t = setTimeout(() => setShouldFocusNewPrayer(false), 0)
    return () => clearTimeout(t)
  }, [shouldFocusNewPrayer])

  // 접힌 상태 시, 초반 2초간만 화살표에 펄스 애니메이션 제공 (모바일 시선 유도)
  useEffect(() => {
    setShowPulseHint(true)
    const t = setTimeout(() => setShowPulseHint(false), 2000)
    return () => clearTimeout(t)
  }, [])

  // 변경사항 감지 (출석 상태는 제외)
  useEffect(() => {
    // 초기화가 완료되지 않았으면 비교하지 않음
    if (!isInitialized || !originalMember.memberId) {
      return
    }

    const hasStoryChanges = localStory !== (originalMember.story ?? '')
    const hasGoalChanges = (localGoal ?? '') !== (originalMember.goal ?? '')

    // 기도제목 변경사항 확인: 원본과 현재 입력값 비교
    const originalPrayers =
      originalMember.prayers?.map(p => p.prayerRequest) || []
    const currentPrayers = prayerInputs
      .filter(input => input.value.trim() !== '')
      .map(input => input.value)

    // 배열 길이가 다르거나, 내용이 다른 경우 변경된 것으로 판단
    const hasPrayerChanges =
      originalPrayers.length !== currentPrayers.length ||
      originalPrayers.some(
        (original, index) => original !== currentPrayers[index]
      )

    setHasChanges(hasStoryChanges || hasPrayerChanges || hasGoalChanges)
  }, [localStory, localGoal, prayerInputs, originalMember, isInitialized])

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
        story: localStory.trim() === '' ? null : localStory,
        goal: (localGoal ?? '').trim() === '' ? null : localGoal,
        prayers: prayerInputs
          .filter(input => input.value.trim() !== '')
          .map(input => {
            if (input.id === 'new') {
              // + 버튼으로 새로 추가한 기도제목 - id 필드 제외
              return {
                prayerRequest: input.value,
                description: '',
              }
            } else {
              // 기존 기도제목 - 서버 id 포함
              const originalPrayer = member.prayers?.find(
                p => p.id === input.id
              )
              return {
                prayerRequest: input.value,
                description: originalPrayer?.description || '',
                id: input.id,
              }
            }
          }),
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
    setPrayerInputs(prev => [...prev, { id: 'new', value: '' }])
    setShouldFocusNewPrayer(true)
  }

  const removePrayerInput = (index: number) => {
    const newPrayerInputs = prayerInputs.filter((_, i) => i !== index)
    // 최소 하나의 빈 입력란은 유지
    if (newPrayerInputs.length === 0) {
      setPrayerInputs([{ id: 'new', value: '' }])
    } else {
      setPrayerInputs(newPrayerInputs)
    }
    // 삭제 시에는 즉시 변경사항으로 감지되어 저장 버튼이 표시됨
  }

  const handleDeletePrayer = async (index: number, input: PrayerInput) => {
    // 새로 추가한 미저장 항목은 즉시 제거 (API 호출 없음)
    if (input.id === 'new') {
      removePrayerInput(index)
      return
    }

    try {
      setDeletingPrayerIds(prev => ({ ...prev, [input.id]: true }))

      // API 호출 (200 OK 시에만 UI 제거)
      await prayersApi.delete(input.id)

      // 성공 시 UI에서 항목 제거
      setPrayerInputs(prev => {
        const next = prev.filter((_, i) => i !== index)
        return next.length === 0 ? [{ id: 'new', value: '' }] : next
      })

      // 상위 상태 동기화 (멤버의 prayers에서 해당 항목 제거)
      const updatedPrayers = (member.prayers || []).filter(
        p => p.id !== input.id
      )
      const updatedMember = { ...member, prayers: updatedPrayers }
      onChange(updatedMember)
      setOriginalMember(updatedMember)
      setHasChanges(false)
    } catch (err) {
      console.error('기도제목 삭제 실패:', err)
      if (err instanceof ApiError) {
        alert(err.message)
      } else {
        alert('기도제목을 삭제하는데 실패했습니다.')
      }
    } finally {
      setDeletingPrayerIds(prev => {
        const { [input.id]: _removed, ...rest } = prev
        return rest
      })
    }
  }

  const updatePrayerInput = (index: number, value: string) => {
    const newInputs = [...prayerInputs]
    newInputs[index] = { ...newInputs[index], value }
    setPrayerInputs(newInputs)

    // prayers 배열 업데이트
    const updatedPrayers = newInputs
      .filter(input => input.value.trim() !== '')
      .map((input, idx) => ({
        id: member.prayers[idx]?.id || input.id || `temp-${idx}`,
        prayerRequest: input.value,
        description: member.prayers[idx]?.description || '',
        answered: member.prayers[idx]?.answered || false,
      }))

    onChange({ ...member, prayers: updatedPrayers })
  }

  const handleStoryChange = (value: string) => {
    setLocalStory(value)
    onChange({ ...member, story: value })
  }

  const handleGoalChange = (value: string) => {
    setLocalGoal(value)
    onChange({ ...member, goal: value })
  }

  const handleSave = async () => {
    try {
      // API 요청 데이터 준비
      const updateData = {
        worshipAttendance: member.worshipAttendance,
        gatheringAttendance: member.gatheringAttendance,
        story: localStory.trim() === '' ? null : localStory,
        goal: (localGoal ?? '').trim() === '' ? null : localGoal,
        prayers: prayerInputs
          .filter(input => input.value.trim() !== '')
          .map(input => {
            if (input.id === 'new') {
              // + 버튼으로 새로 추가한 기도제목 - id 필드 제외
              return {
                prayerRequest: input.value,
                description: '',
              }
            } else {
              // 기존 기도제목 - 서버 id 포함
              const originalPrayer = member.prayers?.find(
                p => p.id === input.id
              )
              return {
                prayerRequest: input.value,
                description: originalPrayer?.description || '',
                id: input.id,
              }
            }
          }),
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
        goal: response.goal ?? localGoal,
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
      className={`relative bg-[#F5F7F5] rounded-2xl px-4 py-2.5 cursor-pointer transition-colors hover:bg-[#F0F4F2] active:bg-[#E6EEE9] active:scale-[0.99]`}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      {/* Member Info Row */}
      <div className={`flex items-center justify-between mb-4`}>
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
          {/* 예배 체크박스 */}
          <div
            className="flex items-center gap-1 pr-1 cursor-pointer"
            onClick={e => {
              e.stopPropagation()
              if (!isReadOnly && !worshipLoading) {
                handleAttendanceChange('worship', !member.worshipAttendance)
              }
            }}
          >
            <div className="relative w-6 h-6">
              {/* 체크박스 배경 */}
              <div
                className={`w-6 h-6 rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${
                  member.worshipAttendance
                    ? 'bg-[#5F7B6D] border-[#5F7B6D]'
                    : 'bg-transparent border-[#A5BAAF]'
                } ${worshipLoading || isReadOnly ? 'opacity-50' : ''}`}
              >
                {/* 체크 아이콘 */}
                {member.worshipAttendance && !worshipLoading && (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path
                      d="M2 5L5.5 8.5L12 2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {/* 로딩 스피너 */}
              {worshipLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <span className="text-[#20342F] font-medium text-base leading-tight font-pretendard">
              예배
            </span>
          </div>

          {/* 모임 체크박스 */}
          <div
            className="flex items-center gap-1 pr-1 cursor-pointer"
            onClick={e => {
              e.stopPropagation()
              if (!isReadOnly && !gatheringLoading) {
                handleAttendanceChange('gathering', !member.gatheringAttendance)
              }
            }}
          >
            <div className="relative w-6 h-6">
              {/* 체크박스 배경 */}
              <div
                className={`w-6 h-6 rounded-[5px] border-[1.5px] flex items-center justify-center transition-all ${
                  member.gatheringAttendance
                    ? 'bg-[#5F7B6D] border-[#5F7B6D]'
                    : 'bg-transparent border-[#A5BAAF]'
                } ${gatheringLoading || isReadOnly ? 'opacity-50' : ''}`}
              >
                {/* 체크 아이콘 */}
                {member.gatheringAttendance && !gatheringLoading && (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path
                      d="M2 5L5.5 8.5L12 2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {/* 로딩 스피너 */}
              {gatheringLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <span className="text-[#20342F] font-medium text-base leading-tight font-pretendard">
              모임
            </span>
          </div>
        </div>
      </div>

      {/* Collapsed floating open text (no background) */}
      {!isExpanded && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onToggle()
          }}
          aria-label="카드 열기"
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 transform text-xs font-pretendard font-normal text-[#A5BAAF] ${showPulseHint ? 'animate-pulse' : ''}`}
        >
          +
        </button>
      )}

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4" onClick={e => e.stopPropagation()}>
          {/* Divider (solid above '나눔') */}
          <div className="h-0 border-t border-[#C2D0C7]"></div>

          {/* Sharing Section */}
          <div className="space-y-2">
            <div className="text-[#5F7B6D] font-medium text-base leading-tight tracking-[0.025em] font-pretendard">
              나눔
            </div>
            <div className="bg-[#FEFFFE] rounded-lg p-2">
              <AutoGrowInput
                value={localStory}
                onChange={next => {
                  if (isReadOnly) return
                  handleStoryChange(next.replace(/\n/g, ' '))
                }}
                placeholder={
                  isReadOnly ? '내용이 없습니다.' : '나눔 내용을 적어주세요.'
                }
                readOnly={isReadOnly}
                className="border-none"
                inputClassName="rounded-lg bg-transparent"
                autoFocus={!isReadOnly}
                // 상위 카드 토글 방지를 위해 클릭/키 이벤트 전파 중단
                // Type narrowing을 위해 any 캐스팅 사용하지 않음
                // onClick은 wrapper에서 처리되므로 여기서는 stopPropagation만
                onClick={(e: React.MouseEvent) =>
                  e.stopPropagation() as unknown as void
                }
              />
            </div>
          </div>

          {/* Weekly Goal Section */}
          <div className="space-y-2">
            <div className="text-[#5F7B6D] font-medium text-base leading-tight tracking-[0.025em] font-pretendard">
              한주 목표
            </div>
            <div className="bg-[#FEFFFE] rounded-lg p-2">
              <AutoGrowInput
                value={localGoal}
                onChange={next => {
                  if (isReadOnly) return
                  handleGoalChange(next.replace(/\n/g, ' '))
                }}
                placeholder={
                  isReadOnly ? '내용이 없습니다.' : '이번 주 목표를 적어주세요.'
                }
                readOnly={isReadOnly}
                className="border-none"
                inputClassName="rounded-lg bg-transparent"
                onClick={(e: React.MouseEvent) =>
                  e.stopPropagation() as unknown as void
                }
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
              <div
                key={input.id === 'new' ? `new-${index}` : input.id}
                className="bg-[#FEFFFE] rounded-lg p-2"
              >
                <div className="flex items-start gap-2">
                  <AutoGrowInput
                    value={input.value}
                    onChange={next => {
                      if (isReadOnly) return
                      updatePrayerInput(index, next.replace(/\n/g, ' '))
                    }}
                    placeholder={
                      isReadOnly ? '내용이 없습니다.' : '기도제목을 적어주세요.'
                    }
                    readOnly={isReadOnly}
                    className="flex-1 border-none"
                    inputClassName="rounded-lg bg-transparent"
                    autoFocus={
                      index === prayerInputs.length - 1 &&
                      input.value === '' &&
                      shouldFocusNewPrayer
                    }
                    onClick={(e: React.MouseEvent) =>
                      e.stopPropagation() as unknown as void
                    }
                  />
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeletePrayer(index, input)}
                      className="flex-shrink-0 w-6 h-6 ml-1 mt-1 inline-flex items-center justify-center text-[#A5BAAF] hover:text-[#5F7B6D] transition-colors self-start"
                    >
                      {input.id !== 'new' && deletingPrayerIds[input.id] ? (
                        <div className="w-4 h-4 border-2 border-[#5F7B6D] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
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
                      )}
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

export default SmallGathering
