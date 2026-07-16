'use client'

// 새 발표 만들기 모달. 제출 = lib/api.ts 의 createDeck() 호출.
// 지금은 그 함수가 가짜라 메모리에만 추가됨(부모가 화면에 카드로 표시). 서버 붙으면 그 한 함수만 바뀐다.

import { useEffect, useState } from 'react'
import { createDeck, type NewDeckInput } from '@/lib/api'
import type { DeckMeta } from '@/lib/decks'

// 이미 있는 지역 옵션 (드롭다운). "새 지역…" 선택 시 직접 입력 폼이 뜬다.
const REGION_OPTIONS = [
  { label: '울산 에너지자급자족', slug: 'ulsan-energy' },
  { label: '공통', slug: 'common' },
] as const

function todayISO() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function NewDeckModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (deck: DeckMeta) => void
}) {
  const [regionChoice, setRegionChoice] = useState<string>(REGION_OPTIONS[0].slug)
  const [newRegionLabel, setNewRegionLabel] = useState('')
  const [newRegionSlug, setNewRegionSlug] = useState('')
  const [topicSlug, setTopicSlug] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayISO)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (!open) return
    setRegionChoice(REGION_OPTIONS[0].slug)
    setNewRegionLabel('')
    setNewRegionSlug('')
    setTopicSlug('')
    setTitle('')
    setDate(todayISO())
    setDescription('')
    setError(null)
    setSubmitting(false)
  }, [open])

  // ESC 로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const isNewRegion = regionChoice === '__new__'
  const region = isNewRegion ? newRegionLabel.trim() : REGION_OPTIONS.find((r) => r.slug === regionChoice)!.label
  const regionSlug = isNewRegion ? newRegionSlug.trim() : regionChoice

  const slugRe = /^[a-z0-9][a-z0-9-]*$/
  const canSubmit =
    !submitting &&
    title.trim() &&
    date &&
    slugRe.test(topicSlug) &&
    (!isNewRegion || (newRegionLabel.trim() && slugRe.test(newRegionSlug)))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const input: NewDeckInput = {
        region,
        regionSlug,
        topicSlug: topicSlug.trim(),
        title: title.trim(),
        date,
        description: description.trim() || undefined,
      }
      const deck = await createDeck(input)
      onCreated(deck)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했어요.')
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-deck-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-7 border border-slate-200"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="new-deck-title" className="text-xl font-bold tracking-tight">
            새 발표 만들기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="size-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* 지역 */}
          <Field label="지역" hint="발표가 속한 사업·지역">
            <select
              value={regionChoice}
              onChange={(e) => setRegionChoice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.label} ({r.slug})
                </option>
              ))}
              <option value="__new__">+ 새 지역 추가…</option>
            </select>
            {isNewRegion && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  value={newRegionLabel}
                  onChange={(e) => setNewRegionLabel(e.target.value)}
                  placeholder="표시 이름 (예: 인천 에너지자급자족)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <input
                  value={newRegionSlug}
                  onChange={(e) => setNewRegionSlug(e.target.value.toLowerCase())}
                  placeholder="폴더명 (영문, 예: incheon-energy)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            )}
          </Field>

          {/* 제목 */}
          <Field label="제목" hint="화면에 보일 한글 자유">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 탄소거래 개념 정리 (지역명은 붙이지 않기)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>

          {/* 날짜 · 주제 슬러그 */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="날짜">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
            <Field label="주제 슬러그" hint="영문, URL 끝">
              <input
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value.toLowerCase())}
                placeholder="예: planning"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </Field>
          </div>

          {/* 설명 (선택) */}
          <Field label="설명 (선택)">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="한 줄 요약"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </Field>

          {/* URL 미리보기 */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono text-slate-500">
            URL 미리보기:{' '}
            <span className="text-slate-900">
              /{regionSlug || '지역'}/{date.slice(2).replace(/-/g, '') || 'YYMMDD'}_{topicSlug || '주제'}
            </span>
          </div>
        </div>

        {/* 안내 */}
        <p className="mt-5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          ⚠ 서버 연결 전이라 지금은 <strong>임시 저장</strong>(새로고침 시 사라짐).
          서버가 붙으면 같은 폼이 그대로 영구 저장됩니다.
        </p>

        {error && (
          <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-brand text-white hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            {submitting ? '저장 중…' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2 mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
