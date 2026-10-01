// ── 발표 목록 (홈 화면용 메타데이터) ──
// 실제 내용은 각 발표 폴더의 page.tsx 에 있다(폴더=URL). 여기엔 "목록에 뭘 보여줄지"만 둔다.
// 새 발표 = 폴더(page.tsx) 만들고 + 여기 한 줄 추가(최신을 위로)
//          + 폴더에 layout.tsx 3줄(deckMetadata) 추가 → 카톡 등 링크 미리보기에 덱 제목·설명 노출.

import type { Metadata } from 'next'

// 용도 분류 — 홈 화면 필터용. 미지정(공통·템플릿 등)은 '전체'에서만 보인다.
//   외부 = 발주처·외부 대상 발표 · 내부 = 내부 공유·작업·설계 · 개인 = 개인 정리·개념·레퍼런스
export type DeckCategory = '외부' | '내부' | '개인'

export type DeckMeta = {
  region: string // 지역·사업 (그룹 머리말)
  date: string // 'YYYY-MM-DD'
  title: string
  href: string // 폴더 경로 = URL (예: '/울산-에너지자급자족/260513_플랫폼')
  category?: DeckCategory // 용도 필터 (외부/내부/개인). 미지정 = 공통·템플릿
  description?: string
  tags?: string[]
}

// region/title 은 화면에 보이는 한글(자유), href(=URL·폴더)는 ASCII.
// (Next 정적 export 가 한글 폴더명을 못 다뤄서 URL은 영문, 화면 표기는 한글로 분리)
export const decks: DeckMeta[] = [
  {
    region: '울산 에너지자급자족',
    date: '2026-07-30',
    title: '3차년도 중간점검 보고',
    href: '/ulsan-energy/260730_midterm',
    category: '외부',
    description: '추진일정 · 2차년도 성과와 지표 · 3차년도 지표 · 인프라 추진현황(사진)',
    tags: ['중간점검', '성과지표', '인프라'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-30',
    title: '3차년도 사업 변경 신청 사전 보고 (태양광 SPC)',
    href: '/ulsan-energy/260730_spc',
    category: '외부',
    description: '태양광 SPC 설립 시기 3차→4차년도 조정 — 사유 · 일정 · 수요모집 정상화',
    tags: ['SPC', '태양광', '변경신청'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-23',
    title: 'LASEE 설치기업 페르소나·프로세스',
    href: '/ulsan-energy/260723_lasee',
    category: '내부',
    description: '설치기업 페르소나 추가 — 등록·자동배정·설치·검수·이상감지 End-to-End',
    tags: ['Persona', 'Process', 'LASEE'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-30',
    title: '통합에너지플랫폼 구축 현황 (작업본)',
    href: '/ulsan-energy/260730_demo-v2',
    category: '내부',
    description: '수정 작업 중인 개정본 — 고정본에서 분기',
    tags: ['Platform', 'WIP'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-30',
    title: '통합에너지플랫폼 구축 현황',
    href: '/ulsan-energy/260730_demo',
    category: '외부',
    description: '고정 스냅샷 — 경과 · 방향성 · 핵심 기능 4 · 로드맵 · 확장',
    tags: ['Platform', 'RE100', 'Fixed'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-15',
    title: '탄소거래 개념 정리',
    href: '/ulsan-energy/260715_carbon',
    category: '개인',
    description: '왜 사고파는가 · 시장과 상품 · K-ETS 운영 · 측정과 CBAM',
    tags: ['K-ETS', 'Carbon', 'MRV'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-06-05',
    title: '플랫폼 프로세스 맵',
    href: '/ulsan-energy/260605_processmap',
    category: '내부',
    description: '전체 프로세스 · 페르소나별 · 중복 진단 (페이지형)',
    tags: ['Page', 'Persona', 'Process'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-05-13',
    title: '에너지 자급자족 플랫폼',
    href: '/ulsan-energy/260513_platform',
    category: '외부',
    description: '페르소나 · PPA 거래 · 앞으로의 방향',
    tags: ['PPA', 'Platform'],
  },
  {
    region: '공통',
    date: '2026-10-01',
    title: '에너지 개념 정리',
    href: '/common/261001_energy-concepts',
    description: '첫 질문은 탄소 배출 여부 — 태양광(설비 흐름 · DC/AC · 전기실·분기점 · 자가소비/리스/PPA · kW/kWh) · 태양열 · 지열 · 연료전지 · ESS(구성 · 충방전 곡선 · PCS/BMS/EMS · 전압×전류 · 부하 구간 · 데이터). 설계 가이드 PDF + 구두 설명 전사 기반',
    tags: ['Concept', 'Solar', 'ESS', 'Geothermal', 'FuelCell'],
  },
  {
    region: '공통',
    date: '2026-04-30',
    title: '빈 템플릿 (새 발표 시작용)',
    href: '/common/260430_blank',
    description: '복사해서 시작하는 빈 템플릿 — 에디토리얼 표준(자체 플레이어·vw·블롭 배경) + 범용 빌딩블록',
    tags: ['Template', 'Editorial'],
  },
]

/** 덱 폴더의 layout.tsx 에서 사용 — 등록된 제목·설명을 <title>·Open Graph(카톡 미리보기)로 노출.
 *  주의: openGraph 는 루트 layout 값과 얕게 병합되어 통째로 대체되므로 이미지까지 다시 지정한다. */
export function deckMetadata(href: string): Metadata {
  const d = decks.find((x) => x.href === href)
  if (!d) return {}
  const description = d.description ?? 'RMS PLATFORM 발표자료'
  return {
    title: d.title,
    description,
    openGraph: {
      title: d.title,
      description,
      siteName: 'RMS',
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: '/images/og-image.png', width: 1728, height: 910 }],
    },
  }
}

export type RegionGroup = { region: string; decks: DeckMeta[] }

/** 지역별로 묶고, 각 지역 안에서 최신 날짜 먼저. (홈 화면용) */
export function getDecksByRegion(): RegionGroup[] {
  const map = new Map<string, DeckMeta[]>()
  for (const d of decks) {
    if (!map.has(d.region)) map.set(d.region, [])
    map.get(d.region)!.push(d)
  }
  return Array.from(map.entries()).map(([region, list]) => ({
    region,
    decks: [...list].sort((a, b) => b.date.localeCompare(a.date)),
  }))
}
