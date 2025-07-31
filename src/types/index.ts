// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Common component props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface User {
  id: string
  email: string
  name?: string
}
