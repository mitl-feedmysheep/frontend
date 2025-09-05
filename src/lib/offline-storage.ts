// 오프라인 모드를 위한 로컬 저장소 관리

export interface OfflineData {
  id: string
  type: 'prayer' | 'sharing' | 'meeting' | 'note'
  data: any
  timestamp: number
  synced: boolean
  groupId?: string
  gatheringId?: string
}

const OFFLINE_DATA_KEY = 'intotheheaven_offline_data'
const OFFLINE_MEETINGS_KEY = 'intotheheaven_offline_meetings'
const OFFLINE_USER_DATA_KEY = 'intotheheaven_offline_user'

class OfflineStorage {
  // 오프라인 데이터 저장
  saveOfflineData(
    data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>
  ): string {
    try {
      const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const offlineData: OfflineData = {
        ...data,
        id,
        timestamp: Date.now(),
        synced: false,
      }

      const existingData = this.getAllOfflineData()
      existingData.push(offlineData)

      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(existingData))
      console.log('[OfflineStorage] Saved offline data:', offlineData)

      return id
    } catch (error) {
      console.error('[OfflineStorage] Failed to save offline data:', error)
      throw error
    }
  }

  // 모든 오프라인 데이터 가져오기
  getAllOfflineData(): OfflineData[] {
    try {
      const data = localStorage.getItem(OFFLINE_DATA_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('[OfflineStorage] Failed to get offline data:', error)
      return []
    }
  }

  // 동기화되지 않은 데이터 가져오기
  getUnsyncedData(): OfflineData[] {
    return this.getAllOfflineData().filter(item => !item.synced)
  }

  // 특정 타입의 데이터 가져오기
  getDataByType(type: OfflineData['type']): OfflineData[] {
    return this.getAllOfflineData().filter(item => item.type === type)
  }

  // 특정 그룹의 데이터 가져오기
  getDataByGroup(groupId: string): OfflineData[] {
    return this.getAllOfflineData().filter(item => item.groupId === groupId)
  }

  // 특정 모임의 데이터 가져오기
  getDataByGathering(gatheringId: string): OfflineData[] {
    return this.getAllOfflineData().filter(
      item => item.gatheringId === gatheringId
    )
  }

  // 데이터를 동기화 완료로 표시
  markAsSynced(id: string): void {
    try {
      const allData = this.getAllOfflineData()
      const updatedData = allData.map(item =>
        item.id === id ? { ...item, synced: true } : item
      )
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(updatedData))
      console.log('[OfflineStorage] Marked as synced:', id)
    } catch (error) {
      console.error('[OfflineStorage] Failed to mark as synced:', error)
    }
  }

  // 오프라인 데이터 삭제
  deleteOfflineData(id: string): void {
    try {
      const allData = this.getAllOfflineData()
      const filteredData = allData.filter(item => item.id !== id)
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(filteredData))
      console.log('[OfflineStorage] Deleted offline data:', id)
    } catch (error) {
      console.error('[OfflineStorage] Failed to delete offline data:', error)
    }
  }

  // 동기화된 데이터 정리 (옵션)
  cleanSyncedData(): void {
    try {
      const unsyncedData = this.getUnsyncedData()
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(unsyncedData))
      console.log('[OfflineStorage] Cleaned synced data')
    } catch (error) {
      console.error('[OfflineStorage] Failed to clean synced data:', error)
    }
  }

  // 캐시된 모임 목록 저장 (오프라인에서 표시용)
  saveCachedMeetings(meetings: any[]): void {
    try {
      const cachedData = {
        meetings,
        timestamp: Date.now(),
      }
      localStorage.setItem(OFFLINE_MEETINGS_KEY, JSON.stringify(cachedData))
      console.log('[OfflineStorage] Cached meetings:', meetings.length)
    } catch (error) {
      console.error('[OfflineStorage] Failed to cache meetings:', error)
    }
  }

  // 캐시된 모임 목록 가져오기
  getCachedMeetings(): any[] {
    try {
      const data = localStorage.getItem(OFFLINE_MEETINGS_KEY)
      if (!data) return []

      const cachedData = JSON.parse(data)

      // 24시간 이상 된 캐시는 무시
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24시간

      if (now - cachedData.timestamp > maxAge) {
        localStorage.removeItem(OFFLINE_MEETINGS_KEY)
        return []
      }

      return cachedData.meetings || []
    } catch (error) {
      console.error('[OfflineStorage] Failed to get cached meetings:', error)
      return []
    }
  }

  // 사용자 정보 캐시 (오프라인에서 표시용)
  saveCachedUserData(userData: any): void {
    try {
      const cachedData = {
        userData,
        timestamp: Date.now(),
      }
      localStorage.setItem(OFFLINE_USER_DATA_KEY, JSON.stringify(cachedData))
    } catch (error) {
      console.error('[OfflineStorage] Failed to cache user data:', error)
    }
  }

  // 캐시된 사용자 정보 가져오기
  getCachedUserData(): any | null {
    try {
      const data = localStorage.getItem(OFFLINE_USER_DATA_KEY)
      if (!data) return null

      const cachedData = JSON.parse(data)

      // 1시간 이상 된 캐시는 무시
      const now = Date.now()
      const maxAge = 60 * 60 * 1000 // 1시간

      if (now - cachedData.timestamp > maxAge) {
        localStorage.removeItem(OFFLINE_USER_DATA_KEY)
        return null
      }

      return cachedData.userData
    } catch (error) {
      console.error('[OfflineStorage] Failed to get cached user data:', error)
      return null
    }
  }

  // 전체 오프라인 데이터 초기화 (로그아웃 시 사용)
  clearAllData(): void {
    try {
      localStorage.removeItem(OFFLINE_DATA_KEY)
      localStorage.removeItem(OFFLINE_MEETINGS_KEY)
      localStorage.removeItem(OFFLINE_USER_DATA_KEY)
      console.log('[OfflineStorage] Cleared all offline data')
    } catch (error) {
      console.error('[OfflineStorage] Failed to clear all data:', error)
    }
  }

  // 오프라인 모드인지 확인
  isOffline(): boolean {
    return !navigator.onLine
  }

  // 오프라인 데이터 통계
  getStats() {
    const allData = this.getAllOfflineData()
    const unsyncedData = this.getUnsyncedData()

    return {
      total: allData.length,
      unsynced: unsyncedData.length,
      synced: allData.length - unsyncedData.length,
      byType: {
        prayer: allData.filter(item => item.type === 'prayer').length,
        sharing: allData.filter(item => item.type === 'sharing').length,
        meeting: allData.filter(item => item.type === 'meeting').length,
        note: allData.filter(item => item.type === 'note').length,
      },
    }
  }
}

// 싱글톤 인스턴스
export const offlineStorage = new OfflineStorage()

// 편의 함수들
export const saveOfflinePrayer = (
  prayer: any,
  groupId?: string,
  gatheringId?: string
) => {
  return offlineStorage.saveOfflineData({
    type: 'prayer',
    data: prayer,
    groupId,
    gatheringId,
  })
}

export const saveOfflineSharing = (
  sharing: any,
  groupId?: string,
  gatheringId?: string
) => {
  return offlineStorage.saveOfflineData({
    type: 'sharing',
    data: sharing,
    groupId,
    gatheringId,
  })
}

export const saveOfflineMeeting = (meeting: any, groupId?: string) => {
  return offlineStorage.saveOfflineData({
    type: 'meeting',
    data: meeting,
    groupId,
  })
}

export const saveOfflineNote = (
  note: any,
  groupId?: string,
  gatheringId?: string
) => {
  return offlineStorage.saveOfflineData({
    type: 'note',
    data: note,
    groupId,
    gatheringId,
  })
}
