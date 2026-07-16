'use client'

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

// === 새 발표 시작용 빈 템플릿 — 복사해서 내용만 채우면 됨 ===
// 골격: 표지 → 목차 → 본문… → 마무리  (간지 슬라이드 금지 — CLAUDE.md §3.4)
// 섹션 구분은 본문 좌상단 라벨(I. 배경 …)로만.
// 사진·캡처가 어울리는 자리는 ImgSlot으로 "어떤 이미지가 좋을지" 제안만 남긴다.

// 이미지 플레이스홀더 — 실제 사진·캡처를 넣을 자리
function ImgSlot({ suggestion, className = '' }: { suggestion: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center px-6 py-8 ${className}`}
    >
      <span
        className="material-symbols-outlined text-slate-400 mb-2"
        style={{ fontSize: '3rem' }}
      >
        add_photo_alternate
      </span>
      <p className="text-sm font-semibold text-slate-500 mb-1">이미지 넣을 자리</p>
      <p className="text-sm text-slate-500 leading-relaxed">제안: {suggestion}</p>
    </div>
  )
}

const slides = [
  /* 1. 표지 — Main.png 이미지 표지(기본값) */
  <CoverSlide
    title="[프레젠테이션 제목 입력]"
    subtitle="[부제목 또는 핵심 태그라인]"
    author="배효원"
    team="RMS팀"
    date="[YYYY.MM.DD]"
  />,

  /* 2. 목차 */
  <TocSlide items={['항목 1', '항목 2', '항목 3', '항목 4']} pageNumber={2} />,

  /* 3. 본문 — 기본 패턴: 섹션 라벨 + 제목 + 콜아웃 + 시각 요소 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">I. 섹션 이름</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">본문 슬라이드 제목</h2>

    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
      <div>
        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-6 py-5 mb-4 flex items-start gap-4">
          <span className="size-11 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined">lightbulb</span>
          </span>
          <p className="text-lg text-slate-700 leading-relaxed">
            <strong className="text-brand">핵심 메시지</strong> — 한 슬라이드에 하나만. 나머지는 불릿으로.
          </p>
        </div>
        <ul className="space-y-2 text-base text-slate-700">
          <li className="flex gap-2">
            <span className="size-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
            <span>내용 1</span>
          </li>
          <li className="flex gap-2">
            <span className="size-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
            <span>내용 2</span>
          </li>
        </ul>
      </div>

      <ImgSlot suggestion="[여기에 들어가면 좋을 사진·캡처를 구체적으로]" />
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">3</p>
  </div>,

  /* 4. 마무리 */
  <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={4} />,
]

export default function Page() {
  return <DeckPlayer slides={slides} />
}
