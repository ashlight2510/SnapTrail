# PWA 아이콘 생성 가이드

PWA 앱을 완전히 작동시키려면 다음 아이콘 파일들이 필요합니다:

- `icon-192.png` - 192x192 픽셀
- `icon-512.png` - 512x512 픽셀

## 아이콘 생성 방법

### 온라인 도구 사용
1. [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) 사용
2. [RealFaviconGenerator](https://realfavicongenerator.net/) 사용

### 직접 생성
1. 512x512 픽셀의 정사각형 이미지를 준비하세요
2. 이미지 편집 도구로 192x192와 512x512 크기로 리사이즈하세요
3. `public/` 폴더에 저장하세요:
   - `public/icon-192.png`
   - `public/icon-512.png`

### 임시 해결책
아이콘 파일이 없어도 앱은 작동하지만, 홈화면에 추가할 때 기본 아이콘이 표시됩니다.

