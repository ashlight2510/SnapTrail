# 배포 문제 해결 가이드

## 현재 발생하는 문제

1. `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/css"`
2. `sw.js`, `manifest.json` 404 에러
3. 소스 파일 경로(`/src/main.js`)가 그대로 남아있음
4. 빌드된 파일이 배포되지 않고 소스 파일이 서빙됨

## 원인 분석

이 문제들은 **배포된 사이트가 빌드된 파일이 아닌 소스 파일을 사용하고 있을 때** 발생합니다.

**가장 흔한 원인:**
- GitHub Pages 설정이 "GitHub Actions"가 아닌 "Deploy from a branch"로 설정되어 있음
- 이 경우 `main` 브랜치의 소스 파일이 직접 서빙되어 빌드된 파일이 무시됨

## 해결 방법

### 1. GitHub Pages 설정 확인 (가장 중요!)

1. GitHub 저장소로 이동
2. **Settings** > **Pages** 클릭
3. **Source** 섹션 확인:
   - ✅ **"GitHub Actions"** 선택되어 있어야 함
   - ❌ **"Deploy from a branch"** 선택되어 있으면 **반드시 변경 필요!**
   
4. **"Deploy from a branch"가 선택되어 있다면:**
   - 드롭다운을 클릭
   - **"GitHub Actions"** 선택
   - 저장 (자동으로 저장됨)
   
5. **변경 후 확인:**
   - Source가 "GitHub Actions"로 표시되는지 확인
   - 이전에 "Deploy from a branch"였다면, 이제 빌드된 파일이 배포됩니다

### 2. GitHub Actions 확인

1. **Actions** 탭 클릭
2. 최근 워크플로우 실행 확인:
   - ✅ 초록색 체크: 배포 성공
   - ❌ 빨간색 X: 배포 실패 (로그 확인)
   - 🟡 노란색: 진행 중 (완료 대기)

3. 배포가 실패한 경우:
   - 워크플로우 클릭
   - "Verify build output" 단계 확인
   - 에러 메시지 확인
   - 특히 다음을 확인:
     - `✗ 빌드되지 않은 index.html (소스 파일)` 에러가 있는지
     - `✗ 오류: 소스 파일 경로(/src/main.js)가 남아있습니다!` 에러가 있는지

4. **배포가 성공했는데도 문제가 있는 경우:**
   - Settings > Pages에서 Source가 "GitHub Actions"인지 다시 확인
   - 배포 완료 후 2-5분 기다린 후 다시 확인
   - 브라우저 캐시 삭제 후 확인

### 3. 강제 재배포

**중요: GitHub Pages 설정을 먼저 확인하세요!**

```bash
# 1. 변경사항 커밋 및 푸시
git add .
git commit -m "Fix deployment configuration"
git push origin main

# 2. GitHub Actions에서 배포 시작 확인
# 3. 배포 완료까지 2-5분 대기
```

**GitHub Pages 설정이 "Deploy from a branch"였다면:**
1. Settings > Pages에서 "GitHub Actions"로 변경
2. 위 명령어로 푸시
3. Actions 탭에서 배포 진행 확인
4. 배포 완료 후 2-5분 기다린 후 사이트 확인

### 4. 배포 확인

배포 완료 후 다음 URL로 직접 접근하여 확인:

- https://snaptrail.funnyfunny.cloud/manifest.json
- https://snaptrail.funnyfunny.cloud/sw.js
- https://snaptrail.funnyfunny.cloud/.nojekyll

모두 200 OK가 나와야 합니다.

### 5. 브라우저 캐시 문제

배포가 완료되었는데도 이전 버전이 보이는 경우:

1. **하드 리프레시**: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
2. **시크릿 모드**에서 테스트
3. **브라우저 캐시 삭제**

## 예상 배포 시간

- 빌드: 1-2분
- 배포: 1-3분
- **총 소요 시간: 2-5분**

## 로컬 빌드 확인

배포 전 로컬에서 확인:

```bash
yarn build
yarn preview
```

`http://localhost:4173`에서 정상 작동하는지 확인하세요.

## 추가 확인 사항

### 빌드된 파일 구조

배포 후 다음 구조가 되어야 합니다:

```
https://snaptrail.funnyfunny.cloud/
├── index.html          (빌드된 버전, /assets/index-xxx.js 참조)
├── assets/
│   ├── index-xxx.js
│   └── index-xxx.css
├── manifest.json
├── sw.js
├── .nojekyll
└── ...
```

### 빌드된 index.html 확인

배포된 `index.html`에서 다음을 확인:

```html
<!-- 올바른 경로 (빌드된 파일) -->
<script type="module" crossorigin src="/assets/index-xxx.js"></script>
<link rel="stylesheet" href="/assets/index-xxx.css">

<!-- 잘못된 경로 (소스 파일) -->
<script type="module" src="/src/main.js"></script>
```

**확인 방법:**
1. 배포된 사이트에서 `Ctrl+U` (또는 `Cmd+Option+U`)로 소스 보기
2. `Ctrl+F`로 `/src/main.js` 검색
3. **검색 결과가 나오면:** 빌드된 파일이 배포되지 않은 것 (GitHub Pages 설정 확인 필요)
4. **검색 결과가 없으면:** 정상 (빌드된 파일이 배포됨)

**또는 브라우저 개발자 도구에서:**
- Network 탭 열기
- 페이지 새로고침
- `/assets/index-`로 시작하는 파일이 로드되는지 확인
- `/src/main.js`가 로드되면 문제 있음

