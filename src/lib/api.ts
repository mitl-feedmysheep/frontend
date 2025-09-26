import type {
  ApiResponse,
  Church,
  CreateGatheringRequest,
  Gathering,
  GatheringDetail,
  GatheringResponse,
  Group,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from '@/types'
import { checkAndHandleJwtExpired } from './auth-handler'

// Get API URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// API error class
export class ApiError extends Error {
  status: number
  response?: unknown

  constructor(message: string, status: number, response?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}

// Fetch wrapper function
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    defaultHeaders['Authorization'] = `${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      const apiError = new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      )

      // JWT 만료 처리
      if (checkAndHandleJwtExpired(apiError)) {
        return Promise.reject(apiError)
      }

      throw apiError
    }

    return data
  } catch (error) {
    // JWT 만료 처리
    if (checkAndHandleJwtExpired(error)) {
      return Promise.reject(error)
    }

    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error occurred.', 0, error)
  }
}

// HTTP method convenience functions
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Direct API call without ApiResponse wrapper for login
    const url = `${API_BASE_URL}/auth/login`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리 (로그인 실패 시에도 확인)
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: LoginResponse = await response.json()

    // isProvisioned가 false일 때만 정식 토큰 저장, true면 임시 토큰 보관
    if (data.accessToken) {
      const provisioned = (data as any).isProvisioned
      if (provisioned === false) {
        localStorage.setItem('authToken', data.accessToken)
      } else if (provisioned === true) {
        try {
          localStorage.setItem('provisionToken', data.accessToken)
          localStorage.setItem('provisionPending', 'true')
        } catch {
          // ignore if sessionStorage unavailable
        }
      }
    }

    return data
  },

  // 이메일 인증 코드 발송
  sendEmailVerification: async (email: string): Promise<void> => {
    const url = `${API_BASE_URL}/auth/verification/email`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },

  // 이메일 인증 코드 확인
  confirmEmailVerification: async (
    email: string,
    code: string
  ): Promise<void> => {
    const url = `${API_BASE_URL}/auth/verification/email/confirm`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('churchId')
    localStorage.removeItem('groupId')
    try {
      localStorage.removeItem('provisionToken')
      localStorage.removeItem('provisionPending')
    } catch {
      // ignore localStorage errors
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken')
    return !!token
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  signup: async (payload: SignupRequest): Promise<SignupResponse> => {
    const url = `${API_BASE_URL}/auth/signup`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: SignupResponse = await response.json()
    return data
  },
}

// Groups API functions
export const groupsApi = {
  getGroupsByChurch: async (churchId: string): Promise<Group[]> => {
    // API call to get groups in a specific church
    const url = `${API_BASE_URL}/churches/${churchId}/groups`

    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: Group[] = await response.json()
    return data
  },

  getGroupMembers: async (groupId: string): Promise<User[]> => {
    const url = `${API_BASE_URL}/groups/${groupId}/members`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: User[] = await response.json()
    return data
  },

  getGroupGatherings: async (groupId: string): Promise<Gathering[]> => {
    const url = `${API_BASE_URL}/groups/${groupId}/gatherings`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: Gathering[] = await response.json()
    return data
  },

  getMyInfoInGroup: async (groupId: string): Promise<User> => {
    const url = `${API_BASE_URL}/groups/${groupId}/me`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: User = await response.json()
    return data
  },

  // 그룹 멤버 역할 변경 (Leader only)
  changeMemberRole: async (
    groupId: string,
    groupMemberId: string,
    newRole: string
  ): Promise<User> => {
    const url = `${API_BASE_URL}/groups/${groupId}/groupMembers/${groupMemberId}/role`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ newRole }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: User = await response.json()
    return data
  },
}

// Members API functions
export const membersApi = {
  getMyInfo: async (): Promise<User> => {
    // Direct API call for /members/me
    const url = `${API_BASE_URL}/members/me`

    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: User = await response.json()
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
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },

  // 이메일 변경 (프로비저닝/최초 설정 포함)
  changeEmail: async (
    newEmail: string,
    tokenOverride?: string
  ): Promise<void> => {
    const url = `${API_BASE_URL}/members/email/change`
    const token = tokenOverride || localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newEmail }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },

  // 내 정보 수정
  updateMyInfo: async (payload: {
    id: string
    name: string
    sex: 'M' | 'F'
    birthday: string // YYYY-MM-DD
    phone: string
  }): Promise<User> => {
    const url = `${API_BASE_URL}/members/me`
    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `${token}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: User = await response.json()
    return data
  },
}

