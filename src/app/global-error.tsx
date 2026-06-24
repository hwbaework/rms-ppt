'use client'

// 최상위(루트 레이아웃) 에러 경계 — 레이아웃 자체가 깨지는 치명적 에러용.
// 자체 <html>/<body> 를 포함해야 한다(레이아웃을 대체하므로).

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard, system-ui, sans-serif',
          background: '#172554',
          color: '#fff',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          앱에 문제가 발생했어요
        </h1>
        <p style={{ color: '#bfdbfe', marginTop: 12 }}>
          페이지를 새로고침하거나 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 28,
            background: '#fff',
            color: '#1e3a8a',
            fontWeight: 600,
            border: 0,
            borderRadius: 999,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  )
}
