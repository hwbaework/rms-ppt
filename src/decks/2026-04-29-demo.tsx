import { useState } from 'react'
import type { Deck } from '../data/types'

// === 새 발표 추가 가이드 ===
// 1. 이 파일을 복사 (예: 2026-05-15-mytalk.tsx)
// 2. meta의 slug, title, date, description 변경
// 3. slides 배열에 JSX로 슬라이드 작성 (한 항목 = 한 슬라이드)
// 4. data/deckList.ts에서 import + decks 배열에 추가

/** 좌측 컬러바 + 챕터 라벨 (예: "I. 소개") */
function ChapterLabel({
  romanNum,
  title,
}: {
  romanNum: string
  title: string
}) {
  return (
    <div className="flex items-stretch mb-12">
      <div className="w-1.5 bg-brand rounded-full mr-4" />
      <div className="flex items-center text-sm md:text-base text-gray-500">
        <span className="font-mono mr-2 text-brand font-semibold">
          {romanNum}.
        </span>
        {title}
      </div>
    </div>
  )
}

/** 강조 박스 */
function CalloutBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-base md:text-lg text-gray-700">
      {children}
    </div>
  )
}

/** 다이어그램 박스 */
function DiagramBox({
  label,
  title,
  className = '',
}: {
  label?: string
  title: string
  className?: string
}) {
  return (
    <div
      className={`px-6 py-5 rounded-xl border border-gray-200 bg-white shadow-sm min-w-40 text-center ${className}`}
    >
      {label && (
        <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">
          {label}
        </p>
      )}
      <p className="font-bold text-gray-900">{title}</p>
    </div>
  )
}

