# images/

이 폴더에 넣은 이미지는 **URL 경로로 바로 접근**할 수 있습니다.

```
public/images/logo.svg    →  사이트에서 /images/logo.svg
public/images/foo.png     →  사이트에서 /images/foo.png
```

## 사용 예시

JSX/TSX에서:

```tsx
<img src="/images/logo.png" alt="..." />
<img src="/images/2026-04-29/screenshot.png" alt="..." />
```

> 경로 앞의 `/`를 빼먹지 말 것 (절대 경로). `public/images/`는 코드에서 그냥 `/images/`로 시작.

## 권장 파일

| 파일 | 용도 |
|------|------|
| `logo.svg` 또는 `logo.png` | RMS GROUP 로고 (`<Logo />` 컴포넌트에서 사용) |
| `slides/<날짜>/...` | 발표별 스크린샷 (선택, 폴더 분리하면 정리 깔끔) |

## 새 이미지 추가 흐름

1. 이 폴더에 파일 저장 (예: `logo.png`)
2. 코드에서 `<img src="/images/logo.png" />`로 참조
3. `git add . && git commit && git push` → 자동 배포
