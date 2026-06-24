'use client'

import { Fragment, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'

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

/* ── 수용가(Consumer) 전용: 엔드투엔드 유저 저니 × 신규 GNB 매핑·점검 ──
   image-spec: 6단계 phase × {저니행동 / 신규GNB / 대시보드(전폭) / 점검결과 / 정산데이터흐름} */
const CONSUMER_PHASES = [
  { n: '01', t: '온보딩·구축', h: '1·2차년도 · 설비 설치' },
  { n: '02', t: '발전 개시', h: '3차년도~ · 자원별 가동' },
  { n: '03', t: '매칭·계약', h: '수요 ↔ 공급 연결' },
  { n: '04', t: '거래·공급', h: '전력 흐름' },
  { n: '05', t: '정산·세금', h: '대금 흐름' },
  { n: '06', t: '이행·증빙', h: 'RE100 · ESG' },
]

type CJourneyCell =
  | { action: string; routes?: string[]; handoff?: string; decision?: string }
  | { empty: { title: string; note?: string } }

const CONSUMER_JOURNEY: CJourneyCell[] = [
  { action: '가입 · RE100 무료진단 신청', routes: ['/consulting/diagnosis'], handoff: '컨설턴트로 핸드오프' },
  { empty: { title: '설비 구축 단계 · 미참여', note: '(제안 수신 시작 가능)' } },
  { action: '제안 검토 → 발전원·계약유형 선택', routes: ['/proposals→/trading→/contracts'], decision: '발전원·계약(태양광 3종)' },
  { action: '전력 사용 · 사용량 확인', routes: ['/ppa/status', '/consumer/usage'] },
  { action: '요금 확인 · 납부 (부족 시 편차)', routes: ['/ppa/billing/*'] },
  { action: 'RE100/ESG 증빙 수령', routes: ['/consumer/re100', '/documents'] },
]

type CGnbCell =
  | { label: string; items: string[]; handoff?: string }
  | { empty: string }

const CONSUMER_GNB: CGnbCell[] = [
  { label: 'GNB ② 컨설팅', items: ['무료 진단', '(마켓플레이스)', '받은 제안 → P3로 연결'] },
  { empty: '전용 화면 없음' },
  { label: 'GNB ③ 전력거래', items: ['거래 신청', '내 계약 (新 에너지계약 통합)'], handoff: '← 발전사·SPC·관리자 연계' },
  { label: 'GNB ③ 전력거래', items: ['전력 현황 (실시간)', '사용량 분석 (과거)'], handoff: '← SPC 매칭 / 발전사 공급' },
  { label: 'GNB ④ 정산·요금', items: ['정산 내역 (납부 통합)', '세금계산서', '사용량 편차'] },
  { label: 'GNB ⑤ RE100·이행', items: ['RE100 현황', '이행증빙', '운영 보고서'] },
]

const CONSUMER_CHECK = [
  { no: '❶', title: '2곳 중복 → 단일화', desc: '계약·요금·증빙이 대시보드 + 전력거래 양쪽에 존재. 요약판 제거, 풀기능 한 곳으로.' },
  { no: '❷', title: '정산 독립 GNB 분리', desc: 'P05 정산이 전력거래에 묻힘. 거래 ≠ 정산(업계 표준) → GNB로 승격.' },
  { no: '❸', title: '납부 액션 신설', desc: 'P05에 조회·수취만 있고 납부 액션 부재 → 정산 내역에 통합.' },
  { no: '❹', title: 'RE100 GNB 승격', desc: '2순위 관심사인데 LNB에 묻힘 → GNB로 상위 노출. (증빙 발급 한 클릭)' },
  { no: '❺', title: '사용량 이동', desc: '사용량 분석을 대시보드 → 전력거래로 이동. 현황·분석 한 곳에.' },
]

/* 수용가 — 관심사 우선순위 */
const CONSUMER_PRIORITIES = [
  { rank: 1, label: '얼마나 줄었나', desc: '한전 대비 이번 달/누적 절감액 (경영진 보고 숫자)' },
  { rank: 2, label: 'RE100 얼마나 달성했나', desc: '달성률·증빙 (수출기업은 CBAM·ESG 대응으로 시급)' },
  { rank: 3, label: '한전이었다면 얼마나 손해였나', desc: '"한전 청구 vs 실제 PPA" 직접 비교' },
  { rank: 4, label: '이번 달 요금 · 다음 결제일', desc: '발전량 변동으로 예측 불안' },
  { rank: 5, label: '부족분 발생 여부', desc: '부족분은 비싼 한전 요금으로 보충됨' },
]

/* 수용가 — GNB → LNB 트리 */
type CGnbTree =
  | { idx: string; name: string; route: string; sub?: string; lnb: null; note: string }
  | { idx: string; name: string; route?: string; sub?: string; lnb: { name: string; route: string }[] }

const CONSUMER_NAV: CGnbTree[] = [
  { idx: '①', name: '대시보드', route: '/consumer', lnb: null, note: 'LNB 없음 · 단독 홈' },
  { idx: '②', name: '컨설팅', lnb: [
    { name: '무료 진단', route: '/consulting/diagnosis' },
    { name: '마켓플레이스', route: '/consulting/marketplace' },
    { name: '받은 제안', route: '/consulting/proposals' },
    { name: '컨설팅 현황', route: '/consulting' },
  ]},
  { idx: '③', name: '전력거래', sub: '거래하기 (계약 + 사용)', lnb: [
    { name: '거래 신청', route: '/ppa/trading' },
    { name: '내 계약', route: '/ppa/contracts' },
    { name: '전력 현황', route: '/ppa/status' },
    { name: '사용량 분석', route: '/consumer/usage' },
  ]},
  { idx: '④', name: '정산·요금', sub: '내가 내는 돈', lnb: [
    { name: '정산 내역', route: '/ppa/billing/settlement' },
    { name: '세금계산서', route: '/ppa/billing/tax-invoice' },
    { name: '사용량 편차', route: '/ppa/billing/usage-deviation' },
  ]},
  { idx: '⑤', name: 'RE100·이행', sub: '증빙', lnb: [
    { name: 'RE100 현황', route: '/consumer/re100' },
    { name: '이행증빙', route: '/ppa/documents/evidence' },
    { name: '운영 보고서', route: '/ppa/documents/report' },
  ]},
]
const CONSUMER_NAV_COMMON = ['탄소거래', 'e-Data', 'VPP', 'DT']

/* 핵심 설계 ①②③ — 전체 메뉴 구조 아래 함께 표시 */
const CONSUMER_DESIGN_INTENT = [
  '정산·요금을 전력거래에서 분리해 독립 GNB로 (거래 ≠ 정산, 업계 표준)',
  '사용량 분석을 대시보드 → 전력거래로 이동 (현황·분석 한 곳)',
  'RE100·이행을 독립 GNB로 승격 (2순위 관심사 상위 노출)',
]

/* 수용가 — GNB ① 대시보드 4 Zone */
const DASHBOARD_ZONES = [
  { z: 'Zone 1', title: '얼마나 아꼈나', items: [
    '이번달/누적 절감액 · 절감률 KPI',
    '"한전 vs 실제 PPA" 월별 비교 차트 (차이 음영)',
    '→ "한전이었으면 +XXX만원 더 냈음"',
  ]},
  { z: 'Zone 2', title: 'RE100 달성', items: [
    '달성률 게이지 · RE 비율 · CO₂ 저감',
    '"증빙 발급" 바로가기',
  ]},
  { z: 'Zone 3', title: '이번 달 돈 관리', items: [
    '예상 요금 · 다음 결제일 · 미정산',
    '부족분 경고 (발생 시만)',
  ]},
  { z: 'Zone 4', title: '사용량 요약', items: [
    '총 사용량 · 수요 피크',
    '미니 차트',
  ]},
]
const DASHBOARD_REMOVED = ['발전량 추이 차트', '발전소 상태 보드 (발전사 관심사)']

/* 수용가 — 각 GNB의 LNB 화면 상세 */
type ScreenSection = { label: string; items: string[] }
type Screen = {
  name: string
  route: string
  sub?: string         // (대시보드에서 이동) 같은 메타
  hero?: boolean       // 정산 내역 같은 핵심 화면
  sections: ScreenSection[]
  rel?: string         // ← SPC 정산 확정 …
  warn?: string        // ⚠ 보강 필요 …
}

const GNB_CONSULTING: Screen[] = [
  { name: '무료 진단', route: '/consulting/diagnosis',
    sections: [{ label: '내용', items: ['5단계 위저드(분야 → 기업현황 → 재생E목표 → 연락처 → 확인)'] }],
    rel: '→ 컨설턴트 신규 의뢰' },
  { name: '마켓플레이스', route: '/consulting/marketplace',
    sections: [{ label: '내용', items: ['컨설턴트 탐색·선택'] }],
    rel: '← 컨설턴트 프로필' },
  { name: '받은 제안', route: '/consulting/proposals',
    sections: [{ label: '내용', items: ['제안 목록 · 상세(발전원·계약유형)'] }],
    rel: '← 컨설턴트 제안 발송' },
  { name: '컨설팅 현황', route: '/consulting', sub: '舊 "컨설팅 홈"',
    sections: [{ label: '내용', items: ['진행 중 컨설팅 추적 · 일정'] }],
    rel: '← 컨설턴트 프로젝트 관리' },
]

const GNB_TRADING: Screen[] = [
  { name: '거래 신청', route: '/ppa/trading',
    sections: [{ label: '내용', items: [
      'Lease PPA 문의 / 직접 PPA 유형 선택(Onsite·Offsite)',
      '거래 이력 / 신청 취소',
    ]}],
    rel: '→ SPC 매칭·중개 · ↔ 발전사 공급신청 · → 관리자 승인' },
  { name: '내 계약', route: '/ppa/contracts', sub: '舊 "에너지 계약" 통합', hero: true,
    sections: [
      { label: '진행 5단계 추적', items: ['신청접수 → SPC검토 → 거래소신고서 → 승인대기 → 효력발생'] },
      { label: 'KPI', items: ['총 계약 · 이달 비용 · CFE 매칭 · RE100 · 자원 믹스'] },
      { label: '액션', items: ['갱신 · 변경 · 해지'] },
    ],
    rel: '↔ 발전사 동일 계약(상태 동기화) · → SPC·관리자 검토·승인' },
  { name: '전력 현황', route: '/ppa/status',
    sections: [{ label: '내용', items: [
      '실시간 자원별 매칭',
      'RE100 누적 이행률 · 예상 정산금',
      '할 일 · 최근 활동',
    ]}],
    rel: '← SPC 매칭 결과 · ← 발전사 공급량' },
  { name: '사용량 분석', route: '/consumer/usage', sub: '대시보드에서 이동',
    sections: [{ label: '내용', items: [
      '총 사용량 · 한전 사용량 · 평균 일사용량 · 수요 피크',
      '시간대별 · 일별 · 월별 차트',
    ]}],
    rel: '→ SPC 발전량 예측 입력 · → 컨설턴트 진단 기초자료' },
]

const GNB_BILLING: Screen[] = [
  { name: '정산 내역', route: '/ppa/billing/settlement', hero: true, sub: '핵심 화면',
    sections: [
      { label: 'KPI', items: ['이달 총 비용 · 이달 순절감 · 다음 결제일 · 누적(YTD) · 미정산'] },
      { label: '정산 산출', items: ['발전량(계량기/RTU) × SMP 단가 → 공급가액 / 24/7 매칭률'] },
      { label: '납부 통합', items: ['청구 확인 → 납부 액션 (별도 화면 신설 안 함)'] },
      { label: '한전 비교 상세', items: ['대시보드 Zone1의 상세판'] },
      { label: '상태', items: ['SPC 확정 전 "잠정" 배지'] },
    ],
    rel: '← SPC 정산 확정 · 납부=SPC 수금 · 발전사 판매대금과 차액=SPC 마진' },
  { name: '세금계산서', route: '/ppa/billing/tax-invoice',
    sections: [
      { label: '수취 현황', items: ['총 발급건수 · 총 수취 합계 · 미발급 · 결제 대기'] },
      { label: '상세', items: ['발급번호 · 공급자 · 사업자번호 · 공급량 · 단가 · 공급가액 · 부가세 · 결제일 · 가상계좌'] },
      { label: '역할', items: ['증빙·수취 확인 전용 (납부 액션은 정산 내역에만)'] },
    ],
    rel: '← SPC 발행 (확정 → 발행 → 수취 순서 강제)' },
  { name: '사용량 편차', route: '/ppa/billing/usage-deviation', sub: '舊 "사용량 부족 내역" → 라벨 통일',
    sections: [
      { label: 'KPI', items: ['총 부족량 · 내부 보완률 · 정산 순영향'] },
      { label: '내용', items: ['일별 추이 · 시간대별 분포 · 원인 분해 · 처리 분해 · 이벤트 로그 · 편차 정산 처리'] },
    ],
    rel: '← SPC 예측 vs 실측 · ↔ 발전사 편차(동일 이벤트 양면)' },
]

const GNB_RE100: Screen[] = [
  { name: 'RE100 현황', route: '/consumer/re100', sub: '대시보드에서 이동',
    sections: [
      { label: 'KPI', items: ['현재 RE 비율 · 재생E 사용 · CO₂ 저감'] },
      { label: '차트', items: ['월별 RE 비율 · 연도별 목표 vs 실적 · 에너지원 구성 · 로드맵'] },
    ],
    rel: '← 컨설턴트 RE100 인증 지원' },
  { name: '이행증빙', route: '/ppa/documents/evidence',
    sections: [
      { label: '누적', items: ['발전 · 리스료 · 절감 · 증빙 제출'] },
      { label: '액션', items: ['증빙 문서 + 미리보기 · 다운로드 · 이메일 · 공유'] },
    ],
    rel: '← SPC 거래 증빙 · ← 발전사 REC 발급(동일 라우트, 권한 분리 필요)' },
  { name: '운영 보고서', route: '/ppa/documents/report', sub: '현재 74줄 · 보강 대상',
    sections: [
      { label: '내용', items: ['누적 발전량 · 리스료 · 한전 대비 절감 · 연간 추정', '월별 비용 vs 절감 · 발급 이력'] },
    ],
    warn: '발행 주체(SPC/관리자) 미정의 → 보강 필요' },
]

/* AS-IS → TO-BE 변경 요약 */
const CONSUMER_DIFF = [
  '대시보드 LNB 제거 → 단독 홈 (절감·RE100 중심)',
  '에너지 계약·요금 내역 요약판 제거 → 내 계약·정산 내역으로 통합',
  '사용량 분석 → 전력거래로 이동',
  '정산·요금 → 독립 GNB 신설',
  'RE100·이행 → 독립 GNB 신설',
  '컨설팅 홈 → 컨설팅 현황 명칭 변경',
  '/ppa/billing ↔ /lease/billing 미러 폐기',
]
const CONSUMER_OPEN = ['공통 GNB 4개 노출 여부', '운영 보고서 발행 주체', '이행증빙 권한 분리']

/* ── 수용가 유저 플로우 — 신규 GNB 기준 화면 단계·분기 ── */
type CGnbKey = 'dashboard' | 'consulting' | 'trading' | 'billing' | 're100'

const CGNB_META: Record<CGnbKey, { label: string; soft: string; line: string; ink: string }> = {
  dashboard:  { label: '① 대시보드(상시)', soft: '#f1f3f7', line: '#d7dce5', ink: '#64748b' },
  consulting: { label: '② 컨설팅',        soft: '#f3effe', line: '#ddd0fb', ink: '#8b5cf6' },
  trading:    { label: '③ 전력거래',      soft: '#fff7ea', line: '#f3d79a', ink: '#b4730a' },
  billing:    { label: '④ 정산·요금',     soft: '#e9f7fe', line: '#bfe6f7', ink: '#0277b6' },
  re100:      { label: '⑤ RE100·이행',    soft: '#eafaf3', line: '#bfe9d4', ink: '#0b7a52' },
}

/* 공통 GNB 이름 — 모든 페르소나 동일 (번호 없음, 범례·라벨용) */
const GNB_COMMON_LABEL: Record<CGnbKey, string> = {
  dashboard: '대시보드',
  consulting: '컨설팅',
  trading: '전력거래',
  billing: '정산·요금',
  re100: 'RE100·이행',
}

type CJStep = { no: string; title: string; gnb: CGnbKey; path: string; route: string }

const CJ_STEPS: CJStep[] = [
  { no: 'STEP 1', title: 'RE100 무료진단 신청',                 gnb: 'consulting', path: '컨설팅 > 무료 진단',   route: '/consulting/diagnosis' },
  { no: 'STEP 2', title: '제안 검토·수락',                       gnb: 'consulting', path: '컨설팅 > 받은 제안',   route: '/consulting/proposals' },
  { no: 'STEP 3', title: '거래 신청 (발전원·계약유형)',          gnb: 'trading',    path: '전력거래 > 거래 신청', route: '/ppa/trading' },
  { no: 'STEP 4', title: '계약 체결·관리 (진행 5단계)',          gnb: 'trading',    path: '전력거래 > 내 계약',   route: '/ppa/contracts' },
  { no: 'STEP 5', title: '전력 사용·현황 실시간 + 사용량',       gnb: 'trading',    path: '전력현황·사용량분석',  route: '/ppa/status · /usage' },
  { no: 'STEP 6', title: '정산 확인·납부 + 세금계산서·편차',     gnb: 'billing',    path: '정산·요금 > 정산 내역', route: '/ppa/billing/settlement' },
  { no: 'STEP 7', title: 'RE100·증빙 수령',                      gnb: 're100',      path: 'RE100·이행',           route: '/consumer/re100 · /evidence' },
]

type CJBranch = { label: string; desc: string; tone?: 'ok' | 'warn' | 'no' }
type CJDecision = {
  q: string
  hint?: string
  branches: CJBranch[]
  note?: string
  meta?: string
  isDashboard?: boolean
}

const CJ_DECISIONS: CJDecision[] = [
  {
    q: '자가발전이 가능한가?',
    branches: [
      { label: '가능', desc: '자가소비형 태양광 설치', tone: 'ok' },
      { label: '불가', desc: '마켓플레이스 → 제안 받기', tone: 'warn' },
    ],
    note: 'STEP 2–3 진입 분기. 자가설치는 모니터링만, 그 외는 거래 신청으로.',
    meta: '관련 GNB: ② 컨설팅 → ③ 전력거래',
  },
  {
    q: '발전원·계약유형은?',
    hint: 'STEP 3',
    branches: [
      { label: '태양광',   desc: 'PPA·자가 3종' },
      { label: '연료전지', desc: '24h·SMP+REC' },
      { label: 'ORC',      desc: '폐열 발전' },
    ],
    note: '태양광 계약 3종: Lease PPA(임대·발전량 비례) / 직접 PPA(Onsite·Offsite 5~20년) / 자가 설치(자가소비·모니터링만) → STEP 4 계약 체결로',
  },
  {
    q: '사용량이 계약량 대비?',
    hint: 'STEP 5 → 6',
    branches: [
      { label: '부족', desc: '한전 단가 보충 → 사용량 편차', tone: 'no' },
      { label: '충족', desc: '정상 정산', tone: 'ok' },
    ],
    note: '정산 단계(⑥)로 직결. 부족분은 GNB ⑥ > 사용량 편차에서 원인·정산영향 확인.',
    meta: '데이터 원천: SPC 예측 vs 실측 / 발전사 편차 (동일 이벤트)',
  },
  {
    q: '대시보드 (상시)',
    isDashboard: true,
    branches: [],
    note: '모든 단계 위에서 "얼마나 아꼈나"를 매일 요약. 각 위젯 → 해당 단계로 딥링크.',
  },
]

type CJConcern = { no: string; label: string; desc: string; mapping: string; hint?: string; tone: CGnbKey | 'red' }
const CJ_CONCERNS: CJConcern[] = [
  { no: '①', label: '얼마나 줄었나',  desc: '한전 대비 절감액·절감률',     mapping: '→ 대시보드 Zone1 + 정산 내역', hint: '(한전 vs 실제 PPA 비교)', tone: 'dashboard' },
  { no: '②', label: 'RE100 달성',     desc: '달성률·증빙 (수출=CBAM 시급)', mapping: '→ 대시보드 Zone2 + GNB⑤',     hint: '"증빙 발급" 한 클릭',     tone: 're100' },
  { no: '③', label: '한전이면 손해?', desc: '한전 청구 vs 실제 PPA',        mapping: '→ 정산 내역 상세 비교',       hint: '"한전이었으면 +XXX만원"', tone: 'trading' },
  { no: '④', label: '이번 달 요금',   desc: '예상 요금·다음 결제일',        mapping: '→ 대시보드 Zone3',            hint: '+ 정산 내역',             tone: 'billing' },
  { no: '⑤', label: '부족분?',        desc: '부족분 = 한전 보충 비용',       mapping: '→ 사용량 편차 (조건부)',      hint: '대시보드 경고',           tone: 'red' },
]

const CJ_CHECKPOINTS = [
  "STEP 2 '받은 제안'을 컨설팅에 둘지, 전력거래 입구로 당길지",
  'STEP 5 전력현황/사용량분석을 한 항목으로 합칠지',
  '자가설치 케이스는 거래 없이 모니터링만 → 별도 분기 표기 필요',
]

const CJ_CONCERN_TONES: Record<CJConcern['tone'], { bg: string; bd: string; ink: string }> = {
  dashboard:  { bg: '#f1f3f7', bd: '#d7dce5', ink: '#64748b' },
  consulting: { bg: '#f3effe', bd: '#ddd0fb', ink: '#8b5cf6' },
  trading:    { bg: '#fff7ea', bd: '#f3d79a', ink: '#b4730a' },
  billing:    { bg: '#e9f7fe', bd: '#bfe6f7', ink: '#0277b6' },
  re100:      { bg: '#eafaf3', bd: '#bfe9d4', ink: '#0b7a52' },
  red:        { bg: '#fef0f0', bd: '#f3c9c9', ink: '#b42424' },
}

/* ── 페르소나별 통합 PLAN ── (6 personas: 화면구성안 + 유저저니)
   CGnbKey 의미는 색상 슬롯(① dashboard ② violet ③ orange ④ sky ⑤ green)으로만 쓰임.
   라벨은 plan.nav[].name 으로 표시. 즉 generator의 'consulting' 슬롯은 "자원관리"를 의미. */
type PersonaPlan = {
  priorities: { rank: number; label: string; desc: string }[]
  nav: CGnbTree[]
  navCommon: string[]
  designIntent: string[]
  dashboard: { route: string; sub: string; zones: { z: string; title: string; items: string[] }[]; removed?: string[] }
  gnbs: { no: string; name: string; sub?: string; screens: Screen[] }[]
  diff: string[]
  open: string[]
  jSteps: CJStep[]
  jDecisions: CJDecision[]
  jConcerns: CJConcern[]
  jCheckpoints: string[]
  matrix?: { phases: typeof CONSUMER_PHASES; journey: typeof CONSUMER_JOURNEY; gnb: typeof CONSUMER_GNB; check: typeof CONSUMER_CHECK }
}

/* 수용가 — 기존 데이터 재포장 */
const PLAN_CONSUMER: PersonaPlan = {
  priorities: CONSUMER_PRIORITIES,
  nav: CONSUMER_NAV,
  navCommon: CONSUMER_NAV_COMMON,
  designIntent: CONSUMER_DESIGN_INTENT,
  dashboard: { route: '/consumer', sub: 'LNB 없음 · 단독 홈', zones: DASHBOARD_ZONES, removed: DASHBOARD_REMOVED },
  gnbs: [
    { no: 'D', name: '② 컨설팅', screens: GNB_CONSULTING },
    { no: 'E', name: '③ 전력거래', sub: '"거래하기" (계약 + 사용) — 내 계약이 통합 핵심', screens: GNB_TRADING },
    { no: 'F', name: '④ 정산·요금', sub: '"내가 내는 돈" — 정산 내역이 hero, 납부 통합', screens: GNB_BILLING },
    { no: 'G', name: '⑤ RE100·이행', sub: '"증빙" — 2순위 관심사 상위 노출', screens: GNB_RE100 },
  ],
  diff: CONSUMER_DIFF,
  open: CONSUMER_OPEN,
  jSteps: CJ_STEPS,
  jDecisions: CJ_DECISIONS,
  jConcerns: CJ_CONCERNS,
  jCheckpoints: CJ_CHECKPOINTS,
  matrix: { phases: CONSUMER_PHASES, journey: CONSUMER_JOURNEY, gnb: CONSUMER_GNB, check: CONSUMER_CHECK },
}

/* 발전사업자 — 수용가와 대칭, 5 GNB (모니터링 별도·정산 독립) */
const PLAN_GENERATOR: PersonaPlan = {
  priorities: [
    { rank: 1, label: '지금 잘 돌고 있나',     desc: '설비 가동률·발전소 상태·발전량' },
    { rank: 2, label: '그래서 얼마 버나',      desc: '수익·정산·미수금' },
    { rank: 3, label: '약정을 지키나',         desc: '발전량 편차(초과/미달)·REC 발급' },
    { rank: 4, label: '계약은 안정적인가',     desc: '잔여 계약 기간·갱신·해지 위약금' },
    { rank: 5, label: '시장가는 어떤가',       desc: 'SMP·REC 시세' },
  ],
  nav: [
    { idx: '①', name: '대시보드', route: '/dashboard', lnb: null, note: 'LNB 없음 · 단독 홈 · 허브' },
    { idx: '②', name: '전력거래', sub: '"팔기" (자원 등록 포함)', lnb: [
      { name: '자원 관리',          route: '/generator/ppa/resources/register' },
      { name: '공급 신청',          route: '/generator/trading' },
      { name: '내 계약',            route: '/generator/ppa/contracts' },
      { name: '전력거래시장(ETM)',  route: '/generator/etm' },
    ]},
    { idx: '③', name: '발전 모니터링', sub: '"운영 감시"', lnb: [
      { name: '발전 현황',          route: '/generator/ppa/dashboard' },
      { name: '발전소 모니터링',    route: '/monitoring/plant' },
      { name: '이상감지',          route: '/monitoring/anomalies' },
    ]},
    { idx: '④', name: '수익·정산', sub: '"내가 받는 돈"', lnb: [
      { name: '수익 분석',          route: '/generator/ppa/revenue/analytics' },
      { name: '정산 내역',          route: '/generator/ppa/revenue/invoices' },
      { name: '세금계산서',         route: '/generator/ppa/revenue/tax-invoice' },
      { name: '발전량 편차',        route: '/generator/ppa/revenue/deviation' },
    ]},
    { idx: '⑤', name: '이행·증빙', sub: '"REC·증빙"', lnb: [
      { name: 'REC·이행증빙',       route: '/ppa/documents/evidence' },
      { name: '보고서',             route: '/monitoring/reports' },
      { name: '문서 보관함',        route: '/generator/ppa/documents' },
    ]},
  ],
  navCommon: ['탄소거래', 'e-Data', 'VPP', 'DT'],
  designIntent: [
    '자원 등록을 전력거래로 합침 (공급의 전제조건·한 번 하는 셋업)',
    '모니터링은 성격이 달라(상시 운영 감시) 별도 GNB',
    '수익·정산을 독립 GNB로 (거래 ≠ 정산) — 수용가 "정산·요금"의 발전사판(받는 돈)',
  ],
  dashboard: {
    route: '/dashboard', sub: 'LNB 없음 · 단독 홈 · 허브 (5개 GNB 진입 위젯 하나씩)',
    zones: [
      { z: 'Zone 1', title: '지금 잘 돌고 있나 (운영)', items: [
        '설비 가동률·현재 출력(현재출력÷용량 %) → ③ 발전소 모니터링',
        '설비 상태 보드(정상·주의·점검·정지) → ③ 이상감지',
        '발전량·발전시간(전일) + 오늘 시간대별 → ③ 발전 현황',
      ]},
      { z: 'Zone 2', title: '그래서 얼마 버나 (수익)', items: [
        '금액(전일)·이번달 예상 수익 → ④ 수익 분석',
        '미수금·정산 알림 → ④ 정산 내역 (신규)',
      ]},
      { z: 'Zone 3', title: '약정을 지키나 (이행)', items: [
        '미달 발전 수요기업(CFE<70%) → ④ 발전량 편차',
        'REC 발급 예정 → ⑤ REC·이행증빙 (신규)',
      ]},
      { z: 'Zone 4', title: '계약·셋업', items: [
        '수요기업 비교·계약 갱신 알림 → ② 내 계약 (갱신 알림 신규)',
        '자원 등록 유도 배너 → ② 자원 관리',
      ]},
    ],
    removed: ['대시보드 3중 중복(/dashboard·/generator/ppa/dashboard·/lease/dashboard) → 홈 1개 + 발전 현황으로 일원화 · 신규 위젯 3개: 미수금·계약 갱신·REC 발급 예정'],
  },
  gnbs: [
    { no: 'D', name: '② 전력거래', sub: '"팔기" — 내 계약이 hero, 자원 등록 포함', screens: [
      { name: '자원 관리', route: '/generator/ppa/resources/register',
        sections: [
          { label: '등록',   items: ['신규 자원(발전소)·용량·자원유형(연료전지/태양광/ORC) 등록'] },
          { label: '현황',   items: ['현재 출력·오늘 발전량·상태·예상 REC 발급개수'] },
        ],
        rel: '공급의 전제조건 · 거래 흐름의 입구' },
      { name: '공급 신청', route: '/generator/trading',
        sections: [
          { label: '4단계', items: ['신청 접수 → SPC 매칭 → 수요기업 승인 대기 → 매칭 완료'] },
          { label: '액션',  items: ['신청 취소'] },
        ],
        rel: '→ SPC 매칭 · ↔ 수용가 거래 신청과 매칭' },
      { name: '내 계약', route: '/generator/ppa/contracts', hero: true, sub: '핵심 화면',
        sections: [
          { label: 'KPI',   items: ['총 계약 용량 · 잔여 계약 기간 · 중도 해지 위약금'] },
          { label: '내용',  items: ['등록 발전 자원'] },
          { label: '액션',  items: ['계약 변경·해지 신청'] },
        ],
        rel: '↔ 수용가 내 계약과 동일 데이터(상태 동기화) · → SPC·관리자 검토·승인' },
      { name: '전력거래시장(ETM)', route: '/generator/etm', sub: '배치 위치는 검토 포인트',
        sections: [
          { label: 'KPI',   items: ['최신 SMP · 활성 계약 · REC 보유 · 총 거래 계약'] },
          { label: '차트',  items: ['시장 가격 추이(SMP/REC)'] },
          { label: '내용',  items: ['내 거래 계약 목록'] },
        ],
        rel: '→ 시세 참고' },
    ]},
    { no: 'E', name: '③ 발전 모니터링', sub: '"운영 감시" — 발전 현황이 hero', screens: [
      { name: '발전 현황', route: '/generator/ppa/dashboard', hero: true, sub: '발전사의 일상 핵심 화면',
        sections: [
          { label: 'KPI',   items: ['현재 시각 발전량 · 오늘 누적 · 이번달 누적 · 이번달 예상 수익'] },
          { label: '차트',  items: ['발전량 추이 · 연도별 발전량 이력'] },
        ]},
      { name: '발전소 모니터링', route: '/monitoring/plant',
        sections: [{ label: '내용', items: ['맵 기반 발전소 상세 상태(실시간)'] }],
        warn: '현재 발전사는 진입로 없음 — 신규 노출 필요' },
      { name: '이상감지', route: '/monitoring/anomalies',
        sections: [{ label: '내용', items: ['이상 상황 관리 · 알림'] }] },
    ]},
    { no: 'F', name: '④ 수익·정산', sub: '"내가 받는 돈" — 정산 내역이 hero', screens: [
      { name: '수익 분석', route: '/generator/ppa/revenue/analytics',
        sections: [{ label: '내용', items: ['정산 일정 · 보고서·자동 발송 · 연도별 수익 추이'] }] },
      { name: '정산 내역', route: '/generator/ppa/revenue/invoices', hero: true, sub: '핵심 화면 · 1,068줄',
        sections: [
          { label: '수익 항목', items: ['전력량 대금(매출) · 부가정산금 · 망이용요금'] },
          { label: '차감 항목', items: ['거래수수료(전력거래소) · 거래수수료(전력공급거래) · 관리 수수료'] },
          { label: '세금·기금', items: ['부가세(+10%) · 전력산업기반기금 · 요금 조정'] },
          { label: '합계',      items: ['합계(VAT 포함) · 미수금(발행·미입금)'] },
        ],
        rel: '→ 수용가 지불액 − SPC 마진 = 발전사 수령액' },
      { name: '세금계산서', route: '/generator/ppa/revenue/tax-invoice',
        sections: [{ label: '항목', items: ['발급번호·발급일·유형·공급받는자·사업자번호·발전소', '공급량·단가·공급가액·부가세(10%)·입금일·상태·입금계좌'] }],
        rel: '발전사는 발행·수금측 (수용가는 수취측)' },
      { name: '발전량 편차', route: '/generator/ppa/revenue/deviation', sub: '화면 타이틀 "예상 발전량"',
        sections: [
          { label: 'KPI',   items: ['초과 발생 · 평균 SMP 시장가 · 예상 REC 발급개수'] },
          { label: '내용',  items: ['초과 발생 로그 · 매도 내역 PDF'] },
        ],
        rel: '발전사는 초과 중심 (수용가는 부족 중심) · 동일 이벤트의 발전측 면' },
    ]},
    { no: 'G', name: '⑤ 이행·증빙', sub: '"REC·증빙"', screens: [
      { name: 'REC·이행증빙', route: '/ppa/documents/evidence',
        sections: [{ label: '내용', items: ['REC 발급 · 이행 증빙'] }],
        warn: '수용가와 동일 라우트 공유 → 권한·뷰 분리 필요' },
      { name: '보고서', route: '/monitoring/reports', sub: '배치 위치는 검토 포인트',
        sections: [{ label: '내용', items: ['운영·발전 보고서'] }] },
      { name: '문서 보관함', route: '/generator/ppa/documents',
        sections: [
          { label: '항목',   items: ['파일명·발급일·크기·출처·상태'] },
          { label: '폴더',   items: ['전체·발전소별·종류별·연도월별'] },
          { label: '액션',   items: ['미리보기·다운로드·이메일·공유 링크'] },
        ]},
    ]},
  ],
  diff: [
    '모니터링 진입로 신설 — 저니 STEP(/monitoring/plant)가 발전사 메뉴에 없음 → ③ 발전 모니터링',
    "정산 화면 LNB 노출 — 정산·세금계산서·편차 있는데 '수익 분석'만 노출 → ④에 4개 모두",
    '대시보드 3중 중복 정리 — /dashboard·/generator/ppa/dashboard·/lease/dashboard → 홈 1개 + 발전 현황',
    '거래 ≠ 정산 분리 — 자원/거래/정산을 ②③④ 3개 GNB로, 저니 STEP1~5 = GNB ②~⑤ 정렬',
    '자원 등록을 전력거래로 합침 (공급의 전제조건)',
  ],
  open: ['모니터링 GNB 유지 vs 대시보드 흡수', 'ETM 위치(②거래 vs 별도 시장)', '보고서 위치(⑤증빙 vs ③모니터링)'],
  jSteps: [
    { no: 'STEP 1', title: '자원 등록',                gnb: 'trading',    path: '전력거래 > 자원 관리',        route: '/generator/ppa/resources/register' },
    { no: 'STEP 2', title: '공급 신청·SPC 매칭',       gnb: 'trading',    path: '전력거래 > 공급 신청',        route: '/generator/trading' },
    { no: 'STEP 3', title: '계약 체결',                gnb: 'trading',    path: '전력거래 > 내 계약',          route: '/generator/ppa/contracts' },
    { no: 'STEP 4', title: '발전·운영 감시',           gnb: 'consulting', path: '발전 모니터링 > 발전 현황',   route: '/generator/ppa/dashboard' },
    { no: 'STEP 5', title: '수익·정산 확인',           gnb: 'billing',    path: '수익·정산 > 정산 내역',       route: '/generator/ppa/revenue/invoices' },
    { no: 'STEP 6', title: '발전량 편차(초과)·정산',   gnb: 'billing',    path: '수익·정산 > 발전량 편차',     route: '/generator/ppa/revenue/deviation' },
    { no: 'STEP 7', title: 'REC·증빙 발급',            gnb: 're100',      path: '이행·증빙 > REC·이행증빙',    route: '/ppa/documents/evidence' },
  ],
  jDecisions: [
    { q: '자원 유형은?', hint: 'STEP 1', branches: [
      { label: '연료전지', desc: 'SMP + 2.2 REC 가중치(≈239원/kWh) · CHPS' },
      { label: '태양광',   desc: '직접 PPA(140원/kWh) 또는 자가소비형' },
      { label: 'ORC',      desc: '전력공급 SPC(≈100원/kWh · 7,920h/년)' },
    ], note: '자원유형이 수익 모델을 결정 — 정산 단가에 직결', meta: '관련 GNB: ② 전력거래 → ④ 수익·정산' },
    { q: '매칭 결과는?', hint: 'STEP 3 → 4', branches: [
      { label: '정상', desc: '약정대로 공급', tone: 'ok' },
      { label: '미달', desc: '미달분 보정·분쟁 처리', tone: 'no' },
      { label: '초과', desc: '초과분 SMP 매도 (발전량 편차)', tone: 'warn' },
    ], note: 'SPC가 시간단위 매칭 — 초과/미달은 발전량 편차에서 정산' },
    { q: '정산 상태?', hint: 'STEP 5 → 6', branches: [
      { label: '잠정',         desc: '검토 대기' },
      { label: '확정',         desc: '세금계산서 발행·수금', tone: 'ok' },
      { label: '분쟁/재정산',  desc: '수정세금계산서', tone: 'no' },
    ], meta: '데이터 원천: 발전량(계량기/RTU) × 단가 → SPC 확정' },
  ],
  jConcerns: [
    { no: '①', label: '지금 잘 돌고 있나', desc: '가동률·발전소 상태·발전량', mapping: '→ 대시보드 Z1 + 발전 모니터링', tone: 'consulting' },
    { no: '②', label: '그래서 얼마 버나',  desc: '수익·정산·미수금',          mapping: '→ 대시보드 Z2 + 정산 내역',     tone: 'billing' },
    { no: '③', label: '약정을 지키나',     desc: '발전량 편차·REC 발급',      mapping: '→ 발전량 편차 + REC·이행증빙',  tone: 're100' },
    { no: '④', label: '계약은 안정적인가', desc: '잔여 기간·갱신·위약금',     mapping: '→ 내 계약',                     tone: 'trading' },
    { no: '⑤', label: '시장가는 어떤가',   desc: 'SMP·REC 시세',             mapping: '→ 전력거래시장(ETM)',           tone: 'red' },
  ],
  jCheckpoints: [
    '모니터링 GNB 유지 vs 대시보드 흡수',
    'ETM 위치 (② 전력거래 vs 별도 시장 GNB)',
    '보고서 위치 (⑤ 이행·증빙 vs ③ 발전 모니터링)',
  ],
}

/* 컨설턴트 (독립) */
const PLAN_CONSULTANT: PersonaPlan = {
  priorities: [
    { rank: 1, label: '진행 案件·예상 수익', desc: '컨설팅 수수료·성사 단계' },
    { rank: 2, label: '신규 진단 의뢰',       desc: '수용가의 RE100 무료진단 인입' },
    { rank: 3, label: '매칭·제안 성공률',     desc: '발전사 ↔ 수용가 매칭 전환율' },
    { rank: 4, label: '용역사 위탁 진행',     desc: '시공 진척률·검수' },
    { rank: 5, label: '정산·수금',            desc: '컨설팅 사업비 정산 일정' },
  ],
  nav: [
    { idx: '①', name: '대시보드', route: '/consultant', lnb: null, note: 'LNB 없음 · 단독 홈' },
    { idx: '②', name: '컨설팅', sub: '진단·매칭·제안·시공을 한 GNB로 통합', lnb: [
      { name: '진단 의뢰',       route: '/consulting/diagnosis-requests' },
      { name: '진행 案件',       route: '/consultant/projects' },
      { name: '마켓·매칭',       route: '/consulting/marketplace' },
      { name: '제안 작성·발송',  route: '/consulting/proposals/create' },
      { name: '시공 위탁·검수',  route: '/consulting/agency' },
      { name: '고객 관리',       route: '/consultant/clients' },
    ]},
    { idx: '③', name: '정산·요금', sub: '컨설팅 사업비', lnb: [
      { name: '컨설팅 수익',  route: '/consultant/earnings' },
      { name: '세금계산서',   route: '/consultant/tax-invoice' },
      { name: '사업비 정산',  route: '/consulting/settlement' },
    ]},
  ],
  navCommon: ['탄소거래', 'e-Data', 'VPP', 'DT'],
  designIntent: [
    '매칭·제안·시공·검수를 모두 컨설팅 GNB 하위로 통합 (별도 GNB 폐지)',
    '案件관리·고객도 컨설팅에 흡수 (영업 흐름 한 곳)',
    '정산·요금만 분리 — 이름 통일 (수용가·발전사와 동일)',
  ],
  dashboard: {
    route: '/consultant', sub: 'LNB 없음 · 단독 홈',
    zones: [
      { z: 'Zone 1', title: '案件 수익',        items: ['진행 案件 수·예상 수익 KPI', '단계별 분포 (진단→제안→계약→정산)'] },
      { z: 'Zone 2', title: '신규 리드',        items: ['신규 진단 의뢰 알림', '미응답 案件'] },
      { z: 'Zone 3', title: '매칭 전환',        items: ['제안 송부·수락률·진행 案件 비율'] },
      { z: 'Zone 4', title: '용역 진척',        items: ['위탁 案件 진척률·검수 대기'] },
    ],
  },
  gnbs: [
    { no: 'D', name: '② 컨설팅', sub: '진단·매칭·제안·시공 통합 — 진행 案件이 hero', screens: [
      { name: '진단 의뢰', route: '/consulting/diagnosis-requests',
        sections: [{ label: '내용', items: ['수용가 진단 의뢰 수신·접수', '진단 응답 등록'] }],
        rel: '← 수용가 RE100 무료진단 신청' },
      { name: '진행 案件', route: '/consultant/projects', hero: true, sub: '핵심 화면',
        sections: [
          { label: 'KPI',      items: ['진행 案件 수·단계별 분포'] },
          { label: '추적',     items: ['진단 → 제안 → 계약 → 시공 → 정산'] },
          { label: '액션',     items: ['案件 등록·상태 변경·종결'] },
        ],
        rel: '↔ 수용가·발전사·용역사 동시 추적' },
      { name: '마켓·매칭', route: '/consulting/marketplace',
        sections: [{ label: '내용', items: ['발전사 자원 탐색·필터 (자원유형·용량·지역)', '발전사 ↔ 수용가 매칭'] }],
        rel: '↔ 발전사·수용가 매칭' },
      { name: '제안 작성·발송', route: '/consulting/proposals/create',
        sections: [
          { label: '내용', items: ['발전원·계약유형 선택·단가 산출·시뮬레이션', '제안서 생성 → 수용가 발송·수락/거절 추적'] },
        ],
        rel: '→ 수용가 받은 제안 화면' },
      { name: '시공 위탁·검수', route: '/consulting/agency', sub: '독립 컨설턴트만',
        sections: [{ label: '내용', items: ['용역사 선정·위탁·계약', '시공 진척 추적·완료 검수(합격/보완)'] }],
        rel: '→ 용역사 시공 案件 · ← 진행 보고' },
      { name: '고객 관리', route: '/consultant/clients',
        sections: [{ label: '내용', items: ['고객 정보·초대 링크·상담 이력'] }] },
    ]},
    { no: 'E', name: '③ 정산·요금', sub: '컨설팅 사업비', screens: [
      { name: '컨설팅 수익', route: '/consultant/earnings', hero: true,
        sections: [
          { label: 'KPI',     items: ['이달 수익·누적·다음 수금일'] },
          { label: '산출',    items: ['案件별 성사 수수료·단가차익 % 등'] },
        ],
        rel: '← SPC 사업비 지급' },
      { name: '세금계산서', route: '/consultant/tax-invoice',
        sections: [{ label: '내용', items: ['발행·수취 현황'] }] },
      { name: '사업비 정산', route: '/consulting/settlement',
        sections: [{ label: '내용', items: ['용역사 시공비 정산 (위탁→지급)'] }],
        rel: '→ 용역사 시공비 수금' },
    ]},
  ],
  diff: [
    '대시보드 LNB 제거 → 단독 홈',
    '案件관리·매칭·제안·시공 4개 GNB → 컨설팅 하나로 통합',
    '정산·수익 → 정산·요금 이름 통일',
    '용역사 소속 컨설턴트는 컨설팅 내 마켓·매칭/제안/시공 LNB 숨김 (역할 분기)',
  ],
  open: ['용역사 소속 vs 독립 메뉴 분기 방식', '案件 데이터 모델 (수용가/발전사/용역사 N:M 연결)'],
  jSteps: [
    { no: 'STEP 1', title: '진단 의뢰 수신',         gnb: 'consulting', path: '컨설팅 > 진단 의뢰',       route: '/consulting/diagnosis-requests' },
    { no: 'STEP 2', title: 'RE100 진단 수행·응답',   gnb: 'consulting', path: '컨설팅 > 진행 案件',       route: '/consultant/projects' },
    { no: 'STEP 3', title: '매칭·제안 작성·발송',    gnb: 'consulting', path: '컨설팅 > 제안 작성',       route: '/consulting/proposals/create' },
    { no: 'STEP 4', title: '계약 주관',              gnb: 'consulting', path: '컨설팅 > 진행 案件',       route: '/consultant/projects' },
    { no: 'STEP 5', title: '용역사 위탁·관리',       gnb: 'consulting', path: '컨설팅 > 시공 위탁',       route: '/consulting/agency' },
    { no: 'STEP 6', title: '진행 보고·검수',         gnb: 'consulting', path: '컨설팅 > 시공 위탁·검수',  route: '/consulting/agency' },
    { no: 'STEP 7', title: '컨설팅 수익 정산',       gnb: 'billing',    path: '정산·요금 > 컨설팅 수익',  route: '/consultant/earnings' },
  ],
  jDecisions: [
    { q: '소속 유형?', hint: 'login.agencyId', branches: [
      { label: '독립',         desc: '전체 메뉴 노출 (③ 매칭·④ 시공)', tone: 'ok' },
      { label: '용역사 소속',  desc: '③·④ 숨김 → 용역 작업만', tone: 'warn' },
    ], note: '같은 GNB 골격, 권한 게이트로 메뉴 노출 분기', meta: '데이터: user.agencyId 유무로 판정' },
    { q: '진단 결과?', hint: 'STEP 2', branches: [
      { label: '자가발전 가능', desc: '자가소비형 태양광 추천', tone: 'ok' },
      { label: '불가',          desc: '마켓플레이스 → 발전사 매칭' },
    ], note: '진단 결과가 STEP 3 제안 흐름을 결정' },
    { q: '시공 검수?', hint: 'STEP 6', branches: [
      { label: '합격', desc: '준공 → 운영 전환(SPC)', tone: 'ok' },
      { label: '보완', desc: '재시공·보완 조치', tone: 'no' },
    ]},
  ],
  jConcerns: [
    { no: '①', label: '案件 수익',     desc: '예상 수수료·진행 단계',  mapping: '→ 대시보드 Z1 + 컨설팅 수익', tone: 'dashboard' },
    { no: '②', label: '신규 리드',     desc: '진단 의뢰 알림',         mapping: '→ 대시보드 Z2 + 진단 의뢰',   tone: 'consulting' },
    { no: '③', label: '제안 전환',     desc: '제안 → 계약 성공률',     mapping: '→ 제안 현황',                  tone: 'trading' },
    { no: '④', label: '용역 진척',     desc: '시공 진척률·검수',       mapping: '→ 시공 진행·검수',             tone: 'billing' },
    { no: '⑤', label: '수금 일정',     desc: '다음 수금일·미수금',     mapping: '→ 컨설팅 수익',                tone: 're100' },
  ],
  jCheckpoints: [
    '案件 데이터 모델 (수용가·발전사·용역사 N:M)',
    '용역사 소속 컨설턴트 메뉴 분기 정책',
    '/consulting/* 와 /consultant/* 라우트 통합',
  ],
}

/* 용역사 */
const PLAN_AGENCY: PersonaPlan = {
  priorities: [
    { rank: 1, label: '신규 위탁 案件',     desc: '독립 컨설턴트의 시공 위탁' },
    { rank: 2, label: '시공 진척률',         desc: '일정·자재·인력 현황' },
    { rank: 3, label: '시공비 정산',         desc: '단계별 지급·미수금' },
    { rank: 4, label: 'A/S·유지보수',       desc: '정기 점검·긴급 수리' },
    { rank: 5, label: '검수 통과율',         desc: '준공 합격·보완' },
  ],
  nav: [
    { idx: '①', name: '대시보드', route: '/agency', lnb: null, note: 'LNB 없음 · 단독 홈' },
    { idx: '②', name: '컨설팅', sub: '시공 영역 — 위탁·시공·유지보수 통합', lnb: [
      { name: '위탁 案件',     route: '/consulting/agency/new' },
      { name: '시공 진행',     route: '/agency/work' },
      { name: '시운전·검수',   route: '/agency/inspection' },
      { name: '유지보수·A/S',  route: '/agency/as' },
    ]},
    { idx: '③', name: '정산·요금', sub: '시공비', lnb: [
      { name: '시공비 정산', route: '/consulting/settlement' },
      { name: '세금계산서',  route: '/agency/tax-invoice' },
    ]},
  ],
  navCommon: ['탄소거래', 'e-Data', 'VPP', 'DT'],
  designIntent: [
    '신규 페르소나로 등록 (기존 전용 화면 없음)',
    '위탁·시공·유지보수를 컨설팅 GNB로 통합 (시공 = 컨설팅 영역)',
    '정산·요금만 분리 — 이름 통일 (다른 페르소나와 동일)',
  ],
  dashboard: {
    route: '/agency', sub: 'LNB 없음 · 단독 홈',
    zones: [
      { z: 'Zone 1', title: '신규 위탁',     items: ['신규 위탁 案件 알림', '미응답 案件'] },
      { z: 'Zone 2', title: '시공 진척',     items: ['진행 案件 수·평균 진척률', '지연 案件 경고'] },
      { z: 'Zone 3', title: '시공비 정산',   items: ['이달 수금·미수금·다음 정산일'] },
      { z: 'Zone 4', title: 'A/S 대응',      items: ['미처리 A/S 요청·평균 대응 시간'] },
    ],
  },
  gnbs: [
    { no: 'D', name: '② 컨설팅', sub: '시공 영역 — 시공 진행이 hero', screens: [
      { name: '위탁 案件', route: '/consulting/agency/new',
        sections: [{ label: '내용', items: ['컨설턴트의 위탁 수신·수락/거절', '진행 案件 목록·이력'] }],
        rel: '← 컨설턴트 시공 위탁 · ↔ 진행 案件' },
      { name: '시공 진행', route: '/agency/work', hero: true,
        sections: [
          { label: '진척률', items: ['단계별 % · 일정 vs 실제'] },
          { label: '준비',   items: ['견적·일정·자재 발주·입고'] },
          { label: '보고',   items: ['일일 작업 보고·사진 첨부'] },
        ],
        rel: '→ 컨설턴트 진척 보고' },
      { name: '시운전·검수', route: '/agency/inspection',
        sections: [{ label: '내용', items: ['시운전 결과·검수 신청·합격/보완'] }],
        rel: '→ 컨설턴트 검수' },
      { name: '유지보수·A/S', route: '/agency/as',
        sections: [{ label: '내용', items: ['긴급 수리·정기 점검·이력 관리'] }],
        rel: '← 수용가·발전사 A/S 신청' },
    ]},
    { no: 'E', name: '③ 정산·요금', sub: '시공비 — 시공비 정산이 hero', screens: [
      { name: '시공비 정산', route: '/consulting/settlement', hero: true,
        sections: [
          { label: 'KPI',     items: ['이달 수금·누적·미수금'] },
          { label: '단계',    items: ['계약금 → 중도금 → 잔금'] },
        ],
        rel: '← 컨설턴트 사업비 지급' },
      { name: '세금계산서', route: '/agency/tax-invoice',
        sections: [{ label: '내용', items: ['발행·수취 현황'] }] },
    ]},
  ],
  diff: [
    '신규 페르소나로 등록 (이전엔 컨설팅 하위 운영)',
    '위탁·시공·유지보수 → 컨설팅 하나로 통합 (이름 통일)',
    '정산·증빙 → 정산·요금 이름 통일',
    '/consulting/agency/* 와 /agency/* 라우트 정리',
  ],
  open: ['컨설턴트 → 용역사 위탁 인터페이스 정의', '발전소 준공 후 모니터링 권한'],
  jSteps: [
    { no: 'STEP 1', title: '시공 위탁 수신',     gnb: 'consulting', path: '컨설팅 > 위탁 案件',     route: '/consulting/agency/new' },
    { no: 'STEP 2', title: '견적·일정·자재',     gnb: 'consulting', path: '컨설팅 > 시공 진행',     route: '/agency/work' },
    { no: 'STEP 3', title: '설치·시공',          gnb: 'consulting', path: '컨설팅 > 시공 진행',     route: '/agency/work' },
    { no: 'STEP 4', title: '시운전·검수',        gnb: 'consulting', path: '컨설팅 > 시운전·검수',   route: '/agency/inspection' },
    { no: 'STEP 5', title: '시공비 정산',        gnb: 'billing',    path: '정산·요금 > 시공비 정산', route: '/consulting/settlement' },
    { no: 'STEP 6', title: '유지보수·A/S',       gnb: 'consulting', path: '컨설팅 > 유지보수·A/S',  route: '/agency/as' },
  ],
  jDecisions: [
    { q: '작업 유형?', branches: [
      { label: '신규 시공',   desc: '발전설비 신규 설치 (태양광/연료전지/ORC)' },
      { label: '유지보수',    desc: '기설치 설비 A/S·정기 점검' },
    ], note: '작업 유형이 단계 흐름을 결정' },
    { q: '준공 검수?', hint: 'STEP 5', branches: [
      { label: '합격', desc: '준공 → 운영 전환·정산 청구', tone: 'ok' },
      { label: '보완', desc: '재시공·보완 조치', tone: 'no' },
    ], meta: '검수자: 독립 컨설턴트' },
    { q: 'A/S 유형?', branches: [
      { label: '정기 점검', desc: '계획된 일정' },
      { label: '긴급 수리', desc: '장애·고장 대응', tone: 'no' },
    ]},
  ],
  jConcerns: [
    { no: '①', label: '신규 위탁',     desc: '인입 案件 알림',         mapping: '→ 대시보드 Z1 + 신규 위탁', tone: 'dashboard' },
    { no: '②', label: '시공 진척',     desc: '단계·지연 案件',         mapping: '→ 대시보드 Z2 + 시공 진행', tone: 'consulting' },
    { no: '③', label: '자재·일정',     desc: '발주·입고·인력',         mapping: '→ 자재 발주',                tone: 'trading' },
    { no: '④', label: '시공비',        desc: '단계별 수금',            mapping: '→ 시공비 정산',              tone: 're100' },
    { no: '⑤', label: 'A/S',          desc: '미처리·평균 대응 시간',  mapping: '→ A/S 요청',                 tone: 'red' },
  ],
  jCheckpoints: [
    '컨설턴트 → 용역사 위탁 데이터 모델',
    '시공 진행 보고 표준화 (사진·일지)',
    '준공 후 모니터링 권한 — 발전사로 이관 시점',
  ],
}

/* 전기공급사업자 (SPC) — 5 GNB (발전량 예측 별도·정산 허브) */
const PLAN_SPC: PersonaPlan = {
  priorities: [
    { rank: 1, label: '총 거래량·매칭률',   desc: '중개 운영 핵심 — 양쪽(발전사·수용가)을 본다' },
    { rank: 2, label: 'SPC 마진',           desc: '단가차익 (청구액 − 지급액)' },
    { rank: 3, label: '정산 정확도',         desc: '잠정→확정 전환률·분쟁률' },
    { rank: 4, label: '수급 예측·오차율',    desc: 'SPC 예측 vs 발전사 실측 (페널티 직결)' },
    { rank: 5, label: '미정산·분쟁',         desc: '재정산·수정세금계산서' },
  ],
  nav: [
    { idx: '①', name: '대시보드', route: '/spc', lnb: null, note: 'LNB 없음 · 단독 홈 · 허브' },
    { idx: '②', name: '전력거래', sub: '"중개" — 양쪽을 본다 (+ 매칭)', lnb: [
      { name: '거래 현황',        route: '/platform/trading' },
      { name: '거래 모니터링',    route: '/platform/ppa/status' },
      { name: 'PPA 운영 현황',    route: '/platform/ppa/dashboard' },
    ]},
    { idx: '③', name: '발전량 예측', route: '/platform/ppa/forecast', lnb: null,
      note: 'SPC 고유 (수급 예측) · 단일 화면 · 탭(예측·예측 vs 실적·오차/페널티·모델 성능)' },
    { idx: '④', name: '정산', sub: '"중개·정산 허브" — SPC의 핵심', lnb: [
      { name: '정산',             route: '/platform/ppa/billing/settlement' },
      { name: '세금계산서',       route: '/platform/ppa/billing/tax-invoice' },
      { name: '발전량 초과/미달', route: '/platform/ppa/billing/usage-deviation' },
      { name: 'SPC 마진',         route: '/platform/ppa/status/margin' },
    ]},
    { idx: '⑤', name: '이행·증빙', sub: '증빙·문서', lnb: [
      { name: '문서 생성',        route: '/platform/ppa/documents/generation' },
      { name: '문서 보관함',      route: '/platform/ppa/documents' },
    ]},
  ],
  navCommon: ['탄소거래', 'e-Data', 'VPP', 'DT'],
  designIntent: [
    '거래·매칭 → 전력거래로 이름 통일 (SPC는 양쪽 + 매칭이 특징)',
    '발전량 예측을 별도 GNB로 (SPC 고유 — 수급 예측, 정산 정확도의 전제)',
    '정산을 SPC의 핵심 허브로 (정산·세금계산서·초과/미달·마진 통합)',
  ],
  dashboard: {
    route: '/spc', sub: 'LNB 없음 · 단독 홈 · 허브',
    zones: [
      { z: 'Zone 1', title: '거래량·매칭', items: ['실시간 거래량·24/7 CFE 매칭률 → ② 거래 모니터링', '신규 신청 처리 → ② 거래 현황'] },
      { z: 'Zone 2', title: 'SPC 마진',    items: ['이달 마진·누적·자원유형별 분해 → ④ SPC 마진'] },
      { z: 'Zone 3', title: '정산 현황',   items: ['잠정·확정·분쟁 案件 수·다음 정산일 → ④ 정산'] },
      { z: 'Zone 4', title: '수급 예측',   items: ['오차율 게이지·페널티 → ③ 발전량 예측'] },
    ],
  },
  gnbs: [
    { no: 'D', name: '② 전력거래', sub: '"중개" — 거래 모니터링이 hero', screens: [
      { name: '거래 현황', route: '/platform/trading',
        sections: [{ label: '내용', items: ['신규 신청 처리·접수 큐'] }],
        rel: '← 수용가·발전사 거래 신청' },
      { name: '거래 모니터링', route: '/platform/ppa/status', hero: true, sub: '핵심 화면',
        sections: [
          { label: '4탭',   items: ['발전사 거래 · 수요기업 거래 · 매칭 이력 · SPC 마진'] },
          { label: '액션',  items: ['시간단위 매칭·우선순위·알고리즘 감사'] },
        ],
        rel: '↔ 발전사·수용가 양면 매칭' },
      { name: 'PPA 운영 현황', route: '/platform/ppa/dashboard',
        sections: [{ label: '내용', items: ['PPA 전체 운영 지표·자원별 거래량·CFE'] }] },
    ]},
    { no: 'E', name: '③ 발전량 예측', sub: 'SPC 고유 — 수급 예측 (단일 화면·탭)', screens: [
      { name: '발전량 예측', route: '/platform/ppa/forecast', hero: true,
        sections: [
          { label: '탭',    items: ['예측 · 예측 vs 실적 · 오차/페널티 · 모델 성능'] },
          { label: '역할',  items: ['수급 예측으로 정산 단가·편차 산출의 전제 제공'] },
        ],
        rel: '↔ 발전사 실측 · 수용가 사용량 (예측 vs 실측 → 정산)' },
    ]},
    { no: 'F', name: '④ 정산', sub: '"중개·정산 허브" — SPC의 핵심, 정산이 hero', screens: [
      { name: '정산', route: '/platform/ppa/billing/settlement', hero: true, sub: '핵심 화면',
        sections: [
          { label: '탭',    items: ['정산 · 수금·지급 · 이력·감사'] },
          { label: '4상태', items: ['잠정 → 확정 → 세금계산서 → 수금/지급'] },
          { label: '산출',  items: ['발전량 × SMP 단가·24/7 매칭률 적용'] },
        ],
        rel: '→ 수용가·발전사·관리자 동기화 (단일 데이터, 다중 뷰)' },
      { name: '세금계산서', route: '/platform/ppa/billing/tax-invoice',
        sections: [{ label: '내용', items: ['확정 후 자동 발행·일괄 처리·수정세금계산서'] }],
        rel: '→ 수용가·발전사 수취' },
      { name: '발전량 초과/미달', route: '/platform/ppa/billing/usage-deviation',
        sections: [{ label: '내용', items: ['초과/미달 편차 보정 정산·패널티'] }],
        rel: '↔ 발전사 초과 · 수용가 부족 (동일 이벤트)' },
      { name: 'SPC 마진', route: '/platform/ppa/status/margin', hero: true, sub: '관리자 권한 일부',
        sections: [
          { label: '산식',   items: ['수용가 청구액 − 발전사 지급액 = 마진'] },
          { label: '분해',   items: ['자원유형별·계약별·기간별'] },
        ],
        rel: '↔ 관리자 정산 감사' },
    ]},
    { no: 'G', name: '⑤ 이행·증빙', sub: '증빙·문서', screens: [
      { name: '문서 생성', route: '/platform/ppa/documents/generation',
        sections: [{ label: '내용', items: ['거래·정산 증빙 문서 생성·일괄 발급'] }],
        rel: '→ 수용가 이행증빙·발전사 REC' },
      { name: '문서 보관함', route: '/platform/ppa/documents',
        sections: [{ label: '내용', items: ['발급 문서 보관·검색·다운로드·공유'] }] },
    ]},
  ],
  diff: [
    '대시보드 LNB 제거 → 단독 홈·허브 (거래량·마진 중심)',
    '거래·매칭 → 전력거래로 이름 통일 (양쪽 + 매칭이 SPC 특징)',
    '발전량 예측을 별도 GNB로 승격 (SPC 고유 — 수급 예측)',
    '정산을 핵심 허브로 — 정산·세금계산서·초과/미달·마진 통합',
    '증빙 → 이행·증빙으로 이름 통일',
  ],
  open: ['발전량 예측 GNB 독립 유지 vs 정산에 흡수', 'SPC 마진 위치(② 거래 status 하위 vs ④ 정산)', '마진 노출 권한 (관리자 일부)'],
  jSteps: [
    { no: 'STEP 1', title: '거래 신청 수신',          gnb: 'trading',    path: '전력거래 > 거래 현황',      route: '/platform/trading' },
    { no: 'STEP 2', title: '매칭·계약 중개',           gnb: 'trading',    path: '전력거래 > 거래 모니터링',  route: '/platform/ppa/status' },
    { no: 'STEP 3', title: '발전량 예측·실적',         gnb: 'consulting', path: '발전량 예측 > 예측',        route: '/platform/ppa/forecast' },
    { no: 'STEP 4', title: '잠정 정산',                gnb: 'billing',    path: '정산 > 정산',              route: '/platform/ppa/billing/settlement' },
    { no: 'STEP 5', title: '확정·세금계산서 발행',     gnb: 'billing',    path: '정산 > 세금계산서',        route: '/platform/ppa/billing/tax-invoice' },
    { no: 'STEP 6', title: '수금·지급·마진 정산',      gnb: 'billing',    path: '정산 > SPC 마진',          route: '/platform/ppa/status/margin' },
    { no: 'STEP 7', title: '증빙 문서 생성',           gnb: 're100',      path: '이행·증빙 > 문서 생성',     route: '/platform/ppa/documents/generation' },
  ],
  jDecisions: [
    { q: '매칭 결과는?', hint: 'STEP 2', branches: [
      { label: '정상', desc: '약정대로 공급', tone: 'ok' },
      { label: '부족', desc: '미달분 처리·분쟁 가능', tone: 'no' },
      { label: '초과', desc: '초과분 처리', tone: 'warn' },
    ], note: '시간단위 매칭 — 매칭 결과가 정산 단가·편차에 직결' },
    { q: '정산 상태?', hint: 'STEP 4 → 7', branches: [
      { label: '잠정',          desc: '검토 대기' },
      { label: '확정',          desc: '세금계산서 발행·수금/지급', tone: 'ok' },
      { label: '분쟁/재정산',   desc: '수정세금계산서', tone: 'no' },
    ], meta: '데이터 원천: 발전량(계량기) × SMP × 24/7 매칭률' },
    { q: '예측 오차율?', hint: 'STEP 3', branches: [
      { label: '허용 범위 내', desc: '정상 정산', tone: 'ok' },
      { label: '초과',         desc: '발전량 초과/미달 편차 정산·패널티', tone: 'no' },
    ]},
  ],
  jConcerns: [
    { no: '①', label: '거래량·매칭률', desc: '실시간 거래량·CFE',          mapping: '→ 대시보드 Z1 + 거래 모니터링', tone: 'trading' },
    { no: '②', label: 'SPC 마진',      desc: '단가차익·자원별 분해',        mapping: '→ 대시보드 Z2 + SPC 마진',      tone: 'billing' },
    { no: '③', label: '정산 정확도',   desc: '잠정→확정 전환률',            mapping: '→ 정산 (이력·감사 탭)',          tone: 'dashboard' },
    { no: '④', label: '수급 예측',     desc: '예측 vs 실측·페널티',          mapping: '→ 발전량 예측',                  tone: 'consulting' },
    { no: '⑤', label: '분쟁·미정산',   desc: '재정산·수정세금계산서',        mapping: '→ 정산 + 발전량 초과/미달',      tone: 'red' },
  ],
  jCheckpoints: [
    '발전량 예측 GNB 독립 유지 vs 정산에 흡수',
    'SPC 마진 화면 위치 (② 거래 status 하위 vs ④ 정산)',
    '문서 생성 vs 보관함 분리 유지 여부',
  ],
}

/* 관리자 — 거래 주체 아닌 감독·감사. 5 GNB (회원·권한/통합 관제/정산 감사/시스템·로그) */
const PLAN_ADMIN: PersonaPlan = {
  priorities: [
    { rank: 1, label: '누가 플랫폼에 있나',    desc: '기업·사용자·승인 대기·역할 (거버넌스)' },
    { rank: 2, label: '전체가 잘 도나',        desc: '통합 운영·전체 거래·이상 탐지 (읽기 전용 감독)' },
    { rank: 3, label: '돈 흐름은 정확한가',    desc: '정산 감사·SPC 마진 검증 (운영 아님, 감사)' },
    { rank: 4, label: '시스템은 정상인가',     desc: '앱·DB·LASEE API·배치 스케줄' },
    { rank: 5, label: '누가 무엇을 했나',      desc: '감사 로그·접근 통제' },
  ],
  nav: [
    { idx: '①', name: '대시보드', route: '/platform', lnb: null,
      note: '통합 관제 홈 · 사용자·기업·승인대기·계약 KPI + 발전소·이상·출력 통합관제 + 최근 감사 로그' },
    { idx: '②', name: '회원·권한', sub: '"누가 플랫폼에 있나" (거버넌스)', lnb: [
      { name: '기업 초대',     route: '/platform/invitations' },
      { name: '승인 관리',     route: '/platform/approvals' },
      { name: '기업 관리',     route: '/platform/companies' },
      { name: '사용자 관리',   route: '/platform/users' },
      { name: '역할·권한',     route: '/platform/roles' },
    ]},
    { idx: '③', name: '통합 관제', sub: '"전체가 잘 도나" (읽기 전용 감독)', lnb: [
      { name: '통합 운영 현황',     route: '/platform/operations' },
      { name: '전체 거래 모니터링', route: '/platform/trading · /platform/ppa/status' },
      { name: '이상감지',          route: '/monitoring/anomalies' },
    ]},
    { idx: '④', name: '정산 감사', sub: '"돈 흐름 감독" (운영 아님, 감사)', lnb: [
      { name: '정산 감사',     route: '/platform/ppa/billing/settlement' },
      { name: 'SPC 마진',      route: '/platform/ppa/status/margin' },
      { name: '세금계산서',    route: '/platform/ppa/billing/tax-invoice' },
    ]},
    { idx: '⑤', name: '시스템·로그', sub: '운영 인프라', lnb: [
      { name: '감사 로그',     route: '/platform/audit-logs' },
      { name: '시스템 상태',   route: '/platform/system' },
      { name: '시스템 설정',   route: '/platform/settings' },
      { name: '알림 설정',     route: '/platform/notification-settings' },
    ]},
  ],
  navCommon: ['탄소거래', 'e-Data', 'VPP', 'DT'],
  designIntent: [
    '관리자는 거래·정산의 주체가 아닌 감독·감사 — 전력거래 대신 "통합 관제"(읽기 전용)',
    '정산도 운영이 아닌 "정산 감사"(감사 뷰) — SPC 마진은 관리자 전용',
    '회원·권한(거버넌스)·시스템·로그는 운영자 고유 GNB — 대시보드는 통합 관제 홈',
  ],
  dashboard: {
    route: '/platform', sub: '통합 관제 홈 · 모든 위젯이 해당 GNB로 딥링크',
    zones: [
      { z: 'Zone 1', title: '회원·승인', items: ['사용자·기업·승인대기·계약 KPI → ② 회원·권한', '신규 초대 응답률'] },
      { z: 'Zone 2', title: '통합 관제', items: ['발전소·이상·출력 통합관제 → ③ 통합 관제', '전체 거래량'] },
      { z: 'Zone 3', title: '정산 감사', items: ['감사 대기 案件·SPC 마진 이상 → ④ 정산 감사'] },
      { z: 'Zone 4', title: '감사·시스템', items: ['최근 감사 로그·시스템 상태 → ⑤ 시스템·로그'] },
    ],
  },
  gnbs: [
    { no: 'D', name: '② 회원·권한', sub: '"누가 플랫폼에 있나" 거버넌스 — 승인 관리가 hero', screens: [
      { name: '기업 초대', route: '/platform/invitations',
        sections: [{ label: '내용', items: ['신규 산단 기업 초대·응답 추적'] }] },
      { name: '승인 관리', route: '/platform/approvals', hero: true, sub: '핵심 화면',
        sections: [
          { label: 'KPI',   items: ['승인 대기 건수·평균 처리 시간'] },
          { label: '액션',  items: ['기업·사용자·역할 승인·반려·사유 등록'] },
        ],
        rel: '← 신규 페르소나(수용가·발전사 등) 가입 요청' },
      { name: '기업 관리', route: '/platform/companies',
        sections: [{ label: '내용', items: ['기업 목록·상세·상태·계약 현황'] }] },
      { name: '사용자 관리', route: '/platform/users',
        sections: [{ label: '내용', items: ['사용자 목록·검색·필터·상태'] }] },
      { name: '역할·권한', route: '/platform/roles',
        sections: [{ label: '내용', items: ['6종 페르소나 역할 부여·권한 매핑·접근 정책'] }] },
    ]},
    { no: 'E', name: '③ 통합 관제', sub: '"전체가 잘 도나" 읽기 전용 감독 — 통합 운영 현황이 hero', screens: [
      { name: '통합 운영 현황', route: '/platform/operations', hero: true,
        sections: [
          { label: '관제',  items: ['발전소·이상·출력 통합관제 (맵/상태)'] },
          { label: 'KPI',   items: ['전체 가동률·이상 건수·실시간 출력'] },
        ],
        rel: '← 발전사 모니터링 · SPC 거래 (읽기 전용)' },
      { name: '전체 거래 모니터링', route: '/platform/trading · /platform/ppa/status',
        sections: [{ label: '내용', items: ['실시간 거래량·자원별 분해·필터(수용가·발전사·SPC)'] }],
        rel: '← SPC 매칭 엔진·거래 모니터링' },
      { name: '이상감지', route: '/monitoring/anomalies',
        sections: [{ label: '내용', items: ['이상 거래·설비 패턴·자동 알림·조사'] }] },
    ]},
    { no: 'F', name: '④ 정산 감사', sub: '"돈 흐름 감독" 감사 — 정산 감사가 hero', screens: [
      { name: '정산 감사', route: '/platform/ppa/billing/settlement', hero: true, sub: '감사 뷰',
        sections: [
          { label: 'KPI',   items: ['감사 대기·이상 案件·SPC 마진 검증'] },
          { label: '액션',  items: ['감사 실행·재정산 요청·승인'] },
        ],
        rel: '← SPC 정산 운영 (동일 데이터, 감사 관점)' },
      { name: 'SPC 마진', route: '/platform/ppa/status/margin', sub: '관리자 전용',
        sections: [{ label: '산식', items: ['수용가 청구액 − 발전사 지급액 = 마진', '자원유형별·계약별 분해'] }],
        rel: '↔ SPC 마진 추적 (관리자만 전체 노출)' },
      { name: '세금계산서', route: '/platform/ppa/billing/tax-invoice',
        sections: [{ label: '내용', items: ['세금계산서 검증·세무 신고·이상 점검'] }] },
    ]},
    { no: 'G', name: '⑤ 시스템·로그', sub: '운영 인프라 — 감사 로그가 hero', screens: [
      { name: '감사 로그', route: '/platform/audit-logs', hero: true,
        sections: [{ label: '내용', items: ['전 활동 로그·접근·변경 이력', '검색·필터·내보내기'] }],
        rel: '↔ 전 페르소나 활동 추적' },
      { name: '시스템 상태', route: '/platform/system',
        sections: [{ label: '내용', items: ['앱·DB·LASEE API·배치 스케줄 상태·알람'] }] },
      { name: '시스템 설정', route: '/platform/settings',
        sections: [{ label: '내용', items: ['공통 코드·기준정보·운영 설정'] }] },
      { name: '알림 설정', route: '/platform/notification-settings',
        sections: [{ label: '내용', items: ['공지 발행·알림 채널·발송 이력'] }] },
    ]},
  ],
  diff: [
    '대시보드 → 통합 관제 홈 (회원·관제·감사·시스템 KPI 한 화면)',
    '거래·계약 → 통합 관제로 (관리자는 거래 주체 아닌 읽기 전용 감독)',
    '정산 → 정산 감사로 명확화 (운영 아님 · SPC 마진 관리자 전용)',
    '회원·권한(거버넌스) GNB로 통합 (초대·승인·기업·사용자·역할)',
    '시스템·로그 묶음 (감사 로그·시스템 상태·설정·알림)',
  ],
  open: ['통합 관제 읽기 전용 범위 (승인 액션은 ②에만)', 'SPC 마진 관리자 전용 노출 범위', '시스템 상태 외부 연동(LASEE API·배치)'],
  jSteps: [
    { no: 'STEP 1', title: '기업 초대',              gnb: 'consulting', path: '회원·권한 > 기업 초대',       route: '/platform/invitations' },
    { no: 'STEP 2', title: '가입 승인·역할 부여',    gnb: 'consulting', path: '회원·권한 > 승인 관리',       route: '/platform/approvals' },
    { no: 'STEP 3', title: '통합 운영 감독',         gnb: 'trading',    path: '통합 관제 > 통합 운영 현황',  route: '/platform/operations' },
    { no: 'STEP 4', title: '거래·이상 모니터링',     gnb: 'trading',    path: '통합 관제 > 전체 거래 모니터링', route: '/platform/trading' },
    { no: 'STEP 5', title: '정산 감사·마진 검증',    gnb: 'billing',    path: '정산 감사 > 정산 감사',       route: '/platform/ppa/billing/settlement' },
    { no: 'STEP 6', title: '감사 로그 추적',         gnb: 're100',      path: '시스템·로그 > 감사 로그',     route: '/platform/audit-logs' },
    { no: 'STEP 7', title: '시스템 운영·설정',       gnb: 're100',      path: '시스템·로그 > 시스템 상태',   route: '/platform/system' },
  ],
  jDecisions: [
    { q: '가입 승인?', hint: 'STEP 2', branches: [
      { label: '승인', desc: '역할 부여 단계로', tone: 'ok' },
      { label: '거절', desc: '반려 사유 등록', tone: 'no' },
    ]},
    { q: '이상 탐지?', hint: 'STEP 4', branches: [
      { label: '통과',  desc: '정상 거래·운영', tone: 'ok' },
      { label: '의심',  desc: '추가 조사 필요', tone: 'warn' },
      { label: '차단',  desc: '거래 중단·계정 잠금', tone: 'no' },
    ], meta: '자동 알림 + 수동 검토 (읽기 전용 감독)' },
    { q: '정산 감사?', hint: 'STEP 5', branches: [
      { label: '통과',          desc: '확정·종결', tone: 'ok' },
      { label: '분쟁 발생',     desc: 'SPC 재정산 트리거', tone: 'no' },
    ]},
  ],
  jConcerns: [
    { no: '①', label: '누가 있나',      desc: '승인 대기·기업·사용자·역할', mapping: '→ 대시보드 Z1 + 회원·권한',     tone: 'consulting' },
    { no: '②', label: '전체가 잘 도나', desc: '통합 운영·전체 거래·이상',   mapping: '→ 대시보드 Z2 + 통합 관제',     tone: 'trading' },
    { no: '③', label: '돈 흐름',        desc: 'SPC 마진 검증·재정산',        mapping: '→ 정산 감사',                   tone: 'billing' },
    { no: '④', label: '시스템 정상?',   desc: '앱·DB·API·배치 상태',         mapping: '→ 시스템·로그 (시스템 상태)',    tone: 're100' },
    { no: '⑤', label: '누가 무엇을',    desc: '접근·변경 이력 추적',         mapping: '→ 시스템·로그 (감사 로그)',      tone: 'red' },
  ],
  jCheckpoints: [
    '통합 관제 읽기 전용 범위 — 승인/제어 액션은 ② 회원·권한에만',
    'SPC 마진 관리자 전용 노출 — SPC 화면과 권한 분리',
    '시스템 상태 외부 연동 (LASEE API·배치 스케줄 모니터링)',
  ],
}

/* 페르소나 키 → PLAN 매핑 */
const PLANS: Partial<Record<ColorKey, PersonaPlan>> = {
  consumer:   PLAN_CONSUMER,
  generator:  PLAN_GENERATOR,
  consultant: PLAN_CONSULTANT,
  agency:     PLAN_AGENCY,
  spc:        PLAN_SPC,
  admin:      PLAN_ADMIN,
}

/* 페르소나 키 → 한글명 (헤더 타이틀용) */
const PERSONA_NAME_KO: Record<ColorKey, string> = {
  consumer:   '수용가',
  generator:  '발전사업자',
  consultant: '컨설턴트',
  agency:     '용역사',
  spc:        '전기공급사업자',
  admin:      '관리자',
}

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

/* 페르소나 유저 플로우 — 신규 GNB 기준 (N STEP + 분기 + 관심사→화면) */
function PersonaJourney({ plan, name }: { plan: PersonaPlan; name: string }) {
  // 슬롯 → 실제 GNB 이름: jSteps.path 첫 토큰("전력거래 > ..." → "전력거래")에서 역산.
  // 페르소나마다 같은 색 슬롯이 다른 GNB(예: 관리자의 consulting 슬롯 = "사용자·기업")일 수 있어 라벨을 동적으로.
  const slotLabel = (k: CGnbKey): string => {
    const step = plan.jSteps.find((s) => s.gnb === k)
    if (step) return step.path.split(' > ')[0].trim()
    return GNB_COMMON_LABEL[k]
  }
  // 범례엔 실제 사용하는 슬롯만 (+대시보드는 항상)
  const usedSlots = Array.from(new Set<CGnbKey>(['dashboard', ...plan.jSteps.map((s) => s.gnb)]))
  return (
    <div className="cj">
      <div className="cj-head">
        <div>
          <h3>{name} 유저 플로우 — 신규 GNB 기준 화면 단계·분기</h3>
          <p>STEP {plan.jSteps.length}단계 흐름. 카드 색 = 소속 GNB. 화살표 = 주 경로. 아래 다이아몬드 = 분기점.</p>
        </div>
        <div className="cj-legend">
          {usedSlots.map((k) => (
            <span key={k} className="cj-lg-item">
              <span className="cj-lg-sw" style={{ background: CGNB_META[k].soft, borderColor: CGNB_META[k].line }} />
              <span style={{ color: CGNB_META[k].ink, fontWeight: 700 }}>{slotLabel(k)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* N STEPs */}
      <div className="cj-sec-h">☰ 유저 플로우 — 실제 화면 단계 ({plan.jSteps.length})</div>
      <div className="cj-steps">
        {plan.jSteps.map((s, i) => {
          const m = CGNB_META[s.gnb]
          return (
            <Fragment key={s.no}>
              <div className="cj-step" style={{ background: m.soft, borderColor: m.line }}>
                <div className="cj-step-no" style={{ color: m.ink }}>{s.no}</div>
                <div className="cj-step-title">{s.title}</div>
                <div className="cj-step-meta">
                  <span className="cj-step-path">ⓘ {s.path}</span>
                  <code className="cj-step-route">{s.route}</code>
                </div>
              </div>
              {i < plan.jSteps.length - 1 && <div className="cj-step-arrow">→</div>}
            </Fragment>
          )
        })}
      </div>

      {/* 분기점 */}
      <div className="cj-sec-h">☰ 프로세스 흐름 — 주요 분기점</div>
      <div className="cj-decisions">
        {plan.jDecisions.map((d, i) => (
          <div key={i} className={`cj-deci${d.isDashboard ? ' cj-deci--dash' : ''}`}>
            <div className="cj-deci-q">
              <span className="cj-deci-dia">◇</span>
              <span>{d.q}</span>
              {d.hint && <span className="cj-deci-hint">({d.hint})</span>}
            </div>
            {d.branches.length > 0 && (
              <div className="cj-deci-branches">
                {d.branches.map((b) => (
                  <div key={b.label} className={`cj-branch${b.tone ? ` cj-branch--${b.tone}` : ''}`}>
                    <div className="cj-branch-l">{b.label}</div>
                    <div className="cj-branch-d">{b.desc}</div>
                  </div>
                ))}
              </div>
            )}
            {d.note && <div className="cj-deci-note">→ {d.note}</div>}
            {d.meta && <div className="cj-deci-meta">{d.meta}</div>}
          </div>
        ))}
      </div>

      {/* 관심사 → 화면 */}
      <div className="cj-sec-h">☰ {name}이(가) 각 단계에서 궁금한 것 (관심사 → 화면)</div>
      <div className="cj-concerns">
        {plan.jConcerns.map((c) => {
          const t = CJ_CONCERN_TONES[c.tone]
          return (
            <div key={c.no} className="cj-concern" style={{ background: t.bg, borderColor: t.bd }}>
              <div className="cj-concern-h" style={{ color: t.ink }}>
                <span className="cj-concern-no">{c.no}</span>
                <span className="cj-concern-label">{c.label}</span>
              </div>
              <div className="cj-concern-desc">{c.desc}</div>
              <div className="cj-concern-map" style={{ color: t.ink }}>{c.mapping}</div>
              {c.hint && <div className="cj-concern-hint">{c.hint}</div>}
            </div>
          )
        })}
      </div>

      {/* 검토 포인트 */}
      <div className="cj-checkpoints">
        <b>검토 포인트</b>
        <ol>{plan.jCheckpoints.map((c, i) => <li key={i}>({i + 1}) {c}</li>)}</ol>
      </div>
    </div>
  )
}

/* 단일 화면 카드 — Screen 한 건 */
function ScreenCard({ scr }: { scr: Screen }) {
  return (
    <div className={`csm-scr${scr.hero ? ' csm-scr--hero' : ''}`}>
      <div className="csm-scr-h">
        <div className="csm-scr-title">
          <span className="csm-scr-name">{scr.name}</span>
          {scr.sub && <span className="csm-scr-sub">— {scr.sub}</span>}
        </div>
        <code className="csm-scr-route">{scr.route}</code>
      </div>
      {scr.sections.map((s) => (
        <div key={s.label} className="csm-scr-sec">
          <div className="csm-scr-label">{s.label}</div>
          <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
        </div>
      ))}
      {scr.warn && <div className="csm-scr-warn">⚠ {scr.warn}</div>}
      {scr.rel && <div className="csm-scr-rel">{scr.rel}</div>}
    </div>
  )
}

/* GNB 섹션 박스 */
function GnbSection({ no, name, sub, screens }: { no: string; name: string; sub?: string; screens: Screen[] }) {
  return (
    <div className="csm-sec">
      <div className="csm-sec-h">
        <span className="csm-sec-no">{no}</span>
        <h4>GNB {name}</h4>
        {sub && <p>{sub}</p>}
      </div>
      <div className="csm-scr-grid">
        {screens.map((s) => <ScreenCard key={s.name} scr={s} />)}
      </div>
    </div>
  )
}

/* 페르소나 화면 구성안 — 관심사 → 메뉴 트리 → GNB ①~⑤ → 정산 데이터 흐름 → 변경 요약 → (옵션) 매핑·점검 매트릭스 */
function ScreenMap({ plan, name }: { plan: PersonaPlan; name: string }) {
  return (
    <div className="csm">
      <div className="csm-head">
        <div>
          <h3>{name} 화면 구성안 — GNB ①~⑤ + 대시보드</h3>
          <p>관심사 우선순위 → 메뉴 구조 → 각 화면(LNB) 상세 → 정산 데이터 흐름 → 변경 요약{plan.matrix ? ' → 매핑·점검 매트릭스' : ''} 순으로 정리</p>
        </div>
      </div>

      {/* ── A. 관심사 우선순위 ── */}
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">A</span>
          <h4>{name}은(는) 무엇이 제일 궁금한가</h4>
          <p>관심사 우선순위 = 화면 우선순위</p>
        </div>
        <div className="csm-prios">
          {plan.priorities.map((p) => (
            <div key={p.rank} className="csm-prio">
              <div className="csm-prio-rank">#{p.rank}</div>
              <div>
                <div className="csm-prio-label">{p.label}</div>
                <div className="csm-prio-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── B. 전체 메뉴 구조 ── */}
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">B</span>
          <h4>전체 메뉴 구조 (GNB → LNB)</h4>
          <p>5개 GNB + 공통 GNB 4개(별도)</p>
        </div>
        <div className="csm-tree">
          {plan.nav.map((g) => (
            <div key={g.idx} className="csm-tree-gnb">
              <div className="csm-tree-h">
                <span className="csm-tree-idx">{g.idx}</span>
                <span className="csm-tree-name">{g.name}</span>
                {g.sub && <span className="csm-tree-sub">{g.sub}</span>}
              </div>
              {'route' in g && g.route && <code className="csm-tree-route">{g.route}</code>}
              {g.lnb === null ? (
                <div className="csm-tree-note">{g.note}</div>
              ) : (
                <ul className="csm-tree-lnb">
                  {g.lnb.map((l) => (
                    <li key={l.name}>
                      <span>{l.name}</span>
                      <code>{l.route}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="csm-common-gnb">
          공통 GNB:
          {plan.navCommon.map((n) => <span key={n} className="csm-common-pill">{n}</span>)}
        </div>
        <div className="csm-intent">
          <div className="csm-intent-h">핵심 설계 — 왜 이렇게 재구성했는가</div>
          <ol>
            {plan.designIntent.map((d, i) => (
              <li key={i}><span className="csm-intent-no">{['①','②','③','④','⑤'][i] || `${i + 1}.`}</span>{d}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── C. GNB ① 대시보드 ── */}
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">C</span>
          <h4>GNB ① 대시보드 <code className="csm-inline-code">{plan.dashboard.route} · {plan.dashboard.sub}</code></h4>
          <p>관심사 순서대로 위→아래 배치. 모든 위젯은 상세 화면으로 딥링크</p>
        </div>
        <div className="csm-zones">
          {plan.dashboard.zones.map((z) => (
            <div key={z.z} className="csm-zone">
              <div className="csm-zone-h">
                <span className="csm-zone-tag">{z.z}</span>
                <span className="csm-zone-title">{z.title}</span>
              </div>
              <ul>{z.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
        {plan.dashboard.removed && (
          <div className="csm-removed">
            <b>제거된 위젯</b> · {plan.dashboard.removed.join(' · ')}
          </div>
        )}
      </div>

      {/* ── D–G. GNB ②~⑤ ── */}
      {plan.gnbs.map((g) => (
        <GnbSection key={g.no} no={g.no} name={g.name} sub={g.sub} screens={g.screens} />
      ))}

      {/* ── H. 정산 데이터 흐름 ── */}
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">H</span>
          <h4>정산 데이터 흐름 — 단일 데이터, 다중 뷰</h4>
          <p>미러 라우트로 복제하지 않고 같은 데이터를 권한·관점만 다르게 표시</p>
        </div>
        <div className="csm-flow">
          <div className="csm-flow-step">
            <div className="csm-flow-t">발전사 발전량</div>
            <div className="csm-flow-d">계량기 / RTU</div>
          </div>
          <span className="csm-flow-arrow">→</span>
          <div className="csm-flow-step csm-flow-spc">
            <div className="csm-flow-t">SPC 정산: ① 잠정 → ② 확정 → ③ 세금계산서 → ④ 수금/지급</div>
            <div className="csm-flow-d">분쟁 시 재정산 · 수정세금계산서로 분기</div>
          </div>
          <span className="csm-flow-arrow">→</span>
          <div className="csm-flow-step csm-flow-consumer">
            <div className="csm-flow-t">수용가: 정산 내역</div>
            <div className="csm-flow-d">잠정/확정 표시 → 납부 = SPC 수금</div>
          </div>
          <div className="csm-flow-side">
            <div className="csm-flow-step csm-flow-mini">
              <div className="csm-flow-t">발전사: 판매대금</div>
              <div className="csm-flow-d">수용가 지불 − SPC 마진</div>
            </div>
            <div className="csm-flow-step csm-flow-mini">
              <div className="csm-flow-t">관리자: SPC 마진</div>
              <div className="csm-flow-d">청구액 − 지급액 (전용)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── I. AS-IS → TO-BE 변경 요약 ── */}
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">I</span>
          <h4>AS-IS 대비 무엇이 바뀌나</h4>
        </div>
        <ul className="csm-diff">
          {plan.diff.map((d) => <li key={d}>{d}</li>)}
        </ul>
        <div className="csm-open">
          <b>남은 논점</b>
          {plan.open.map((o) => <span key={o} className="csm-open-pill">{o}</span>)}
        </div>
      </div>

      {/* ── J. 부록: 6단계 매트릭스 — plan.matrix 있을 때만 (현재 consumer 전용) ── */}
      {plan.matrix && <MatrixAppendix matrix={plan.matrix} />}
    </div>
  )
}

/* J. 부록 매트릭스 — consumer 전용 (legacy 한장 요약 보존) */
function MatrixAppendix({ matrix }: { matrix: NonNullable<PersonaPlan['matrix']> }) {
  return (
    <>
      <div className="csm-sec">
        <div className="csm-sec-h">
          <span className="csm-sec-no">J</span>
          <h4>부록 · 6단계 매트릭스 — 매핑·점검 한장 요약</h4>
          <p>가로 = 6단계 여정 · 위 = 저니 행동 · 아래 = 신규 GNB · 빨간 박스 = 점검 결과</p>
        </div>
        <div className="csm-mlegend">
          <span><span className="csm-lg lg-j" /> 저니 행동</span>
          <span><span className="csm-lg lg-g" /> 신규 GNB</span>
          <span><span className="csm-lg lg-c" /> 점검·변경</span>
        </div>
      </div>

      <div className="csm-grid">
        {/* PHASE HEADER ROW */}
        {matrix.phases.map((p) => (
          <div key={`ph-${p.n}`} className="csm-ph">
            <div className="pn">PHASE {p.n}</div>
            <div className="pt">{p.t}</div>
            <div className="phh">{p.h}</div>
          </div>
        ))}

        {/* ROW 1: 저니 행동 */}
        <div className="csm-row-label">☰ 저니 행동 (현 매트릭스)</div>
        {matrix.journey.map((cell, i) => {
          if ('empty' in cell) {
            return (
              <div key={`j-${i}`} className="csm-cell csm-cell--empty">
                <div className="csm-ce-t">{cell.empty.title}</div>
                {cell.empty.note && <div className="csm-ce-n">{cell.empty.note}</div>}
              </div>
            )
          }
          return (
            <div key={`j-${i}`} className="csm-cell csm-cell--j">
              <div className="csm-ca">{cell.action}</div>
              {cell.routes?.map((r) => (
                <span key={r} className="csm-route">{r}</span>
              ))}
              {cell.decision && <span className="csm-deci">◇ {cell.decision}</span>}
              {cell.handoff && <span className="csm-ho">↘ {cell.handoff}</span>}
            </div>
          )
        })}

        {/* ROW 2: 신규 GNB */}
        <div className="csm-row-label">☰ 신규 GNB / LNB 가 받는 곳</div>
        {matrix.gnb.map((cell, i) => {
          if ('empty' in cell) {
            return (
              <div key={`g-${i}`} className="csm-cell csm-cell--empty">
                <div className="csm-ce-t">{cell.empty}</div>
              </div>
            )
          }
          return (
            <div key={`g-${i}`} className="csm-cell csm-cell--g">
              <div className="csm-glabel">{cell.label}</div>
              <ul className="csm-glist">
                {cell.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              {cell.handoff && <span className="csm-glink">{cell.handoff}</span>}
            </div>
          )
        })}

        {/* ROW 3: 대시보드 (전 폭) */}
        <div className="csm-row-label">☰ GNB ① 대시보드 (/consumer · LNB 없음)</div>
        <div className="csm-dash">
          <b>전 단계를 가로지르는 단독 홈</b> — Zone1 절감액·한전비교 · Zone2 RE100 · Zone3 이번달 돈관리 · Zone4 사용량 요약 · 각 위젯이 위 GNB로 딥링크
        </div>

        {/* ROW 4: 점검 결과 (빨강) */}
        <div className="csm-row-label">☰ 점검 결과 — 현 매트릭스 대비 무엇을 바꾸나</div>
        {matrix.check.map((c, i) => (
          <div key={`c-${i}`} className="csm-cell csm-cell--c">
            <div className="csm-ct">{c.no} {c.title}</div>
            <div className="csm-cd">{c.desc}</div>
          </div>
        ))}
        {/* 6번째 칸 비움(점검 결과는 5개) */}
        <div className="csm-cell csm-cell--blank" />

        {/* ROW 5: 정산 데이터 흐름 (전 폭) */}
        <div className="csm-row-label">☰ 정산 데이터 흐름 (단일 데이터·다중 뷰) — P05 의 뒷단</div>
        <div className="csm-flow">
          <div className="csm-flow-step">
            <div className="csm-flow-t">발전사 발전량</div>
            <div className="csm-flow-d">계량기 / RTU</div>
          </div>
          <span className="csm-flow-arrow">→</span>
          <div className="csm-flow-step csm-flow-spc">
            <div className="csm-flow-t">SPC 정산: ① 잠정 → ② 확정 → ③ 세금계산서 → ④ 수금/지급</div>
            <div className="csm-flow-d">분쟁 시 재정산 · 수정세금계산서로 분기</div>
          </div>
          <span className="csm-flow-arrow">→</span>
          <div className="csm-flow-step csm-flow-consumer">
            <div className="csm-flow-t">수용가: 정산 내역</div>
            <div className="csm-flow-d">잠정/확정 표시 → 납부 = SPC 수금</div>
          </div>
          <div className="csm-flow-side">
            <div className="csm-flow-step csm-flow-mini">
              <div className="csm-flow-t">발전사: 판매대금</div>
              <div className="csm-flow-d">수용가 지불 − SPC 마진</div>
            </div>
            <div className="csm-flow-step csm-flow-mini">
              <div className="csm-flow-t">관리자: SPC 마진</div>
              <div className="csm-flow-d">청구액 − 지급액 (전용)</div>
            </div>
          </div>
        </div>

        <div className="csm-foot">
          ※ 미러 라우트(/ppa/billing ↔ /lease/billing)로 복제하지 않고, 같은 정산 데이터를 페르소나별 권한·관점만 다르게 표시. 4상태가 전 화면에서 동기화.
        </div>
      </div>
    </>
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
          {PLANS[active] ? (
            <>
              {/* PLAN 있는 페르소나: 화면 구성안(메인) → 신규 GNB 기준 유저 플로우(아래) */}
              <ScreenMap plan={PLANS[active]!} name={PERSONA_NAME_KO[active]} />
              <div className="csm-userjourney-h">
                <h4>참고 · 신규 GNB 기준 유저 플로우 — 위 화면 구성안과 연결되는 사용자 흐름</h4>
              </div>
              <PersonaJourney plan={PLANS[active]!} name={PERSONA_NAME_KO[active]} />
            </>
          ) : (
            <>
              <UserFlow p={p} />
              <Flow p={p} />
            </>
          )}
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

/* ── 수용가 화면 구성안 매트릭스 (consumer 전용) ── */
.ppm .csm{margin-top:22px;padding:20px 22px 22px;background:#fffbf5;border:1px solid #f4d8a8;border-radius:14px}
.ppm .csm-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px;flex-wrap:wrap}
.ppm .csm-head h3{margin:0 0 4px;font-size:15px;font-weight:800;letter-spacing:-.01em;color:var(--ink)}
.ppm .csm-head p{margin:0;font-size:12px;color:var(--ink-2)}
.ppm .csm-legend{display:flex;align-items:center;gap:10px;font-size:11.5px;color:var(--ink-2);flex-wrap:wrap}
.ppm .csm-lg{display:inline-block;width:14px;height:14px;border-radius:4px;margin-right:3px;vertical-align:middle}
.ppm .csm-lg.lg-j{background:#fef4d6;border:1px solid #f3d79a}
.ppm .csm-lg.lg-g{background:#fde0b8;border:1px solid #f0b974}
.ppm .csm-lg.lg-c{background:#ef4444}

.ppm .csm-grid{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:8px;overflow-x:auto}
.ppm .csm-row-label{grid-column:1 / -1;margin-top:10px;font-size:11px;font-weight:800;color:var(--ink-2);letter-spacing:.04em}

.ppm .csm-ph{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 11px}
.ppm .csm-ph .pn{font-size:11px;font-weight:800;color:var(--primary)}
.ppm .csm-ph .pt{font-weight:800;font-size:13px;margin-top:1px}
.ppm .csm-ph .phh{font-size:10.5px;color:var(--ink-3);margin-top:2px}

.ppm .csm-cell{border-radius:10px;padding:9px 10px;min-height:84px;display:flex;flex-direction:column;gap:4px;font-size:11.5px}
.ppm .csm-cell--j{background:#fef4d6;border:1px solid #f3d79a}
.ppm .csm-cell--g{background:#fde0b8;border:1px solid #f0b974}
.ppm .csm-cell--empty{background:repeating-linear-gradient(135deg,#fafbfd,#fafbfd 6px,#f3f5f8 6px,#f3f5f8 12px);border:1px dashed var(--line);color:var(--ink-3);align-items:center;justify-content:center;text-align:center}
.ppm .csm-cell--empty .csm-ce-t{font-weight:700;font-size:12px}
.ppm .csm-cell--empty .csm-ce-n{font-size:10.5px;margin-top:2px;color:var(--ink-3)}
.ppm .csm-cell--blank{background:transparent;border:0;min-height:0}

.ppm .csm-ca{font-weight:800;font-size:12px;color:var(--ink);line-height:1.35}
.ppm .csm-route{display:inline-block;font-size:9.5px;color:var(--ink-2);font-family:ui-monospace,monospace;border:1px solid #e7c989;background:#fffaef;border-radius:5px;padding:1px 5px;align-self:flex-start;margin-top:1px}
.ppm .csm-deci{display:inline-block;font-size:10px;font-weight:800;color:#b4730a;background:#fff7ea;border:1px solid #f3d79a;border-radius:999px;padding:1px 7px;align-self:flex-start;margin-top:2px}
.ppm .csm-ho{font-size:10.5px;font-weight:800;color:#8b5cf6;align-self:flex-start;margin-top:auto}

.ppm .csm-glabel{font-weight:800;font-size:12px;color:#7a4a0c}
.ppm .csm-glist{margin:2px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}
.ppm .csm-glist li{font-size:11px;color:var(--ink);font-weight:600}
.ppm .csm-glist li::before{content:'·';color:#b4730a;margin-right:4px;font-weight:800}
.ppm .csm-glink{font-size:10px;font-weight:700;color:#7a4a0c;margin-top:auto}

.ppm .csm-dash{grid-column:1 / -1;border:1.5px dashed #f0b974;background:#fff7ea;border-radius:10px;padding:10px 14px;font-size:12px;color:var(--ink);line-height:1.5}
.ppm .csm-dash b{color:#b4730a}

.ppm .csm-cell--c{background:#ef4444;color:#fff;border:0}
.ppm .csm-cell--c .csm-ct{font-weight:800;font-size:12.5px}
.ppm .csm-cell--c .csm-cd{font-size:11px;color:#fff;opacity:.92;line-height:1.45;margin-top:2px}

.ppm .csm-flow{grid-column:1 / -1;display:flex;flex-wrap:wrap;align-items:stretch;gap:8px;padding:4px 0}
.ppm .csm-flow-step{flex:1 1 0;min-width:150px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:9px 12px;display:flex;flex-direction:column;gap:2px}
.ppm .csm-flow-spc{background:#eff4ff;border-color:#cfe0ff}
.ppm .csm-flow-consumer{background:#fff7ea;border-color:#f3d79a}
.ppm .csm-flow-side{flex:1 1 220px;display:flex;flex-direction:column;gap:6px}
.ppm .csm-flow-mini{padding:6px 10px;min-width:0}
.ppm .csm-flow-t{font-weight:800;font-size:11.5px;color:var(--ink)}
.ppm .csm-flow-d{font-size:10.5px;color:var(--ink-2)}
.ppm .csm-flow-arrow{display:flex;align-items:center;font-weight:800;color:var(--ink-3)}

.ppm .csm-foot{grid-column:1 / -1;margin-top:8px;font-size:11px;color:var(--ink-3);line-height:1.5}

/* ── csm 본문: 섹션·블록 공통 ── */
.ppm .csm-sec{margin-top:20px;padding:14px 16px 16px;background:#fff;border:1px solid var(--line);border-radius:12px}
.ppm .csm-sec-h{display:flex;align-items:baseline;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.ppm .csm-sec-no{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:7px;background:#fff7ea;color:#b4730a;font-weight:800;font-size:12px;flex:none}
.ppm .csm-sec-h h4{margin:0;font-size:14.5px;font-weight:800;letter-spacing:-.01em;color:var(--ink)}
.ppm .csm-sec-h p{margin:0 0 0 4px;font-size:11.5px;color:var(--ink-3)}
.ppm .csm-inline-code{display:inline-block;font-family:ui-monospace,monospace;font-size:11px;color:var(--ink-2);background:#f3f5f8;border:1px solid var(--line);border-radius:5px;padding:1px 6px;margin-left:6px;font-weight:600}

/* A. priorities */
.ppm .csm-prios{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.ppm .csm-prio{display:flex;align-items:flex-start;gap:9px;background:#fffbf3;border:1px solid #f3d79a;border-radius:10px;padding:9px 11px}
.ppm .csm-prio-rank{font-size:14px;font-weight:900;color:#b4730a;background:#fff;border:1px solid #f3d79a;border-radius:7px;padding:1px 7px;flex:none}
.ppm .csm-prio-label{font-size:12.5px;font-weight:800;color:var(--ink)}
.ppm .csm-prio-desc{font-size:11px;color:var(--ink-2);margin-top:2px;line-height:1.4}

/* B. tree */
.ppm .csm-tree{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}
.ppm .csm-tree-gnb{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.ppm .csm-tree-h{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ppm .csm-tree-idx{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#fff7ea;color:#b4730a;font-weight:800;font-size:11.5px;flex:none}
.ppm .csm-tree-name{font-weight:800;font-size:13px;color:var(--ink)}
.ppm .csm-tree-sub{font-size:10.5px;color:var(--ink-3)}
.ppm .csm-tree-route{font-family:ui-monospace,monospace;font-size:10.5px;color:var(--ink-2);background:#f3f5f8;border:1px solid var(--line);border-radius:5px;padding:1px 6px;width:fit-content}
.ppm .csm-tree-note{font-size:11px;color:var(--ink-3);font-style:italic}
.ppm .csm-tree-lnb{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px}
.ppm .csm-tree-lnb li{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11.5px;color:var(--ink);padding:3px 0;border-bottom:1px dashed #eef0f3}
.ppm .csm-tree-lnb li:last-child{border-bottom:0}
.ppm .csm-tree-lnb code{font-size:9.5px;color:var(--ink-3);font-family:ui-monospace,monospace}

.ppm .csm-common-gnb{margin-top:10px;font-size:11.5px;color:var(--ink-2)}
.ppm .csm-common-pill{display:inline-block;font-size:10.5px;color:var(--ink-2);background:#f3f5f8;border:1px solid var(--line);border-radius:999px;padding:1px 8px;margin-left:5px;font-weight:700}
.ppm .csm-intent{margin-top:12px;background:#eff4ff;border:1px solid #cfe0ff;border-radius:10px;padding:11px 14px}
.ppm .csm-intent-h{font-size:11.5px;font-weight:800;color:var(--primary);letter-spacing:.02em;margin-bottom:6px}
.ppm .csm-intent ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.ppm .csm-intent li{font-size:12px;color:var(--ink-2);line-height:1.5;display:flex;gap:8px;align-items:flex-start}
.ppm .csm-intent-no{flex:none;font-weight:900;color:var(--primary);min-width:18px}

/* C. dashboard zones */
.ppm .csm-zones{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.ppm .csm-zone{background:linear-gradient(180deg,#fffbf3,#fff);border:1px solid #f3d79a;border-radius:10px;padding:10px 12px}
.ppm .csm-zone-h{display:flex;align-items:baseline;gap:7px;margin-bottom:6px}
.ppm .csm-zone-tag{font-size:10px;font-weight:800;color:#fff;background:#b4730a;border-radius:5px;padding:1px 6px}
.ppm .csm-zone-title{font-size:13px;font-weight:800;color:var(--ink)}
.ppm .csm-zone ul{margin:0;padding-left:14px;display:flex;flex-direction:column;gap:3px}
.ppm .csm-zone li{font-size:11px;color:var(--ink-2);line-height:1.45}
.ppm .csm-removed{margin-top:10px;font-size:11px;color:var(--ink-3);background:#f8fafc;border:1px dashed var(--line);border-radius:8px;padding:7px 10px}
.ppm .csm-removed b{color:var(--ink-2);margin-right:6px}

/* D-G. GNB sections — screen cards */
.ppm .csm-scr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.ppm .csm-scr{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.ppm .csm-scr--hero{background:#fffbf3;border-color:#f3d79a;box-shadow:0 0 0 2px rgba(180,115,10,.08)}
.ppm .csm-scr-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid #eef0f3;padding-bottom:6px}
.ppm .csm-scr--hero .csm-scr-h{border-bottom-color:#f3d79a}
.ppm .csm-scr-title{display:flex;flex-direction:column}
.ppm .csm-scr-name{font-weight:800;font-size:13.5px;color:var(--ink)}
.ppm .csm-scr--hero .csm-scr-name{color:#b4730a}
.ppm .csm-scr-sub{font-size:10.5px;color:var(--ink-3);margin-top:2px;font-weight:600}
.ppm .csm-scr-route{font-family:ui-monospace,monospace;font-size:10px;color:var(--ink-2);background:#f3f5f8;border:1px solid var(--line);border-radius:5px;padding:1px 5px;flex:none}
.ppm .csm-scr-sec{display:flex;flex-direction:column;gap:2px}
.ppm .csm-scr-label{font-size:10px;font-weight:800;color:#b4730a;letter-spacing:.04em;text-transform:uppercase}
.ppm .csm-scr-sec ul{margin:0;padding-left:14px;display:flex;flex-direction:column;gap:2px}
.ppm .csm-scr-sec li{font-size:11.5px;color:var(--ink-2);line-height:1.45}
.ppm .csm-scr-rel{margin-top:auto;font-size:10.5px;color:var(--violet);font-weight:700;border-top:1px dashed #eef0f3;padding-top:6px}
.ppm .csm-scr-warn{font-size:11px;color:#b42424;background:#fef0f0;border:1px solid #f3c9c9;border-radius:6px;padding:5px 8px}

/* I. diff & open */
.ppm .csm-diff{margin:0;padding-left:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:5px 18px}
.ppm .csm-diff li{font-size:12px;color:var(--ink-2);line-height:1.5}
.ppm .csm-open{margin-top:10px;font-size:11.5px;color:var(--ink-2);background:#f8fafc;border:1px dashed var(--line);border-radius:8px;padding:7px 10px}
.ppm .csm-open b{color:var(--ink);margin-right:6px}
.ppm .csm-open-pill{display:inline-block;font-size:10.5px;color:var(--ink-2);background:#fff;border:1px solid var(--line);border-radius:999px;padding:1px 8px;margin-left:5px;font-weight:700}

/* J. legend (matrix 부록 위) */
.ppm .csm-mlegend{display:flex;gap:14px;flex-wrap:wrap;font-size:11.5px;color:var(--ink-2);margin-top:-4px}
.ppm .csm-mlegend>span{display:inline-flex;align-items:center;gap:5px}

/* 수용가 — 유저저니 구분선 (ConsumerScreenMap 아래) */
.ppm .csm-userjourney-h{margin:24px 0 10px;padding-top:18px;border-top:2px dashed var(--line)}
.ppm .csm-userjourney-h h4{margin:0;font-size:13px;font-weight:800;color:var(--ink-2);letter-spacing:-.01em}

/* ── 수용가 유저 플로우 (신규 GNB 기준) ── */
.ppm .cj{margin-top:10px;padding:14px 16px 16px;background:#fff;border:1px solid var(--line);border-radius:12px}
.ppm .cj-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px;flex-wrap:wrap}
.ppm .cj-head h3{margin:0 0 3px;font-size:14.5px;font-weight:800;letter-spacing:-.01em;color:var(--ink)}
.ppm .cj-head p{margin:0;font-size:11.5px;color:var(--ink-3)}
.ppm .cj-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:11px}
.ppm .cj-lg-item{display:inline-flex;align-items:center;gap:5px}
.ppm .cj-lg-sw{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid}

.ppm .cj-sec-h{margin:14px 0 8px;font-size:11px;font-weight:800;color:var(--ink-2);letter-spacing:.04em}

/* 7 STEPs */
.ppm .cj-steps{display:flex;align-items:stretch;gap:6px;overflow-x:auto;padding-bottom:4px}
.ppm .cj-step{flex:1 1 0;min-width:158px;border:2px solid;border-radius:10px;padding:9px 11px;display:flex;flex-direction:column;gap:4px}
.ppm .cj-step-no{font-size:10.5px;font-weight:900;letter-spacing:.05em}
.ppm .cj-step-title{font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.35;min-height:34px}
.ppm .cj-step-meta{display:flex;flex-direction:column;gap:2px;margin-top:auto}
.ppm .cj-step-path{font-size:10px;color:var(--ink-2);font-weight:700}
.ppm .cj-step-route{font-family:ui-monospace,monospace;font-size:9.5px;color:var(--ink-3);background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.06);border-radius:4px;padding:1px 5px;width:fit-content}
.ppm .cj-step-arrow{display:flex;align-items:center;font-weight:800;font-size:18px;color:var(--ink-3);flex:none;padding:0 2px}

/* 분기점 */
.ppm .cj-decisions{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}
.ppm .cj-deci{background:#fffbf3;border:1px solid #f3d79a;border-radius:10px;padding:10px 12px}
.ppm .cj-deci--dash{background:repeating-linear-gradient(135deg,#fafbfd,#fafbfd 6px,#f3f5f8 6px,#f3f5f8 12px);border:1px dashed var(--line-strong)}
.ppm .cj-deci-q{display:flex;align-items:baseline;gap:6px;font-weight:800;font-size:13px;color:#b4730a;margin-bottom:8px;flex-wrap:wrap}
.ppm .cj-deci--dash .cj-deci-q{color:var(--ink-2)}
.ppm .cj-deci-dia{font-size:14px}
.ppm .cj-deci-hint{font-size:10.5px;font-weight:700;color:var(--ink-3)}
.ppm .cj-deci-branches{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.ppm .cj-branch{flex:1 1 0;min-width:110px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px 9px}
.ppm .cj-branch-l{font-size:11.5px;font-weight:800;color:var(--ink)}
.ppm .cj-branch-d{font-size:10.5px;color:var(--ink-2);margin-top:2px;line-height:1.4}
.ppm .cj-branch--ok{border-color:#bfe9d4;background:#eafaf3}
.ppm .cj-branch--ok .cj-branch-l{color:#0b7a52}
.ppm .cj-branch--warn{border-color:#f3d79a;background:#fff7ea}
.ppm .cj-branch--warn .cj-branch-l{color:#b4730a}
.ppm .cj-branch--no{border-color:#f3c9c9;background:#fef0f0}
.ppm .cj-branch--no .cj-branch-l{color:#b42424}
.ppm .cj-deci-note{font-size:11px;color:var(--ink-2);line-height:1.45}
.ppm .cj-deci-meta{font-size:10.5px;color:var(--ink-3);margin-top:4px;font-style:italic}

/* 관심사 → 화면 */
.ppm .cj-concerns{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}
.ppm .cj-concern{border:1px solid;border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:3px}
.ppm .cj-concern-h{display:flex;align-items:baseline;gap:5px;font-weight:800;font-size:13px}
.ppm .cj-concern-no{font-weight:900}
.ppm .cj-concern-label{font-size:13px}
.ppm .cj-concern-desc{font-size:11px;color:var(--ink);font-weight:600;line-height:1.4;margin-top:3px}
.ppm .cj-concern-map{font-size:11px;font-weight:800;margin-top:5px;line-height:1.4}
.ppm .cj-concern-hint{font-size:10.5px;color:var(--ink-3);line-height:1.4;margin-top:1px}

/* 검토 포인트 */
.ppm .cj-checkpoints{margin-top:14px;background:#f8fafc;border:1px dashed var(--line);border-radius:10px;padding:10px 14px}
.ppm .cj-checkpoints b{font-size:11.5px;color:var(--ink);margin-right:8px}
.ppm .cj-checkpoints ol{margin:5px 0 0;padding-left:14px;display:flex;flex-direction:column;gap:3px}
.ppm .cj-checkpoints li{font-size:11.5px;color:var(--ink-2);line-height:1.45;list-style:none;padding-left:0}
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
          <Link href="/" className="logo">
            <span className="spark">⚡</span>
            <span>
              에너지 자급자족 플랫폼
              <small>울산미포 스마트그린산단 · ESG 에너지 플랫폼</small>
            </span>
          </Link>
          <div className="spacer" />
          <Link href="/" className="pill">← 목록</Link>
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
export default function Page() {
  return <PersonaProcessMap />
}
