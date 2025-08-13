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
  groupMemberCount: number
}

// Gathering types
export interface Gathering {
  id: string
  name: string
  description?: string
  date: string
  place: string
  totalWorshipAttendanceCount: number
  totalGatheringAttendanceCount: number
  totalPrayerRequestCount: number
}

export interface CreateGatheringRequest {
  groupId: string
  name: string
  description: string
  date: string
  startedAt: string
  endedAt: string
  place: string
}

export interface GatheringResponse {
  id: string
  name: string
  description: string
  date: string
  startedAt: string
  endedAt: string
  place: string
}

export interface GatheringDetail {
  id: string
  name: string
  description: string
  date: string
  startedAt: string
  endedAt: string
  place: string
  gatheringMembers: GatheringMember[]
}

export interface GatheringMember {
  memberId: string
  groupMemberId: string
  name: string
  birthday?: string
  worshipAttendance: boolean
  gatheringAttendance: boolean
  story: string
  prayerTopics?: string
  prayers: Prayer[]
}

export interface Prayer {
  id: string
  prayerRequest: string
  description: string
  answered: boolean
}

// Signup types
export interface SignupRequest {
  password: string
  name: string
  email: string
  birthdate: string // YYYY-MM-DD
  sex: 'M' | 'F'
  phone: string
  address: string
}

export interface SignupResponse {
  memberId: string
  message: string
}
