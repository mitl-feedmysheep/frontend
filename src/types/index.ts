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
  name: string
  email: string
  sex: string
  birthday: string
  phone: string
  profileUrl: string
  role?: string // LEADER, MEMBER 등
}

// Church types
export interface Church {
  id: string
  name: string
  location: string
  number: string
  homepageUrl: string
  description: string
  createdAt: string
}

// Group types
export interface Group {
  id: string
  name: string
  description: string
  churchId: string
  startDate: string
  endDate: string
}

// Gathering types
export interface Gathering {
  id: string
  name: string
  date: string
  place: string
  totalWorshipAttendanceCount: number
  totalGatheringAttendanceCount: number
  totalPrayerRequestCount: number
}
