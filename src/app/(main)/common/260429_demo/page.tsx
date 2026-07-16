'use client'

import DeckPlayer from '@/components/Deck'
import CoverSlide from '@/components/slides/CoverSlide'
import TocSlide from '@/components/slides/TocSlide'
import ThankYouSlide from '@/components/slides/ThankYouSlide'

// === 표준 데모 — 새 덱을 만들 때 참고하는 패턴 모음 ===
// 규칙 정본은 CLAUDE.md. 여기 슬라이드들은 그 규칙의 "실물 예시"다.
//  - 간지(SectionSlide) 금지 — 섹션 구분은 본문 좌상단 라벨로
//  - 표지는 /images/Main.png 이미지 표지가 기본
//  - 사진이 어울리는 자리는 ImgSlot(이미지 제안 플레이스홀더)로 표시

// 이미지 플레이스홀더 — 실제 사진·캡처를 넣을 자리. suggestion = 어떤 이미지가 좋을지 제안.
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

const TOC = ['표준 골격', '레이아웃 패턴', '시각 요소', '새 발표 추가하기']

const slides = [
  /* 1. 표지 — 메인 이미지 배경(기본값). 제목·부제·작성자·날짜만 넘기면 됨 */
  <CoverSlide
    title="표준 데모"
    subtitle="RMS 발표자료 표준 — 슬라이드 패턴 모음"
    author="배효원"
    team="RMS팀"
    date="2026.04.29"
  />,

  /* 2. 목차 */
  <TocSlide items={TOC} pageNumber={2} />,

  /* 3. 표준 골격 — 간지 없이 바로 본문 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">I. 표준 골격</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      표지 → 목차 → 본문 → 마무리
    </h2>

    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 mb-6">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {[
          { icon: 'image', label: '표지', desc: 'Main.png 이미지 표지' },
          { icon: 'list', label: '목차', desc: 'TocSlide' },
          { icon: 'article', label: '본문', desc: '자유 JSX (내용 바로 설명)' },
          { icon: 'waving_hand', label: '마무리', desc: 'ThankYouSlide' },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1 min-w-32">
              <div className="size-16 rounded-2xl border-2 border-blue-300 bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '2rem' }}>
                  {s.icon}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{s.label}</p>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
            {i < arr.length - 1 && (
              <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
            )}
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-2xl bg-blue-50 border border-blue-100 px-6 py-4 flex items-start gap-4 max-w-4xl">
      <span className="size-10 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center">
        <span className="material-symbols-outlined">block</span>
      </span>
      <p className="text-base text-slate-700">
        <strong className="text-brand">간지(섹션 구분 전용) 슬라이드는 넣지 않는다</strong> — 페이지만 차지하고
        정보가 없다. 섹션 구분은 이 슬라이드처럼 좌상단 라벨(<span className="text-slate-500">I. 표준 골격</span>)로
        표현하고, 모든 슬라이드는 바로 내용을 설명한다.
      </p>
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">3</p>
  </div>,

  /* 4. 레이아웃 패턴 — 2단 + 이미지 제안 플레이스홀더 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">II. 레이아웃 패턴</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      2단 레이아웃 — 텍스트 + 이미지 제안
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
      <div>
        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-6 py-5 mb-4 flex items-start gap-4">
          <span className="size-11 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined">lightbulb</span>
          </span>
          <p className="text-lg text-slate-700 leading-relaxed">
            핵심 메시지는 <strong className="text-brand">콜아웃 박스</strong>로 강조한다.
            좌측 컬러 스트라이프 대신 틴트 배경 + 둥근 아이콘 칩.
          </p>
        </div>
        <ul className="space-y-2 text-base text-slate-700">
          <li className="flex gap-2">
            <span className="size-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
            <span>불릿 1차 = 채운 원 <code>blue-600</code>, 2차 = <code>slate-400</code></span>
          </li>
          <li className="flex gap-2">
            <span className="size-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
            <span>본문은 좌측 정렬 — 가운데 정렬은 표지 제목만</span>
          </li>
          <li className="flex gap-2">
            <span className="size-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0" />
            <span>강조는 Bold 또는 <strong className="text-brand">blue-600</strong> — 밑줄 금지</span>
          </li>
        </ul>
      </div>

      <ImgSlot suggestion="이 자리에 들어갈 사진·캡처를 구체적으로 제안 (예: 제품 스크린샷, 현장 사진). 사용자가 나중에 실제 이미지로 교체" />
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">4</p>
  </div>,

  /* 5. 시각 요소 — KPI 카드 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">III. 시각 요소</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      KPI 카드 — 수치는 크게, 맥락은 캡션으로
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: '지표 이름', value: '1,234건', note: '전월 대비 +12% ▲' },
        { label: '핵심 수치', value: '98.7%', note: '목표 95% 달성' },
        { label: '금액', value: '2.5억 원', note: '2026년 상반기 누적' },
        { label: '기간', value: '3개월', note: '2026.07 ~ 2026.09' },
      ].map((k) => (
        <div key={k.label} className="rounded-2xl bg-blue-50 p-5">
          <p className="text-sm text-slate-500 mb-1">{k.label}</p>
          <p className="text-2xl font-bold text-blue-600">{k.value}</p>
          <p className="text-sm text-slate-500 mt-1">{k.note}</p>
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 max-w-4xl">
      <p className="text-base text-slate-700">
        모든 수치에 <strong>단위</strong>를 붙이고, 증감은 <strong>색 + 기호(▲▼)</strong>를 병기한다
        (색만으로 의미 전달 금지). 출처는 좌하단 캡션(<code>text-sm text-slate-500</code>).
      </p>
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">5</p>
  </div>,

  /* 6. 시각 요소 — 표 + 막대 차트 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">III. 시각 요소</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      표와 차트 — 강조 1계열만 진하게
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 표 */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">표 — 헤더 블루, 가로선만</h3>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-3 text-left font-semibold">항목</th>
                <th className="px-4 py-3 text-right font-semibold">수치</th>
                <th className="px-4 py-3 text-right font-semibold">비고</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-t border-slate-200">
                <td className="px-4 py-2.5">항목 A</td>
                <td className="px-4 py-2.5 text-right font-semibold text-brand">120건</td>
                <td className="px-4 py-2.5 text-right text-slate-500">+8% ▲</td>
              </tr>
              <tr className="border-t border-slate-200 bg-slate-100/60">
                <td className="px-4 py-2.5">항목 B</td>
                <td className="px-4 py-2.5 text-right">86건</td>
                <td className="px-4 py-2.5 text-right text-slate-500">-3% ▼</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-2.5">항목 C</td>
                <td className="px-4 py-2.5 text-right">54건</td>
                <td className="px-4 py-2.5 text-right text-slate-500">유지</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 막대 차트 */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">막대 — 블루 우세, 나머지는 후퇴</h3>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          {[
            { label: '핵심 계열', pct: 78, cls: 'bg-blue-600', strong: true },
            { label: '보조 계열', pct: 52, cls: 'bg-slate-300' },
            { label: '보조 계열', pct: 34, cls: 'bg-slate-300' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <p className="w-24 shrink-0 text-sm font-semibold text-slate-600">{b.label}</p>
              <div className="flex-1 h-8 rounded-lg bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${b.cls} flex items-center justify-end pr-2 text-sm font-semibold ${b.strong ? 'text-white' : 'text-slate-600'}`}
                  style={{ width: `${b.pct}%` }}
                >
                  {b.pct}%
                </div>
              </div>
            </div>
          ))}
          <p className="text-sm text-slate-500">
            차트 색 순서: blue-600 → teal-500 → amber-500 → blue-300 → slate-400
          </p>
        </div>
      </div>
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">6</p>
  </div>,

  /* 7. 새 발표 추가하기 */
  <div className="relative w-full min-h-full px-12 md:px-20 py-12">
    <p className="text-base text-slate-500 mb-2">IV. 새 발표 추가하기</p>
    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
      새 발표 추가 — 3단계로 끝
    </h2>

    <ol className="space-y-5 max-w-4xl mb-8">
      {[
        {
          no: '1',
          title: 'src/app/(main)/{지역}/{YYMMDD_주제}/page.tsx 생성',
          desc: '260430_blank(빈 템플릿)를 복사해서 내용만 채움. 폴더명은 ASCII — 폴더 경로가 곧 URL',
        },
        {
          no: '2',
          title: 'src/lib/decks.ts 에 한 줄 등록',
          desc: 'region·date·title·href — 홈 목록 카드로 노출됨 (라우팅은 폴더가 알아서)',
        },
        {
          no: '3',
          title: 'npm run build 로 검증 후 커밋',
          desc: '타입체크 + 정적 생성. 배포는 Cloudflare가 자동',
        },
      ].map((step) => (
        <li key={step.no} className="flex gap-4 items-start">
          <span className="size-10 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0 text-lg">
            {step.no}
          </span>
          <div>
            <p className="font-bold text-slate-900 text-lg">{step.title}</p>
            <p className="text-base text-slate-500 mt-0.5">{step.desc}</p>
          </div>
        </li>
      ))}
    </ol>

    <div className="rounded-2xl bg-blue-50 border border-blue-100 px-6 py-4 max-w-4xl">
      <p className="text-base text-slate-700">
        규칙 정본은 <strong className="text-brand">CLAUDE.md</strong> — 색·폰트·간격 토큰, 금지 패턴(간지·밑줄·컬러바·텍스트-only)이 정리돼 있다.
      </p>
    </div>

    <p className="absolute bottom-3 right-6 text-sm text-slate-400 font-medium">7</p>
  </div>,

  /* 8. 마무리 */
  <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={8} />,
]

export default function Page() {
  return <DeckPlayer slides={slides} />
}
