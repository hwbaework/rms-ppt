import Logo from '../Logo'

// 표지 슬라이드 (1번 형식)
//
// 사용 예시:
// <CoverSlide
//   title="프레젠테이션 제목"
//   subtitle="부제목 또는 핵심 태그라인"
//   author="배효원"
//   team="RMS팀"
//   date="2026.04.29"
// />

function CoverSlide({
  title,
  subtitle,
  author = '배효원',
  team = 'RMS팀',
  date,
}: {
  title: string
  subtitle?: string
  author?: string
  team?: string
  date: string // 'YYYY.MM.DD' 형식
}) {
  return (
    <div className="relative w-full min-h-full flex flex-col">
      {/* 가운데 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <Logo size="xl" className="mb-12" />

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg md:text-2xl text-gray-700 mb-12">
            {subtitle}
          </p>
        )}

        <div className="w-12 h-1 bg-brand mb-6" />

        <p className="text-sm md:text-base text-gray-600">
          {author}
          <span className="text-gray-300 mx-2">|</span>
          {team}
          <span className="text-gray-300 mx-2">|</span>
          {date}
        </p>
      </div>

    </div>
  )
}

export default CoverSlide
