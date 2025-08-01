import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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
              <Home />
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
