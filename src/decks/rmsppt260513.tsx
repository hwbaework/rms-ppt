import type { Deck } from '../data/types'
import CoverSlide from '../components/slides/CoverSlide'
import TocSlide from '../components/slides/TocSlide'
import ThankYouSlide from '../components/slides/ThankYouSlide'

const TOC = [
  '배경',
  '페르소나',
  'Lease PPA · 직접 PPA · 자가 설치',
  '비즈니스 모델',
  'As-Is / To-Be',
  '일정',
  'Q&A',
]

const PERSONAS = [
  {
    short: '발전사',
    tag: 'Generator',
    label: '발전사',
    desc: '전기를 만드는 주체',
    role: '발전 설비를 운영해 전력을 생산하고 전기 공급사업자에 판매',
    tasks: ['발전 자원 등록·관리', '수익 분석', '발전량 예측·오차', '계약·문서'],
    why: '한전 단일 창구가 아닌 신재생 직접 판매 채널이 필요',
    benefit: '전기 공급사업자와 직거래로 신재생 판매처 확보 — 단가차익 확보, 거래 다변화',
  },
  {
    short: '수용가',
    tag: 'Consumer',
    label: '수용가',
    desc: '전기를 쓰는 주체 (RE100·ESG)',
    role: '신재생 전기를 사들여 RE100·ESG 이행',
    tasks: ['사용량·요금 분석', '직접 PPA 계약·거래현황', 'Lease PPA 운영', '정산·세금·증빙 수령'],
    why: 'RE100·ESG 직접 이행 / 사용 전력 종류·요금 가시화',
    benefit: 'RE100·ESG 이행 가능 — 글로벌 수출 통로 확보, 사용 전기 종류·요금 가시화',
  },
  {
    short: '컨설턴트',
    tag: 'Consultant',
    label: '컨설턴트',
    desc: '독립·용역사 컨설팅',
    role: '발전사·수용가 매칭, 사업 진행 컨설팅',
    tasks: ['고객·제안 관리', '수익·정산', '초대 링크', '거래현황 모니터링'],
    why: '발전사·수용가 매칭 복잡도와 컨설팅 수요를 흡수',
    benefit: '플랫폼 매칭으로 영업 효율화 — 수익·정산 자동화',
  },
  {
    short: '전기 공급사업자',
    tag: 'SPC',
    label: '전기 공급사업자',
    desc: '거래소·정산소 운영',
    role: '가운데서 모든 거래를 묶어 정산·세금계산서·증빙을 일괄 처리',
    tasks: ['거래 정산', '예측·오차율', '결제·세금계산서', '컨설팅 사업비'],
    why: '다주체 거래·세무·증빙을 가운데서 일괄 처리',
    benefit: '거래량 비례 마진 — 통합 정산·세금계산서·증빙 자동 처리',
  },
  {
    short: '관리자',
    tag: 'Admin',
    label: '관리자',
    desc: '시스템·기업·권한 운영',
    role: '플랫폼 운영자 — 기업·사용자·권한·거래 전반 통제',
    tasks: ['기업·사용자 승인', '역할·권한', '감사 로그', '전체 거래 모니터링'],
    why: '다주체 거래 환경의 권한·감사·통제',
    benefit: '전체 거래·권한·감사를 한 화면에서 통제 — 운영 효율화',
  },
]

