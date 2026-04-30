import type { Deck } from '../data/types'
import CoverSlide from '../components/slides/CoverSlide'
import TocSlide from '../components/slides/TocSlide'
import SectionSlide from '../components/slides/SectionSlide'
import ThankYouSlide from '../components/slides/ThankYouSlide'

// 새 발표 시작용 템플릿 (2026-04-30).
// 컨텐츠는 자유롭게 채워 쓰면 됨.

const TOC = ['항목 1', '항목 2', '항목 3', '항목 4']

const deck: Deck = {
  meta: {
    slug: 'rmsppt260430',
    title: '[프레젠테이션 제목 입력]',
    date: '2026-04-30',
    description: '[부제목 또는 핵심 태그라인을 입력하세요]',
    tags: ['Draft'],
  },
  slides: [
    /* 1. 표지 */
    <CoverSlide
      title="[프레젠테이션 제목 입력]"
      subtitle="[여기에 부제목 또는 핵심 태그라인을 입력하세요]"
      author="배효원"
      team="RMS팀"
      date="2026.04.30"
    />,

    /* 2. 목차 */
    <TocSlide items={TOC} pageNumber={2} />,

    /* 3. 섹션 구분 */
    <SectionSlide
      number="01"
      title="[여기에 섹션 제목을 입력하세요]"
      description="해당 섹션에 다룰 핵심 메시지나 서브타이틀을 한 줄로 간결하게 작성하세요"
      pageNumber={3}
    />,

    /* 4. 본문 (자유 JSX) */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-sm text-gray-500 mb-2">I. 항목 1</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
        본문 슬라이드
      </h2>
      <p className="text-gray-500 mb-8">
        여기에 자유롭게 컨텐츠를 작성하세요.
      </p>

      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-base md:text-lg text-gray-700">
        <strong>강조 박스</strong> — 핵심 메시지를 강조하고 싶을 때 이 박스를 사용하세요.
      </div>

      <p className="absolute bottom-3 right-6 text-xs text-gray-500 font-medium">
        4
      </p>
    </div>,

    /* 5. 마무리 */
    <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={5} />,
  ],
}

export default deck
