// 섹션 구분 슬라이드 — 표준 마스터 M2 (Section Divider)
// blue-950 다크 배경 + 거대한 blue-700 틴트 번호(워터마크) + 흰 제목. 액센트 바 금지(§17).
//
// 사용 예시:
// <SectionSlide
//   number="01"
//   title="여기에 섹션 제목을 입력하세요"
//   description="해당 섹션에 다룰 핵심 메시지를 한 줄로"
//   progress="01 / 03"
// />

function SectionSlide({
  number,
  title,
  description,
  progress,
  pageNumber,
}: {
  number: string // '01', '02', ... 형식 권장
  title: string
  description?: string
  progress?: string // 예: '01 / 03'
  pageNumber?: number
}) {
  return (
    <div className="relative w-full min-h-full bg-blue-950 text-white flex flex-col justify-center px-12 md:px-20 py-20 overflow-hidden">
      {/* 좌상단 거대한 번호 (blue-700 틴트, 워터마크) */}
      <p
        className="absolute top-8 md:top-12 left-8 md:left-16 font-black leading-none text-blue-700/30 select-none"
        style={{ fontSize: 'clamp(8rem, 18vw, 16rem)' }}
      >
        {number}
      </p>

      {/* 가운데 콘텐츠 */}
      <div className="relative z-10 mt-32 md:mt-48">
        {progress && (
          <p className="text-base md:text-lg text-blue-300 font-semibold mb-4">
            {progress}
          </p>
        )}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-base md:text-xl lg:text-2xl text-blue-200 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* 우하단 페이지 번호 (간지는 보통 생략하나, 전달 시 표기) */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-xs text-blue-300/70 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default SectionSlide
