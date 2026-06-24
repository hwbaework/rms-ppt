'use client'

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import SectionSlide from '@/components/slides/SectionSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

// 새 발표 시작용 빈 템플릿. 복사해서 내용만 채우면 됨.

const slides = [
  /* 1. 표지 */
  <CoverSlide
    title="[프레젠테이션 제목 입력]"
    subtitle="[부제목 또는 핵심 태그라인]"
    author="배효원"
    date="2026.04.30"
  />,

  /* 2. 목차 */
  <TocSlide items={['항목 1', '항목 2', '항목 3', '항목 4']} pageNumber={2} />,

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
