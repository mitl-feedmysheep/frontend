import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { ToastProvider } from '../common/ToastProvider'
import AdminSplashScreen from './AdminSplashScreen'
import AdminLogin from './Login'

// AdminLogin Wrapper 컴포넌트
const AdminLoginWrapper = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />
}

// 임시 어드민 대시보드 컴포넌트
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-red-600 font-pretendard">
              관리자 대시보드
            </h1>
            <button
              onClick={() => {
                // TODO: 로그아웃 로직 구현
                window.location.href = '/admin/login'
              }}
              className="text-gray-600 hover:text-gray-800 font-pretendard"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 font-pretendard mb-2">
                어드민 대시보드
              </h2>
              <p className="text-gray-600 font-pretendard">
                관리자 기능들이 여기에 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Protected Route for Admin
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: 어드민 인증 로직 구현
  const isAdminAuthenticated = false // 임시로 false

  return isAdminAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  )
}

function AdminApp() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showSplash, setShowSplash] = useState<boolean>(true)

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
          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
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
