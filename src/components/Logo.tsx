// RMS GROUP 로고.
// 이미지는 public/images/ 폴더에 넣고, 아래 src 경로를 그 파일명으로 맞추면 됨.
//   - public/images/logo.png  →  src="/images/logo.png"
//   - public/images/logo.svg  →  src="/images/logo.svg"
//
// variant="white": 다크 배경(blue-950 표지·간지·마무리)에서 로고를 흰색으로.
//   래스터 로고도 brightness-0 invert 필터로 순백 처리(§11.1).

function Logo({
  size = 'md',
  variant = 'default',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white'
  className?: string
}) {
  const sizes = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-14',
    xl: 'h-20',
  }
  return (
    <img
      src="/images/logo.png"
      alt="RMS GROUP"
      className={`${sizes[size]} w-auto ${variant === 'white' ? 'brightness-0 invert' : ''} ${className}`}
    />
  )
}

export default Logo
