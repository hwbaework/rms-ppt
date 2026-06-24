import Logo from '../Logo'

// 마무리 슬라이드 — 표준 마스터 M12 (Closing)
// blue-950 다크 배경 + 흰 메시지 + blue-200 연락처.
//
// 사용 예시:
// <ThankYouSlide email="hwbae@rms.co.kr" />

function ThankYouSlide({
  email = 'hwbae@rms.co.kr',
  message = '경청해 주셔서 감사합니다.',
  pageNumber,
}: {
  email?: string
  message?: string
  pageNumber?: number
}) {
  return (
    <div className="relative w-full min-h-full flex flex-col bg-gradient-to-b from-blue-950 to-blue-900 text-white">
      {/* 가운데 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6">
          THANK YOU
        </h2>

        <p className="text-base md:text-lg text-blue-200 mb-12">{message}</p>

        <Logo size="md" variant="white" className="mb-8" />

        {email && (
          <a
            href={`mailto:${email}`}
            className="text-sm md:text-base text-blue-200 hover:text-white transition"
          >
            {email}
          </a>
        )}
      </div>

      {/* 우하단 페이지 번호 (마무리는 보통 생략) */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-xs text-blue-300/70 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default ThankYouSlide
