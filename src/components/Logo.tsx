// RMS GROUP 로고.
// 이미지는 public/images/ 폴더에 넣고, 아래 src 경로를 그 파일명으로 맞추면 됨.
//   - public/images/logo.png  →  src="/images/logo.png"
//   - public/images/logo.svg  →  src="/images/logo.svg"

function Logo({
  size = 'md',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
      className={`${sizes[size]} w-auto ${className}`}
    />
  )
}

export default Logo