// Churches API functions
export const churchesApi = {
  getMyChurches: async (): Promise<Church[]> => {
    // Direct API call since /churches returns array directly
    const url = `${API_BASE_URL}/churches`

    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
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

  // 교회 전체 기도제목 개수 조회
  getPrayerRequestCount: async (
    churchId: string
  ): Promise<{ count: number }> => {
    const url = `${API_BASE_URL}/churches/${churchId}/prayer-request-count`

    const token = localStorage.getItem('authToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: { count: number } = await response.json()
    return data
  },
}

// Gathering API
export const gatheringsApi = {
  // 새 모임 생성
  create: async (
    gatheringData: CreateGatheringRequest
  ): Promise<GatheringResponse> => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new ApiError('Not authenticated', 401)
    }

    const response = await fetch(`${API_BASE_URL}/gatherings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify(gatheringData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: GatheringResponse = await response.json()
    return data
  },

  // 모임 상세 정보 조회 (멤버 리스트 포함)
  getDetail: async (gatheringId: string): Promise<GatheringDetail> => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new ApiError('Not authenticated', 401)
    }

    const response = await fetch(`${API_BASE_URL}/gatherings/${gatheringId}`, {
      method: 'GET',
      headers: {
        Authorization: authToken,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: GatheringDetail = await response.json()
    return data
  },

  // 모임 정보 업데이트 (날짜/장소/시간/설명)
  update: async (
    gatheringId: string,
    payload: {
      name: string
      date: string
      place: string
      startedAt: string
      endedAt: string
      description: string
      leaderComment?: string
    }
  ): Promise<GatheringResponse> => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new ApiError('Not authenticated', 401)
    }

    const response = await fetch(`${API_BASE_URL}/gatherings/${gatheringId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data: GatheringResponse = await response.json()
    return data
  },

  // 멤버 정보 업데이트 (출석, 나눔, 기도제목)
  updateMember: async (
    gatheringId: string,
    groupMemberId: string,
    updateData: {
      worshipAttendance: boolean
      gatheringAttendance: boolean
      story: string | null
      goal?: string | null
      prayers: Array<{
        prayerRequest: string
        description: string
      }>
    }
  ): Promise<{
    id: string
    worshipAttendance: boolean
    gatheringAttendance: boolean
    story: string | null
    goal?: string | null
    prayers: Array<{
      id: string
      prayerRequest: string
      description: string
      answered: boolean
    }>
  }> => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new ApiError('Not authenticated', 401)
    }

    const response = await fetch(
      `${API_BASE_URL}/gatherings/${gatheringId}/groupMember/${groupMemberId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify(updateData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }

    const data = await response.json()
    return data
  },
}

// Prayers API
export const prayersApi = {
  // 기도제목 삭제 (soft delete)
  delete: async (prayerId: string): Promise<void> => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new ApiError('Not authenticated', 401)
    }

    const response = await fetch(`${API_BASE_URL}/prayers/${prayerId}`, {
      method: 'DELETE',
      headers: {
        Authorization: authToken,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const apiError = new ApiError(
        (errorData as any).message || `HTTP ${response.status}`,
        response.status,
        errorData
      )

      // JWT 만료 처리
      checkAndHandleJwtExpired(apiError)

      throw apiError
    }
  },
}

// Admin APIs
// admin-api.ts로 분리됨
