# 아이콘 및 이미지 생성 가이드

## PWA 아이콘
- `icon-192.png` - 192x192 픽셀
- `icon-512.png` - 512x512 픽셀

## 파비콘
- `favicon.ico` - 16x16, 32x32 포함
- `favicon-16x16.png` - 16x16 픽셀
- `favicon-32x32.png` - 32x32 픽셀
- `apple-touch-icon.png` - 180x180 픽셀

## 공유 이미지 (OG Image)
- `og-image.png` - 1200x630 픽셀 (Facebook, Twitter 공유용)

## 생성 방법

### 온라인 도구 사용
1. [RealFaviconGenerator](https://realfavicongenerator.net/) - 파비콘 및 PWA 아이콘 생성
2. [Favicon.io](https://favicon.io/) - 파비콘 생성
3. [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) - PWA 아이콘 생성

### 직접 생성
1. 512x512 픽셀의 정사각형 이미지를 준비하세요
2. 각 크기로 리사이즈하여 `public/` 폴더에 저장하세요
3. OG 이미지는 1200x630 픽셀로 별도 디자인하세요

### 임시 해결책
이미지 파일이 없어도 앱은 작동하지만, 파비콘과 공유 이미지가 표시되지 않습니다.

