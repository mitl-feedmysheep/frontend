import { ApiError } from '@/lib/api'
import type {
  Church,
  CreateVisitRequest,
  LoginRequest,
  LoginResponse,
  MemberSearchResponse,
  Visit,
  VisitListResponse,
  VisitMember,
} from '@/types'
import { checkAndHandleJwtExpired } from './auth-handler'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const adminApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/auth/admin/login`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: LoginResponse = await response.json()
    if (data.accessToken) {
      const provisioned = (data as any).isProvisioned
      if (provisioned === false) {
        localStorage.setItem('authToken', data.accessToken)
      } else if (provisioned === true) {
        try {
          localStorage.setItem('provisionToken', data.accessToken)
          localStorage.setItem('provisionPending', 'true')
        } catch {
          // ignore
        }
      }
    }
    return data
  },

  getAdminChurches: async (): Promise<Church[]> => {
    const url = `${API_BASE_URL}/churches/admin`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, { method: 'GET', headers })
    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
    const data: Church[] = await response.json()
    return data
  },

  selectChurch: async (churchId: string): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/churches/admin/select-church`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ churchId }),
    })
    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
    const data: LoginResponse = await response.json()
    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken)
    }
    return data
  },

  searchMembers: async (
    searchText: string
  ): Promise<MemberSearchResponse[]> => {
    const url = `${API_BASE_URL}/churches/admin/members?searchText=${encodeURIComponent(searchText)}`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, { method: 'GET', headers })
    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
    const data: MemberSearchResponse[] = await response.json()
    return data
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    const url = `${API_BASE_URL}/members/password/change`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },

  // Visit API
  getAllVisits: async (): Promise<VisitListResponse[]> => {
    const url = `${API_BASE_URL}/visits/admin`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, { method: 'GET', headers })
    if (!response.ok) {
      const errorData: { message?: string; error?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string; error?: string })
      const apiError = new ApiError(
        errorData.message || errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: VisitListResponse[] = await response.json()
    return data
  },

  createVisit: async (visitData: CreateVisitRequest): Promise<Visit> => {
    const url = `${API_BASE_URL}/visits/admin`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(visitData),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
    const data: Visit = await response.json()
    return data
  },

  getVisitDetail: async (visitId: string): Promise<Visit> => {
    const url = `${API_BASE_URL}/visits/admin/${visitId}`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, { method: 'GET', headers })
    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
    const data: Visit = await response.json()
    return data
  },

  // 심방에 멤버 추가 (단일)
  addVisitMember: async (
    visitId: string,
    churchMemberId: string
  ): Promise<VisitMember> => {
    const url = `${API_BASE_URL}/visits/admin/${visitId}/members`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ churchMemberId }),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )
      checkAndHandleJwtExpired(apiError)
      throw apiError
    }

    const data: VisitMember = await response.json()
    return data
  },

  // 심방에 여러 멤버 추가
  addVisitMembers: async (
    visitId: string,
    memberIds: string[]
  ): Promise<Visit> => {
    const url = `${API_BASE_URL}/visits/admin/${visitId}/members`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ memberIds }),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )
      checkAndHandleJwtExpired(apiError)
      throw apiError
    }

    const data: Visit = await response.json()
    return data
  },

  // 심방 멤버의 나눔/기도제목 수정
  updateVisitMember: async (
    visitId: string,
    visitMemberId: string,
    data: {
      story?: string
      prayers?: Array<{
        id?: string
        prayerRequest: string
        description: string
      }>
    }
  ): Promise<VisitMember> => {
    const url = `${API_BASE_URL}/visits/admin/${visitId}/members/${visitMemberId}`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )
      checkAndHandleJwtExpired(apiError)
      throw apiError
    }

    const responseData: VisitMember = await response.json()
    return responseData
  },

  // 심방 멤버 삭제
  deleteVisitMember: async (
    visitId: string,
    visitMemberId: string
  ): Promise<void> => {
    const url = `${API_BASE_URL}/visits/admin/${visitId}/members/${visitMemberId}`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const errorData: { message?: string } = await response
        .json()
        .catch(() => ({}) as { message?: string })
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )
      checkAndHandleJwtExpired(apiError)
      throw apiError
    }
  },
}
