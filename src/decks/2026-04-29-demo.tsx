import type { Deck } from '../data/types'
import CoverSlide from '../components/slides/CoverSlide'
import TocSlide from '../components/slides/TocSlide'
import SectionSlide from '../components/slides/SectionSlide'
import ThankYouSlide from '../components/slides/ThankYouSlide'

// === 새 발표 추가 가이드 ===
// 1. 이 파일을 복사 (예: 2026-05-15-mytalk.tsx)
// 2. meta의 slug, title, date 변경
// 3. slides 배열에 슬라이드 컴포넌트 또는 자유 JSX 추가
//    - <CoverSlide />        : 표지
//    - <TocSlide />          : 목차
//    - <SectionSlide />      : 섹션 구분 (빨강 풀배경)
//    - <ThankYouSlide />     : 마무리
//    - 또는 <div>...</div>   : 직접 JSX
// 4. data/deckList.ts 에 import + decks 배열에 추가

const TOC = ['rms-ppt 란?', '작성 흐름', '데모', '마무리']

const deck: Deck = {
  meta: {
    slug: '2026-04-29-demo',
    title: 'rms-ppt 데모 — RMS GROUP 템플릿',
    date: '2026-04-29',
    description: 'RMS GROUP PPT 템플릿(표지·목차·섹션·마무리)을 그대로 옮긴 데모입니다.',
    tags: ['Demo', 'Template'],
  },
  slides: [
    /* 1. 표지 */
    <CoverSlide
      title="rms-ppt 데모"
      subtitle="AI와 함께 만드는 발표 자료 아카이브"
      author="배효원"
      team="RMS팀"
      date="2026.04.29"
    />,

    /* 2. 목차 */
    <TocSlide items={TOC} pageNumber={2} />,

    /* 3. 섹션 구분 */
    <SectionSlide
      number="01"
      title="rms-ppt 란?"
      description="발표 자료를 코드로 작성하고 한 곳에 모아 보는 아카이브"
      pageNumber={3}
    />,

    /* 4. 본문 (자유 JSX) — 챕터 라벨 + 강조 박스 + 다이어그램 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-sm text-gray-500 mb-2">I. rms-ppt 란?</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
        1. 작성 → 빌드 → 배포
      </h2>
      <p className="text-gray-500 mb-8">파일 한 개를 추가하고 git push만 하면 끝</p>

      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-base md:text-lg text-gray-700 mb-10">
        <strong>JSX 기반 슬라이드</strong> — Vite + React + Tailwind v4 위에,
        <strong> Cloudflare Workers</strong>로 정적 호스팅
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 md:p-8">
        <p className="inline-block text-xs font-semibold tracking-widest text-brand bg-red-50 px-3 py-1 rounded-full mb-6 border border-red-100">
          WORKFLOW
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { label: 'Write', title: 'JSX 슬라이드' },
            { label: 'Build', title: 'Vite + Tailwind' },
            { label: 'Deploy', title: 'Cloudflare' },
            { label: 'Browse', title: 'rms-ppt' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm text-center min-w-32">
                <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">
                  {s.label}
                </p>
                <p className="font-bold text-gray-900 text-sm">{s.title}</p>
              </div>
              {i < 3 && (
                <span className="material-symbols-outlined text-gray-300">
                  arrow_forward
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-xs text-gray-500 font-medium">
        4
      </p>
    </div>,

    /* 5. 섹션 구분 */
    <SectionSlide
      number="02"
      title="작성 흐름"
      description="src/decks 폴더에 파일 추가 → git push → 자동 배포"
      pageNumber={5}
    />,

    /* 6. 본문 — 단계 가이드 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-sm text-gray-500 mb-2">II. 작성 흐름</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
        2. 새 발표 추가하기
      </h2>
      <p className="text-gray-500 mb-10">3단계로 끝</p>

      <ol className="space-y-5">
        {[
          {
            no: '1',
            title: 'src/decks/YYYY-MM-DD-제목.tsx 새 파일',
            desc: '기존 데모 파일을 복사해서 이름 · 내용 변경',
          },
          {
            no: '2',
            title: 'src/data/deckList.ts 에 import + 배열 추가',
            desc: '목록에 자동 노출됨',
          },
          {
            no: '3',
            title: 'git push',
            desc: 'Cloudflare가 1~2분 내 자동 빌드/배포',
          },
        ].map((step) => (
          <li key={step.no} className="flex gap-4 items-start">
            <span className="size-10 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0 text-lg">
              {step.no}
            </span>
            <div>
              <p className="font-bold text-gray-900 text-lg">{step.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="absolute bottom-3 right-6 text-xs text-gray-500 font-medium">
        6
      </p>
    </div>,

    /* 7. 마무리 */
    <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={7} />,
  ],
}

export default deck
