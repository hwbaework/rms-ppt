// 섹션 구분 슬라이드 (3번 형식)
// 전체 빨강 배경 + 거대한 번호 + 흰 글씨
//
// 사용 예시:
// <SectionSlide
//   number="01"
//   title="여기에 섹션 제목을 입력하세요"
//   description="해당 섹션에 다룰 핵심 메시지를 한 줄로"
// />

function SectionSlide({
  number,
  title,
  description,
  pageNumber,
}: {
  number: string // '01', '02', ... 형식 권장
  title: string
  description?: string
  pageNumber?: number
}) {
  return (
    <div className="relative w-full min-h-full bg-brand text-white flex flex-col justify-center px-12 md:px-20 py-20 overflow-hidden">
      {/* 좌상단 거대한 반투명 번호 */}
      <p
        className="absolute top-8 md:top-12 left-8 md:left-16 font-black leading-none text-white/20 select-none"
        style={{ fontSize: 'clamp(8rem, 18vw, 16rem)' }}
      >
        {number}
      </p>

      {/* 가운데 콘텐츠 */}
      <div className="relative z-10 mt-32 md:mt-48">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          {title}
        </h2>
        <div className="w-16 h-1 bg-white mb-6" />
        {description && (
          <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* 우하단 페이지 번호 (흰색) */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-xs text-white/70 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default SectionSlide
