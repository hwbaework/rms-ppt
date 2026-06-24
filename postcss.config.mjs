// Next.js는 Vite 플러그인(@tailwindcss/vite)을 못 쓰므로,
// Tailwind v4를 PostCSS 플러그인 방식으로 연결한다. (index.css 의 @import "tailwindcss" 가 이걸로 처리됨)
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
