import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  return phone
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Debounce function
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 한국 시간을 UTC로 변환
export function convertKSTtoUTC(dateStr: string, timeStr: string): string {
  // 한국 시간으로 명시적으로 생성 (KST = UTC+9)
  const kstDateTime = new Date(`${dateStr}T${timeStr}:00+09:00`)
  return kstDateTime.toISOString()
}

// 주차 계산: 특정 날짜의 월 내 몇 번째 주인지 계산
export function getWeekOfMonth(dateString: string): number {
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1)
    const dayOfMonth = date.getDate()
    const firstDayOfWeek = firstDay.getDay() // 0: 일요일

    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7)
  } catch {
    return 1
  }
}

// 년/월/주차 포맷 (예: "25년 2월 3주차")
export function formatWeekFormat(dateString: string): string {
  try {
    const date = new Date(dateString)
    const year = String(date.getFullYear()).slice(-2)
    const month = date.getMonth() + 1
    const week = getWeekOfMonth(dateString)
    return `${year}년 ${month}월 ${week}주차`
  } catch {
    return '25년 1월 1주차'
  }
}

// Local storage utility
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore save failure
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore removal failure
    }
  },
}

// 서브도메인 감지 함수
export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null

  const hostname = window.location.hostname
  const parts = hostname.split('.')

  // localhost나 IP 주소인 경우
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }

  // 서브도메인이 있는 경우 (예: admin.intotheheaven.app)
  if (parts.length > 2) {
    return parts[0]
  }

  return null
}

// 어드민 도메인인지 확인
export function isAdminDomain(): boolean {
  // 개발 환경에서 환경변수로 어드민 모드 확인
  if (import.meta.env.VITE_ADMIN_MODE === 'true') {
    return true
  }

  // 프로덕션에서는 서브도메인으로 확인
  const subdomain = getSubdomain()
  return subdomain === 'admin'
}
