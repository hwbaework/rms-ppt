// 목차 슬라이드 — 표준 마스터 M3 (Agenda)
// 라이트 배경 + 둥근 번호 칩(blue-50 원 + blue-700 숫자). 사이드 스트라이프/밑줄 금지(§17).
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
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-slate-500 mb-2">Contents</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-12">
        목차
      </h1>

      <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-5xl">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-4">
            <span className="size-10 shrink-0 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-xl md:text-2xl font-bold text-slate-700">
              {item}
            </span>
          </li>
        ))}
      </ol>

      {/* 우하단 페이지 번호 */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default TocSlide
