import { useLocation, useNavigate } from 'react-router-dom'

const AdminBottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      id: 'home',
      label: '홈',
      path: '/',
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? '#3B82F6' : 'none'}
            fillOpacity={isActive ? 0.1 : 0}
          />
          <path
            d="M9 22V12H15V22"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'members',
      label: '교적부',
      path: '/members',
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? '#3B82F6' : 'none'}
            fillOpacity={isActive ? 0.1 : 0}
          />
          <path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'visit',
      label: '심방',
      path: '/visit',
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? '#3B82F6' : 'none'}
            fillOpacity={isActive ? 0.1 : 0}
          />
          <path
            d="M12 14V11"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8V5"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'groups',
      label: '소모임',
      path: '/groups',
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? '#3B82F6' : 'none'}
            fillOpacity={isActive ? 0.1 : 0}
          />
          <path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke={isActive ? '#3B82F6' : '#9CA3AF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path)
    } else {
      // 같은 페이지 클릭 시 강제 스크롤
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-screen-sm bg-white border-t border-gray-200"
      style={{
        zIndex: 9999,
        isolation: 'isolate',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <button
              type="button"
              key={item.id}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigate(item.path)
              }}
              onTouchEnd={e => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigate(item.path)
              }}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              {item.icon(isActive)}
              <span
                className={`text-xs font-pretendard transition-colors ${
                  isActive
                    ? 'text-blue-500 font-medium'
                    : 'text-gray-400 font-normal'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default AdminBottomNav