// 페르소나 색상 매핑 — 표·그림에서 시각적 매칭
const PERSONA_COLOR: Record<string, { badge: string; ring: string; bg: string; text: string }> = {
  Generator: { badge: 'bg-emerald-500', ring: 'ring-emerald-400 border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Consumer: { badge: 'bg-amber-500', ring: 'ring-amber-400 border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  Consultant: { badge: 'bg-violet-500', ring: 'ring-violet-400 border-violet-300', bg: 'bg-violet-50', text: 'text-violet-700' },
  SPC: { badge: 'bg-brand', ring: 'ring-red-400 border-red-300', bg: 'bg-red-50', text: 'text-brand' },
  Admin: { badge: 'bg-slate-500', ring: 'ring-slate-400 border-slate-300', bg: 'bg-slate-50', text: 'text-slate-700' },
}

// 컨설턴트 2종 — 독립 = 컨설턴트 회사 / 용역사 소속 = 시공 위탁 받는 용역사 인력
const CONSULTANT_TYPES = [
  {
    short: '독립',
    label: '컨설턴트 (독립)',
    desc: '컨설턴트 회사',
    role: '발전사·수용가 매칭 컨설팅 · 사업 기획·계약 주관',
    tasks: ['고객 발굴·매칭', '제안 작성·송부', '수익·정산', '용역사 위탁'],
    why: '컨설팅 회사가 사업을 기획·주관',
    benefit: '플랫폼에서 매칭·정산 자동화 — 영업 효율화',
  },
  {
    short: '용역사 소속',
    label: '컨설턴트 (용역사 소속)',
    desc: '시공 위탁받는 용역사',
    role: '독립 컨설턴트가 위탁한 실제 시공·설치·유지보수 수행',
    tasks: ['시공 견적·일정', '설치·유지보수', '진행 보고', '정산'],
    why: '실제 시공 인력 — 독립 컨설턴트의 위탁을 수행',
    benefit: '시공 의뢰·정산이 플랫폼에서 일원화 — 운영 부담 절감',
  },
]

const TRADES = [
  {
    tag: 'LEASE',
    title: 'Lease PPA',
    analogy: '태양광 설비 임대형 (구조물·인버터 포함)',
    summary: '발전사가 수요자 부지에 설치 → 설비 임대 + 발전량 비례 청구',
    flowNodes: ['발전사 (설치·소유)', '수용가 (사용)'],
    flowLabels: ['설비 임대료'],
    points: [
      '발전사가 수요자 부지에 발전소 설치',
      '발전전력 전량을 수요자에게 공급',
      '태양광 설비 임대 형식 — 발전량에 비례하여 청구',
      '※ 직접 PPA 방식 아님 (Lease)',
    ],
  },
  {
    tag: 'DIRECT',
    title: '직접 PPA',
    analogy: '발전사와 직접 계약',
    summary: 'Onsite PPA · Offsite PPA 중 선택 — 1:1, 1:N, N:1 매칭 가능',
    flowNodes: ['발전사', '전기 공급사업자', '수용가'],
    flowLabels: ['전력', '전력'],
    points: [
      '발전사와 직접 계약 — Onsite는 1:1, Offsite는 1:N · N:1 등 다양한 매칭',
      '장기 계약 5 / 10 / 15 / 20년',
      'REC 분리 옵션 지원',
      '하위 유형 ① Onsite PPA / ② Offsite PPA (다음 슬라이드)',
    ],
  },
  {
    tag: 'SELF-GEN',
    title: '태양광 자가 설치',
    analogy: '자가 소유 · 모니터링만',
    summary: '자가 소유 발전소 — 거래 없이 자가소비, 가입 시 실시간 발전량 모니터링 제공',
    flowNodes: ['자가 발전 설비', '자가 소비'],
    flowLabels: [],
    points: [
      '자가 소유 발전소',
      '거래·정산 없이 자가소비',
      '발전소·사용 관리 대행',
      '실시간 발전량 모니터링 화면 제공',
      '※ 직접 PPA 방식 아님',
    ],
  },
]

const DIRECT_SUB = [
  {
    tag: 'ONSITE',
    title: 'Onsite PPA',
    summary: '발전사가 부지 임대료 지급 + 발전소 설치 → 전력 전량 공급',
    points: [
      '발전사가 수요자 부지 임대',
      '발전사가 발전소 설치·운영',
      '발전전력 전량을 수요자에게 공급',
      '발전사가 부지 임대료 지급',
      '1:1 매칭',
    ],
    steps: ['신청 접수', '부지 평가', '계약 체결'],
  },
  {
    tag: 'OFFSITE',
    title: 'Offsite PPA',
    summary: '외부 발전소 → 망 경유 전력 공급',
    points: [
      '발전사가 외부에 발전소 설치',
      '망 경유 전력 공급',
      '24/7 CFE 매칭률 산출',
      '다수 발전사 후보 제안',
      '5/10/15/20년 장기 계약',
    ],
    steps: ['신청 접수', '공급사업자 매칭', '승인 대기', '매칭 완료'],
  },
]

const REVENUE = [
  {
    tag: 'LEASE',
    label: 'Lease PPA',
    formula: '월 발전량(kWh) × 설비 임대 단가',
    note: '발전량 비례 청구 — 발전사가 직접 청구·정산',
  },
  {
    tag: 'DIRECT',
    label: '직접 PPA',
    formula: '월 거래량(kWh) × 단가차익(원/kWh)',
    note: '전기 공급사업자가 발전사 → 수용가 단가 차익을 마진으로 가져감',
  },
  {
    tag: 'SELF-GEN',
    label: '태양광 자가 설치',
    formula: '거래 없음 — 모니터링 운영 수수료(예시)',
    note: '거래·정산 없이 발전소·사용 관리 대행 + 발전량 모니터링 제공',
  },
]

const TIMELINE = [
  { no: '1', title: '설명 및 시연', desc: '오늘 자리' },
  { no: '2', title: '의견 전달 및 수렴', desc: '부서별 피드백 취합' },
  { no: '3', title: '기획 수정 및 검토', desc: '의견 반영 → 기획 보강' },
  { no: '4', title: '개발', desc: '확정 기획 기반 개발' },
]

const REQUESTS = [
  {
    dept: '스마트플랫폼사업본부',
    color: 'red',
    items: ['사용자 흐름의 일관성', 'UX 컴포넌트', '성능 및 확장성'],
  },
  {
    dept: 'AX 사업본부',
    color: 'red',
    items: ['사용자 흐름의 일관성', 'UX 컴포넌트', '성능 및 확장성'],
  },
  {
    dept: '경영전략본부',
    color: 'gray',
    items: [
      '세금계산서 발행 절차 및 국세청 연동',
      '전기 공급사업자 마진 회계 처리 및 법인세 영향',
      '정산 사이클의 타당성',
      '부가세 처리 등 회계',
      '감사 추적 및 법정 보존',
    ],
  },
]

const deck: Deck = {
  meta: {
    slug: 'rmsppt260513',
    title: '울산 에너지 자급자족 플랫폼',
    date: '2026-05-13',
    description: '페르소나 · PPA 거래 · 앞으로의 방향',
    tags: ['Ulsan', 'PPA', 'Platform'],
  },
  slides: [
    /* 1. 표지 */
    <CoverSlide
      title="울산 에너지 자급자족 플랫폼"
      author=""
      team=""
      date="2026.05.13"
    />,

    /* 2. 목차 */
    <TocSlide items={TOC} pageNumber={2} />,

    /* 3. I. 배경 — 1. 현재 거래 구조 (As-Is) */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">I. 배경</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        1. 현재 거래 구조 (As-Is)
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-8 mb-6">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {/* 발전사 */}
          <div className="flex flex-col items-center gap-1 min-w-24">
            <div className="size-20 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '3rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">발전사</p>
          </div>

          {/* arrow: 발전사 ↔ 한전 */}
          <div className="flex flex-col items-center px-1">
            <p className="text-sm text-gray-600">매입·지급</p>
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.75rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 한전 — 강조 */}
          <div className="flex flex-col items-center gap-1 min-w-28">
            <div className="size-24 rounded-2xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '3.5rem' }}
              >
                bolt
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">한전</p>
            <p className="text-sm text-gray-500">일괄 매입·재판매</p>
          </div>

          {/* arrow: 한전 ↔ 수용가 (양방향) */}
          <div className="flex flex-col items-center px-1">
            <p className="text-sm text-gray-600">판매·잉여 매입</p>
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.75rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 수용가 */}
          <div className="flex flex-col items-center gap-1 min-w-24">
            <div className="size-20 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '3rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">수용가</p>
            <p className="text-sm text-gray-500">구매·잉여 판매</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
        <p className="text-base text-gray-700">
          <strong>모든 거래가 한전을 거친다</strong> — 발전사·수용가 모두
          한전과만 거래. 수용가는 자가발전 잉여 전기를 한전에 매각할 수 있다.
        </p>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        3
      </p>
    </div>,

    /* 4. I. 배경 — 2. RE100 시대 (RE100 이행 필요) */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">I. 배경</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        2. RE100 시대 — RE100 이행이 필요하다
      </h2>

      <div className="rounded-2xl border border-red-200 bg-red-50/30 p-8 mb-6">
        <div className="flex items-center justify-center gap-1 flex-wrap mb-4">
          {/* 발전사 */}
          <div className="flex flex-col items-center gap-1 min-w-24 opacity-50">
            <div className="size-20 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center">
              <span
                className="material-symbols-outlined text-gray-500"
                style={{ fontSize: '3rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-700 text-sm">발전사</p>
          </div>

          <div className="flex flex-col items-center px-1 opacity-50">
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.75rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 한전 */}
          <div className="flex flex-col items-center gap-1 min-w-28 opacity-50">
            <div className="size-24 rounded-2xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '3.5rem' }}
              >
                bolt
              </span>
            </div>
            <p className="font-bold text-gray-700 text-sm">한전</p>
          </div>

          <div className="flex flex-col items-center px-1 opacity-50">
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.75rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 수용가 */}
          <div className="flex flex-col items-center gap-1 min-w-24">
            <div className="size-20 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '3rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">수용가</p>
            <p className="text-sm text-gray-500">RE100 미이행</p>
          </div>

          {/* BLOCKED arrow — RE100 인증 차단 */}
          <div className="flex flex-col items-center px-2">
            <p className="text-sm font-bold text-red-600 mb-0.5">RE100 인증</p>
            <div className="relative inline-flex items-center justify-center">
              <span
                className="material-symbols-outlined text-red-300"
                style={{ fontSize: '2rem' }}
              >
                arrow_forward
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-7 rounded-full bg-red-600 text-white text-base font-black flex items-center justify-center shadow-md">
                  ✕
                </div>
              </div>
            </div>
            <p className="text-sm font-bold text-red-600">불가</p>
          </div>

          {/* RE100 인증 목표 */}
          <div className="flex flex-col items-center gap-1 min-w-24 opacity-70">
            <div className="size-20 rounded-2xl border-2 border-dashed border-red-400 bg-red-50/50 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-red-400"
                style={{ fontSize: '3rem' }}
              >
                verified
              </span>
            </div>
            <p className="font-bold text-red-600 text-sm">RE100 인증</p>
            <p className="text-sm text-red-500">신재생 100%</p>
          </div>
        </div>
        <p className="text-center text-base text-red-700 font-semibold">
          한전 일반 전기로는 신재생 사용 증명 불가 → RE100 이행·인증 불가
        </p>
      </div>

      {/* 경고 배너 */}
      <div className="bg-red-600 text-white rounded-2xl px-6 py-4 mb-3 flex items-start gap-4 shadow-md">
        <span
          className="material-symbols-outlined shrink-0 mt-0.5"
          style={{ fontSize: '2.5rem' }}
        >
          warning
        </span>
        <div className="flex-1">
          <p className="font-black text-xl mb-1">
            RE100 이행이 의무화된다
          </p>
          <p className="text-base text-white/90">
            글로벌 기업이 협력사에 RE100 이행을 요구 —
            <strong> 한전 일반 전기로는 이행 불가</strong>
          </p>
        </div>
      </div>

      {/* RE100 시각 분해 */}
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          {/* 좌측 — 시각적 분해 */}
          <div className="shrink-0">
            <p className="text-sm font-semibold tracking-widest text-gray-400 mb-2 text-center">
              RE100 =
            </p>
            <div className="flex items-baseline gap-3 justify-center">
              <div className="text-center">
                <span className="text-4xl font-black text-brand">RE</span>
                <p className="text-sm text-gray-500 mt-1">재생에너지</p>
              </div>
              <span className="text-3xl font-bold text-gray-300">+</span>
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span
                    className="font-black text-brand"
                    style={{ fontSize: '3rem', lineHeight: 1 }}
                  >
                    100
                  </span>
                  <span className="text-3xl font-bold text-brand">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">전부 충당</p>
              </div>
            </div>
          </div>

          {/* 우측 — 의미 */}
          <div className="flex-1 border-l border-gray-200 pl-6">
            <p className="font-bold text-gray-900 text-lg mb-1">
              Renewable Electricity 100%
            </p>
            <p className="text-base text-gray-500">
              기업이 사용하는 전력 <strong>전부를 재생에너지로 충당</strong> —
              한전 일반 전기는 모든 발전원이 섞여 있어 신재생 사용 증명이 어려움
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        4
      </p>
    </div>,

    /* 5. I. 배경 — 3. To-Be (새 거래 구조) */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">I. 배경</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        3. 새 거래 구조 (To-Be)
      </h2>

      <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 mb-3">
        {/* 메인 — 발전사 ↔ 플랫폼 ↔ 수용가 (화살표 아래에 한전·KPX 위치) */}
        <div className="grid grid-cols-[auto_9rem_auto_9rem_auto] gap-y-1 items-center justify-center justify-items-center">
          {/* 발전사 */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-24 rounded-2xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '3.5rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">발전사</p>
            <p className="text-sm text-emerald-700">신재생 발전</p>
          </div>

          {/* arrow ↔ (발전사 ↔ 플랫폼) */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-brand font-semibold mb-0.5">계약</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '2.5rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 플랫폼 (전기 공급사업자) */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-28 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '4rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">플랫폼</p>
            <p className="text-sm text-brand">전기 공급사업자</p>
          </div>

          {/* arrow ↔ (플랫폼 ↔ 수용가) */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-brand font-semibold mb-0.5">계약</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '2.5rem' }}
            >
              swap_horiz
            </span>
          </div>

          {/* 수용가 */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-24 rounded-2xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '3.5rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">수용가</p>
            <p className="text-sm text-amber-700">RE100 이행</p>
          </div>

          {/* Row 2: 한전·KPX 아래로 (화살표 아래 칸) */}
          <div />

          {/* 한전 (발전사 ↔ 플랫폼 화살표 아래) */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.5rem' }}
            >
              north
            </span>
            <div className="size-14 rounded-xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-gray-700"
                style={{ fontSize: '1.75rem' }}
              >
                bolt
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">한전</p>
          </div>

          <div />

          {/* 한전·KPX (플랫폼 ↔ 수용가 화살표 아래) */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.5rem' }}
            >
              north
            </span>
            <div className="flex items-center gap-1">
              <div className="size-14 rounded-xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-gray-700"
                  style={{ fontSize: '1.75rem' }}
                >
                  bolt
                </span>
              </div>
              <div className="size-14 rounded-xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-gray-700"
                  style={{ fontSize: '1.75rem' }}
                >
                  account_balance
                </span>
              </div>
            </div>
            <p className="font-bold text-gray-900 text-sm">한전 · KPX</p>
          </div>

          <div />
        </div>
      </div>

      {/* SPC = 다중 연결 허브 → 페르소나 다양함 */}
      <div className="rounded-2xl border border-red-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="material-symbols-outlined text-brand"
            style={{ fontSize: '1.75rem' }}
          >
            hub
          </span>
          <p className="font-bold text-gray-900 text-lg">
            전기 공급사업자 = 다중 연결 허브 (한전 단일 창구와 다름)
          </p>
        </div>

        {/* SPC가 묶는 주체들 */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          {[
            { icon: 'solar_power', label: '발전사들' },
            { icon: 'factory', label: '수용가들' },
            { icon: 'handshake', label: '컨설턴트' },
            { icon: 'construction', label: '시공사 (EPC)' },
            { icon: 'shield', label: '관리자' },
            { icon: 'dvr', label: 'RMS' },
          ].map((e) => (
            <div
              key={e.label}
              className="rounded-xl bg-red-50/60 border border-red-100 px-2 py-2 text-center"
            >
              <span
                className="material-symbols-outlined text-brand"
                style={{ fontSize: '1.5rem' }}
              >
                {e.icon}
              </span>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {e.label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-base text-gray-700 leading-relaxed">
          수용가가 RE100 합당한 발전소·컨설팅·시공·관리 주체를 직접 다 찾을
          필요 없음 — 전기 공급사업자가 매칭·정산하고, 한전 거치는 수수료도 제거
          (당근마켓처럼 직거래) →
          <strong className="text-brand">
            {' '}
            여러 주체가 묶이니 페르소나가 5종으로 다양함
          </strong>
        </p>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        5
      </p>
    </div>,

    /* 6. II. 페르소나 — 페르소나 표 (컨설턴트 = 독립 / 용역사 2종) */
    <div className="relative w-full min-h-full px-8 md:px-12 py-10">
      <p className="text-base text-gray-500 mb-2">II. 페르소나</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        페르소나
      </h2>

      <div className="rounded-2xl border border-gray-100 overflow-hidden mb-4">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-80">
                페르소나
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                플랫폼 사용 장점
              </th>
            </tr>
          </thead>
          <tbody>
            {PERSONAS.flatMap((p) => {
              // 컨설턴트는 parent + 독립·용역사 sub-rows (2뎁스)
              if (p.tag === 'Consultant') {
                return [
                  {
                    ...p,
                    _key: `${p.tag}-parent`,
                    _isParent: true as boolean,
                    _isChild: false as boolean,
                  },
                  ...CONSULTANT_TYPES.map((sub) => ({
                    ...p,
                    short: sub.short,
                    label: sub.label,
                    desc: sub.desc,
                    benefit: sub.benefit,
                    _key: `${p.tag}-${sub.short}`,
                    _isParent: false as boolean,
                    _isChild: true as boolean,
                  })),
                ]
              }
              return [
                {
                  ...p,
                  _key: p.tag,
                  _isParent: false as boolean,
                  _isChild: false as boolean,
                },
              ]
            }).map((row, i, arr) => {
              const color = PERSONA_COLOR[row.tag]
              return (
                <tr
                  key={row._key}
                  className={
                    'align-top ' +
                    (i < arr.length - 1 ? 'border-b border-gray-100' : '') +
                    (row._isParent || row._isChild ? ' bg-violet-50/30' : '')
                  }
                >
                  <td className="px-4 py-2.5">
                    {row._isChild ? (
                      <div className="pl-6 flex items-center gap-2">
                        <span className="text-violet-400 text-base">↳</span>
                        <span className="size-2.5 rounded-full bg-violet-500 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {row.label}
                          </p>
                          <p className="text-sm text-gray-500">{row.desc}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            'size-3 rounded-full shrink-0 ' +
                            (color?.badge ?? 'bg-brand')
                          }
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {row.label}
                          </p>
                          <p className="text-sm text-gray-500">{row.desc}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-base text-gray-700">
                    {row._isParent ? (
                      <span className="text-sm text-violet-600 italic">
                        ↓ 하위 2종 (독립 · 용역사)
                      </span>
                    ) : (
                      row.benefit
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 컨설턴트 ecosystem — 관리자 outer frame, 컨설팅 위에서 SPC로, 발전사·수용가는 가로 (기존 그대로) */}
      <div className="relative rounded-2xl border-2 border-slate-400 bg-slate-50/40 p-5 pt-8 mt-6">
        {/* 플랫폼 관리자 outer label */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-500 text-white px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '1rem' }}
          >
            shield
          </span>
          <p className="font-bold text-sm">플랫폼 관리자</p>
        </div>

        {/* 컨설팅 (위, violet) */}
        <div className="flex justify-center mb-1">
          <div className="flex flex-col items-center gap-1">
            <div className="size-16 rounded-2xl bg-violet-500 text-white flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '2.25rem' }}
              >
                support_agent
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">컨설팅</p>
            <p className="text-sm text-violet-700">독립 · 용역사</p>
          </div>
        </div>

        {/* ↓ 컨설팅 → SPC */}
        <div className="flex justify-center mb-2">
          <span
            className="material-symbols-outlined text-violet-500"
            style={{ fontSize: '1.5rem' }}
          >
            south
          </span>
        </div>

        {/* 메인 가로 흐름 — 발전사 ↔ SPC ↔ 수용가 (5p와 동일 grid 구조) */}
        <div className="grid grid-cols-[auto_8rem_auto_8rem_auto] items-center justify-center justify-items-center">
          {/* 발전사 (emerald) */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-16 rounded-2xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '2.25rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">발전사</p>
            <p className="text-sm text-emerald-700">신재생 발전</p>
          </div>

          {/* arrow ↔ 직거래 */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-brand font-semibold">직거래</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '2rem' }}
            >
              swap_horiz
            </span>
            <p className="text-sm text-gray-500">재생E전기</p>
          </div>

          {/* SPC (brand) */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-20 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '2.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">전기 공급사업자</p>
            <p className="text-sm text-brand">매칭·정산</p>
          </div>

          {/* arrow ↔ 직거래 */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-brand font-semibold">직거래</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '2rem' }}
            >
              swap_horiz
            </span>
            <p className="text-sm text-gray-500">재생E전기</p>
          </div>

          {/* 수용가 (amber) */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-16 rounded-2xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shadow-sm">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '2.25rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">수용가</p>
            <p className="text-sm text-amber-700">RE100 이행</p>
          </div>
        </div>

        {/* 색상 범례 */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-3 text-sm">
          <span className="text-gray-400">표 ↔ 그림 매칭:</span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-emerald-500" /> 발전사
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-amber-500" /> 수용가
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-violet-500" /> 컨설턴트
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-brand" /> 전기 공급사업자
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-full bg-slate-500" /> 관리자
          </span>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        6
      </p>
    </div>,

    /* 7. II. Lease PPA · 직접 PPA · 자가 설치 — 한눈에 3종 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">
        III. Lease PPA · 직접 PPA · 자가 설치
      </p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        3가지 형태
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Lease PPA — violet 톤 (Lease 강조) */}
        <div className="rounded-2xl border-2 border-violet-300 bg-violet-50/50 px-5 py-4 flex flex-col shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="inline-block text-sm font-bold tracking-widest text-white bg-violet-500 px-3 py-1 rounded-full shadow-sm">
              {TRADES[0].tag}
            </p>
            <p className="text-sm text-violet-600 font-semibold">
              {TRADES[0].analogy}
            </p>
          </div>
          <p className="font-bold text-gray-900 text-xl mb-1">
            {TRADES[0].title}
          </p>
          <p className="text-base text-gray-700">{TRADES[0].summary}</p>
        </div>

        {/* 직접 PPA — brand red 톤 (제일 강조) */}
        <div className="rounded-2xl border-2 border-red-300 bg-red-50/60 px-5 py-4 flex flex-col shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="inline-block text-sm font-bold tracking-widest text-white bg-brand px-3 py-1 rounded-full shadow-sm">
              {TRADES[1].tag}
            </p>
            <p className="text-sm text-brand font-semibold">
              {TRADES[1].analogy}
            </p>
          </div>
          <p className="font-bold text-gray-900 text-xl mb-1">
            {TRADES[1].title}
          </p>
          <p className="text-base text-gray-700 mb-3">{TRADES[1].summary}</p>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            {DIRECT_SUB.map((sub) => (
              <div
                key={sub.tag}
                className="rounded-xl border-2 border-red-200 bg-white px-3 py-2 shadow-sm"
              >
                <p className="inline-block text-sm font-bold tracking-widest text-white bg-brand px-2 py-0.5 rounded-full mb-1">
                  {sub.tag}
                </p>
                <p className="font-bold text-gray-900 text-sm">{sub.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 태양광 자가 설치 — slate 톤 (거래 X) */}
        <div className="rounded-2xl border-2 border-slate-300 bg-slate-50/60 px-5 py-4 flex flex-col shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="inline-block text-sm font-bold tracking-widest text-white bg-slate-500 px-3 py-1 rounded-full shadow-sm">
              {TRADES[2].tag}
            </p>
            <p className="text-sm text-slate-600 font-semibold">
              {TRADES[2].analogy}
            </p>
          </div>
          <p className="font-bold text-gray-900 text-xl mb-1">
            {TRADES[2].title}
          </p>
          <p className="text-base text-gray-700 mb-3">{TRADES[2].summary}</p>

          <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-500 text-sm text-white w-fit shadow-sm">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '1rem' }}
            >
              monitor_heart
            </span>
            <span className="font-bold">거래 X · 모니터링 ✓</span>
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        7
      </p>
    </div>,

    /* 8. II. Lease PPA 상세 — 4단계 프로세스만 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">
        III. Lease PPA · 직접 PPA · 자가 설치
      </p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        1. Lease PPA (Onsite Lease)
      </h2>

      <div className="space-y-3">
        {/* Step 1: 수용가 → 전기 공급사업자 (전력 요청) */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-brand text-white font-black flex items-center justify-center shrink-0 shadow-md">
            1
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-gray-700 font-semibold">전력 요청</p>
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
          </div>
        </div>

        {/* Step 2: 전기 공급사업자 → 컨설팅 (시공 요청) */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-brand text-white font-black flex items-center justify-center shrink-0 shadow-md">
            2
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-violet-700 font-semibold">시공 요청</p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl bg-violet-500 text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                support_agent
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">컨설팅 (시공사)</p>
              <p className="text-sm text-violet-700">독립 · 용역사</p>
            </div>
          </div>
        </div>

        {/* Step 3: 컨설팅 → 발전사 (수용가 부지에 설치) */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-brand text-white font-black flex items-center justify-center shrink-0 shadow-md">
            3
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl bg-violet-500 text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                support_agent
              </span>
            </div>
            <p className="font-bold text-gray-900">컨설팅 (시공사)</p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-emerald-700 font-semibold">
              수용가 부지에 설치
            </p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사</p>
          </div>
        </div>

        {/* Step 4: 발전사 = 수용가 (같은 entity) */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-brand text-white font-black flex items-center justify-center shrink-0 shadow-md">
            4
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-violet-300 bg-violet-50/40 px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사</p>
            <span className="text-3xl font-black text-violet-600">=</span>
            <p className="text-base text-violet-700 font-bold">같은 entity</p>
            <span className="text-3xl font-black text-violet-600">=</span>
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
          </div>
        </div>
      </div>

      {/* 핵심 메시지 — 발전사 = 수용가 */}
      <div className="mt-4 rounded-2xl bg-violet-50 border-2 border-violet-300 px-5 py-3 shadow-sm">
        <p className="text-base text-gray-800">
          <strong className="text-violet-700">
            ※ Lease PPA에서는 발전사 = 수용가
          </strong>
          {' — '}
          수용가 부지에 설비가 설치되어 <strong>수용가가 발전사 역할도 함</strong>
        </p>
      </div>

      {/* 계약 구조 — 매월 약정 임대료 · 5/10/15/20년 단위 */}
      <div className="mt-2 rounded-2xl bg-red-50 border-2 border-red-300 px-5 py-3 shadow-sm">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-brand shrink-0 mt-0.5"
            style={{ fontSize: '1.75rem' }}
          >
            schedule
          </span>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-base mb-1">
              매월 약정 임대료 — 계약{' '}
              <span className="text-brand">5 / 10 / 15 / 20년</span> 단위
            </p>
            <p className="text-sm text-gray-700">
              <strong className="text-brand">매월 고정 금액 지급</strong>{' '}
              — 계약 체결 시 연차별 임대료가 전체 확정되어 전달 (효율 감소율
              N%/년 반영해 연차별 산정)
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        8
      </p>
    </div>,

    /* 9. II. 직접 PPA 상세 — Onsite/Offsite 각 4단계 프로세스 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-10">
      <p className="text-base text-gray-500 mb-2">
        III. Lease PPA · 직접 PPA · 자가 설치
      </p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        2. 직접 PPA
      </h2>

      {/* A. Onsite PPA — Lease PPA 스타일 동일 */}
      <p className="text-base font-bold text-emerald-700 mb-1">
        A. Onsite PPA — 3단계
      </p>
      <p className="text-sm text-gray-500 mb-3">
        발전사가 수용가 부지에 발전소 설치 + 전력 전량 공급
      </p>

      <div className="space-y-3 mb-6">
        {/* Step 1: 수용가 → 신청 접수 → 전기 공급사업자 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            1
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-emerald-700 font-semibold">
              신청 접수
            </p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
          </div>
        </div>

        {/* Step 2: 전기 공급사업자 → 발전사 매칭 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            2
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-emerald-700 font-semibold">
              발전사 매칭
            </p>
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사 후보</p>
          </div>
        </div>

        {/* Step 3: 발전사 ↔ 계약 ↔ 수용가 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            3
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사</p>
            <span className="text-3xl font-black text-emerald-600">↔</span>
            <p className="text-base text-emerald-700 font-bold">
              계약 체결 · 전력 공급
            </p>
            <span className="text-3xl font-black text-emerald-600">↔</span>
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
          </div>
        </div>
      </div>

      {/* B. Offsite PPA */}
      <p className="text-base font-bold text-violet-700 mb-1">
        B. Offsite PPA — 4단계
      </p>
      <p className="text-sm text-gray-500 mb-3">
        외부 발전소·망 경유 · 1:N · N:1 매칭 / 5~20년 장기
      </p>

      <div className="space-y-3">
        {/* Step 1 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-violet-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            1
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-violet-700 font-semibold">
              신청 접수 (용량·계약기간)
            </p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-violet-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            2
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '1.75rem' }}
              >
                hub
              </span>
            </div>
            <p className="font-bold text-gray-900">전기 공급사업자</p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <p className="text-base text-violet-700 font-semibold">
              공급사업자 매칭
            </p>
            <span
              className="material-symbols-outlined text-violet-500"
              style={{ fontSize: '1.5rem' }}
            >
              arrow_forward
            </span>
            <div className="flex items-center -space-x-2">
              <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-emerald-700"
                  style={{ fontSize: '1.75rem' }}
                >
                  solar_power
                </span>
              </div>
              <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-emerald-700"
                  style={{ fontSize: '1.75rem' }}
                >
                  solar_power
                </span>
              </div>
            </div>
            <p className="font-bold text-gray-900">다수 발전사 후보</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-violet-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            3
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
            <span className="text-3xl font-black text-violet-600">↔</span>
            <p className="text-base text-violet-700 font-semibold">
              승인 대기 (5/10/15/20년 단가)
            </p>
            <span className="text-3xl font-black text-violet-600">↔</span>
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-violet-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
            4
          </div>
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-violet-300 bg-violet-50/50 px-4 py-3 shadow-sm">
            <div className="size-12 rounded-xl border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-emerald-700"
                style={{ fontSize: '1.75rem' }}
              >
                solar_power
              </span>
            </div>
            <p className="font-bold text-gray-900">발전사</p>
            <span className="text-3xl font-black text-violet-600">→</span>
            <p className="text-base text-violet-700 font-bold">
              매칭 완료 · 망 경유 전력 공급
            </p>
            <span className="text-3xl font-black text-violet-600">→</span>
            <div className="size-12 rounded-xl border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-amber-700"
                style={{ fontSize: '1.75rem' }}
              >
                factory
              </span>
            </div>
            <p className="font-bold text-gray-900">수용가</p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        9
      </p>
    </div>,

    /* 10. III. 비즈니스 모델 — 공급사업자 마진 구조 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">IV. 비즈니스 모델</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        공급사업자 마진 = 단가 차익
      </h2>

      {/* 마진 산식 */}
      <div className="rounded-2xl border-2 border-red-200 bg-red-50/30 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap text-base font-bold">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50">
            <span
              className="material-symbols-outlined text-amber-700"
              style={{ fontSize: '1.5rem' }}
            >
              factory
            </span>
            <span className="text-gray-900">수용가 청구액</span>
          </div>
          <span className="text-3xl font-black text-brand">−</span>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50">
            <span
              className="material-symbols-outlined text-emerald-700"
              style={{ fontSize: '1.5rem' }}
            >
              solar_power
            </span>
            <span className="text-gray-900">발전사업자 지급액</span>
          </div>
          <span className="text-3xl font-black text-brand">−</span>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-50">
            <span
              className="material-symbols-outlined text-gray-700"
              style={{ fontSize: '1.5rem' }}
            >
              receipt_long
            </span>
            <span className="text-gray-900">각종 수수료·부가세</span>
          </div>
          <span className="text-3xl font-black text-brand">=</span>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand text-white shadow-md">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '1.5rem' }}
            >
              hub
            </span>
            <span>공급사업자 마진</span>
          </div>
        </div>
      </div>

      <p className="text-base text-gray-500 mb-2 font-semibold tracking-widest">
        모델별 매출식
      </p>
      <div className="space-y-2">
        {REVENUE.map((r) => (
          <div
            key={r.tag}
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 shadow-sm"
          >
            <div className="md:w-48 shrink-0 flex items-center gap-2">
              <p className="inline-block text-sm font-bold tracking-widest text-brand bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                {r.tag}
              </p>
              <p className="font-bold text-gray-900 text-base">{r.label}</p>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">{r.formula}</p>
              <p className="text-sm text-gray-500">{r.note}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        10
      </p>
    </div>,

    /* 11. IV. As-Is / To-Be — 페르소나별 화면 재구성 (컨설턴트 = 독립·용역사 2종) */
    <div className="relative w-full min-h-full px-12 md:px-20 py-12">
      <p className="text-base text-gray-500 mb-2">V. As-Is / To-Be</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
        가시성·기능을 페르소나별로 재구성
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* As-Is */}
        <div className="rounded-2xl border-2 border-gray-300 bg-gray-50/60 p-5 shadow-sm">
          <p className="inline-block text-sm font-bold tracking-widest text-gray-600 bg-white px-3 py-1 rounded-full mb-4 border-2 border-gray-300">
            AS-IS · 모두 같은 화면
          </p>

          {/* 페르소나 5개 + 컨설턴트 2종 = 6개 dot */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {PERSONAS.flatMap((p) => {
              if (p.tag === 'Consultant') {
                return CONSULTANT_TYPES.map((sub) => ({
                  ...p,
                  short: sub.short,
                  _key: `${p.tag}-${sub.short}`,
                }))
              }
              return [{ ...p, _key: p.tag }]
            }).map((row) => (
              <div
                key={row._key}
                className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white border-2 border-gray-300 text-sm font-bold text-gray-600"
              >
                <span
                  className={
                    'size-2.5 rounded-full shrink-0 ' +
                    (PERSONA_COLOR[row.tag]?.badge ?? 'bg-brand')
                  }
                />
                {row.short}
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-2">
            <span
              className="material-symbols-outlined text-gray-400"
              style={{ fontSize: '1.75rem' }}
            >
              south
            </span>
          </div>

          <div className="rounded-xl border-2 border-gray-300 bg-white px-4 py-5 text-center">
            <p className="text-sm font-bold tracking-widest text-gray-400 mb-1">
              SHARED PAGE
            </p>
            <p className="font-bold text-gray-700 text-lg">공통 페이지 1개</p>
            <p className="text-sm text-gray-500 mt-1">
              모든 역할이 동일 화면 — 필요 없는 메뉴까지 노출
            </p>
          </div>
        </div>

        {/* To-Be */}
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-5 shadow-sm">
          <p className="inline-block text-sm font-bold tracking-widest text-brand bg-white px-3 py-1 rounded-full mb-4 border-2 border-red-200">
            TO-BE · 역할별 전용 화면
          </p>

          <div className="space-y-1.5">
            {PERSONAS.flatMap((p) => {
              if (p.tag === 'Consultant') {
                return CONSULTANT_TYPES.map((sub) => ({
                  ...p,
                  short: sub.short,
                  label: sub.label,
                  _key: `${p.tag}-${sub.short}`,
                  _isChild: true,
                }))
              }
              return [{ ...p, _key: p.tag, _isChild: false }]
            }).map((row) => {
              const color = PERSONA_COLOR[row.tag]
              return (
                <div key={row._key} className="flex items-center gap-2">
                  <div
                    className={
                      'flex items-center gap-1.5 px-2.5 h-8 min-w-32 rounded-full text-white text-xs font-bold shrink-0 ' +
                      (color?.badge ?? 'bg-brand')
                    }
                  >
                    {row._isChild && (
                      <span className="text-white/80">↳</span>
                    )}
                    <span>{row.short}</span>
                  </div>
                  <span
                    className="material-symbols-outlined text-brand"
                    style={{ fontSize: '1.25rem' }}
                  >
                    arrow_forward
                  </span>
                  <div className="flex-1 rounded-lg bg-white border-2 border-red-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                    {row.label} 전용 페이지
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-sm text-gray-600 mt-3 text-center">
            각 역할이 자기 일에 필요한 메뉴·기능만 노출
          </p>
        </div>
      </div>

      {/* 색상 범례 (페르소나 표·그림과 동일) */}
      <div className="flex items-center justify-center gap-3 flex-wrap mt-4 text-sm">
        <span className="text-gray-400">색상 매칭:</span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-emerald-500" /> 발전사
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-amber-500" /> 수용가
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-violet-500" /> 컨설턴트
          (독립·용역사)
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-brand" /> 전기 공급사업자
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-full bg-slate-500" /> 관리자
        </span>
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        11
      </p>
    </div>,

    /* 12. V. 일정 */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">VI. 일정</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        타임라인
      </h2>

      <ol className="space-y-4">
        {TIMELINE.map((step) => (
          <li key={step.no} className="flex gap-4 items-start">
            <span className="size-12 rounded-full bg-brand text-white font-bold flex items-center justify-center shrink-0 text-xl">
              {step.no}
            </span>
            <div className="flex-1 pt-1">
              <p className="font-bold text-gray-900 text-xl">{step.title}</p>
              <p className="text-base text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        12
      </p>
    </div>,

    /* 13. VII. Q&A */
    <div className="relative w-full min-h-full px-12 md:px-20 py-16">
      <p className="text-base text-gray-500 mb-2">VII. Q&amp;A</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
        부서별 요청 항목
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REQUESTS.map((r) => (
          <div
            key={r.dept}
            className={
              'rounded-2xl px-5 py-4 ' +
              (r.color === 'red'
                ? 'border border-red-100 bg-red-50/30'
                : 'border border-gray-100 bg-white')
            }
          >
            <p
              className={
                'inline-block text-sm font-semibold tracking-widest px-2.5 py-1 rounded-full mb-2 border ' +
                (r.color === 'red'
                  ? 'text-brand bg-white border-red-100'
                  : 'text-gray-600 bg-white border-gray-200')
              }
            >
              {r.dept}
            </p>
            <ul className="space-y-1.5">
              {r.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-base text-gray-700"
                >
                  <span className="material-symbols-outlined text-brand text-base shrink-0">
                    check_circle
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="absolute bottom-3 right-6 text-sm text-gray-500 font-medium">
        13
      </p>
    </div>,

    /* 14. 마무리 */
    <ThankYouSlide email="" pageNumber={14} />,
  ],
}

export default deck
