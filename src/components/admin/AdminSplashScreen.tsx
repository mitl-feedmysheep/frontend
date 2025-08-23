import React, { useEffect, useState } from 'react'

interface AdminSplashScreenProps {
  onComplete: () => void
}

const AdminSplashScreen: React.FC<AdminSplashScreenProps> = ({
  onComplete,
}) => {
  const [showVerse, setShowVerse] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // 어드민용 성경 말씀들 (리더십과 관리 관련)
  const adminVerses = [
    {
      text: '너희 중에 누구든지 크고자 하는 자는 너희를 섬기는 자가 되고',
      reference: '마태복음 20:26',
    },
    {
      text: '각각 은사를 받은 대로 하나님의 여러 가지 은혜의 선한 청지기같이 서로 봉사하라',
      reference: '베드로전서 4:10',
    },
    {
      text: '사람이 감독의 직분을 얻으려 함은 선한 일을 사모하는 것이라',
      reference: '디모데전서 3:1',
    },
    {
      text: '너는 그리스도 예수의 좋은 병사로 나와 함께 고난을 받을지니',
      reference: '디모데후서 2:3',
    },
    {
      text: '내가 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니',
      reference: '디모데후서 4:7',
    },
  ]

  // 랜덤 말씀 선택
  const [selectedVerse] = useState(
    () => adminVerses[Math.floor(Math.random() * adminVerses.length)]
  )

  useEffect(() => {
    // 1초 후 말씀 fade in
    const verseTimer = setTimeout(() => {
      setShowVerse(true)
    }, 1000)

    // 4초 후 전체 fade out 시작
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 4000)

    // 5초 후 완전히 사라지고 어드민 앱으로 이동
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearTimeout(verseTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center px-4 pt-30 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 어드민 로고 */}
      <div className="flex flex-col items-center">
        <img
          src="/admin-splash.png"
          alt="IntoTheHeaven Admin Logo"
          className="w-80 h-80 mb-5"
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

export default AdminSplashScreen
