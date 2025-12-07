# 배포 문제 해결 가이드

## 현재 발생하는 문제

1. `style.css`가 JavaScript 모듈로 로드되려고 함
2. `sw.js`, `manifest.json` 404 에러
3. 파비콘 파일들 404 에러

## 원인 분석

이 문제들은 **배포된 사이트가 빌드된 파일이 아닌 소스 파일을 사용하고 있을 때** 발생합니다.

## 해결 방법

### 1. GitHub Pages 설정 확인

1. GitHub 저장소로 이동
2. **Settings** > **Pages** 클릭
3. **Source** 섹션 확인:
   - ✅ **"GitHub Actions"** 선택되어 있어야 함
   - ❌ "Deploy from a branch" 선택되어 있으면 변경 필요

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

### 3. 강제 재배포

```bash
# 1. 변경사항 커밋 및 푸시
git add .
git commit -m "Fix deployment configuration"
git push origin main

# 2. GitHub Actions에서 배포 시작 확인
# 3. 배포 완료까지 2-5분 대기
```

### 4. 배포 확인

배포 완료 후 다음 URL로 직접 접근하여 확인:

- https://snaptrail.ashlight.store/manifest.json
- https://snaptrail.ashlight.store/sw.js
- https://snaptrail.ashlight.store/.nojekyll

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
https://snaptrail.ashlight.store/
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
<!-- 올바른 경로 -->
<script type="module" crossorigin src="/assets/index-xxx.js"></script>

<!-- 잘못된 경로 (소스 파일) -->
<script type="module" src="/src/main.js"></script>
```

만약 `/src/main.js`가 보이면, 빌드된 파일이 배포되지 않은 것입니다.

