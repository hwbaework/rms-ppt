// 목차 슬라이드 (2번 형식)
//
// 사용 예시:
// <TocSlide items={['항목1', '항목2', '항목3', '항목4']} />

function TocSlide({
  items,
  pageNumber,
}: {
  items: string[]
  pageNumber?: number
}) {
  return (
    <div className="relative w-full min-h-full flex">
      {/* 좌측 콘텐츠 */}
      <div className="flex-1 px-12 md:px-20 py-20">
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-3">
            목차
          </h1>
          <div className="w-16 h-1 bg-brand" />
        </div>

        <ol className="space-y-4 md:space-y-5 text-2xl md:text-3xl font-bold">
          {items.map((item, i) => (
            <li key={i} className="flex gap-5 md:gap-6">
              <span className="text-brand w-10 shrink-0">{i + 1}.</span>
              <span className="text-gray-900">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 우측 회색 사이드바 */}
      <div className="hidden md:block w-32 lg:w-40 bg-gray-100" />

      {/* 우하단 페이지 번호 */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-xs text-gray-500 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default TocSlide
