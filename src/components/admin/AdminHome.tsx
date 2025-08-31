import { authApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

function AdminHome() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // 토큰 및 churchId, groupId 제거 후 로그인으로 이동
    authApi.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-900 font-pretendard">
              관리자 홈
            </h1>
            <button
              onClick={handleLogout}
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
                어드민 홈
              </h2>
              <p className="text-gray-600 font-pretendard">
                로그인 성공 시 이 화면으로 이동합니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminHome
