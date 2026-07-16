'use client'

// CLI 스모크 테스트
// 생성: 2026-06-26 · CLI(npm run new)

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import SectionSlide from '@/components/slides/SectionSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

const TOC = ['항목 1', '항목 2', '항목 3', '마무리']

const slides = [
  /* 1. 표지 */
  <CoverSlide
    title="CLI 스모크 테스트"
    subtitle="CLI 자동생성 검증용"
    author="배효원"
    date="2026.06.26"
  />,

  /* 2. 목차 */
  <TocSlide items={TOC} pageNumber={2} />,

  /* 3. 섹션 구분 */
  <SectionSlide
    number="01"
    title="섹션 제목"
    description="이 섹션의 핵심 메시지를 한 줄로"
    progress="01 / 03"
    pageNumber={3}
  />,

  /* 4. 본문 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-16">
    <p className="text-base text-slate-500 mb-2">I. 섹션</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">본문 슬라이드</h2>
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5 text-lg text-slate-700 max-w-3xl">
      <strong className="text-brand">강조 박스</strong> — 핵심 메시지를 강조할 때 사용하세요.
    </div>
    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">4</p>
  </div>,

  /* 5. 마무리 */
  <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={5} />,
]

export default function Page() {
  return <DeckPlayer slides={slides} />
}