/** 인터랙티브 토글 슬라이드 — 코드 vs 결과 */
function InteractiveSlide() {
  const [showResult, setShowResult] = useState(false)

  return (
    <div>
      <ChapterLabel romanNum="III" title="인터랙티브" />
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        4. 코드로 작성, 즉시 슬라이드
      </h1>
      <CalloutBox>
        <strong>JSX 코드</strong>가 곧 슬라이드입니다. 버튼을 눌러
        코드와 결과를 토글해보세요.
      </CalloutBox>

      <div className="text-center my-8">
        <button
          onClick={() => setShowResult(!showResult)}
          className="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-red-700 transition shadow-lg shadow-brand/25 flex items-center gap-2 mx-auto"
        >
          <span className="material-symbols-outlined text-base">
            {showResult ? 'code' : 'visibility'}
          </span>
          {showResult ? '코드 다시 보기' : '결과 보기'}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 md:p-8 min-h-[200px]">
        {showResult ? (
          <div className="text-center py-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              <span className="text-brand">Hello</span>, rms-ppt!
            </h2>
            <p className="text-gray-500">이 화면이 위 코드의 결과입니다.</p>
          </div>
        ) : (
          <pre className="text-sm md:text-base text-gray-700 overflow-x-auto">
            <code>{`<div className="text-center py-6">
  <h2 className="text-5xl font-extrabold">
    <span className="text-brand">Hello</span>,
    rms-ppt!
  </h2>
  <p>이 화면이 위 코드의 결과입니다.</p>
</div>`}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

const deck: Deck = {
  meta: {
    slug: '2026-04-29-demo',
    title: 'rms-ppt 데모 — 라이트 템플릿',
    date: '2026-04-29',
    description:
      '라이트 톤 슬라이드 데모입니다. 챕터 라벨, 강조 박스, 다이어그램, 인터랙티브 버튼이 포함됩니다.',
    tags: ['Demo', 'Template'],
  },
  slides: [
    /* 1. 표지 */
    <div className="text-center">
      <p className="text-xs md:text-sm text-brand tracking-[0.3em] uppercase mb-6 font-semibold">
        2026 · 04 · 29
      </p>
      <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 leading-[1.05]">
        rms-ppt
        <br />
        <span className="text-brand">데모 발표</span>
      </h1>
      <p className="text-lg md:text-2xl text-gray-500">
        AI와 함께 만드는 발표 자료 아카이브
      </p>
    </div>,

    /* 2. 목차 */
    <div>
      <ChapterLabel romanNum="-" title="Agenda" />
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-12">
        목차
      </h1>
      <ol className="space-y-5 text-xl md:text-2xl text-gray-700">
        <li className="flex gap-5">
          <span className="text-brand font-mono font-semibold">01</span>
          rms-ppt 란?
        </li>
        <li className="flex gap-5">
          <span className="text-brand font-mono font-semibold">02</span>
          작성 · 빌드 · 배포 흐름
        </li>
        <li className="flex gap-5">
          <span className="text-brand font-mono font-semibold">03</span>
          코드로 작성, 즉시 슬라이드
        </li>
      </ol>
    </div>,

    /* 3. 강조 박스 + 다이어그램 (rms-ppt 자체 소개) */
    <div>
      <ChapterLabel romanNum="I" title="소개" />
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
        1. rms-ppt 개요
      </h1>
      <p className="text-gray-500 mb-8 text-base md:text-lg">
        발표 자료를 코드로 작성하고, 한 곳에서 모아 보는 아카이브
      </p>

      <CalloutBox>
        <strong>JSX 기반 슬라이드</strong> — Vite + React + TypeScript 위에,
        <strong> Cloudflare Workers</strong>로 정적 호스팅되는{' '}
        <strong>발표 자료 아카이브</strong>
      </CalloutBox>

      <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50/50 p-8">
        <p className="text-center text-xs font-semibold tracking-widest text-brand bg-red-50 inline-block px-3 py-1 rounded-full mb-6 mx-auto block w-fit border border-red-100">
          WORKFLOW · 작성에서 배포까지
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <DiagramBox label="Write" title="JSX 슬라이드" />
          <span className="material-symbols-outlined text-gray-300">
            arrow_forward
          </span>
          <DiagramBox label="Build" title="Vite + Tailwind" />
          <span className="material-symbols-outlined text-gray-300">
            arrow_forward
          </span>
          <DiagramBox label="Deploy" title="Cloudflare Workers" />
          <span className="material-symbols-outlined text-gray-300">
            arrow_forward
          </span>
          <DiagramBox label="Browse" title="rms-ppt 사이트" />
        </div>
      </div>
    </div>,

    /* 4. 작성 흐름 (다이어그램 두 줄 형식) */
    <div>
      <ChapterLabel romanNum="II" title="작성 흐름" />
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
        2. 새 발표 추가하기
      </h1>
      <p className="text-gray-500 mb-8 text-base md:text-lg">
        파일 한 개를 추가하고 git push만 하면 끝
      </p>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8">
        <ol className="space-y-4">
          <li className="flex gap-4 items-start">
            <span className="size-8 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                <code className="text-sm bg-white px-2 py-0.5 rounded border border-gray-200">
                  src/decks/YYYY-MM-DD-제목.tsx
                </code>{' '}
                새 파일
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                기존 데모 파일을 복사해서 이름·내용 변경
              </p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="size-8 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                <code className="text-sm bg-white px-2 py-0.5 rounded border border-gray-200">
                  src/data/deckList.ts
                </code>
                에 import + 배열에 추가
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                목록에 자동 노출
              </p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="size-8 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                <code className="text-sm bg-white px-2 py-0.5 rounded border border-gray-200">
                  git push
                </code>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Cloudflare가 1~2분 내 자동 빌드/배포
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>,

    /* 5. 인터랙티브 슬라이드 */
    <InteractiveSlide />,

    /* 6. 마지막 */
    <div className="text-center">
      <p className="text-xs md:text-sm text-brand tracking-[0.3em] uppercase mb-6 font-semibold">
        Thank you
      </p>
      <h1 className="text-6xl md:text-9xl font-extrabold tracking-tight mb-6 leading-[1.05]">
        감사합니다
      </h1>
      <p className="text-lg md:text-xl text-gray-500">
        <span className="text-brand font-semibold">rms-ppt</span>
      </p>
    </div>,
  ],
}

export default deck
