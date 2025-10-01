import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import ProvisionEmail from '../app/ProvisionEmail'
import AdminBottomNav from './AdminBottomNav'
import AdminChangePassword from './AdminChangePassword'
import AdminGroups from './AdminGroups'
import AdminHome from './AdminHome'
import AdminLogin from './AdminLogin'
import AdminMembers from './AdminMembers'
import AdminSettings from './AdminSettings'
import AdminSplashScreen from './AdminSplashScreen'
import AdminVisit from './AdminVisit'

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
  // 브라우저 스크롤 복원 비활성화
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const env = import.meta.env as Record<string, string | boolean | undefined>
    const raw = env.VITE_IS_SPLASH_ON
    const normalized = String(raw ?? 'true').toLowerCase()
    const splashEnabled =
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes' ||
      normalized === 'on'
    const seen = localStorage.getItem('splash.seen.admin') === 'true'
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'
    const isProvisionRoute = path === '/provision/email'
    return splashEnabled && !seen && !isProvisionRoute
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
    try {
      localStorage.setItem('splash.seen.admin', 'true')
    } catch (_e) {
      // ignore
    }
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

  return <RoutesWithScrollReset />
}

// Routes를 별도 컴포넌트로 분리하여 location을 사용
function RoutesWithScrollReset() {
  const location = useLocation()

  useEffect(() => {
    // 페이지 전환 시 스크롤 최상단으로
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/login" element={<AdminLoginWrapper />} />
        <Route
          path="/provision/email"
          element={<ProvisionEmail variant="admin" />}
        />
        <Route
          path="/"
          element={
            <AdminProtectedRoute>
              <AdminHome />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <AdminProtectedRoute>
              <AdminMembers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/visit"
          element={
            <AdminProtectedRoute>
              <AdminVisit />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <AdminProtectedRoute>
              <AdminGroups />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/settings/password"
          element={
            <AdminProtectedRoute>
              <AdminChangePassword />
            </AdminProtectedRoute>
          }
        />
        {/* 기본값: 어드민 로그인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <AdminProtectedRoute>
        <AdminBottomNav />
      </AdminProtectedRoute>
    </>
  )
}

export default AdminApp
