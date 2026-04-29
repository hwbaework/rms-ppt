import { Link } from 'react-router-dom'
import { getGroupedDecks } from '../data/deckList'
import type { DeckMeta } from '../data/types'

function Home() {
  const grouped = getGroupedDecks()
  const totalCount = grouped.reduce(
    (sum, y) => sum + y.months.reduce((s, m) => s + m.decks.length, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased flex flex-col selection:bg-red-200 selection:text-red-900">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/30 transition-transform group-hover:rotate-6">
              <span className="text-white font-extrabold text-sm">R</span>
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">rms-ppt</p>
              <p className="text-xs text-gray-400 font-mono">talks · archive</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-red-300/20 blur-3xl" />
          <div className="absolute top-20 right-0 size-[300px] rounded-full bg-rose-300/15 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <p className="text-sm font-semibold text-brand mb-2 tracking-wide">
            TALKS · DECKS
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            발표 자료{' '}
            <span className="text-brand">아카이브</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            AI와 함께 준비한 발표 자료를 날짜별로 정리합니다.
            <br className="hidden md:block" />
            각 슬라이드는{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 font-mono">
              ←
            </kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 font-mono">
              →
            </kbd>{' '}
            또는{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-gray-100 border border-gray-200 font-mono">
              Space
            </kbd>{' '}
            로 넘길 수 있어요.
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-gray-400 mt-6 font-mono">
              총 {totalCount}개의 발표
            </p>
          )}
        </div>
      </section>

      {/* Grouped decks */}
      <section className="flex-1 max-w-5xl mx-auto px-6 pb-20 w-full">
        {grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-16">
            {grouped.map((yearGroup) => (
              <YearSection key={yearGroup.year} {...yearGroup} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-gray-500 flex justify-between">
          <p>© 2026 hwbae</p>
          <p className="font-mono text-xs">rms-ppt</p>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────── 년 섹션 ─────────────────── */

function YearSection({
  year,
  months,
}: {
  year: string
  months: { month: string; monthLabel: string; decks: DeckMeta[] }[]
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {year}
        </h2>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-sm text-gray-400 font-mono">
          {months.reduce((s, m) => s + m.decks.length, 0)} talks
        </span>
      </div>

      <div className="space-y-12">
        {months.map((monthGroup) => (
          <MonthSection key={monthGroup.month} {...monthGroup} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── 월 섹션 ─────────────────── */

function MonthSection({
  monthLabel,
  decks,
}: {
  month: string
  monthLabel: string
  decks: DeckMeta[]
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-brand mb-4 tracking-wide uppercase">
        {monthLabel}
      </h3>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((meta) => (
          <li key={meta.slug}>
            <DeckCard meta={meta} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────────── 발표 카드 ─────────────────── */

function DeckCard({ meta }: { meta: DeckMeta }) {
  const day = meta.date.split('-')[2]
  return (
    <Link
      to={`/decks/${meta.slug}`}
      className="group block aspect-[4/3] rounded-2xl bg-brand p-1 shadow-lg shadow-brand/15 hover:shadow-2xl hover:shadow-brand/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="size-full rounded-[14px] bg-white p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-extrabold tracking-tight text-brand">
              {day}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {meta.date}
            </span>
          </div>
          <h4 className="text-base font-bold tracking-tight group-hover:text-brand transition leading-tight mb-1.5 line-clamp-2">
            {meta.title}
          </h4>
          {meta.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-wrap gap-1">
            {meta.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-brand border border-red-100"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="material-symbols-outlined text-brand text-xl group-hover:translate-x-1 transition">
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────── 빈 상태 ─────────────────── */

function EmptyState() {
  return (
    <div className="text-center py-24 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
      <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
        slideshow
      </span>
      <p className="text-gray-500">아직 등록된 발표가 없습니다.</p>
    </div>
  )
}

export default Home
