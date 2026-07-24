import type { Metadata } from 'next'

// 이 덱 전용 링크 미리보기(OG) — 루트(모음) 설정을 덮어씀
export const metadata: Metadata = {
  title: '통합에너지플랫폼 구축 현황',
  openGraph: {
    title: '지속가능한 통합 에너지 플랫폼',
    description: '울산미포 에너지자급자족 · 통합에너지플랫폼 구축 현황과 방향성 (2026.07.30)',
    url: 'https://rms-ppt.pairworks.net/ulsan-energy/260730_demo-v2',
    siteName: 'RMS',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/images/og-image.png', width: 1728, height: 910 }],
  },
}

export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return children
}
