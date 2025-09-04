import ToastNotification from '@/components/common/ToastNotification'
import { ApiError, groupsApi } from '@/lib/api'
import type { User } from '@/types'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const SmallGatheringManagement: React.FC = () => {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: string }>()

  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = (message: string) => {
    setToastMessage(message)
    setToastVisible(true)
  }

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

      {/* Title */}
      <div className="px-5 pt-4">
        <h2 className="text-[#232323] font-bold text-xl leading-tight tracking-[-0.02em] font-pretendard">
          서브리더 지정
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4">
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
            {members
              .filter(m => m.role !== 'LEADER')
              .map(m => (
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
                              const mm = String(d.getMonth() + 1).padStart(
                                2,
                                '0'
                              )
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
                        className={`min-w-[110px] inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-pretendard border transition-colors ${
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
