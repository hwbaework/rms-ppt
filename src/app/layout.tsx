import type { Metadata } from 'next'
import './globals.css'

// ── src/app/layout.tsx = "모든 페이지를 감싸는 공통 틀" ──
// Vite의 index.html <head> 역할을 여기가 대신한다. (폰트 로딩, 전역 CSS, <html>/<body>)
// App Router에서 layout.tsx 는 자식 페이지(page.tsx)를 children 으로 받아 감싼다.

export const metadata: Metadata = {
  metadataBase: new URL('https://rms-ppt.pairworks.net'),
  title: 'ppt',
  robots: { index: false, follow: false }, // 기존 noindex 유지
  // 카톡·SNS 링크 미리보기(Open Graph) — 이미지는 public/og-image.png 에 넣으면 자동 노출
  openGraph: {
    title: '지속가능한 통합 에너지 플랫폼',
    description: '울산미포 에너지자급자족 · 통합에너지플랫폼 구축 현황과 방향성',
    url: 'https://rms-ppt.pairworks.net',
    siteName: 'RMS PLATFORM',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/images/og-image.png', width: 1728, height: 910 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Google Material Symbols (Outlined) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
