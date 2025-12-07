# OG 이미지 생성 가이드

## 문제
카카오톡 공유나 링크 미리보기에서 이미지가 표시되지 않는 경우, `og-image.png` 파일이 없기 때문입니다.

## 해결 방법

### 방법 1: 브라우저에서 생성 (가장 간단)

1. `public/generate-og-image.html` 파일을 브라우저에서 엽니다
2. 이미지가 자동으로 생성됩니다
3. "다운로드 og-image.png" 버튼을 클릭합니다
4. 다운로드한 파일을 `public/og-image.png`로 저장합니다

### 방법 2: Node.js로 생성 (canvas 패키지 필요)

```bash
# canvas 패키지 설치
yarn add -D canvas

# OG 이미지 생성
yarn generate:og-image
```

생성된 파일은 `public/og-image.png`에 저장됩니다.

## 파일 확인

생성 후 다음 명령으로 확인:

```bash
ls -la public/og-image.png
```

파일이 존재하면 배포 시 자동으로 포함됩니다.

## 배포

파일을 생성한 후:

```bash
git add public/og-image.png
git commit -m "Add OG image"
git push origin main
```

GitHub Actions가 자동으로 배포합니다.

## 캐시 문제 해결

이미지가 업데이트되지 않는 경우:

1. **카카오톡 캐시**: 카카오톡은 이미지를 캐시하므로, URL에 버전 파라미터 추가:
   ```html
   <meta property="og:image" content="https://snaptrail.ashlight.store/og-image.png?v=2">
   ```

2. **Facebook/카카오 디버거 사용**:
   - Facebook: https://developers.facebook.com/tools/debug/
   - 카카오: https://developers.kakao.com/tool/clear/og
   - URL 입력 후 "스크랩 새로고침" 클릭

3. **브라우저 캐시**: 하드 리프레시 (`Ctrl+Shift+R` / `Cmd+Shift+R`)

