'use client'

// 런타임 에러 경계 — (main) 안의 페이지가 렌더 중 에러를 던지면 이 화면이 대신 뜬다.
// (App Router는 status code별 파일이 아니라, 런타임 에러는 error.tsx, 404는 not-found.tsx 로 처리한다.)

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 px-6 text-center">
      <p className="text-7xl md:text-9xl font-black tracking-tight text-red-100 select-none">
        오류
      </p>
      <h1 className="text-2xl md:text-3xl font-bold mt-2">문제가 발생했어요</h1>
      <p className="text-slate-500 mt-3 max-w-md">
        이 발표를 여는 중 오류가 났어요. 다시 시도해 주세요.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs font-mono text-slate-400">코드: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand text-white font-semibold px-5 py-2.5 hover:bg-primary-hover transition"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-700 font-semibold px-5 py-2.5 hover:bg-slate-50 transition"
        >
          홈으로
        </Link>
      </div>
    </div>
  )
}
