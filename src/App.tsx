import { authApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import Home from './components/Home'
import Login from './components/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = authApi.isAuthenticated()
      setIsAuthenticated(isAuth)
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // 로그인 성공 콜백
  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-pretendard">로딩 중...</div>
      </div>
    )
  }

  // 로그인 상태에 따라 화면 전환
  return isAuthenticated ? (
    <Home />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

export default App
