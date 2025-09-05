// 오프라인 지원을 위한 API wrapper

import type { ApiResponse } from '@/types'
import { ApiError, apiRequest } from './api'
import {
  offlineStorage,
  saveOfflineMeeting,
  saveOfflinePrayer,
  saveOfflineSharing,
} from './offline-storage'

// 오프라인 API wrapper 클래스
class OfflineApiWrapper {
  // 네트워크 연결 상태 확인
  isOnline(): boolean {
    return navigator.onLine
  }

  // 오프라인 모드에서 GET 요청 처리
  async handleOfflineGet<T>(
    endpoint: string,
    fallbackData?: T
  ): Promise<ApiResponse<T>> {
    console.log('[OfflineAPI] Offline GET request:', endpoint)

    // 캐시된 데이터 확인
    if (endpoint.includes('/meetings') || endpoint.includes('/gatherings')) {
      const cachedMeetings = offlineStorage.getCachedMeetings()
      if (cachedMeetings.length > 0) {
        return {
          success: true,
          data: cachedMeetings as any,
          message: '오프라인 캐시된 데이터입니다',
        }
      }
    }

    // 사용자 정보 캐시 확인
    if (endpoint.includes('/user') || endpoint.includes('/profile')) {
      const cachedUser = offlineStorage.getCachedUserData()
      if (cachedUser) {
        return {
          success: true,
          data: cachedUser as any,
          message: '오프라인 캐시된 사용자 정보입니다',
        }
      }
    }

    // 폴백 데이터가 있으면 반환
    if (fallbackData) {
      return {
        success: true,
        data: fallbackData,
        message: '오프라인 모드 - 기본 데이터입니다',
      }
    }

    // 오프라인 에러 반환
    throw new ApiError('오프라인 상태입니다. 인터넷 연결을 확인해주세요.', 503)
  }

  // 오프라인 모드에서 POST/PUT 요청 처리
  async handleOfflineWrite(
    endpoint: string,
    data: any,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<ApiResponse<any>> {
    console.log('[OfflineAPI] Offline write request:', {
      endpoint,
      method,
      data,
    })

    // 데이터 타입 결정
    let offlineId: string

    if (endpoint.includes('/prayers') || endpoint.includes('/prayer')) {
      offlineId = saveOfflinePrayer(data, data.groupId, data.gatheringId)
    } else if (
      endpoint.includes('/sharings') ||
      endpoint.includes('/sharing')
    ) {
      offlineId = saveOfflineSharing(data, data.groupId, data.gatheringId)
    } else if (
      endpoint.includes('/meetings') ||
      endpoint.includes('/gathering')
    ) {
      offlineId = saveOfflineMeeting(data, data.groupId)
    } else {
      // 일반 오프라인 데이터
      offlineId = offlineStorage.saveOfflineData({
        type: 'note',
        data: { ...data, endpoint, method },
      })
    }

    return {
      success: true,
      data: {
        id: offlineId,
        ...data,
        __offline: true,
      },
      message: '오프라인에서 저장되었습니다. 연결되면 자동으로 동기화됩니다.',
    }
  }

  // 통합 API 요청 함수
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 온라인 상태면 일반 API 요청
      if (this.isOnline()) {
        const response = await apiRequest<T>(endpoint, options)

        // 성공적인 GET 요청 결과를 캐시
        if (options.method === 'GET' || !options.method) {
          this.cacheResponseData(endpoint, response.data)
        }

        return response
      } else {
        // 오프라인 상태 처리
        const method = (options.method || 'GET').toUpperCase()

        if (method === 'GET') {
          return this.handleOfflineGet<T>(endpoint)
        } else {
          const body = options.body ? JSON.parse(options.body as string) : {}
          return this.handleOfflineWrite(endpoint, body, method as any)
        }
      }
    } catch (error) {
      // 네트워크 에러인 경우 오프라인 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log(
          '[OfflineAPI] Network error detected, switching to offline mode'
        )

        const method = (options.method || 'GET').toUpperCase()

