# 📸 SnapTrail

올인원 사진 타임라인 뷰어 웹앱 - EXIF 분석, GPS 지도, ZIP 다운로드 기능을 갖춘 PWA 애플리케이션

## ✨ 주요 기능

- ✅ **EXIF 메타데이터 분석** - 촬영일, 카메라 기종, GPS 정보 추출
- ✅ **HEIC 파일 지원** - iPhone 사진(HEIC/HEIF) 자동 변환
- ✅ **연도/월 타임라인 뷰어** - 사진을 자동으로 날짜별로 그룹화
- ✅ **GPS 기반 지도** - Leaflet을 사용한 인터랙티브 지도 뷰
- ✅ **ZIP 다운로드** - 연/월별로 사진을 ZIP 파일로 다운로드
- ✅ **LocalStorage 캐싱** - 새로고침 후에도 데이터 유지
- ✅ **PWA 지원** - Service Worker + manifest로 홈화면 설치 가능

## 🚀 시작하기

### 설치

```bash
yarn install
# 또는
npm install
```

### 개발 서버 실행

```bash
yarn dev
# 또는
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 빌드

```bash
yarn build
# 또는
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### GitHub Pages 배포

1. GitHub Actions를 사용한 자동 배포 (권장):
   - `main` 브랜치에 푸시하면 자동으로 배포됩니다
   - Settings > Pages에서 GitHub Actions를 소스로 선택

2. 수동 배포:
   ```bash
   yarn build
   # dist 폴더의 내용을 gh-pages 브랜치에 푸시
   ```

## 📦 기술 스택

- **Vite** - 빌드 도구
- **exifreader** - EXIF 메타데이터 읽기
- **heic2any** - HEIC 파일 변환
- **leaflet** - 지도 표시
- **leaflet.markercluster** - 마커 클러스터링
- **jszip** - ZIP 파일 생성
- **file-saver** - 파일 다운로드

## 📱 PWA 설치

### iPhone/iPad
1. Safari에서 앱 열기
2. 공유 버튼(⬆️) 클릭
3. "홈 화면에 추가" 선택

### Android
1. Chrome에서 앱 열기
2. 메뉴(⋮) 클릭
3. "홈 화면에 추가" 선택

## 🎨 사용 방법

1. **사진 업로드**: 드래그 앤 드롭 또는 파일 선택 버튼 클릭 (HEIC 파일 포함)
2. **HEIC 자동 변환**: iPhone 사진(HEIC/HEIF)은 자동으로 JPEG로 변환됩니다
3. **타임라인 보기**: 업로드된 사진이 연도/월별로 자동 그룹화되어 표시됩니다
4. **지도 보기**: GPS 정보가 있는 사진은 지도에 마커로 표시됩니다
5. **ZIP 다운로드**: 각 월 섹션의 "ZIP 다운로드" 버튼을 클릭하여 해당 월의 사진을 다운로드할 수 있습니다
6. **사진 상세 보기**: 사진 카드를 클릭하면 원본 크기로 볼 수 있습니다

## 📝 프로젝트 구조

```
/public
  manifest.json
  sw.js
  privacy.html
  terms.html
  robots.txt
  sitemap.xml
  .nojekyll
/src
  /components
    Timeline.js
    PhotoCard.js
    MapView.js
  /utils
    exif.js
    heic.js
    grouping.js
    cache.js
    zip.js
    geocoding.js
    dateFormat.js
    miniMap.js
  main.js
  style.css
index.html
```

## 🔧 커스터마이징

- **아이콘**: `public/icon-192.png`와 `public/icon-512.png`를 교체하세요
- **테마 색상**: `src/style.css`의 CSS 변수를 수정하세요
- **기본 지도 위치**: `src/components/MapView.js`의 `center` 좌표를 변경하세요

## 📄 라이선스

MIT

## 👤 개발자

**AshLight**  
이메일: ashlight2510@gmail.com

© 2025 AshLight. All rights reserved.
