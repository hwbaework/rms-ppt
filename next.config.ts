import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 정적 내보내기: 서버 없이 out/ 폴더에 순수 정적 파일(HTML/JS/CSS)을 생성한다.
  // → 지금 Vite가 dist/ 를 만들던 것과 같은 "정적 사이트"가 되어 Cloudflare에 그대로 올릴 수 있다.
  output: 'export',
  // 모든 라우트를 폴더+index.html 로 내보낸다 → 어떤 정적 호스트에서도 클린 URL이 404 안 나게.
  trailingSlash: true,
  // next/image 최적화는 서버가 필요하므로, 정적 내보내기에서는 끈다.
  images: { unoptimized: true },
}

export default nextConfig
