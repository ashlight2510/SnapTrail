# 빌드 확인 가이드

## 로컬 빌드 확인

```bash
# 1. 빌드 실행
yarn build

# 2. dist 폴더 확인
ls -la dist/

# 3. 필수 파일 확인
test -f dist/manifest.json && echo "✓ manifest.json" || echo "✗ manifest.json 없음"
test -f dist/sw.js && echo "✓ sw.js" || echo "✗ sw.js 없음"
test -f dist/.nojekyll && echo "✓ .nojekyll" || echo "✗ .nojekyll 없음"
test -f dist/index.html && echo "✓ index.html" || echo "✗ index.html 없음"

# 4. assets 폴더 확인
ls -la dist/assets/

# 5. 빌드된 index.html 확인
grep "assets/index" dist/index.html
```

## 예상 결과

빌드 후 `dist/` 폴더에는 다음이 있어야 합니다:

```
dist/
├── index.html          (빌드된 HTML, /assets/index-xxx.js 참조)
├── assets/
│   ├── index-xxx.js    (번들된 JavaScript)
│   └── index-xxx.css   (추출된 CSS)
├── manifest.json       (public에서 복사됨)
├── sw.js               (public에서 복사됨)
├── .nojekyll           (public에서 복사됨)
├── privacy.html
├── terms.html
├── robots.txt
├── sitemap.xml
└── ... (기타 public 파일들)
```

## 배포 확인

GitHub Actions에서:
1. Actions 탭에서 최근 워크플로우 확인
2. "Verify build output" 단계에서 파일 목록 확인
3. 배포가 완료될 때까지 기다리기 (몇 분 소요)

## 문제 해결

### 빌드는 되지만 배포 시 404가 발생하는 경우

1. **GitHub Pages 설정 확인**:
   - Settings > Pages
   - Source: "GitHub Actions" 선택
   - Branch: 자동 설정됨

2. **배포 완료 대기**:
   - GitHub Actions에서 배포가 완료될 때까지 기다리기
   - 보통 2-5분 소요

3. **캐시 문제**:
   - 브라우저 캐시 삭제
   - 시크릿 모드에서 테스트

4. **파일 확인**:
   - 배포된 사이트에서 직접 파일 접근 시도:
     - https://snaptrail.ashlight.store/manifest.json
     - https://snaptrail.ashlight.store/sw.js
     - https://snaptrail.ashlight.store/.nojekyll

