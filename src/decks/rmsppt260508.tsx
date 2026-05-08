import type { Deck } from '../data/types'
import CoverSlide from '../components/slides/CoverSlide'
import TocSlide from '../components/slides/TocSlide'
import SectionSlide from '../components/slides/SectionSlide'
import ThankYouSlide from '../components/slides/ThankYouSlide'

const TOC = ['페르소나', 'PPA 거래 (3종)', '앞으로의 방향']

const PERSONAS = [
  { short: '발전', tag: 'Generator', label: '발전 사업자', desc: '전기를 만드는 주체' },
  { short: '공급', tag: 'Supplier', label: '전기공급 사업자', desc: '전기를 공급·중개하는 사업자' },
  { short: '수용', tag: 'Consumer', label: '수용가', desc: '전기를 쓰는 주체' },
  { short: '관리', tag: 'Admin', label: '관리자', desc: '시스템·거래 운영 관리' },
  { short: '독립', tag: 'Indep.', label: '컨설턴트 (독립)', desc: '외부 독립 컨설턴트' },
  { short: '용역', tag: 'Vendor', label: '컨설턴트 (용역사)', desc: '용역 컨설팅 회사' },
]

const PPA_TYPES = [
  {
    tag: 'PPA',
    title: 'PPA 계약',
    summary: '발전사업자 ↔ 수용가 장기 전력 직접거래',
    flow: ['발전 사업자', 'SPC (플랫폼)', '수용가'],
    detail: [
      '계약: 단가·연간 보장량을 정해 장기 계약',
      '정산: 시간대별 사용량 기준 자동 정산',
      '특징: 수용가가 외부 발전소에서 전기를 사오는 형태',
    ],
  },
  {
    tag: 'LEASE',
    title: '직접 PPA (리스)',
    summary: '수용가 부지에 발전 설비를 두고 리스 형태로 운영',
    flow: ['공급 사업자', '발전 설비 (리스)', '수용가'],
    detail: [
      '설치: 공급사업자가 수용가 부지에 설비 설치·소유',
      '계약: 수용가는 사용료(리스료) 지불',
      '특징: 초기 투자 없이 자가 발전 효과',
    ],
  },
  {
    tag: 'SELF',
    title: '자가 PPA',
    summary: '자가 발전 설비에서 만든 전기를 자체 시설에서 소비',
    flow: ['자가 발전 설비', '→', '자가 소비 시설'],
    detail: [
      '소유: 발전 설비·소비 시설 모두 본인 소유',
      '정산: SPC 통해 잉여 전력 정산·관리',
      '특징: RE100 직접 이행, 잉여분 처리 필요',
    ],
  },
]

const ROADMAP = [
  {
    tag: '01',
    title: '실제 데이터 적재',
    desc: '산단 발전·소비 실시간 데이터 수집·축적',
  },
  {
    tag: '02',
    title: 'E 데이터 마켓',
    desc: '에너지 데이터 자체를 거래 자원화',
  },
  {
    tag: '03',
    title: 'VPP',
    desc: '분산 자원을 묶어 가상발전소로 시장 입찰',
  },
  {
    tag: '04',
    title: '탄소관리 (Thingspire)',
    desc: '연계 검토 — 확인 필요',
    tentative: true,
  },
  {
    tag: '05',
    title: 'DT 디지털 트윈',
    desc: '산단 가상화 → 시뮬레이션·운영 최적화',
  },
]

