import { authApi } from '@/lib/api'
import React from 'react'

const Home: React.FC = () => {
  const handleLogout = () => {
    authApi.logout()
    // 페이지 새로고침으로 Login 화면으로 돌아가기
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white h-11 flex items-center justify-between px-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 font-pretendard">
          홈
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-blue-600 font-pretendard hover:text-blue-800 transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-pretendard mb-4">
            🙏 IntoTheHeaven
          </h2>
          <p className="text-gray-600 font-pretendard mb-8">
            교회 소그룹을 위한 기도제목 관리 플랫폼
          </p>

          <div className="space-y-4 w-full max-w-sm">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium font-pretendard hover:bg-blue-700 transition-colors">
              모임 관리
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium font-pretendard hover:bg-green-700 transition-colors">
              기도제목
            </button>
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium font-pretendard hover:bg-purple-700 transition-colors">
              나눔 주제
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
