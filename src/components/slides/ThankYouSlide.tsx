import Logo from '../Logo'

// 마무리 슬라이드 (4번 형식)
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
    <div className="relative w-full min-h-full flex flex-col">
      {/* 가운데 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <h2 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 mb-6">
          THANK YOU
        </h2>

        <p className="text-base md:text-lg text-gray-700 mb-12">{message}</p>

        <Logo size="md" className="mb-8" />

        {email && (
          <>
            <div className="w-64 md:w-96 h-px bg-gray-300 mb-8" />
            <a
              href={`mailto:${email}`}
              className="text-sm md:text-base text-gray-700 hover:text-brand transition"
            >
              {email}
            </a>
          </>
        )}
      </div>

      {/* 우하단 페이지 번호 */}
      {pageNumber && (
        <p className="absolute bottom-3 right-6 text-xs text-gray-500 font-medium">
          {pageNumber}
        </p>
      )}
    </div>
  )
}

export default ThankYouSlide
