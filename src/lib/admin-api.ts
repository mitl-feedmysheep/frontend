import { ApiError } from '@/lib/api'
import type {
  Church,
  LoginRequest,
  LoginResponse,
  MemberSearchResponse,
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
}
