# OG 이미지 문제 해결 가이드

## 문제 원인

1. **`og-image.png` 파일이 없었음**: `public/` 폴더에 SVG만 있고 PNG 파일이 없었습니다.
2. **캐시 문제**: 카카오톡, Facebook 등이 이미지를 캐시하여 업데이트가 반영되지 않았습니다.

## 해결 방법

### 1단계: OG 이미지 파일 생성

**방법 A: 브라우저에서 생성 (가장 간단)**

1. 브라우저에서 `public/generate-og-image.html` 파일을 엽니다
2. 이미지가 자동으로 생성되고 미리보기가 표시됩니다
3. "다운로드 og-image.png" 버튼을 클릭합니다
4. 다운로드한 파일을 `public/og-image.png`로 저장합니다

**방법 B: Node.js로 생성**

```bash
# canvas 패키지 설치 (필요한 경우)
yarn add -D canvas

# OG 이미지 생성
yarn generate:og-image
```

### 2단계: 파일 확인

```bash
ls -la public/og-image.png
```

파일이 존재하는지 확인합니다.

### 3단계: 배포

```bash
git add public/og-image.png
git commit -m "Add OG image for social sharing"
git push origin main
```

### 4단계: 캐시 무효화

이미지 URL에 버전 파라미터(`?v=2`)를 추가했습니다. 이제 다음 플랫폼에서 캐시를 새로고침하세요:

#### 카카오톡
1. https://developers.kakao.com/tool/clear/og 접속
2. URL 입력: `https://snaptrail.funnyfunny.cloud/`
3. "스크랩 새로고침" 클릭

#### Facebook
1. https://developers.facebook.com/tools/debug/ 접속
2. URL 입력: `https://snaptrail.funnyfunny.cloud/`
3. "스크랩 새로고침" 클릭

#### 일반 브라우저
- 하드 리프레시: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

## 변경 사항

1. ✅ 모든 OG 이미지 URL에 `?v=2` 버전 파라미터 추가
2. ✅ 카카오톡 공유 이미지 URL 업데이트
3. ✅ Twitter Card 이미지 URL 업데이트
4. ✅ JSON-LD 구조화 데이터 이미지 URL 업데이트

## 확인 방법

배포 후 다음 URL들이 모두 200 OK를 반환해야 합니다:

- https://snaptrail.funnyfunny.cloud/og-image.png?v=2
- https://snaptrail.funnyfunny.cloud/manifest.json
- https://snaptrail.funnyfunny.cloud/sw.js

## 예상 결과

1. **카카오톡 공유**: 이미지가 정상적으로 표시됩니다
2. **링크 미리보기**: 썸네일이 정상적으로 표시됩니다
3. **Facebook/Twitter 공유**: 이미지가 정상적으로 표시됩니다

## 문제가 계속되면

1. 파일이 실제로 배포되었는지 확인:
   ```bash
   curl -I https://snaptrail.funnyfunny.cloud/og-image.png?v=2
   ```

2. GitHub Actions 로그 확인:
   - 저장소 > Actions 탭
   - 최근 배포 로그에서 `og-image.png` 파일이 포함되었는지 확인

3. 브라우저 개발자 도구에서 확인:
   - Network 탭에서 `og-image.png` 요청 확인
   - Status Code가 200인지 확인

