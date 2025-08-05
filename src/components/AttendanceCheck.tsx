import { ApiError, gatheringsApi } from '@/lib/api'
import type { GatheringDetail, GatheringMember } from '@/types'
import React, { useEffect, useState } from 'react'

interface AttendanceCheckProps {
  onBack: () => void
  gatheringId: string
}

const AttendanceCheck: React.FC<AttendanceCheckProps> = ({
  onBack,
  gatheringId,
}) => {
  const [gathering, setGathering] = useState<GatheringDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 컴포넌트 마운트 시 페이지 최상단으로 스크롤
  useEffect(() => {
    // 모바일에서 더 확실한 스크롤 리셋
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // gatheringId가 변경될 때마다 스크롤을 최상위로
  useEffect(() => {
    // 모바일에서 더 확실한 스크롤 리셋
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
      } catch (err) {
        console.error('모임 상세 정보 조회 실패:', err)
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('모임 정보를 불러오는데 실패했습니다.')
        }
      } finally {
        setLoading(false)
        // 데이터 로딩 완료 후 스크롤을 최상위로 (DOM 렌더링 후)
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        }, 100)
      }
    }

    fetchGatheringDetail()
  }, [gatheringId])

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center h-[42px] bg-white">
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
            출석 체크
          </span>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-6">
        {/* Meeting Info */}
        <div className="mb-6">
          <h2 className="text-[#405347] font-semibold text-lg font-pretendard mb-2">
            {gathering.name}
          </h2>
          <div className="text-[#8AA594] font-normal text-sm font-pretendard">
            {gathering.date} • {gathering.place}
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {gathering.members.map(member => (
            <MemberItem
              key={member.memberId}
              member={member}
              onChange={updatedMember => {
                // TODO: 출석 상태 업데이트 로직
                console.warn('Member updated:', updatedMember)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface MemberItemProps {
  member: GatheringMember
  onChange: (member: GatheringMember) => void
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onChange }) => {
  return (
    <div className="bg-[#F5F7F5] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#405347] font-medium text-base font-pretendard">
          {member.name}
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={member.worshipAttendance}
              onChange={e =>
                onChange({ ...member, worshipAttendance: e.target.checked })
              }
              className="w-4 h-4 text-[#5F7B6D] rounded"
            />
            <span className="text-sm text-[#405347] font-pretendard">예배</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={member.gatheringAttendance}
              onChange={e =>
                onChange({ ...member, gatheringAttendance: e.target.checked })
              }
              className="w-4 h-4 text-[#5F7B6D] rounded"
            />
            <span className="text-sm text-[#405347] font-pretendard">모임</span>
          </label>
        </div>
      </div>

      <textarea
        value={member.story}
        onChange={e => onChange({ ...member, story: e.target.value })}
        placeholder="나눔 내용을 입력하세요..."
        className="w-full h-20 p-3 border border-[#E5E7E5] rounded-lg resize-none text-sm text-[#405347] placeholder:text-[#A5BAAF] font-pretendard"
      />
    </div>
  )
}

export default AttendanceCheck
