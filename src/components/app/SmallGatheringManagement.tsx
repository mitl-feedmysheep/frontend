import ToastNotification from '@/components/common/ToastNotification'
import { ApiError, groupsApi, mediaApi } from '@/lib/api'
import { resizeImage } from '@/lib/utils'
import type { Group, User } from '@/types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// 앱 버전 가져오기 (Home과 동일)
const APP_VERSION = __APP_VERSION__

const SmallGatheringManagement: React.FC = () => {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: string }>()

  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // 그룹 이미지 관련 상태
  const [group, setGroup] = useState<Group | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setToastVisible(true)
  }, [])

  const hideToast = () => setToastVisible(false)

  const safeGroupId = useMemo(() => {
    if (groupId) return groupId
    try {
      return localStorage.getItem('groupId') || ''
    } catch {
      return ''
    }
  }, [groupId])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // 그룹 정보 가져오기
  useEffect(() => {
    if (!safeGroupId) {
      setGroupLoading(false)
      return
    }

    let mounted = true
    const fetchGroupInfo = async () => {
      try {
        setGroupLoading(true)

        // 항상 최신 API 데이터를 가져오기 (Home과 동일한 방식)
        const churchId = localStorage.getItem('churchId')
        let foundGroup: Group | undefined = undefined

        if (churchId) {
          console.warn('🔄 Fetching fresh group data from API (like Home)...')
          const groups = await groupsApi.getGroupsByChurch(churchId)
          console.warn('✅ Fresh groups API response:', groups.length, 'groups')

          foundGroup = groups.find(g => g.id === safeGroupId)

          // 최신 데이터를 localStorage에 저장 (캐시 업데이트)
          localStorage.setItem('groups', JSON.stringify(groups))
          console.warn('💾 Updated localStorage with fresh group data')
        }

        if (mounted) {
          setGroup(foundGroup || null)
        }
      } catch (error) {
        console.error('Error fetching group info:', error)
        if (mounted) {
          setGroup(null)
        }
      } finally {
        if (mounted) {
          setGroupLoading(false)
        }
      }
    }

    fetchGroupInfo()

    return () => {
      mounted = false
    }
  }, [safeGroupId])

  useEffect(() => {
    if (!safeGroupId) {
      setError('그룹 정보를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    let mounted = true
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const list = await groupsApi.getGroupMembers(safeGroupId)
        if (mounted) {
          setMembers(list)
          setError('')
        }
      } catch (e) {
        console.error('멤버 목록 조회 실패:', e)
        if (mounted) {
          setError(
            e instanceof ApiError
              ? e.message
              : '멤버 목록을 불러오지 못했습니다.'
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMembers()
    return () => {
      mounted = false
    }
  }, [safeGroupId])

  const handleSetRole = async (
    member: User,
    targetRole: 'MEMBER' | 'SUB_LEADER'
  ) => {
    if (!safeGroupId) return
    if (member.role === targetRole) return
    const memberId = member.id
    try {
      setSavingIds(prev => ({ ...prev, [memberId]: true }))
      await groupsApi.changeMemberRole(safeGroupId, memberId, targetRole)
      // 성공 시 로컬 상태 업데이트
      setMembers(prev =>
        prev.map(m => (m.id === memberId ? { ...m, role: targetRole } : m))
      )
      showToast(
        targetRole === 'SUB_LEADER'
          ? '서브리더로 변경되었어요'
          : '멤버로 변경되었어요'
      )
    } catch (e) {
      console.error('역할 변경 실패:', e)
      alert(e instanceof ApiError ? e.message : '역할 변경에 실패했습니다.')
    } finally {
      setSavingIds(prev => {
        const { [memberId]: _removed, ...rest } = prev
        return rest
      })
    }
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!safeGroupId || !group) {
        showToast('그룹 정보를 찾을 수 없습니다.')
        return
      }

      // 파일 크기 제한 (10MB)
      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        showToast('파일 크기는 20MB 이하로 선택해주세요.')
        return
      }

      // 파일 형식 확인
      if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드 가능합니다.')
        return
      }

      try {
        setImageUploading(true)
        setUploadProgress(20)

        console.warn('🔄 Starting image upload process...')

        // 1. 이미지를 두 가지 크기로 리사이징 (THUMBNAIL, MEDIUM)
        console.warn('🔄 Resizing images...')
        const [thumbnailBlob, mediumBlob] = await Promise.all([
          resizeImage(file, 200, 200, 0.95), // THUMBNAIL: 200x200, 고품질
          resizeImage(file, 500, 500, 0.95), // MEDIUM: 500x500, 고품질
        ])

        setUploadProgress(30)
        console.warn('✅ Images resized successfully')

        // 2. Presigned URL 생성 (THUMBNAIL, MEDIUM 두 개)
        const presignedData = await mediaApi.getPresignedUrls(
          'GROUP',
          safeGroupId,
          file.name,
          file.type,
          file.size
        )

        setUploadProgress(40)
        console.warn(
          '✅ Got presigned URLs:',
          presignedData.uploads.length,
          'files'
        )

        // 3. 리사이징된 파일들을 각각 업로드
        const resizedFiles = {
          THUMBNAIL: thumbnailBlob,
          MEDIUM: mediumBlob,
        }

        const uploadPromises = presignedData.uploads.map(async upload => {
          const resizedFile =
            resizedFiles[upload.mediaType as keyof typeof resizedFiles]

          if (!resizedFile) {
            throw new Error(`No resized file for ${upload.mediaType}`)
          }

          console.warn(
            `🔄 Uploading ${upload.mediaType} (${(resizedFile.size / 1024).toFixed(1)}KB)...`
          )
          await mediaApi.uploadFile(
            upload.uploadUrl,
            new File([resizedFile], file.name, { type: file.type })
          )
          console.warn(`✅ ${upload.mediaType} uploaded successfully`)
          return upload
        })

        const uploadedFiles = await Promise.all(uploadPromises)
        setUploadProgress(70)
        console.warn('✅ All resized files uploaded successfully')

        // 4. 기존 이미지가 있으면 삭제 (groupId)
        if (group.imageUrl) {
          try {
            await mediaApi.deleteMediaByEntityId(group.id)
            console.warn('✅ Old image deleted:', group.id)
          } catch (error) {
            console.warn('⚠️ Failed to delete old image:', error)
            // 삭제 실패해도 업로드는 성공으로 처리
          }
        }

        setUploadProgress(85)
        console.warn('✅ Upload completed:', uploadedFiles)

        // 5. Complete 호출 (THUMBNAIL, MEDIUM 두 개 모두 포함)
        const completeResult = await mediaApi.completeUpload(
          'GROUP',
          safeGroupId,
          uploadedFiles.map(upload => ({
            mediaType: upload.mediaType,
            publicUrl: upload.publicUrl,
          }))
        )

        setUploadProgress(100)

        // MEDIUM을 메인 이미지로 사용 (고화질)
        const updatedImageUrl = completeResult.medias.find(
          media => media.mediaType === 'MEDIUM'
        )?.publicUrl
        console.warn('✅ [UPLOAD COMPLETE] Group image updated:', {
          newImageUrl: updatedImageUrl,
          allMedias: completeResult.medias,
          selectedType: 'MEDIUM',
          urlContains: {
            thumbnail: updatedImageUrl?.includes('thumbnail'),
            medium: updatedImageUrl?.includes('medium'),
          },
        })

        // 로컬 상태 업데이트
        setGroup({ ...group, imageUrl: updatedImageUrl })

        // localStorage의 groups도 업데이트
        try {
          const savedGroups = localStorage.getItem('groups')
          if (savedGroups) {
            const groups: Group[] = JSON.parse(savedGroups)
            const updatedGroups = groups.map(g =>
              g.id === safeGroupId ? { ...group, imageUrl: updatedImageUrl } : g
            )
            localStorage.setItem('groups', JSON.stringify(updatedGroups))
          }
        } catch (error) {
          console.warn('Failed to update localStorage:', error)
        }

        showToast('이미지가 성공적으로 변경되었습니다!')
      } catch (error) {
        console.error('❌ Image upload failed:', error)
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : '이미지 업로드에 실패했습니다.'
        showToast(errorMessage)
      } finally {
        setImageUploading(false)
        setUploadProgress(0)
        // 파일 input 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [safeGroupId, group, showToast]
  )

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0) {
        handleImageUpload(files[0])
      }
    },
    [handleImageUpload]
  )

  // 파일 선택 버튼 클릭
  const handleSelectImageClick = useCallback(() => {
    if (imageUploading) return
    fileInputRef.current?.click()
  }, [imageUploading])

  const sortedMembers = useMemo(() => {
    const toTimestamp = (value: unknown) => {
      if (!value || typeof value !== 'string') return Number.POSITIVE_INFINITY
      const t = new Date(value).getTime()
      return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
    }
    return members
      .filter(m => m.role !== 'LEADER')
      .slice()
      .sort(
        (a, b) =>
          toTimestamp(a.birthday as unknown) -
          toTimestamp(b.birthday as unknown)
      )
  }, [members])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onHide={hideToast}
        duration={2500}
      />

      {/* Top Bar */}
      <div className="flex items-center h-[42px] bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
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
            소그룹 관리
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Group Image Section */}
      <div className="px-5 pt-4">
        <h2 className="text-[#232323] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard mb-4">
          소그룹 이미지 설정
        </h2>

        {groupLoading ? (
          <div className="py-6 text-center text-[#405347] font-pretendard">
            그룹 정보를 불러오는 중...
          </div>
        ) : (
          <div className="mb-8">
            {/* 현재 이미지 미리보기 */}
            <div className="mb-4">
              <div className="w-full h-40 rounded-2xl overflow-hidden bg-[#F5F7F5] border border-[#E5E7E5]">
                {group?.imageUrl ? (
                  <img
                    src={`${group.imageUrl}?v=${APP_VERSION}`}
                    onLoad={() => {
                      // 🔍 관리 화면 이미지 URL 디버깅
                      console.warn('🛠️ [MANAGEMENT] Group Image URL:', {
                        groupId: group.id,
                        groupName: group.name,
                        originalUrl: group.imageUrl,
                        finalUrl: `${group.imageUrl}?v=${APP_VERSION}`,
                        urlContains: {
                          thumbnail: group.imageUrl?.includes('thumbnail'),
                          medium: group.imageUrl?.includes('medium'),
                        },
                      })
                    }}
                    alt={`${group.name} 대표사진`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      // 이미지 로드 실패시 fallback 표시
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      if (target.nextElementSibling) {
                        ;(
                          target.nextElementSibling as HTMLElement
                        ).style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center ${group?.imageUrl ? 'hidden' : 'flex'}`}
                >
                  <div className="text-center">
                    <div className="text-[#98A7A4] text-lg font-medium font-pretendard mb-2">
                      📷
                    </div>
                    <div className="text-[#98A7A4] text-sm font-pretendard">
                      이미지가 없습니다
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 업로드 버튼 및 진행상태 */}
            <div className="space-y-3">
              {/* 파일 선택 input (숨겨진) - 모바일 최적화 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={imageUploading}
              />

              {/* 업로드 버튼 */}
              <button
                onClick={handleSelectImageClick}
                disabled={imageUploading}
                className={`w-full py-3 px-4 rounded-xl font-pretendard font-medium text-sm transition-all ${
                  imageUploading
                    ? 'bg-[#E5E7E5] text-[#98A7A4] cursor-not-allowed'
                    : 'bg-[#5F7B6D] text-white hover:bg-[#4A5D56] active:bg-[#3A4A42]'
                }`}
              >
                {imageUploading
                  ? '업로드 중...'
                  : group?.imageUrl
                    ? '이미지 변경하기'
                    : '이미지 선택하기'}
              </button>

              {/* 업로드 진행 바 */}
              {imageUploading && (
                <div className="w-full bg-[#E5E7E5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#5F7B6D] h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* 업로드 안내 */}
              <div className="text-center text-[#709180] text-xs font-pretendard">
                JPG, PNG 등 이미지 파일 (최대 20MB)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub Leader Section */}
      <div className="px-5">
        <h2 className="text-[#232323] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard mb-4">
          서브리더 지정
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-4">
        {loading ? (
          <div className="py-10 text-center text-[#405347] font-pretendard">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500 font-pretendard">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMembers.map(m => (
              <div
                key={m.id}
                className={`w-full p-3 rounded-xl border transition-colors border-[#E5E7E5] bg-[#FEFFFE] hover:bg-[#F7F9F8]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#E5E7E5] rounded-md" />
                    <div>
                      <div className="text-[#20342F] font-medium text-base font-pretendard">
                        {m.name}
                      </div>
                      <div className="text-[#709180] text-xs font-pretendard">
                        {(() => {
                          try {
                            if (!m.birthday) return '-'
                            const d = new Date(m.birthday)
                            const y = d.getFullYear()
                            const mm = String(d.getMonth() + 1).padStart(2, '0')
                            const dd = String(d.getDate()).padStart(2, '0')
                            return `${y}.${mm}.${dd}`
                          } catch {
                            return m.birthday || '-'
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSetRole(m, 'MEMBER')}
                      disabled={!!savingIds[m.id] || m.role === 'MEMBER'}
                      className={`min-w-[84px] inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-pretendard border transition-colors ${
                        m.role === 'MEMBER'
                          ? 'bg-[#EAF2ED] text-[#2E6B4E] border-[#5F7B6D]'
                          : 'bg-white text-[#6B7C72] border-[#C2D0C7]'
                      } ${savingIds[m.id] ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                      멤버
                    </button>
                    <button
                      onClick={() => handleSetRole(m, 'SUB_LEADER')}
                      disabled={!!savingIds[m.id] || m.role === 'SUB_LEADER'}
                      className={`min-w-[84px] inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-pretendard border transition-colors ${
                        m.role === 'SUB_LEADER'
                          ? 'bg-[#EAF2ED] text-[#2E6B4E] border-[#5F7B6D]'
                          : 'bg-white text-[#6B7C72] border-[#C2D0C7]'
                      } ${savingIds[m.id] ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                      서브리더
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Apply Button removed: toggle operates per member */}
    </div>
  )
}

export default SmallGatheringManagement
