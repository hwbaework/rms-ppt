import type { Deck } from '../data/types'
import { Fragment, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

// 에너지 자급자족 플랫폼 — 프로세스 맵 (페이지형, PPT 아님)
// 기존 단독 HTML 목업을 네이티브 React 로 변환. 3모드(전체/페르소나별/중복진단)는 useState 로 전환.
// 디자인 CSS 는 .ppm 루트로 스코프해 앱 전역에 영향 없음.

type ColorKey =
  | 'generator'
  | 'consumer'
  | 'consultant'
  | 'spc'
  | 'admin'
  | 'agency'

type Color = { a: string; soft: string; line: string; ring: string }

const C: Record<ColorKey, Color> = {
  generator: { a: '#10b981', soft: '#eafaf3', line: '#bfe9d4', ring: 'rgba(16,185,129,.18)' },
  consumer: { a: '#f59e0b', soft: '#fff7ea', line: '#f3d79a', ring: 'rgba(245,158,11,.18)' },
  consultant: { a: '#8b5cf6', soft: '#f3effe', line: '#ddd0fb', ring: 'rgba(139,92,246,.18)' },
  spc: { a: '#0ea5e9', soft: '#e9f7fe', line: '#bfe6f7', ring: 'rgba(14,165,233,.18)' },
  admin: { a: '#64748b', soft: '#f1f3f7', line: '#d7dce5', ring: 'rgba(100,116,139,.18)' },
  agency: { a: '#6366f1', soft: '#eef0fe', line: '#cdd2fb', ring: 'rgba(99,102,241,.18)' },
}

const JPHASES = [
  { n: '01', t: '온보딩·구축', h: '1·2차년도 · 설비 설치' },
  { n: '02', t: '발전 개시', h: '3차년도~ · 자원별 가동' },
  { n: '03', t: '매칭·계약', h: '수요 ↔ 공급 연결' },
  { n: '04', t: '거래·공급', h: '전력 흐름' },
  { n: '05', t: '정산·세금', h: '대금 흐름' },
  { n: '06', t: '이행·증빙', h: 'RE100 · ESG' },
]

type Cell = {
  a: string
  r?: string
  main?: boolean
  c?: string
  ho?: string
  planned?: boolean
} | null
type Lane = { key: ColorKey; icon?: string; name?: string; sub: string; cells: Cell[] }

const JLANES: Lane[] = [
  {
    key: 'admin', icon: '🛡️', name: '관리자', sub: '거버넌스 (전 과정 감독)', cells: [
      { a: '기업 초대 · 승인 · 역할 부여', r: '/platform/approvals', main: true },
      { a: '발전소 · SPC 등록 승인', r: '/platform/companies' },
      { a: '계약 · 매칭 승인', r: '/platform/trading' },
      { a: '전체 거래 모니터링', r: '/platform/trading', main: true },
      { a: '정산 감사', r: '/platform/audit-logs' },
      { a: '감사 로그 · 통제', r: '/platform/audit-logs', main: true },
    ],
  },
  {
    key: 'consumer', sub: '고객', cells: [
      { a: '가입 · RE100 무료진단 신청', r: '/consulting/diagnosis', ho: '컨설턴트', main: true },
      null,
      { a: '제안 검토 → 발전원·계약유형 선택', r: '/ppa/contracts', c: '발전원·계약', main: true },
      { a: '전력 사용', r: '/consumer/usage', main: true },
      { a: '전기요금 납부 (부족 시 부족내역)', r: '/ppa/billing/*', main: true },
      { a: 'RE100/ESG 증빙 수령', r: '/consumer/re100', main: true },
    ],
  },
  {
    key: 'consultant', name: '컨설턴트 (독립)', sub: '진단·기획·인증', cells: [
      { a: 'RE100 진단 수행 · 시공 용역사 위탁', r: '/consulting/diagnosis', ho: '용역사', main: true },
      null,
      { a: '발전사 ↔ 수용가 매칭 · 제안 발송', planned: true, ho: '발전사' },
      null,
      { a: '컨설팅 수익 정산', r: '/consultant/earnings' },
      { a: 'RE100 인증 지원', r: '/consulting/*' },
    ],
  },
  {
    key: 'agency', icon: '🏗️', name: '용역사 (용역)', sub: '시공·설치·유지보수', cells: [
      { a: '발전설비 시공 · 설치 (위탁 수행)', r: '/consulting/agency', main: true },
      { a: '설치 완료 · 시운전', r: '/consulting/agency', main: true },
      null,
      null,
      { a: '시공비 정산', r: '/consulting/settlement' },
      { a: '유지보수 · A/S', r: '/consulting/agency' },
    ],
  },
  {
    key: 'spc', name: '전기공급사업자 (SPC)', sub: '기설립 · 중개·정산', cells: [
      { a: '발전소 등록 · 계통 연계 관리', r: '/platform/companies' },
      { a: '발전 자원 운영 · O&M', r: '/platform/lease/*', main: true },
      { a: 'PPA 매칭·중개', r: '/platform/ppa/status', main: true },
      { a: '전력 중개 · 발전량 예측 vs 실측', r: '/platform/ppa/forecast', c: '정상/부족/초과', main: true },
      { a: '통합 정산 · 세금계산서 발행', r: '/platform/ppa/billing/*', main: true },
      { a: '거래 증빙 지원', r: '/ppa/documents/*' },
    ],
  },
  {
    key: 'generator', sub: '발전·공급', cells: [
      { a: '발전소 구축 · 자원 등록', r: '/generator/ppa/resources/register', c: '자원유형', main: true },
      { a: '준공 → 발전 개시', r: '/monitoring/plant', main: true },
      { a: '계약 체결', r: '/generator/ppa/contracts', main: true },
      { a: '전력 생산 · 공급', r: '/generator/trading', main: true },
      { a: '판매대금 정산', r: '/generator/ppa/revenue/invoices', c: '수익모델', main: true },
      { a: 'REC 발급 · 보고서', r: '/ppa/documents/evidence', main: true },
    ],
  },
]

type UFlow = { n: string; h: string; d: string; r: string }
type FlowNode =
  | { type: 'step'; tag?: string; t: string; d: string; planned?: boolean }
  | { type: 'decision'; q: string; branches: { l: string; d: string; cls?: string }[] }
  | { type: 'output'; t: string; d: string; ref?: string }
type Persona = {
  key: ColorKey
  icon: string
  name: string
  en: string
  actor: string
  userflow: UFlow[]
  flow: FlowNode[]
}

const PERSONAS: Persona[] = [
  {
    key: 'generator', icon: '🏭', name: '발전사업자', en: 'generator',
    actor: '롯데SK에너루트(연료전지) · 에스에너지/한일실리콘(태양광) · 울산미포ORC발전1호',
    userflow: [
      { n: 'STEP 1', h: '발전소 등록', d: '자원(발전소)·용량·자원유형 등록', r: '/generator/ppa/resources/register' },
      { n: 'STEP 2', h: '발전 모니터링', d: '실시간 발전량·예측 vs 실측 확인', r: '/monitoring/plant' },
      { n: 'STEP 3', h: '수익 분석', d: '자원유형별 단가·수익 추이 확인', r: '/generator/ppa/revenue/analytics' },
      { n: 'STEP 4', h: '정산 확인', d: '월별 정산 내역·세금계산서 발행', r: '/generator/ppa/revenue/invoices' },
      { n: 'STEP 5', h: '이행·증빙', d: 'REC 발급·보고서 제출', r: '/ppa/documents/evidence' },
    ],
    flow: [
      { type: 'step', tag: '시작', t: '발전소(자원) 등록', d: '자원관리에서 발전소·용량 등록' },
      { type: 'decision', q: '자원 유형은?', branches: [
        { l: '연료전지', d: 'SMP + 2.2 REC 가중치(≈239원/kWh) · CHPS' },
        { l: '태양광', d: '직접 PPA(140원/kWh) 또는 자가소비형' },
        { l: 'ORC', d: '전력공급 SPC(≈100원/kWh · 7,920h/년)' },
      ] },
      { type: 'step', t: '전력 생산 → 정산', d: '생산전력 판매 매출 정산 → SPC 운영비 활용' },
      { type: 'output', t: '세금계산서 → 이행증빙', d: 'REC 발급 · 보고서 산출', ref: '/generator/ppa/*' },
    ],
  },
  {
    key: 'consumer', icon: '🏢', name: '수용가', en: 'consumer',
    actor: '산단 입주 수요기업 — 한국단조 · 무진네트워크 · 성림첨단산업 등',
    userflow: [
      { n: 'STEP 1', h: 'RE100 진단 신청', d: '무료 진단으로 자급 가능성 확인', r: '/consulting/diagnosis' },
      { n: 'STEP 2', h: '사용량 분석', d: '전력 사용량·패턴 확인', r: '/consumer/usage' },
      { n: 'STEP 3', h: '에너지 계약', d: '발전원(태양광·연료전지·ORC) + 계약유형 선택', r: '/consumer/contracts' },
      { n: 'STEP 4', h: '요금 확인', d: '요금·정산 내역, 부족분 확인', r: '/consumer/billing' },
      { n: 'STEP 5', h: 'RE100/ESG', d: '재생에너지 사용 증빙 수령', r: '/consumer/re100' },
    ],
    flow: [
      { type: 'step', tag: '시작', t: 'RE100 무료 진단', d: '컨설팅 진단으로 자급 가능성 확인' },
      { type: 'decision', q: '자가발전이 가능한가?', branches: [
        { l: '가능', d: '자가소비형 태양광 설치', cls: 'ok' },
        { l: '불가', d: '마켓플레이스 → 컨설턴트 제안 받기' },
      ] },
      { type: 'decision', q: '어떤 발전원과 계약? (자원유형)', branches: [
        { l: '태양광', d: '계약 3종 → Lease PPA · 직접 PPA · 자가 설치' },
        { l: '연료전지', d: '24시간 안정 발전 · SMP+REC' },
        { l: 'ORC', d: '폐열 기반 발전 · 전력공급' },
      ] },
      { type: 'decision', q: '태양광 계약 유형은? (3종)', branches: [
        { l: 'Lease PPA', d: '설비 임대형 · 발전량 비례 청구 (발전사=수용가)' },
        { l: '직접 PPA', d: '발전사 직접계약 · Onsite/Offsite · 5~20년' },
        { l: '자가 설치', d: '자가 소유·자가소비 · 모니터링만' },
      ] },
      { type: 'step', t: '전력 사용 → 요금/정산', d: '사용량 분석 · 요금 내역' },
      { type: 'decision', q: '사용량이 계약량 대비?', branches: [
        { l: '부족', d: '사용량 부족 내역 처리', cls: 'no' },
        { l: '충족', d: '정상 정산', cls: 'ok' },
      ] },
      { type: 'output', t: 'RE100 / ESG 증빙 발급', d: '재생에너지 사용 인증', ref: '/consumer/*' },
    ],
  },
  {
    key: 'consultant', icon: '👤', name: '컨설턴트', en: 'consultant',
    actor: '서울에너지인프라개발센터 · 제일에코플랫폼 (에너지 컨설팅 · RE100 진단/인증)',
    userflow: [
      { n: 'STEP 1', h: '신규 의뢰 수신', d: '수용가의 컨설팅/진단 의뢰 접수', r: '/consulting/consulting-requests' },
      { n: 'STEP 2', h: 'RE100 진단 수행', d: '진단 결과 회신 · 사업 기획', r: '/consulting/diagnosis' },
      { n: 'STEP 3', h: '고객·프로젝트 관리', d: '진행 상황 추적', r: '/consultant/clients' },
      { n: 'STEP 4', h: '시공 용역 위탁', d: '용역사에 시공 위탁·관리', r: '/consulting/agency' },
      { n: 'STEP 5', h: '수익·정산', d: '성사 건 수익 정산', r: '/consultant/earnings' },
    ],
    flow: [
      { type: 'step', tag: 'INBOUND', t: '신규 의뢰 수신', d: '수용가의 컨설팅/진단 의뢰 접수' },
      { type: 'decision', q: '소속 유형은? (user.agencyId)', branches: [
        { l: '용역사 소속', d: '수익/제안/추천 메뉴 숨김 → 용역 작업만', cls: 'no' },
        { l: '독립', d: '전체 메뉴 노출', cls: 'ok' },
      ] },
      { type: 'step', t: 'RE100 진단 · 컨설팅 수행', d: '진단 결과 회신 · 사업 기획' },
      { type: 'step', planned: true, t: '발전사↔수용가 매칭 · 제안 발송', d: '현재 컨설턴트 역할 아님 — 추후 공통 기능으로 편입 예정' },
      { type: 'step', t: '시공 용역사 위탁 · 프로젝트 관리', d: '용역사에 시공 위탁 · 진행 관리' },
      { type: 'output', t: 'RE100 인증 지원 → 수익 정산', d: '성사 건 정산·수익 관리', ref: '/consulting/*' },
    ],
  },
  {
    key: 'agency', icon: '🏗️', name: '용역사', en: 'agency',
    actor: '시공 위탁받는 용역사 — 발전설비 시공·설치·유지보수 (독립 컨설턴트의 위탁 수행)',
    userflow: [
      { n: 'STEP 1', h: '용역 수신', d: '독립 컨설턴트의 시공 위탁 접수', r: '/consulting/agency' },
      { n: 'STEP 2', h: '견적·일정', d: '시공 견적·설치 일정 산출', r: '/consulting/agency' },
      { n: 'STEP 3', h: '시공·설치', d: '발전설비 설치·시운전', r: '/consulting/agency' },
      { n: 'STEP 4', h: '진행 보고', d: '시공 진행률 보고', r: '/consulting/agency' },
      { n: 'STEP 5', h: '시공비 정산', d: '사업비 집행 정산', r: '/consulting/settlement' },
    ],
    flow: [
      { type: 'step', tag: 'INBOUND', t: '시공 용역 수신', d: '독립 컨설턴트의 시공 위탁 접수' },
      { type: 'step', t: '견적 · 일정 산출', d: '시공 견적·설치 일정 작성' },
      { type: 'decision', q: '작업 유형은?', branches: [
        { l: '신규 시공', d: '발전설비 신규 설치 (태양광/연료전지/ORC)' },
        { l: '유지보수', d: '기설치 설비 A/S·유지보수' },
      ] },
      { type: 'step', t: '설치 · 시운전', d: '발전설비 설치 → 시운전' },
      { type: 'decision', q: '준공 검수 결과는?', branches: [
        { l: '합격', d: '준공 → 운영 전환(SPC)', cls: 'ok' },
        { l: '보완', d: '재시공·보완 조치', cls: 'no' },
      ] },
      { type: 'output', t: '시공비 정산', d: '사업비 집행으로 정산', ref: '/consulting/settlement' },
    ],
  },
  {
    key: 'spc', icon: '⚡', name: '전기공급사업자', en: 'spc',
    actor: '울산미포ORC발전1호 + 자원별 SPC (기설립) — SPC 총괄운영·PPA 직접거래',
    userflow: [
      { n: 'STEP 1', h: '거래 현황', d: '발전사·수요기업 거래 이력 (4탭)', r: '/platform/ppa/status' },
      { n: 'STEP 2', h: '매칭·배분', d: '시간단위 매칭 · 우선순위·알고리즘 감사', r: '/platform/ppa/status' },
      { n: 'STEP 3', h: '발전량 예측', d: '예측 vs 실측 오차율', r: '/platform/ppa/forecast' },
      { n: 'STEP 4', h: '정산 처리', d: '잠정→확정 · 분쟁·재정산', r: '/platform/ppa/billing/settlement' },
      { n: 'STEP 5', h: '세금계산서·마진', d: '세금계산서 발행 + SPC 마진 추적', r: '/platform/ppa/billing/tax-invoice' },
    ],
    flow: [
      { type: 'step', tag: '운영', t: '거래 현황 모니터링', d: '발전사 거래·수요기업 거래·매칭이력·SPC마진 (4탭)' },
      { type: 'step', t: '시간단위 매칭 · 배분', d: '우선순위·알고리즘 적용 · 매칭 로그 감사' },
      { type: 'decision', q: '매칭 결과는?', branches: [
        { l: '정상', d: '약정대로 공급', cls: 'ok' },
        { l: '부족', d: '미달분 처리 · 분쟁', cls: 'no' },
        { l: '초과', d: '초과분 처리' },
      ] },
      { type: 'decision', q: '정산 상태는?', branches: [
        { l: '잠정', d: '검토 대기' },
        { l: '확정', d: '세금계산서 발행', cls: 'ok' },
        { l: '분쟁/재정산', d: '수정세금계산서', cls: 'no' },
      ] },
      { type: 'output', t: '세금계산서 발행 · SPC 마진 추적', d: '청구액−지급액=마진 (관리자 전용)', ref: '/platform/ppa/status' },
    ],
  },
  {
    key: 'admin', icon: '🛡️', name: '관리자', en: 'admin',
    actor: 'RMS(주관) · 에스앤아이코퍼레이션 · 이아디공간 (플랫폼 총괄·통합관제)',
    userflow: [
      { n: 'STEP 1', h: '기업 승인', d: '가입 신청 기업 심사·승인', r: '/platform/approvals' },
      { n: 'STEP 2', h: '사용자·역할', d: '사용자 등록·권한 부여', r: '/platform/users' },
      { n: 'STEP 3', h: '기업 초대', d: '신규 산단 기업 초대', r: '/platform/invitations' },
      { n: 'STEP 4', h: '거래 모니터링', d: '전체 거래·운영 감시', r: '/platform/trading' },
      { n: 'STEP 5', h: '감사 로그', d: '전 활동 감사·통제', r: '/platform/audit-logs' },
    ],
    flow: [
      { type: 'step', tag: '시작', t: '기업 초대', d: '산단 기업 온보딩 초대 발송' },
      { type: 'decision', q: '가입 승인하는가?', branches: [
        { l: '승인', d: '역할 부여 단계로', cls: 'ok' },
        { l: '거절', d: '반려 처리', cls: 'no' },
      ] },
      { type: 'step', t: '역할 부여 (6종 페르소나)', d: 'generator/consumer/consultant/agency/spc/admin' },
      { type: 'step', t: '권한 매핑', d: '역할·권한 설정' },
      { type: 'output', t: '플랫폼 이용 → 감사 로그 통제', d: '전 활동 감사·통제', ref: '/platform/*' },
    ],
  },
]

/* 커스텀 CSS 변수를 포함한 style 헬퍼 */
const vars = (o: Record<string, string>) => o as CSSProperties

/* ── 전체 프로세스 (유저 저니) ── */
function Journey() {
  return (
    <div className="journey">
      <div className="jgrid">
        <div className="jcorner">주체 ＼ 단계</div>
        {JPHASES.map((p) => (
          <div className="jph" key={p.n}>
            <div className="pn">PHASE {p.n}</div>
            <div className="pt">{p.t}</div>
            <div className="phh">{p.h}</div>
          </div>
        ))}
        {JLANES.map((lane) => {
          const c = C[lane.key]
          const pn = PERSONAS.find((x) => x.key === lane.key)
          const icon = lane.icon || pn?.icon || ''
          const name = lane.name || pn?.name || lane.key
          return (
            <Fragment key={lane.key}>
              <div
                className="jlabel"
                style={{ background: c.soft, borderColor: c.line, color: c.a }}
              >
                <span className="le">{icon} {name}</span>
                <span className="ls">{lane.sub}</span>
              </div>
              {lane.cells.map((cell, i) => {
                if (!cell) return <div className="jcell empty" key={i} />
                return (
                  <div
                    key={i}
                    className={`jcell ${cell.main ? 'main' : ''} ${cell.planned ? 'planned' : ''}`}
                    style={vars({ '--lane': c.a })}
                  >
                    <div className="ca">{cell.a}</div>
                    {cell.planned && <span className="cf">★ 추후 · 공통 기능</span>}
                    {cell.c && <span className="cc">◇ {cell.c}</span>}
                    {cell.r && cell.r !== '—' && <span className="cr">{cell.r}</span>}
                    {cell.ho && (
                      <span className="cho" style={{ color: 'var(--violet)' }}>
                        ↘ {cell.ho}로 핸드오프
                      </span>
                    )}
                  </div>
                )
              })}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function OverallView() {
  return (
    <section>
      <div className="ov">
        <h2>전체 프로세스 — 엔드투엔드 유저 저니</h2>
        <div className="sub">
          세로축 = 주체(레인), 가로축 = 6단계 여정. 각 칸은 그 주체가 그 단계에서 하는
          행동·화면·분기입니다. <b>굵은 테두리</b>=주 경로(happy path),{' '}
          <span style={{ color: 'var(--violet)', fontWeight: 700 }}>↘ 핸드오프</span>=다음
          주체로 넘김.
        </div>

        <Journey />

        <div className="jlegend">
          <span className="li">
            <span className="b" style={{ boxShadow: 'inset 0 0 0 2px var(--green)' }} />
            주 경로 (굵은 테두리 = 해당 레인 색)
          </span>
          <span className="li">
            <span
              className="b empty"
              style={{ background: 'repeating-linear-gradient(135deg,#fafbfd,#fafbfd 4px,#f3f5f8 4px,#f3f5f8 8px)' }}
            />
            해당 단계 미참여
          </span>
          <span className="li">
            <span className="cc" style={{ position: 'static' }}>분기</span>발생 지점
          </span>
          <span className="li">
            <span style={{ color: 'var(--violet)', fontWeight: 800 }}>↘</span> 주체 간 핸드오프
          </span>
          <span className="li">
            <span
              className="b"
              style={{ background: 'repeating-linear-gradient(135deg,#fbfaff,#fbfaff 4px,#f1eefe 4px,#f1eefe 8px)', border: '1px dashed var(--violet)' }}
            />
            추후 공통 기능 (현재 미적용)
          </span>
        </div>

        <div className="ovgrid">
          <div className="mini">
            <h4><span className="d" style={{ background: 'var(--green)' }} />자원별 수익 모델</h4>
            <div className="rev">
              <div className="revrow">
                <span className="tagm" style={{ background: '#eafaf3', color: '#0b7a52' }}>연료전지</span>
                <b>SMP+REC</b><span className="f">SMP + 2.2 REC 가중치 (≈239원/kWh) · CHPS</span>
              </div>
              <div className="revrow">
                <span className="tagm" style={{ background: '#eff4ff', color: '#2563eb' }}>태양광</span>
                <b>PPA/자가</b><span className="f">직접 PPA(140원/kWh) 또는 자가소비형</span>
              </div>
              <div className="revrow">
                <span className="tagm" style={{ background: '#e9f7fe', color: '#0277b6' }}>ORC</span>
                <b>전력공급</b><span className="f">전력공급 SPC(≈100원/kWh · 7,920h/년)</span>
              </div>
            </div>
          </div>
          <div className="mini">
            <h4><span className="d" style={{ background: 'var(--violet)' }} />ESG 에너지 플랫폼 4모듈 = 화면 도메인</h4>
            <div className="rev">
              <div className="revrow"><span className="tagm" style={{ background: '#f3effe', color: '#7c3aed' }}>RE100</span><span className="f">컨설팅·인증·교육 → <b>/consulting · /consumer/re100</b></span></div>
              <div className="revrow"><span className="tagm" style={{ background: '#fff7ea', color: '#b4730a' }}>E-데이터</span><span className="f">데이터마켓·카본거래·온실가스 → <b>/e-data · /carbon</b></span></div>
              <div className="revrow"><span className="tagm" style={{ background: '#e9f7fe', color: '#0277b6' }}>분산E중개</span><span className="f">시뮬레이션·인증·VPP → <b>/vpp</b></span></div>
              <div className="revrow"><span className="tagm" style={{ background: '#f1f3f7', color: '#475067' }}>통합관제</span><span className="f">모니터링·안전 DSOP → <b>/monitoring · /dt</b></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 페르소나별 ── */
function UserFlow({ p }: { p: Persona }) {
  if (!p.userflow) return null
  return (
    <div className="uflow">
      <div className="ut">▤ 유저 플로우 (실제 화면 단계)</div>
      <div className="usteps">
        {p.userflow.map((s, i) => (
          <div className="ustep" key={i}>
            <div className="un">{s.n}</div>
            <div className="uh">{s.h}</div>
            <div className="ud">{s.d}</div>
            <div className="ur">{s.r}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Flow({ p }: { p: Persona }) {
  return (
    <div className="flow">
      {p.flow.map((n, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div className="node">
              <div
                className={`conn${n.type === 'decision' || p.flow[i - 1].type === 'decision' ? '' : ' short'}`}
              />
            </div>
          )}
          <div className="node">
            {n.type === 'step' && (
              <div className={`step ${n.planned ? 'planned' : ''}`}>
                <div className="st-t">
                  {n.tag && <span className="tag">{n.tag}</span>}
                  {n.t}
                  {n.planned && <span className="pbadge">★ 추후·공통</span>}
                </div>
                <div className="st-d">{n.d}</div>
              </div>
            )}
            {n.type === 'decision' && (
              <div className="decision">
                <div className="dq"><span className="dia" />{n.q}</div>
                <div className="branches">
                  {n.branches.map((b, bi) => (
                    <div className={`branch ${b.cls || ''}`} key={bi}>
                      <div className="bl"><span className="arrow">▸</span>{b.l}</div>
                      <div className="bd">{b.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {n.type === 'output' && (
              <div className="endcap">
                <div className="ec-t">{n.t}</div>
                <div className="ec-d">
                  {n.d}
                  {n.ref && <span className="pageref">{n.ref}</span>}
                </div>
              </div>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function PersonaView({
  active,
  setActive,
}: {
  active: ColorKey
  setActive: (k: ColorKey) => void
}) {
  const p = PERSONAS.find((x) => x.key === active)!
  const c = C[active]
  return (
    <section>
      <nav className="tabs">
        {PERSONAS.map((pp) => {
          const cc = C[pp.key]
          const isActive = pp.key === active
          return (
            <div
              key={pp.key}
              className={`tab${isActive ? ' active' : ''}`}
              style={isActive ? vars({ '--accent': cc.a, '--accent-ring': cc.ring }) : undefined}
              onClick={() => setActive(pp.key)}
            >
              <span className="ic" style={{ background: cc.soft, color: cc.a }}>{pp.icon}</span>
              <span>
                <span className="tt">{pp.name}</span>
                <br />
                <span className="ts">{pp.en}</span>
              </span>
            </div>
          )
        })}
      </nav>

      <div className="grid">
        <main
          className="board"
          style={vars({
            '--accent': c.a,
            '--accent-soft': c.soft,
            '--accent-line': c.line,
            '--accent-ring': c.ring,
          })}
        >
          <div className="board-head">
            <div className="ic" style={{ background: c.soft, color: c.a }}>{p.icon}</div>
            <div>
              <h2>
                {p.name}{' '}
                <span style={{ color: c.a, fontSize: 13, fontWeight: 700 }}>{p.en}</span>
              </h2>
              <div className="sub">유저 플로우 + 프로세스 흐름</div>
            </div>
          </div>
          <div className="actor"><b>담당 주체</b> · {p.actor}</div>
          <UserFlow p={p} />
          <Flow p={p} />
        </main>

        <aside className="side">
          <div className="card">
            <h3><span className="dot" />주요 분기 포인트</h3>
            <div className="cond c-a"><div className="ct">발전 자원 유형</div><div className="cv">연료전지(39.6MW) / 태양광(5.1MW) / ORC</div></div>
            <div className="cond c-b"><div className="ct">수익 모델</div><div className="cv">SMP+2.2REC·CHPS / 직접PPA·자가소비 / 전력공급SPC</div></div>
            <div className="cond c-d"><div className="ct">거래 방식 (태양광 3종)</div><div className="cv">Lease PPA / 직접 PPA(Onsite·Offsite) / 자가 설치</div></div>
          </div>
          <div className="card">
            <h3><span className="dot" style={{ background: 'var(--green)' }} />출처 · 3차년도 사업계획서</h3>
            <div className="src">· 추진체계 및 역할분담 (p77–78)<br />· 수익금 발생 계획 (p58–59)<br />· 수요기업 확보 방안 (p62)<br />· 사업 후 유지운영·SPC (p39–40)</div>
          </div>
        </aside>
      </div>
    </section>
  )
}

/* ── 중복 진단 ── */
function DiagView() {
  return (
    <section>
      <div className="diag">
        <div className="dcard">
          <h2>① 현재 구조 — 장단점</h2>
          <div className="ds">페르소나마다 대시보드가 따로 있는 현재 멀티 대시보드 구조의 평가 (실제 페이지 분석 기준)</div>
          <div className="pc">
            <div className="pcol pro">
              <h4>👍 장점</h4>
              <ul>
                <li><b>페르소나 맥락 최적화</b> — 각 역할이 자기 업무에 필요한 위젯만 봄</li>
                <li><b>권한 경계 명확</b> — SPC 마진 등 민감정보를 관리자 전용 페이지에 격리</li>
                <li><b>장애 격리·독립 배포</b> — 한 페이지 변경이 다른 곳에 영향 적음</li>
                <li><b>역할별 딥링크</b> — URL로 특정 화면 직접 진입 가능</li>
              </ul>
            </div>
            <div className="pcol con">
              <h4>👎 단점 (중복이 핵심)</h4>
              <ul>
                <li><b>위젯 중복 구현</b> — 발전량·수익·RE100·발전소 상태가 여러 대시보드에 각각 구현 → 유지보수 N배</li>
                <li><b>100% 복사본 존재</b> — <span className="loc mirror">/platform/lease/dashboard</span> 는 <span className="loc">/lease/dashboard</span> 리다이렉트(완전 중복)</li>
                <li><b>데이터 정의 불일치 위험</b> — 같은 "이번달 발전량"이 페이지마다 다르게 계산될 수 있음</li>
                <li><b>탐색 혼란</b> — 발전사업자는 발전량을 3곳에서 봄 (어디가 정답?)</li>
                <li><b>라우트 트리 복제</b> — /lease/* ↔ /platform/lease/*, /generator/ppa/* ↔ /platform/ppa/*</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="dcard">
          <h2>② 중복 위젯 — 어디에 몇 번 노출되나</h2>
          <div className="ds">같은(또는 거의 같은) 위젯이 서로 다른 대시보드에 반복 노출되는 지점</div>
          <table className="dup">
            <thead><tr><th>위젯</th><th>중복</th><th>노출 위치 (페이지)</th><th>영향 페르소나</th></tr></thead>
            <tbody>
              <tr><td>발전량 KPI·추이 차트</td><td><span className="dupn hi">5</span></td><td><span className="loc">/dashboard</span><span className="loc">/generator/ppa/dashboard</span><span className="loc">/lease/dashboard</span><span className="loc">/consumer</span><span className="loc">/spc</span></td><td>발전사·수용가·SPC</td></tr>
              <tr><td>발전소 상태 보드(테이블)</td><td><span className="dupn mid">3</span></td><td><span className="loc">/dashboard</span><span className="loc">/consumer</span><span className="loc">/lease/dashboard</span></td><td>발전사·수용가</td></tr>
              <tr><td>CFE 매칭률</td><td><span className="dupn mid">3</span></td><td><span className="loc">/dashboard</span><span className="loc">/platform/ppa/dashboard</span><span className="loc">/platform/ppa/status</span></td><td>발전사·SPC·관리자</td></tr>
              <tr><td>수익·금액 KPI</td><td><span className="dupn mid">3</span></td><td><span className="loc">/dashboard</span><span className="loc">/generator/ppa/dashboard</span><span className="loc">/consultant</span></td><td>발전사·컨설턴트</td></tr>
              <tr><td>거래량·거래 추이</td><td><span className="dupn mid">3</span></td><td><span className="loc">/spc</span><span className="loc">/platform/ppa/dashboard</span><span className="loc">/platform/ppa/status</span></td><td>SPC·관리자</td></tr>
              <tr><td>절감액 KPI</td><td><span className="dupn mid">2</span></td><td><span className="loc">/consumer</span><span className="loc">/lease/dashboard</span></td><td>수용가</td></tr>
              <tr><td>RE100 달성률</td><td><span className="dupn mid">2</span></td><td><span className="loc">/consumer</span><span className="loc">/lease/dashboard</span></td><td>수용가</td></tr>
              <tr><td>Lease 대시보드 전체</td><td><span className="dupn hi">2</span></td><td><span className="loc">/lease/dashboard</span><span className="loc mirror">/platform/lease/dashboard (100% 복사)</span></td><td>수용가·SPC·관리자</td></tr>
            </tbody>
          </table>
        </div>

        <div className="dcard">
          <h2>③ 페르소나별 중복 노출</h2>
          <div className="ds">각 역할이 로그인 후 보게 되는 대시보드 개수와, 그 사이에서 겹치는 위젯</div>
          <div className="pdup">
            <div className="prow"><div className="ic" style={{ background: '#eafaf3', color: '#10b981' }}>🏭</div><div style={{ flex: 1 }}><div className="nm">발전사업자 <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 대시보드 3개</span></div><div className="dd"><span className="loc">/dashboard</span><span className="loc">/generator/ppa/dashboard</span><span className="loc">/lease/dashboard</span> → <b>발전량 KPI · 발전추이 차트 · 발전소 상태 보드</b>가 3중 중복</div></div><span className="badge b-hi">중복 高</span></div>
            <div className="prow"><div className="ic" style={{ background: '#fff7ea', color: '#f59e0b' }}>🏢</div><div style={{ flex: 1 }}><div className="nm">수용가 <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 대시보드 2개</span></div><div className="dd"><span className="loc">/consumer</span><span className="loc">/lease/dashboard</span> → <b>절감액 · RE100 · 발전추이 · 발전소 상태 보드</b>가 2중 중복</div></div><span className="badge b-mid">중복 中</span></div>
            <div className="prow"><div className="ic" style={{ background: '#e9f7fe', color: '#0ea5e9' }}>⚡</div><div style={{ flex: 1 }}><div className="nm">전기공급사업자 (SPC) <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 화면 4개</span></div><div className="dd"><span className="loc">/spc</span><span className="loc">/platform/ppa/dashboard</span><span className="loc">/platform/ppa/status</span><span className="loc">/platform/lease/dashboard</span> → <b>거래량 · 발전량 · CFE 매칭률</b> 중복</div></div><span className="badge b-hi">중복 高</span></div>
            <div className="prow"><div className="ic" style={{ background: '#f1f3f7', color: '#64748b' }}>🛡️</div><div style={{ flex: 1 }}><div className="nm">관리자 <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 화면 3개+</span></div><div className="dd"><span className="loc">/platform</span><span className="loc">/platform/ppa/dashboard</span><span className="loc mirror">/platform/lease/dashboard</span> → <b>Lease 대시보드 100% 복제</b> + 거래·발전 위젯 중복</div></div><span className="badge b-hi">중복 高</span></div>
            <div className="prow"><div className="ic" style={{ background: '#f3effe', color: '#8b5cf6' }}>👤</div><div style={{ flex: 1 }}><div className="nm">컨설턴트 <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 대시보드 2개</span></div><div className="dd"><span className="loc">/consultant</span><span className="loc">/consulting</span> → <b>프로젝트 · 고객 현황</b> 부분 중복</div></div><span className="badge b-lo">중복 低</span></div>
            <div className="prow"><div className="ic" style={{ background: '#eef0fe', color: '#6366f1' }}>🏗️</div><div style={{ flex: 1 }}><div className="nm">용역사 <span style={{ color: '#8a92a6', fontSize: 11, fontWeight: 600 }}>· 전용 대시보드 없음</span></div><div className="dd">현재 전용 대시보드 없이 컨설팅 하위로 운영 → 중복은 없으나 <b>신규 정의 필요</b></div></div><span className="badge b-lo">신규</span></div>
          </div>
        </div>

        <div className="dcard">
          <h2>④ 제안 — 대시보드 1개로 통합 (사용자 UX 기준)</h2>
          <div className="ds">단일 <b>/dashboard</b> 진입 → 로그인 역할(persona)에 따라 위젯이 자동 구성되는 구조</div>
          <div className="unify">
            <div className="ucol before">
              <h4>AS-IS · 멀티 대시보드</h4>
              <ul>
                <li>페르소나마다 대시보드 2~4개</li>
                <li>발전량·수익·RE100 위젯을 페이지마다 각각 구현</li>
                <li>/platform/* 미러 라우트로 화면 복제</li>
                <li>데이터 계산 로직이 페이지마다 흩어짐</li>
                <li><b>사용자</b>: "내 발전량"을 보려고 3개 화면을 도는 혼란</li>
              </ul>
            </div>
            <div className="uarrow">→</div>
            <div className="ucol after">
              <h4>TO-BE · 단일 대시보드</h4>
              <ul>
                <li>진입점 <b>/dashboard</b> 1개 — persona로 위젯 조합만 분기</li>
                <li>공통 위젯 1회 구현: <b>KpiCard · 발전추이Chart · 발전소상태Table · RE100Card · CFE매칭Card</b></li>
                <li>페르소나별 "위젯 레이아웃 config"만 선언 → 한 곳에서 관리</li>
                <li>민감 위젯(SPC 마진)은 <b>role-gate</b>로 표시 제어</li>
                <li><b>사용자</b>: 한 화면에서 내 업무 흐름이 끝남 (단일 진실 공급원)</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-2)', background: '#eff4ff', border: '1px solid #cfe0ff', borderRadius: 10, padding: '11px 14px' }}>
            <b style={{ color: 'var(--primary)' }}>UX 효과</b> — 인지 부하 감소 · 일관성 · 단일 진실 공급원 · 점진적 노출. <b>개발 효과</b> — 위젯 1개 = 1곳 구현, 데이터 정의 단일화, 신규 페르소나(용역사)는 config 한 줄 추가.
          </div>
        </div>
      </div>
    </section>
  )
}

const CSS = `
.ppm{position:fixed;inset:0;z-index:50;overflow:auto;
  --bg:#f6f7f9; --panel:#fff; --line:#e7e9ee; --line-strong:#d4d8e0;
  --ink:#0f1729; --ink-2:#475067; --ink-3:#8a92a6;
  --primary:#2563eb; --amber:#f59e0b; --green:#10b981; --red:#ef4444; --violet:#8b5cf6; --sky:#0ea5e9; --slate:#64748b;
  --amber-soft:#fff7ea;
  --shadow:0 1px 2px rgba(16,23,41,.04), 0 4px 16px rgba(16,23,41,.06);
  --radius:14px;
  background:var(--bg);color:var(--ink);
  font-family:'Pretendard Variable','Pretendard','Malgun Gothic',-apple-system,'Segoe UI',sans-serif;
  -webkit-font-smoothing:antialiased;line-height:1.5}
.ppm *{box-sizing:border-box}
.ppm .wrap{max-width:1320px;margin:0 auto;padding:0 24px}

.ppm header.topbar{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.85);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.ppm .topbar-in{display:flex;align-items:center;gap:14px;height:62px}
.ppm .logo{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.02em;color:inherit;text-decoration:none}
.ppm .logo .spark{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;
  background:linear-gradient(135deg,#2563eb,#10b981);color:#fff;font-size:15px}
.ppm .logo small{display:block;font-size:11px;font-weight:600;color:var(--ink-3)}
.ppm .topbar .spacer{flex:1}
.ppm .pill{font-size:12px;color:var(--ink-2);border:1px solid var(--line);background:#fff;padding:5px 11px;border-radius:999px;text-decoration:none}
.ppm a.pill:hover{border-color:var(--line-strong)}

.ppm .hero{padding:28px 0 6px}
.ppm .hero h1{margin:0 0 6px;font-size:25px;font-weight:800;letter-spacing:-.03em}
.ppm .hero p{margin:0;color:var(--ink-2);font-size:14px;max-width:820px}

.ppm .modebar{display:flex;gap:8px;margin:20px 0 4px;align-items:center}
.ppm .seg{display:inline-flex;background:#eceef2;border-radius:12px;padding:4px;gap:4px}
.ppm .seg button{border:0;background:transparent;cursor:pointer;font:inherit;font-weight:700;
  font-size:13.5px;color:var(--ink-2);padding:8px 16px;border-radius:9px;display:flex;align-items:center;gap:7px;transition:.15s}
.ppm .seg button.on{background:#fff;color:var(--ink);box-shadow:var(--shadow)}

.ppm .tabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px}
.ppm .tab{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;background:#fff;
  border:1px solid var(--line);border-radius:12px;padding:9px 13px;transition:.15s}
.ppm .tab:hover{border-color:var(--line-strong);transform:translateY(-1px)}
.ppm .tab .ic{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:15px;flex:none}
.ppm .tab .tt{font-weight:700;font-size:13px;letter-spacing:-.01em}
.ppm .tab .ts{font-size:10.5px;color:var(--ink-3)}
.ppm .tab.active{box-shadow:0 0 0 3px var(--accent-ring);border-color:var(--accent)}
.ppm .tab.active .tt{color:var(--accent)}

.ppm .ov{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);
  padding:26px 28px 30px;margin:16px 0 50px}
.ppm .ov h2{margin:0 0 4px;font-size:19px;font-weight:800;letter-spacing:-.02em}
.ppm .ov .sub{font-size:13px;color:var(--ink-3);margin-bottom:18px}

.ppm .journey{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fbfcfe;padding:12px}
.ppm .jgrid{display:grid;grid-template-columns:128px repeat(6,minmax(158px,1fr));gap:8px;min-width:1080px}
.ppm .jph{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 11px}
.ppm .jph .pn{font-size:11px;font-weight:800;color:var(--primary)}
.ppm .jph .pt{font-weight:800;font-size:13px;margin-top:1px}
.ppm .jph .phh{font-size:10.5px;color:var(--ink-3);margin-top:2px}
.ppm .jcorner{display:flex;align-items:flex-end;font-size:11px;font-weight:700;color:var(--ink-3);padding:0 4px 6px}
.ppm .jlabel{display:flex;flex-direction:column;justify-content:center;gap:3px;border-radius:10px;padding:8px 11px;border:1px solid;font-weight:800}
.ppm .jlabel .le{font-size:13px} .ppm .jlabel .ls{font-size:10px;opacity:.7;font-weight:700}
.ppm .jcell{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 10px;min-height:70px;
  display:flex;flex-direction:column;gap:4px;position:relative}
.ppm .jcell.empty{background:repeating-linear-gradient(135deg,#fafbfd,#fafbfd 6px,#f3f5f8 6px,#f3f5f8 12px);border:1px dashed var(--line)}
.ppm .jcell .ca{font-weight:700;font-size:12px;line-height:1.35;color:var(--ink)}
.ppm .jcell .cr{font-size:9.5px;color:var(--ink-3);font-family:ui-monospace,monospace;border:1px solid var(--line);border-radius:5px;padding:0 5px;align-self:flex-start}
.ppm .jcell .cc{font-size:9.5px;font-weight:800;color:#b4730a;background:var(--amber-soft);border:1px solid #f3d79a;border-radius:999px;padding:1px 7px;align-self:flex-start}
.ppm .jcell .cho{font-size:9.5px;font-weight:800;align-self:flex-start;margin-top:auto;display:flex;align-items:center;gap:3px}
.ppm .jcell.main{box-shadow:inset 0 0 0 2px var(--lane)}
.ppm .jcell.planned{background:repeating-linear-gradient(135deg,#fbfaff,#fbfaff 7px,#f1eefe 7px,#f1eefe 14px);border:1px dashed var(--violet);box-shadow:none}
.ppm .jcell.planned .ca{color:var(--violet);font-style:italic}
.ppm .jcell .cf{font-size:9px;font-weight:800;color:#fff;background:var(--violet);border-radius:999px;padding:1px 7px;align-self:flex-start}

.ppm .jlegend{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-top:12px;font-size:11.5px;color:var(--ink-2)}
.ppm .jlegend .li{display:flex;align-items:center;gap:6px}
.ppm .jlegend .b{width:22px;height:14px;border-radius:5px;border:1px solid var(--line);display:inline-block}

.ppm .ovgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
@media(max-width:820px){.ppm .ovgrid{grid-template-columns:1fr}}

.ppm .mini{border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:#fff}
.ppm .mini h4{margin:0 0 10px;font-size:13px;font-weight:800;display:flex;align-items:center;gap:7px}
.ppm .mini h4 .d{width:7px;height:7px;border-radius:99px}
.ppm .rev{display:flex;flex-direction:column;gap:8px}
.ppm .revrow{display:flex;gap:10px;align-items:baseline;font-size:12.5px}
.ppm .revrow b{flex:none;width:62px;font-weight:700}
.ppm .revrow .f{color:var(--ink-2)}
.ppm .tagm{font-size:10px;font-weight:700;padding:1px 7px;border-radius:999px;flex:none}

.ppm .grid{display:grid;grid-template-columns:1fr 312px;gap:22px;padding:10px 0 60px;align-items:start}
@media(max-width:980px){.ppm .grid{grid-template-columns:1fr}}
.ppm .board{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px 26px 30px}
.ppm .board-head{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.ppm .board-head .ic{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-size:19px}
.ppm .board-head h2{margin:0;font-size:18px;font-weight:800;letter-spacing:-.02em}
.ppm .board-head .sub{font-size:12.5px;color:var(--ink-3);margin-top:2px}
.ppm .actor{margin:14px 0 22px;font-size:12.5px;color:var(--ink-2);background:var(--accent-soft);
  border:1px solid var(--accent-line);border-radius:10px;padding:10px 13px}
.ppm .actor b{color:var(--accent)}

.ppm .uflow{margin:0 0 18px;border:1px dashed var(--accent-line);border-radius:12px;padding:12px 14px;background:#fff}
.ppm .uflow .ut{font-size:11px;font-weight:800;color:var(--accent);letter-spacing:.03em;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.ppm .usteps{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.ppm .ustep{flex:1 1 0;min-width:110px;border:1px solid var(--line);border-radius:10px;padding:9px 10px;background:#fcfdff;position:relative}
.ppm .ustep .un{font-size:10px;font-weight:800;color:var(--accent)}
.ppm .ustep .uh{font-size:12px;font-weight:700;margin-top:2px}
.ppm .ustep .ud{font-size:11px;color:var(--ink-2);margin-top:2px;line-height:1.4}
.ppm .ustep .ur{font-size:10px;color:var(--ink-3);margin-top:5px;border:1px solid var(--line);border-radius:6px;padding:1px 5px;display:inline-block}

.ppm .flow{display:flex;flex-direction:column}
.ppm .node{position:relative;display:flex;justify-content:center}
.ppm .conn{height:24px;width:2px;background:var(--line-strong);margin:0 auto}
.ppm .conn.short{height:15px}
.ppm .step{width:100%;max-width:580px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 16px;box-shadow:var(--shadow)}
.ppm .step .st-t{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px}
.ppm .step .st-d{font-size:12.5px;color:var(--ink-2);margin-top:3px}
.ppm .step .tag{font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent)}
.ppm .step.planned{background:repeating-linear-gradient(135deg,#fbfaff,#fbfaff 7px,#f1eefe 7px,#f1eefe 14px);border:1px dashed var(--violet)}
.ppm .step.planned .st-t{color:var(--violet)}
.ppm .step .pbadge{font-size:10px;font-weight:800;color:#fff;background:var(--violet);border-radius:999px;padding:1px 7px;margin-left:6px}
.ppm .decision{width:100%;max-width:580px;background:var(--amber-soft);border:1px solid #f3d79a;border-radius:12px;padding:12px 16px}
.ppm .decision .dq{font-weight:800;font-size:13.5px;color:#b4730a;display:flex;align-items:center;gap:8px}
.ppm .decision .dq .dia{width:18px;height:18px;background:var(--amber);transform:rotate(45deg);border-radius:4px;flex:none}
.ppm .branches{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.ppm .branch{flex:1 1 0;min-width:130px;background:#fff;border:1px solid #f0dcb4;border-radius:10px;padding:9px 12px}
.ppm .branch .bl{font-weight:700;font-size:12.5px;display:flex;align-items:center;gap:6px}
.ppm .branch .bd{font-size:11.5px;color:var(--ink-2);margin-top:4px;line-height:1.45}
.ppm .branch .arrow{font-size:11px;color:var(--amber);font-weight:700}
.ppm .branch.ok{border-color:#bfe9d4}.ppm .branch.ok .bl{color:#0b7a52}
.ppm .branch.no{border-color:#f3c9c9}.ppm .branch.no .bl{color:#b42424}
.ppm .endcap{width:100%;max-width:580px;background:linear-gradient(180deg,#fff,#fafcff);border:1px dashed var(--primary);border-radius:12px;padding:12px 16px;text-align:center}
.ppm .endcap .ec-t{font-weight:800;font-size:13.5px;color:var(--primary)}
.ppm .endcap .ec-d{font-size:11.5px;color:var(--ink-2);margin-top:3px}
.ppm .pageref{display:inline-block;font-size:10.5px;color:var(--ink-3);border:1px solid var(--line);border-radius:6px;padding:1px 6px;margin-left:6px}

.ppm .side{display:flex;flex-direction:column;gap:16px;position:sticky;top:80px}
.ppm .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px 18px}
.ppm .card h3{margin:0 0 12px;font-size:13px;font-weight:800;display:flex;align-items:center;gap:7px}
.ppm .card h3 .dot{width:7px;height:7px;border-radius:99px;background:var(--amber)}
.ppm .cond{border-left:3px solid var(--line-strong);padding:2px 0 2px 12px;margin-bottom:13px}
.ppm .cond .ct{font-weight:700;font-size:12.5px}.ppm .cond .cv{font-size:11.5px;color:var(--ink-2);margin-top:3px}
.ppm .cond.c-a{border-color:#2563eb}.ppm .cond.c-b{border-color:#10b981}.ppm .cond.c-c{border-color:#f59e0b}.ppm .cond.c-d{border-color:#8b5cf6}
.ppm .src{font-size:11px;color:var(--ink-3);line-height:1.6}.ppm .src b{color:var(--ink-2)}

.ppm .diag{margin:16px 0 50px;display:flex;flex-direction:column;gap:18px}
.ppm .dcard{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px 24px}
.ppm .dcard h2{margin:0 0 3px;font-size:17px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.ppm .dcard .ds{font-size:12.5px;color:var(--ink-3);margin-bottom:16px}
.ppm .pc{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:820px){.ppm .pc{grid-template-columns:1fr}}
.ppm .pcol{border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.ppm .pcol.pro{background:#eafaf3;border-color:#bfe9d4} .ppm .pcol.con{background:#fef0f0;border-color:#f3c9c9}
.ppm .pcol h4{margin:0 0 11px;font-size:13.5px;font-weight:800;display:flex;align-items:center;gap:6px}
.ppm .pcol.pro h4{color:#0b7a52} .ppm .pcol.con h4{color:#b42424}
.ppm .pcol ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.ppm .pcol li{font-size:12.5px;color:var(--ink-2);line-height:1.45;padding-left:18px;position:relative}
.ppm .pcol li b{color:var(--ink)}
.ppm .pcol.pro li::before{content:'✓';position:absolute;left:0;color:#0b7a52;font-weight:800}
.ppm .pcol.con li::before{content:'!';position:absolute;left:2px;color:#b42424;font-weight:800}

.ppm .dup{width:100%;border-collapse:separate;border-spacing:0 7px;font-size:12px}
.ppm .dup th{text-align:left;font-size:10.5px;color:var(--ink-3);font-weight:700;padding:0 10px}
.ppm .dup td{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px 10px;vertical-align:middle}
.ppm .dup td:first-child{border-left:1px solid var(--line);border-radius:9px 0 0 9px;font-weight:700}
.ppm .dup td:last-child{border-right:1px solid var(--line);border-radius:0 9px 9px 0}
.ppm .dupn{display:inline-block;min-width:26px;text-align:center;font-weight:800;border-radius:7px;padding:2px 7px}
.ppm .dupn.hi{background:#fdecec;color:#b42424} .ppm .dupn.mid{background:#fff7ea;color:#b4730a}
.ppm .loc{display:inline-block;font-family:ui-monospace,monospace;font-size:10px;color:var(--ink-2);background:#f3f5f8;border:1px solid var(--line);border-radius:5px;padding:1px 6px;margin:2px 3px 0 0}
.ppm .loc.mirror{background:#fdecec;border-color:#f3c9c9;color:#b42424}

.ppm .pdup{display:flex;flex-direction:column;gap:10px}
.ppm .prow{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.ppm .prow .ic{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;font-size:16px;flex:none}
.ppm .prow .nm{font-weight:800;font-size:13.5px}
.ppm .prow .dd{font-size:12px;color:var(--ink-2);margin-top:4px;line-height:1.5}
.ppm .prow .badge{font-size:10.5px;font-weight:800;border-radius:999px;padding:2px 9px;flex:none;align-self:flex-start}
.ppm .b-hi{background:#fdecec;color:#b42424} .ppm .b-mid{background:#fff7ea;color:#b4730a} .ppm .b-lo{background:#eafaf3;color:#0b7a52}

.ppm .unify{display:grid;grid-template-columns:1fr 40px 1fr;gap:10px;align-items:stretch}
@media(max-width:820px){.ppm .unify{grid-template-columns:1fr}}
.ppm .ucol{border-radius:12px;padding:15px 16px}
.ppm .ucol.before{background:#fef0f0;border:1px solid #f3c9c9} .ppm .ucol.after{background:#eff4ff;border:1px solid #cfe0ff}
.ppm .ucol h4{margin:0 0 10px;font-size:13px;font-weight:800}
.ppm .ucol.before h4{color:#b42424} .ppm .ucol.after h4{color:var(--primary)}
.ppm .ucol ul{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:7px}
.ppm .ucol li{font-size:12px;color:var(--ink-2);line-height:1.45}
.ppm .uarrow{display:grid;place-items:center;font-size:22px;color:var(--primary);font-weight:800}

.ppm footer{padding:26px 0 40px;text-align:center;color:var(--ink-3);font-size:11.5px}
`

type Mode = 'all' | 'per' | 'diag'

function PersonaProcessMap() {
  const [mode, setMode] = useState<Mode>('all')
  const [active, setActive] = useState<ColorKey>('generator')

  return (
    <div className="ppm">
      <style>{CSS}</style>

      <header className="topbar">
        <div className="wrap topbar-in">
          <Link to="/" className="logo">
            <span className="spark">⚡</span>
            <span>
              에너지 자급자족 플랫폼
              <small>울산미포 스마트그린산단 · ESG 에너지 플랫폼</small>
            </span>
          </Link>
          <div className="spacer" />
          <Link to="/" className="pill">← 목록</Link>
          <span className="pill">프로세스 맵</span>
          <span className="pill">3차년도 사업계획서 기준</span>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <h1>
            에너지 자급자족 플랫폼 — <span style={{ color: 'var(--primary)' }}>프로세스 맵</span>
          </h1>
          <p>
            발전 자원 구축부터 RE100 이행까지, 6개 주체가 엮이는 생태계입니다. 흐름은{' '}
            <b>자원 유형·수익 모델·거래 방식</b>에 따라 갈라집니다.
          </p>
        </section>

        <div className="modebar">
          <div className="seg">
            <button className={mode === 'all' ? 'on' : ''} onClick={() => setMode('all')}>🔗 전체 프로세스</button>
            <button className={mode === 'per' ? 'on' : ''} onClick={() => setMode('per')}>👤 페르소나별</button>
            <button className={mode === 'diag' ? 'on' : ''} onClick={() => setMode('diag')}>🔍 중복 진단</button>
          </div>
        </div>

        {mode === 'all' && <OverallView />}
        {mode === 'per' && <PersonaView active={active} setActive={setActive} />}
        {mode === 'diag' && <DiagView />}
      </div>

      <footer>울산미포 스마트그린산단 에너지 자급자족 플랫폼 — 프로세스 맵 (시안)</footer>
    </div>
  )
}

// 2026-06-05 — PPT(슬라이드)가 아니라 정보 제공용 "페이지".
// PersonaProcessMap 컴포넌트는 위에 같은 파일 안에 정의됨.
const deck: Deck = {
  element: <PersonaProcessMap />,
  meta: {
    slug: 'rmsppt260605',
    title: '에너지 자급자족 플랫폼 — 프로세스 맵',
    date: '2026-06-05',
    description: '전체 프로세스 · 페르소나별 · 중복 진단 (페이지형)',
    tags: ['Page', 'Persona', 'Process'],
  },
  slides: [],
}

export default deck
