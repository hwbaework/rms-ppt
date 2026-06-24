import Link from 'next/link'

// 404 — 없는 주소. 정적 export 시 out/404.html 로 생성된다.
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900 text-white px-6 text-center">
      <p className="text-7xl md:text-9xl font-black tracking-tight text-blue-700/50 select-none">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-bold mt-2">페이지를 찾을 수 없어요</h1>
      <p className="text-blue-200 mt-3 max-w-md">
        주소가 바뀌었거나 삭제된 발표일 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-blue-900 font-semibold px-5 py-2.5 hover:bg-blue-50 transition"
      >
        <span className="material-symbols-outlined text-lg">home</span>
        아카이브로 돌아가기
      </Link>
    </div>
  )
}
