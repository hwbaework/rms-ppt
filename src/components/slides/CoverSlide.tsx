import Logo from '../Logo'

// 표지 슬라이드 — 표준 마스터 M1 (Cover)
// blue-950 다크 배경 + 흰 제목. 액센트 밑줄/컬러바 금지(§17).
// ※ 이미지 표지(Main.png)는 260715_carbon 덱에서 시범 적용 중 — 확정되면 여기로 이식.
//
// 사용 예시:
// <CoverSlide
//   title="프레젠테이션 제목"
//   subtitle="부제목 또는 핵심 태그라인"
//   author="배효원"
//   date="2026.04.29"
// />

function CoverSlide({
  title,
  subtitle,
  author = '배효원',
  team,
  date,
}: {
  title: string
  subtitle?: string
  author?: string
  team?: string
  date: string // 'YYYY.MM.DD' 형식
}) {
  return (
    <div className="relative w-full min-h-full flex flex-col bg-gradient-to-b from-blue-950 to-blue-900 text-white overflow-hidden">
      {/* 우하단 저채도 심볼 (장식 한 점, 과하지 않게) */}
      <span
        className="material-symbols-outlined absolute -bottom-10 -right-6 text-blue-800/40 select-none pointer-events-none"
        style={{ fontSize: '22rem' }}
      >
        bolt
      </span>

      {/* 가운데 콘텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg md:text-2xl text-blue-200 mb-12">{subtitle}</p>
        )}

        <p className="text-sm md:text-base text-blue-200/90 mt-2">
          {author && (
            <>
              {author}
              <span className="text-blue-300/40 mx-2">|</span>
            </>
          )}
          {team && (
            <>
              {team}
              <span className="text-blue-300/40 mx-2">|</span>
            </>
          )}
          {date}
        </p>
      </div>

      {/* 하단 중앙 로고 (다크 배경 → 흰 로고) */}
      <div className="relative z-10 flex justify-center pb-10">
        <Logo size="md" variant="white" />
      </div>
    </div>
  )
}

export default CoverSlide
