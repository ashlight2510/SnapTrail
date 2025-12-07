# GitHub Pages 배포 가이드

## 배포 방법

### 방법 1: GitHub Actions 자동 배포 (권장)

1. GitHub 저장소의 Settings > Pages로 이동
2. Source를 "GitHub Actions"로 선택
3. `main` 브랜치에 푸시하면 자동으로 빌드 및 배포됩니다

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 방법 2: 수동 배포

1. 빌드 실행:
```bash
yarn build
```

2. `dist` 폴더의 내용을 확인:
   - `index.html`
   - `assets/` 폴더
   - `manifest.json`
   - `sw.js`
   - `privacy.html`
   - `terms.html`
   - `robots.txt`
   - `sitemap.xml`
   - `.nojekyll`

3. `dist` 폴더의 내용을 `gh-pages` 브랜치에 푸시:
```bash
# gh-pages 패키지 설치 (선택사항)
yarn add -D gh-pages

# 배포
yarn deploy
```

또는 수동으로:
```bash
cd dist
git init
git add .
git commit -m "Deploy"
git branch -M gh-pages
git remote add origin <your-repo-url>
git push -u origin gh-pages
```

## 중요 사항

1. **.nojekyll 파일**: GitHub Pages가 Jekyll을 사용하지 않도록 `public/.nojekyll` 파일이 필요합니다 (이미 추가됨)

2. **Service Worker**: GitHub Pages는 HTTPS를 사용하므로 Service Worker가 정상 작동합니다. 등록 실패는 무시해도 됩니다.

3. **경로**: 모든 경로는 절대 경로(`/`)로 설정되어 있어 GitHub Pages에서 정상 작동합니다.

4. **빌드 확인**: 배포 전에 로컬에서 빌드 결과를 확인하세요:
```bash
yarn build
yarn preview
```

## 문제 해결

### 404 에러가 발생하는 경우

1. **빌드 확인**:
   ```bash
   yarn build
   ls -la dist/
   ```
   다음 파일들이 있어야 합니다:
   - `index.html`
   - `assets/` 폴더 (JS, CSS 파일들)
   - `manifest.json`
   - `sw.js`
   - `.nojekyll`
   - `privacy.html`, `terms.html`
   - `robots.txt`, `sitemap.xml`

2. **GitHub Pages 설정 확인**:
   - Settings > Pages에서 GitHub Actions를 소스로 선택
   - 배포가 완료될 때까지 기다리기 (몇 분 소요)

3. **빌드 검증**:
   ```bash
   yarn build
   ```
   빌드 후 자동으로 파일 검증이 실행됩니다.

4. **수동 확인**:
   ```bash
   node scripts/verify-build.js
   ```

### MIME type 에러가 발생하는 경우

- Vite가 자동으로 처리하므로 빌드 후에는 발생하지 않아야 합니다
- 빌드된 파일을 사용하는지 확인하세요 (소스 파일이 아닌)

### Service Worker 에러

- GitHub Pages에서는 HTTPS를 사용하므로 정상 작동해야 합니다
- 에러가 발생해도 앱은 정상 작동합니다 (오프라인 기능만 제한됨)

