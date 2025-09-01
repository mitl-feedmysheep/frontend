import { authApi } from '@/lib/api'
import { isAdminDomain } from '@/lib/utils'
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import AdminApp from './components/admin/AdminApp'
import Account from './components/app/Account'
import ChangePassword from './components/app/ChangePassword'
import CreateMeeting from './components/app/CreateMeeting'
import GroupDetail from './components/app/GroupDetail'
import Home from './components/app/Home'
import Login from './components/app/Login'
import Settings from './components/app/Settings'
import Signup from './components/app/Signup'
import SmallGathering from './components/app/SmallGathering'
import SplashScreen from './components/app/SplashScreen'
import { ToastProvider } from './components/common/ToastProvider'

// Login Wrapper 컴포넌트
const LoginWrapper = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return <Login onLoginSuccess={handleLoginSuccess} />
}

// GroupDetail Wrapper 컴포넌트
const GroupDetailWrapper = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  if (!groupId) {
    return <Navigate to="/" replace />
  }

  return <GroupDetail groupId={groupId} onBack={() => navigate('/')} />
}

// CreateMeeting Wrapper 컴포넌트
const CreateMeetingWrapper = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  if (!groupId) {
    return <Navigate to="/" replace />
  }

  return (
    <CreateMeeting
      groupId={groupId}
      onBack={() => navigate(`/group/${groupId}`)}
      onNext={gatheringId => {
        // 모임 생성 후 해당 모임의 SmallGathering 화면으로 이동
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        navigate(`/group/${groupId}/gathering/${gatheringId}`)
      }}
    />
  )
}

// SmallGathering Wrapper 컴포넌트
const SmallGatheringWrapper = () => {
  const { groupId, gatheringId } = useParams<{
    groupId: string
    gatheringId: string
  }>()
  const navigate = useNavigate()

  if (!groupId || !gatheringId) {
    return <Navigate to="/" replace />
  }

  return (
    <SmallGathering
      gatheringId={gatheringId}
      groupId={groupId}
      onBack={() => {
        // SmallGathering에서 나갈 때 스크롤을 최상위로
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        navigate(`/group/${groupId}`)
      }}
    />
  )
}

// Protected Route 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authApi.isAuthenticated()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // 환경변수 VITE_IS_SPLASH_ON 값으로 스플래시 표시 여부 제어
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

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // 스플래시 스크린 완료 핸들러
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleAuthInvalid = () => {
    // 인증 만료/실패 시 SPA 내에서만 경로 변경 (전체 리로드 방지)
    try {
      window.history.replaceState(null, '', '/login')
    } catch {}
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-pretendard">로딩 중...</div>
      </div>
    )
  }

  // 어드민 도메인인 경우 어드민 앱 렌더링 (스플래시 없음)
  if (isAdminDomain()) {
    return <AdminApp />
  }

  // 일반 사용자 앱에서 스플래시 스크린 표시
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        onAuthInvalid={handleAuthInvalid}
      />
    )
  }

  // 일반 사용자 앱 렌더링
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetailWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId/create"
            element={
              <ProtectedRoute>
                <CreateMeetingWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId/gathering/:gatheringId"
            element={
              <ProtectedRoute>
                <SmallGatheringWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          {/* 기본값: 루트로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
