'use client'

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import SectionSlide from '@/components/slides/SectionSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

// PPT 기획 (울산 에너지자급자족 · 기획 초안, 함께 채워나가는 중)
// 참고: 같은 지역의 260513_플랫폼 덱

const TOC = ['기획 배경·목적', '현황 정리', '핵심 메시지', '슬라이드 구성안', '다음 단계']

const slides = [
  /* 1. 표지 */
  <CoverSlide
    title="PPT 기획"
    subtitle="발표 자료 구성안 (초안)"
    author="배효원"
    date="2026.06.24"
  />,

  /* 2. 목차 */
  <TocSlide items={TOC} pageNumber={2} />,

  /* 3. 섹션 — 기획 배경 */
  <SectionSlide
    number="01"
    title="기획 배경·목적"
    description="이 발표로 무엇을, 누구에게, 어떤 결정을 끌어낼지 한 줄로 정의"
    progress="01 / 05"
    pageNumber={3}
  />,

  /* 4. 본문 — 목적 정의 (채울 자리) */
  <div className="relative w-full min-h-full px-12 md:px-20 py-16">
    <p className="text-base text-slate-500 mb-2">I. 기획 배경</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      이 발표의 목적
    </h2>
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5 text-lg text-slate-700 max-w-3xl">
      <strong className="text-brand">목적:</strong> (여기에 한 줄 — 예: "울산 에너지 자급자족
      플랫폼의 거래·정산 구조를 발주처에 설명하고 N차년도 추진안을 합의한다")
    </div>
    <ul className="mt-8 space-y-3 text-slate-700 max-w-3xl">
      <li className="flex gap-3"><span className="size-2 mt-2 rounded-full bg-brand shrink-0" /> 대상 청중: (산단공 / 테크노파크 / 내부 …)</li>
      <li className="flex gap-3"><span className="size-2 mt-2 rounded-full bg-brand shrink-0" /> 끌어낼 결정: (예산 / 일정 / 범위 합의 …)</li>
      <li className="flex gap-3"><span className="size-2 mt-2 rounded-full bg-brand shrink-0" /> 핵심 한 문장: (발표가 끝나고 기억돼야 할 한 줄)</li>
    </ul>
    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">4</p>
  </div>,

  /* 5. 섹션 — 슬라이드 구성안 */
  <SectionSlide
    number="02"
    title="슬라이드 구성안"
    description="섹션별로 한 장 = 한 메시지. 아래 뼈대를 채워가며 발표 덱으로 확정"
    progress="02 / 05"
    pageNumber={5}
  />,

  /* 6. 본문 — 구성안 뼈대 (채울 자리) */
  <div className="relative w-full min-h-full px-12 md:px-20 py-16">
    <p className="text-base text-slate-500 mb-2">II. 구성안</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      섹션 뼈대
    </h2>
    <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
      {[
        { no: '01', t: '배경', d: '왜 지금 — 문제/기회' },
        { no: '02', t: '현황 (As-Is)', d: '지금 구조와 한계' },
        { no: '03', t: '제안 (To-Be)', d: '우리가 만드는 구조' },
        { no: '04', t: '효과·근거', d: 'KPI·수치·사례' },
        { no: '05', t: '추진계획', d: '일정·역할·예산' },
        { no: '06', t: '요청사항', d: '합의가 필요한 결정' },
      ].map((s) => (
        <div key={s.no} className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-4">
          <span className="size-10 shrink-0 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
            {s.no}
          </span>
          <div>
            <p className="font-bold text-slate-900">{s.t}</p>
            <p className="text-sm text-slate-500">{s.d}</p>
          </div>
        </div>
      ))}
    </div>
    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">6</p>
  </div>,

  /* 7. 마무리 */
  <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={7} />,
]

export default function Page() {
  return <DeckPlayer slides={slides} />
}
