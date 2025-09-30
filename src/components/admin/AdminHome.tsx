function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 font-pretendard mb-2">
              관리자 대시보드
            </h2>
            <p className="text-gray-600 font-pretendard text-sm">
              교회 관리 시스템에 오신 것을 환영합니다.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-gray-500 text-xs font-pretendard mb-1">
              전체 교인
            </div>
            <div className="text-2xl font-bold text-gray-900 font-pretendard">
              -
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-gray-500 text-xs font-pretendard mb-1">
              소모임 수
            </div>
            <div className="text-2xl font-bold text-gray-900 font-pretendard">
              -
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminHome
