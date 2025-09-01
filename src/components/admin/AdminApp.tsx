import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import ProvisionEmail from '../app/ProvisionEmail'
import { ToastProvider } from '../common/ToastProvider'
import AdminHome from './AdminHome'
import AdminLogin from './AdminLogin'
import AdminSplashScreen from './AdminSplashScreen'

// AdminLogin Wrapper 컴포넌트
const AdminLoginWrapper = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />
}

// 관리자 홈 화면은 별도 컴포넌트(AdminHome)로 분리

// Protected Route for Admin
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdminAuthenticated = authApi.isAuthenticated()
  return isAdminAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  )
}

function AdminApp() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const env = import.meta.env as Record<string, string | boolean | undefined>
    const raw = env.VITE_IS_SPLASH_ON
    const normalized = String(raw ?? 'true').toLowerCase()
    return (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes' ||
      normalized === 'on'
    )
  })

  // 앱 시작 시 어드민 로그인 상태 확인
  useEffect(() => {
    const checkAdminAuthStatus = () => {
      // TODO: 어드민 인증 상태 확인 로직
      setIsLoading(false)
    }

    checkAdminAuthStatus()
  }, [])

  // 어드민 스플래시 스크린 완료 핸들러
  const handleAdminSplashComplete = () => {
    setShowSplash(false)
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-pretendard">
          관리자 페이지 로딩 중...
        </div>
      </div>
    )
  }

  // 어드민 스플래시 스크린 표시
  if (showSplash) {
    return <AdminSplashScreen onComplete={handleAdminSplashComplete} />
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginWrapper />} />
          <Route path="/provision/email" element={<ProvisionEmail />} />
          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <AdminHome />
              </AdminProtectedRoute>
            }
          />
          {/* 기본값: 어드민 로그인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default AdminApp