        if (method === 'GET') {
          return this.handleOfflineGet<T>(endpoint)
        } else {
          const body = options.body ? JSON.parse(options.body as string) : {}
          return this.handleOfflineWrite(endpoint, body, method as any)
        }
      }

      throw error
    }
  }

  // 응답 데이터 캐싱
  private cacheResponseData(endpoint: string, data: any) {
    try {
      if (endpoint.includes('/meetings') || endpoint.includes('/gatherings')) {
        if (Array.isArray(data)) {
          offlineStorage.saveCachedMeetings(data)
        }
      }

      if (endpoint.includes('/user') || endpoint.includes('/profile')) {
        offlineStorage.saveCachedUserData(data)
      }
    } catch (error) {
      console.error('[OfflineAPI] Failed to cache response data:', error)
    }
  }

  // 오프라인 데이터 동기화
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      console.log('[OfflineAPI] Cannot sync - still offline')
      return
    }

    const unsyncedData = offlineStorage.getUnsyncedData()
    console.log(
      '[OfflineAPI] Syncing offline data:',
      unsyncedData.length,
      'items'
    )

    for (const item of unsyncedData) {
      try {
        await this.syncSingleItem(item)
        offlineStorage.markAsSynced(item.id)
        console.log('[OfflineAPI] Synced item:', item.id)
      } catch (error) {
        console.error('[OfflineAPI] Failed to sync item:', item.id, error)
        // 동기화 실패한 항목은 다음에 다시 시도
      }
    }
  }

  // 개별 아이템 동기화
  private async syncSingleItem(item: any): Promise<void> {
    let endpoint = ''
    let method: RequestInit['method'] = 'POST'

    switch (item.type) {
      case 'prayer':
        endpoint = `/api/prayers`
        break
      case 'sharing':
        endpoint = `/api/sharings`
        break
      case 'meeting':
        endpoint = `/api/meetings`
        break
      case 'note':
        endpoint = item.data.endpoint || '/api/notes'
        method = item.data.method || 'POST'
        break
      default:
        throw new Error(`Unknown item type: ${item.type}`)
    }

    await apiRequest(endpoint, {
      method,
      body: JSON.stringify(item.data),
    })
  }

  // 동기화 상태 확인
  getSyncStatus() {
    return offlineStorage.getStats()
  }
}

// 싱글톤 인스턴스
export const offlineApi = new OfflineApiWrapper()

// 온라인 상태 복원 시 자동 동기화
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineAPI] Back online - starting sync')
    setTimeout(() => {
      offlineApi.syncOfflineData().catch(error => {
        console.error('[OfflineAPI] Auto-sync failed:', error)
      })
    }, 1000) // 1초 지연 후 동기화
  })
}

// PWA에서 사용할 수 있는 편의 함수들
export const pwaApi = {
  // 기도 제목 저장 (온라인/오프라인 자동 처리)
  async savePrayer(prayer: any, groupId?: string, gatheringId?: string) {
    return offlineApi.request('/api/prayers', {
      method: 'POST',
      body: JSON.stringify({ ...prayer, groupId, gatheringId }),
    })
  },

  // 나눔 저장 (온라인/오프라인 자동 처리)
  async saveSharing(sharing: any, groupId?: string, gatheringId?: string) {
    return offlineApi.request('/api/sharings', {
      method: 'POST',
      body: JSON.stringify({ ...sharing, groupId, gatheringId }),
    })
  },

  // 모임 생성 (온라인/오프라인 자동 처리)
  async createMeeting(meeting: any, groupId?: string) {
    return offlineApi.request('/api/meetings', {
      method: 'POST',
      body: JSON.stringify({ ...meeting, groupId }),
    })
  },

  // 데이터 가져오기 (캐시 활용)
  async getData<T>(endpoint: string): Promise<ApiResponse<T>> {
    return offlineApi.request<T>(endpoint)
  },

  // 수동 동기화 트리거
  async syncNow() {
    return offlineApi.syncOfflineData()
  },

  // 동기화 상태 조회
  getSyncStatus() {
    return offlineApi.getSyncStatus()
  },
}
