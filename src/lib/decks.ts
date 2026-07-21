// ── 발표 목록 (홈 화면용 메타데이터) ──
// 실제 내용은 각 발표 폴더의 page.tsx 에 있다(폴더=URL). 여기엔 "목록에 뭘 보여줄지"만 둔다.
// 새 발표 = 폴더(page.tsx) 만들고 + 여기 한 줄 추가(최신을 위로).

export type DeckMeta = {
  region: string // 지역·사업 (그룹 머리말)
  date: string // 'YYYY-MM-DD'
  title: string
  href: string // 폴더 경로 = URL (예: '/울산-에너지자급자족/260513_플랫폼')
  description?: string
  tags?: string[]
}

// region/title 은 화면에 보이는 한글(자유), href(=URL·폴더)는 ASCII.
// (Next 정적 export 가 한글 폴더명을 못 다뤄서 URL은 영문, 화면 표기는 한글로 분리)
export const decks: DeckMeta[] = [
  {
    region: '울산 에너지자급자족',
    date: '2026-07-30',
    title: '통합에너지플랫폼 구축 현황',
    href: '/ulsan-energy/260730_demo',
    description: '발표 시나리오 v0.1 — 13페이지 1:1 구성 (경과 · 방향성 · 핵심 기능 5 · 로드맵)',
    tags: ['Platform', 'RE100', 'Roadmap'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-07-15',
    title: '탄소거래 개념 정리',
    href: '/ulsan-energy/260715_carbon',
    description: '왜 사고파는가 · 시장과 상품 · K-ETS 운영 · 측정과 CBAM',
    tags: ['K-ETS', 'Carbon', 'MRV'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-06-24',
    title: 'PPT 기획',
    href: '/ulsan-energy/260624_planning',
    description: '발표 자료 구성안 (초안, 작성 중)',
    tags: ['기획'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-06-05',
    title: '플랫폼 프로세스 맵',
    href: '/ulsan-energy/260605_processmap',
    description: '전체 프로세스 · 페르소나별 · 중복 진단 (페이지형)',
    tags: ['Page', 'Persona', 'Process'],
  },
  {
    region: '울산 에너지자급자족',
    date: '2026-05-13',
    title: '에너지 자급자족 플랫폼',
    href: '/ulsan-energy/260513_platform',
    description: '페르소나 · PPA 거래 · 앞으로의 방향',
    tags: ['PPA', 'Platform'],
  },
  {
    region: '공통',
    date: '2026-04-30',
    title: '빈 템플릿 (새 발표 시작용)',
    href: '/common/260430_blank',
    description: '복사해서 시작하는 빈 템플릿 — 이미지 표지 · 간지 없음 · 이미지 제안 슬롯',
    tags: ['Draft', 'Template'],
  },
  {
    region: '공통',
    date: '2026-04-29',
    title: '표준 데모 — 슬라이드 패턴',
    href: '/common/260429_demo',
    description: '표준 골격·레이아웃·KPI/표/차트 패턴과 새 발표 추가 가이드',
    tags: ['Demo', 'Guide'],
  },
]

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
