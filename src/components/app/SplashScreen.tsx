import { churchesApi, membersApi } from '@/lib/api'
import React, { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  onAuthInvalid?: () => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onAuthInvalid,
}) => {
  const [showVerse, setShowVerse] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // 성경 말씀들 (랜덤으로 선택)
  const verses = [
    {
      text: '그의 안에서 건물마다 서로 연결하여 주 안에서 성전이 되어 가고 너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라',
      reference: '에베소서 2:21-22',
    },
    {
      text: '주는 나의 목자시니 내게 부족함이 없으리로다',
      reference: '시편 23:1',
    },
    {
      text: '내 양은 내 음성을 들으며 나는 그들을 알며 그들은 나를 따르느니라',
      reference: '요한복음 10:27',
    },
    {
      text: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
      reference: '시편 23:1',
    },
    {
      text: '우리는 그가 지으신 바라 그리스도 예수 안에서 선한 일을 위하여 지으심을 받은 자니',
      reference: '에베소서 2:10',
    },
  ]

  // 랜덤 말씀 선택
  const [selectedVerse] = useState(
    () => verses[Math.floor(Math.random() * verses.length)]
  )

  useEffect(() => {
    // 토큰 유효성 확인 및 홈 데이터 사전 로드
    const precheck = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          // 비인증 상태 → 로그인 경로로만 전환하고, 스플래시는 예정된 타이밍에 종료
          onAuthInvalid?.()
          return
        }

        // 토큰 검증 겸 사용자 정보 로드
        const user = await membersApi.getMyInfo()
        sessionStorage.setItem('prefetch.user', JSON.stringify(user))

        // 홈에서 사용할 수 있는 교회 목록 선 로드
        const churches = await churchesApi.getMyChurches()
        sessionStorage.setItem('prefetch.churches', JSON.stringify(churches))
      } catch (_err) {
        // 인증 실패 등 → 로그인 경로로 전환, 스플래시는 예정된 타이밍에 종료
        onAuthInvalid?.()
      }
    }

    precheck()

    // 1초 후 말씀 fade in
    const verseTimer = setTimeout(() => {
      setShowVerse(true)
    }, 1000)

    // 4초 후 전체 fade out 시작
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 4000)

    // 5초 후 완전히 사라지고 메인 앱으로 이동
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(verseTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, onAuthInvalid])

  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center px-4 pt-30 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 앱 로고 */}
      <div className="flex flex-col items-center">
        <img
          src="/splash.png"
          alt="IntoTheHeaven Logo"
          className="w-80 h-80 mb-2"
        />

        {/* 성경 말씀 */}
        <div
          className={`max-w-md text-center transition-opacity duration-1000 ${
            showVerse ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-base text-gray-700 font-sans leading-relaxed mb-3 tracking-wide">
            "{selectedVerse.text}"
          </p>
          <p className="text-xs text-gray-500 font-sans font-medium tracking-wide">
            - {selectedVerse.reference} -
          </p>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
