'use client'

// 아카이브 홈 — 지역(사업)별로 묶고, 칩으로 필터. 프로젝트가 늘어도 칩+섹션으로 정리됨.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { decks, getDecksByRegion, type DeckMeta } from '@/lib/decks'
import NewDeckModal from '@/components/NewDeckModal'

// 지역별 액센트 색 (새 지역은 여기 추가, 없으면 violet 기본)
const REGION_ACCENT: Record<string, string> = {
  '울산 에너지자급자족': 'bg-blue-500',
  '인천 에너지자급자족': 'bg-teal-500',
  '강원 후평 에너지자급자족': 'bg-amber-500',
  공통: 'bg-slate-400',
}
const accent = (region: string) => REGION_ACCENT[region] ?? 'bg-violet-500'

export default function Home() {
  const [active, setActive] = useState<string>('전체')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [extra, setExtra] = useState<DeckMeta[]>([]) // 서버 붙기 전 임시(메모리)
  const [modalOpen, setModalOpen] = useState(false)

  // 정적 등록부 + 방금 만든 임시 덱을 합쳐 지역별로 묶는다
  const groups = useMemo(() => {
    const merged = [...extra, ...decks]
    const base = getDecksByRegion()
    if (extra.length === 0) return base
    const map = new Map<string, DeckMeta[]>()
    for (const d of merged) {
      if (!map.has(d.region)) map.set(d.region, [])
      map.get(d.region)!.push(d)
    }
    return Array.from(map.entries()).map(([region, list]) => ({
      region,
      decks: [...list].sort((a, b) => b.date.localeCompare(a.date)),
    }))
  }, [extra])

  const total = decks.length + extra.length

  const toggle = (r: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      return next
    })

  const visible = active === '전체' ? groups : groups.filter((g) => g.region === active)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col selection:bg-blue-200 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-slate-200/70 sticky top-0 bg-slate-50/80 backdrop-blur-xl z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-brand flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-sm">R</span>
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">ppt</p>
              <p className="text-xs text-slate-400 font-mono">talks · archive</p>
            </div>
          </Link>
          <span className="text-sm text-slate-400 font-mono">{total} decks</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 md:pt-20 pb-8 w-full">
        <p className="text-sm font-semibold text-brand mb-3 tracking-widest">
          발표 아카이브
        </p>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            지역·사업별로 모은 <span className="text-brand">발표 자료</span>
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-brand text-white font-semibold px-5 py-2.5 text-sm shadow-sm hover:bg-primary-hover hover:shadow-md active:scale-[0.98] transition"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            새 발표 만들기
          </button>
        </div>

        {/* 필터 칩 */}
        <div className="mt-9 flex flex-wrap gap-2">
          {['전체', ...groups.map((g) => g.region)].map((r) => {
            const count = r === '전체' ? total : groups.find((g) => g.region === r)!.decks.length
            const on = active === r
            return (
              <button
                key={r}
                onClick={() => setActive(r)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition border ${
                  on
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {r !== '전체' && (
                  <span className={`size-2 rounded-full ${on ? 'bg-white/80' : accent(r)}`} />
                )}
                {r}
                <span className={`text-xs font-mono ${on ? 'text-white/70' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 목록 */}
      <section className="flex-1 max-w-6xl mx-auto px-6 pb-24 w-full">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-14">
            {visible.map((group) => {
              const isCollapsed = collapsed.has(group.region)
              return (
                <div key={group.region}>
                  <button
                    onClick={() => toggle(group.region)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center gap-3 mb-5 text-left hover:opacity-80 transition"
                  >
                    <span className={`size-2.5 rounded-full ${accent(group.region)}`} />
                    <h2 className="text-lg font-bold tracking-tight">{group.region}</h2>
                    <span className="text-sm text-slate-400 font-mono">
                      {group.decks.length}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform ${
                        isCollapsed ? '' : 'rotate-180'
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {!isCollapsed && (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.decks.map((meta) => (
                        <li key={meta.href}>
                          <DeckCard meta={meta} accentClass={accent(group.region)} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-500 flex justify-between">
          <p>© 2026 배효원</p>
          <p className="font-mono text-xs">ppt</p>
        </div>
      </footer>

      {/* 새 발표 만들기 모달 */}
      <NewDeckModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(deck) => setExtra((prev) => [deck, ...prev])}
      />
    </div>
  )
}

/* ─────────────────── 발표 카드 ─────────────────── */

function DeckCard({ meta, accentClass }: { meta: DeckMeta; accentClass: string }) {
  const [, m, d] = meta.date.split('-')
  return (
    <Link
      href={meta.href}
      className="group relative block h-full rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
    >
      {/* 상단 액센트 바 */}
      <div className={`h-1 w-full ${accentClass}`} />
      <div className="p-5 flex flex-col h-[calc(100%-0.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400">{meta.date}</span>
          <span className="text-sm font-extrabold tracking-tight text-slate-300 font-mono">
            {m}/{d}
          </span>
        </div>
        <h3 className="text-base font-bold tracking-tight leading-snug mb-1.5 line-clamp-2 group-hover:text-brand transition">
          {meta.title}
        </h3>
        {meta.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {meta.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-wrap gap-1">
            {meta.tags?.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="material-symbols-outlined text-slate-300 text-xl group-hover:text-brand group-hover:translate-x-0.5 transition">
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
    <div className="text-center py-24 rounded-2xl border border-dashed border-slate-200 bg-white">
      <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">
        slideshow
      </span>
      <p className="text-slate-500">아직 등록된 발표가 없습니다.</p>
    </div>
  )
}
