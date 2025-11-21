import DevelopingPlaceholder from './DevelopingPlaceholder'

function AdminGroups() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header without Profile Icon */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4 flex items-center justify-start h-[60px]">
          <h1 className="text-xl font-bold text-gray-900 font-pretendard">
            소모임
          </h1>
        </div>
      </div>

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <DevelopingPlaceholder title="소모임 관리 준비 중" />
      </main>
    </div>
  )
}

export default AdminGroups