const deck: Deck = {
  meta: {
    slug: 'rmsppt260508',
    title: '울산 에너지 자급자족 플랫폼',
    date: '2026-05-08',
    description: '페르소나 · PPA 거래 3종 · 앞으로의 방향',
    tags: ['Ulsan', 'PPA', 'Platform'],
  },
  slides: [
    /* 1. 표지 */
    <CoverSlide
      title="울산 에너지 자급자족 플랫폼"
      author="배효원"
      team="RMS팀"
      date="2026.05.08"
    />,

    /* 2. 목차 */
    <TocSlide items={TOC} pageNumber={2} />,

    /* 3. Section — 페르소나 */
    <SectionSlide number="01" title="페르소나" pageNumber={3} />,

    /* 4. 6 페르소나 카드 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">I. 페르소나</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        6개 사용자
      </h2>
      <p className="text-gray-500 mb-10">
        역할에 따라 보는 화면이 다르게 구성됩니다
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PERSONAS.map((p) => (
          <div
            key={p.tag}
            className="rounded-2xl border border-gray-100 bg-white px-5 py-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="size-9 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm">
                {p.short}
              </span>
              <p className="font-bold text-gray-900">{p.label}</p>
            </div>
            <p className="text-base text-gray-500">{p.desc}</p>
          </div>
        ))}
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        4
      </p>
    </div>,

    /* 5. As-Is / To-Be 페르소나 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">I. 페르소나</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        모두 같은 화면 → 역할별 화면
      </h2>
      <p className="text-gray-500 mb-10">As-Is / To-Be</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* As-Is */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6">
          <p className="inline-block text-sm font-semibold tracking-widest text-gray-500 bg-white px-3 py-1 rounded-full mb-5 border border-gray-200">
            AS-IS · 같은 화면
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {PERSONAS.map((p) => (
              <div
                key={p.tag}
                className="size-10 rounded-full bg-white border border-gray-300 text-sm font-bold flex items-center justify-center text-gray-600"
              >
                {p.short}
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-3">
            <span className="material-symbols-outlined text-gray-400">
              south
            </span>
          </div>

          <div className="rounded-xl border border-gray-300 bg-white px-4 py-6 text-center">
            <p className="text-sm text-gray-400 mb-1">SHARED PAGE</p>
            <p className="font-bold text-gray-700">공통 페이지 1개</p>
          </div>
        </div>

        {/* To-Be */}
        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
          <p className="inline-block text-sm font-semibold tracking-widest text-brand bg-white px-3 py-1 rounded-full mb-5 border border-red-100">
            TO-BE · 역할별 화면
          </p>

          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <div key={p.tag} className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {p.short}
                </div>
                <span className="material-symbols-outlined text-brand text-base">
                  arrow_forward
                </span>
                <div className="flex-1 rounded-lg bg-white border border-red-100 px-3 py-1.5 text-sm text-gray-700">
                  {p.label} 전용 페이지
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        5
      </p>
    </div>,

    /* 6. Section — PPA 거래 */
    <SectionSlide number="02" title="PPA 거래 (3종)" pageNumber={6} />,

    /* 7. 3종 한눈에 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">II. PPA 거래</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        3가지 거래 방식
      </h2>
      <p className="text-gray-500 mb-10">
        플랫폼 안에서 처리하는 PPA 종류
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PPA_TYPES.map((p) => (
          <div
            key={p.tag}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-5"
          >
            <p className="inline-block text-sm font-semibold tracking-widest text-brand bg-red-50 px-2.5 py-1 rounded-full mb-3 border border-red-100">
              {p.tag}
            </p>
            <p className="font-bold text-gray-900 text-xl mb-2">{p.title}</p>
            <p className="text-base text-gray-600 mb-4">{p.summary}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {p.flow.map((node, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                    {node}
                  </span>
                  {i < p.flow.length - 1 && (
                    <span className="material-symbols-outlined text-gray-300 text-base">
                      arrow_forward
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        7
      </p>
    </div>,

    /* 8. PPA 계약 상세 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">II. PPA 거래</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        7-1. PPA 계약
      </h2>
      <p className="text-gray-500 mb-10">{PPA_TYPES[0].summary}</p>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 mb-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {PPA_TYPES[0].flow.map((node, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-center min-w-32 font-bold text-base">
                {node}
              </div>
              {i < PPA_TYPES[0].flow.length - 1 && (
                <span className="material-symbols-outlined text-brand">
                  arrow_forward
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {PPA_TYPES[0].detail.map((d, i) => (
          <li
            key={i}
            className="flex gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 text-base text-gray-700"
          >
            <span className="material-symbols-outlined text-brand text-lg">
              check_circle
            </span>
            {d}
          </li>
        ))}
      </ul>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        8
      </p>
    </div>,

    /* 9. 직접 PPA (리스) 상세 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">II. PPA 거래</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        7-2. 직접 PPA (리스)
      </h2>
      <p className="text-gray-500 mb-10">{PPA_TYPES[1].summary}</p>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 mb-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {PPA_TYPES[1].flow.map((node, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-center min-w-32 font-bold text-base">
                {node}
              </div>
              {i < PPA_TYPES[1].flow.length - 1 && (
                <span className="material-symbols-outlined text-brand">
                  arrow_forward
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {PPA_TYPES[1].detail.map((d, i) => (
          <li
            key={i}
            className="flex gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 text-base text-gray-700"
          >
            <span className="material-symbols-outlined text-brand text-lg">
              check_circle
            </span>
            {d}
          </li>
        ))}
      </ul>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        9
      </p>
    </div>,

    /* 10. 자가 PPA 상세 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">II. PPA 거래</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        7-3. 자가 PPA
      </h2>
      <p className="text-gray-500 mb-10">{PPA_TYPES[2].summary}</p>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 mb-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {PPA_TYPES[2].flow.map((node, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={
                  node === '→'
                    ? ''
                    : 'px-5 py-3 rounded-xl border border-gray-200 bg-white text-center min-w-40 font-bold text-base'
                }
              >
                {node === '→' ? (
                  <span className="material-symbols-outlined text-brand">
                    arrow_forward
                  </span>
                ) : (
                  node
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {PPA_TYPES[2].detail.map((d, i) => (
          <li
            key={i}
            className="flex gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 text-base text-gray-700"
          >
            <span className="material-symbols-outlined text-brand text-lg">
              check_circle
            </span>
            {d}
          </li>
        ))}
      </ul>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        10
      </p>
    </div>,

    /* 11. Section — 앞으로의 방향 */
    <SectionSlide number="03" title="앞으로의 방향" pageNumber={11} />,

    /* 12. 5가지 방향 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">III. 앞으로의 방향</p>
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">
        다음에 붙일 것들
      </h2>
      <p className="text-gray-500 mb-10">
        실제 데이터 적재를 시작점으로, 마켓·VPP·탄소·DT까지
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROADMAP.map((r) => (
          <div
            key={r.tag}
            className={
              'rounded-2xl px-6 py-5 ' +
              (r.tentative
                ? 'border border-dashed border-gray-300 bg-gray-50/40'
                : 'border border-gray-100 bg-white')
            }
          >
            <div className="flex items-center gap-3 mb-2">
              <p className="text-3xl font-bold text-brand">{r.tag}</p>
              <p className="font-bold text-gray-900 text-xl">{r.title}</p>
              {r.tentative && (
                <span className="text-sm font-semibold tracking-widest text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-300">
                  TBD
                </span>
              )}
            </div>
            <p className="text-base text-gray-500">{r.desc}</p>
          </div>
        ))}
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        12
      </p>
    </div>,

    /* 13. 마무리 */
    <ThankYouSlide email="hwbae@rms.co.kr" pageNumber={13} />,
  ],
}

export default deck
