import { pwaApi } from '@/lib/offline-api'
import React, { useEffect, useState } from 'react'

interface SyncStatusProps {
  showDetails?: boolean
}

const SyncStatus: React.FC<SyncStatusProps> = ({ showDetails = false }) => {
  const [syncStatus, setSyncStatus] = useState({
    total: 0,
    unsynced: 0,
    synced: 0,
    byType: {
      prayer: 0,
      sharing: 0,
      meeting: 0,
      note: 0,
    },
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const updateSyncStatus = () => {
    const status = pwaApi.getSyncStatus()
    setSyncStatus(status)
  }

  useEffect(() => {
    updateSyncStatus()

    // 주기적으로 상태 업데이트
    const interval = setInterval(updateSyncStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleManualSync = async () => {
    if (isSyncing || !navigator.onLine) return

    setIsSyncing(true)
    try {
      await pwaApi.syncNow()
      updateSyncStatus()
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // 동기화할 데이터가 없으면 표시하지 않음
  if (syncStatus.unsynced === 0 && !showDetails) {
    return null
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🔄</span>
          동기화 상태
        </h3>
        {navigator.onLine && syncStatus.unsynced > 0 && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSyncing ? '동기화 중...' : '지금 동기화'}
          </button>
        )}
      </div>

      {/* 기본 상태 표시 */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {syncStatus.synced}
          </div>
          <div className="text-xs text-gray-600">동기화 완료</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-600">
            {syncStatus.unsynced}
          </div>
          <div className="text-xs text-gray-600">대기 중</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">
            {syncStatus.total}
          </div>
          <div className="text-xs text-gray-600">전체</div>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && syncStatus.total > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            항목별 상세
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {syncStatus.byType.prayer > 0 && (
              <div className="flex justify-between">
                <span>🙏 기도 제목</span>
                <span className="font-medium">{syncStatus.byType.prayer}</span>
              </div>
            )}
            {syncStatus.byType.sharing > 0 && (
              <div className="flex justify-between">
                <span>💬 나눔</span>
                <span className="font-medium">{syncStatus.byType.sharing}</span>
              </div>
            )}
            {syncStatus.byType.meeting > 0 && (
              <div className="flex justify-between">
                <span>📅 모임</span>
                <span className="font-medium">{syncStatus.byType.meeting}</span>
              </div>
            )}
            {syncStatus.byType.note > 0 && (
              <div className="flex justify-between">
                <span>📝 메모</span>
                <span className="font-medium">{syncStatus.byType.note}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 오프라인 안내 */}
      {!navigator.onLine && syncStatus.unsynced > 0 && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            📴 오프라인 상태입니다. 인터넷에 연결되면 자동으로 동기화됩니다.
          </p>
        </div>
      )}

      {/* 마지막 동기화 시간 */}
      {lastSyncTime && (
        <div className="mt-2 text-xs text-gray-500">
          마지막 동기화: {lastSyncTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default SyncStatus
