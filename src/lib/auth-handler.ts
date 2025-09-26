import { authApi } from './api'

// 글로벌 토스트 함수 타입
type ShowToastFunction = (message: string, duration?: number) => void

// 글로벌 네비게이션 함수 타입
type NavigateFunction = (path: string, replace?: boolean) => void

// 글로벌 함수들을 저장할 객체
const globalHandlers: {
  showToast?: ShowToastFunction
  navigate?: NavigateFunction
} = {}

// 글로벌 토스트 함수 등록
export const setGlobalToast = (showToast: ShowToastFunction) => {
  globalHandlers.showToast = showToast
}

// 글로벌 네비게이션 함수 등록
export const setGlobalNavigate = (navigate: NavigateFunction) => {
  globalHandlers.navigate = navigate
}

// JWT 만료 응답인지 확인하는 함수
export const isJwtExpiredError = (error: any): boolean => {
  // ApiError 객체의 response에서 JWT_EXPIRED 에러 확인
  if (error?.response?.error === 'JWT_EXPIRED') {
    return true
  }

  // response 객체에서 직접 JWT_EXPIRED 확인
  if (
    typeof error?.response === 'object' &&
    error?.response?.error === 'JWT_EXPIRED'
  ) {
    return true
  }

  // 에러 메시지에서 JWT 만료 확인
  if (error?.message?.includes('JWT token has expired')) {
    return true
  }

  // 401 상태코드와 JWT 관련 메시지
  if (error?.status === 401 && error?.message?.toLowerCase().includes('jwt')) {
    return true
  }

  // JSON 응답에서 직접 JWT_EXPIRED 확인 (API 응답 구조에 따라)
  if (typeof error === 'object' && error?.error === 'JWT_EXPIRED') {
    return true
  }

  return false
}

// JWT 만료 처리 공통 함수
export const handleJwtExpired = () => {
  // 1. 로그아웃 처리 (토큰 제거)
  authApi.logout()

  // 2. 글로벌 토스트 메시지 표시
  if (globalHandlers.showToast) {
    globalHandlers.showToast(
      '로그인이 만료되었어요. 다시 로그인해주세요!',
      4000
    )
  }

  // 3. 로그인 페이지로 리다이렉트
  if (globalHandlers.navigate) {
    globalHandlers.navigate('/login', true)
  } else {
    // fallback: 글로벌 네비게이션 함수가 없으면 window.location 사용
    window.location.href = '/login'
  }
}

// API 에러를 검사하고 JWT 만료면 처리하는 공통 함수
export const checkAndHandleJwtExpired = (error: any): boolean => {
  if (isJwtExpiredError(error)) {
    handleJwtExpired()
    return true
  }
  return false
}
