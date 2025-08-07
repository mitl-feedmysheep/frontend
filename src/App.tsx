import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import AttendanceCheck from './components/AttendanceCheck'
import CreateMeeting from './components/CreateMeeting'
import GroupDetail from './components/GroupDetail'
import Home from './components/Home'
import Login from './components/Login'

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
        // 모임 생성 후 해당 모임의 AttendanceCheck 화면으로 이동
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        navigate(`/group/${groupId}/gathering/${gatheringId}`)
      }}
    />
  )
}

// AttendanceCheck Wrapper 컴포넌트
const AttendanceCheckWrapper = () => {
  const { groupId, gatheringId } = useParams<{
    groupId: string
    gatheringId: string
  }>()
  const navigate = useNavigate()

  if (!groupId || !gatheringId) {
    return <Navigate to="/" replace />
  }

  return (
    <AttendanceCheck
      gatheringId={gatheringId}
      groupId={groupId}
      onBack={() => {
        // AttendanceCheck에서 나갈 때 스크롤을 최상위로
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

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-pretendard">로딩 중...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
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
              <AttendanceCheckWrapper />
            </ProtectedRoute>
          }
        />
        {/* 기본값: 루트로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
