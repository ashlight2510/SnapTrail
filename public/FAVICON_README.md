# 파비콘 및 공유 이미지 생성 가이드

## 필요한 이미지 파일

### 파비콘
다음 파일들을 `public/` 폴더에 추가하세요:

1. **favicon.ico** - 16x16, 32x32 포함 (다중 크기 ICO 파일)
2. **favicon-16x16.png** - 16x16 픽셀
3. **favicon-32x32.png** - 32x32 픽셀
4. **apple-touch-icon.png** - 180x180 픽셀 (iOS용)
5. **icon-192.png** - 192x192 픽셀 (PWA용, manifest.json에 사용)
6. **icon-512.png** - 512x512 픽셀 (PWA용, manifest.json에 사용)

### 공유 이미지 (OG Image)
1. **og-image.png** - 1200x630 픽셀 (Facebook, Twitter, 카카오톡 공유용)

**생성 방법:**
- 브라우저에서 `public/generate-og-image.html` 파일을 열고 "다운로드" 버튼을 클릭하세요.
- 또는 `public/og-image.svg` 파일을 사용할 수 있습니다 (SVG를 PNG로 변환 필요).

## 생성 방법

### 온라인 도구 사용
1. [Favicon Generator](https://realfavicongenerator.net/) - 파비콘 생성
2. [Favicon.io](https://favicon.io/) - 파비콘 생성
3. 이미지 편집 도구로 OG 이미지 생성

### 직접 생성
1. 512x512 픽셀의 정사각형 이미지를 준비
2. 각 크기로 리사이즈:
   - 16x16 → favicon-16x16.png
   - 32x32 → favicon-32x32.png
   - 180x180 → apple-touch-icon.png
   - 192x192 → icon-192.png
   - 512x512 → icon-512.png
   - 1200x630 → og-image.png (공유 이미지)
3. ICO 파일 생성 (favicon.ico)

### 임시 해결책
이미지 파일이 없어도 앱은 작동하지만, 파비콘과 공유 이미지가 표시되지 않습니다.

## 권장 디자인

### 파비콘
- 간단하고 명확한 아이콘
- 작은 크기에서도 인식 가능
- SnapTrail의 브랜드 컬러 사용

### OG 이미지 (공유 이미지)
- 1200x630 픽셀
- SnapTrail 로고/아이콘
- "사진 타임라인 뷰어" 텍스트
- 주요 기능 간단히 표시
- 밝고 명확한 디자인

