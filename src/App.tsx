function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 font-pretendard">
            🙏 IntoTheHeaven
          </h1>
          <p className="text-sm text-gray-600 font-pretendard">
            기도와 나눔의 공간
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="space-y-4">
          {/* 메뉴 카드들 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl mb-2">📿</div>
              <h3 className="font-semibold text-gray-900 font-pretendard">
                기도 주제
              </h3>
              <p className="text-sm text-gray-600 font-pretendard">
                기도 요청 관리
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900 font-pretendard">
                모임
              </h3>
              <p className="text-sm text-gray-600 font-pretendard">모임 기록</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900 font-pretendard">
                나눔
              </h3>
              <p className="text-sm text-gray-600 font-pretendard">삶의 나눔</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-900 font-pretendard">
                설정
              </h3>
              <p className="text-sm text-gray-600 font-pretendard">앱 설정</p>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 font-pretendard">
              최근 활동
            </h3>
            <div className="text-center py-8 text-gray-500 font-pretendard">
              아직 활동이 없습니다
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-blue-600">
            <div className="text-xl">🏠</div>
            <span className="text-xs font-pretendard">홈</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="text-xl">📿</div>
            <span className="text-xs font-pretendard">기도</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="text-xl">👥</div>
            <span className="text-xs font-pretendard">모임</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="text-xl">⚙️</div>
            <span className="text-xs font-pretendard">설정</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for fixed nav */}
      <div className="h-16"></div>
    </div>
  )
}

export default App
