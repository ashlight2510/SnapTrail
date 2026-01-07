# 배포 확인 가이드

## 현재 상태

✅ `public/og-image.png` 파일 존재 (503KB)
✅ Git에 추적됨 (`git ls-files` 확인)
✅ 로컬 빌드 성공 (`dist/og-image.png` 존재)

## 문제 진단

배포된 사이트에서 404가 나오는 경우:

### 1. GitHub에 푸시 확인

```bash
# 최근 커밋에 og-image.png가 포함되었는지 확인
git log --oneline -5 --name-only | grep og-image

# 원격 저장소와 동기화 확인
git status
```

### 2. GitHub Actions 확인

1. GitHub 저장소 > **Actions** 탭
2. 최근 워크플로우 실행 확인
3. "Verify build output" 단계에서 `og-image.png` 확인
4. 배포가 성공했는지 확인

### 3. 배포된 파일 확인

배포 후 다음 명령으로 확인:

```bash
# curl로 파일 존재 확인
curl -I https://snaptrail.funnyfunny.cloud/og-image.png

# 200 OK가 나와야 함
# 404 Not Found면 파일이 배포되지 않은 것
```

## 해결 방법

### 방법 1: 강제 푸시 (파일이 이미 커밋된 경우)

```bash
# 변경사항 확인
git status

# 모든 변경사항 커밋
git add .
git commit -m "Add OG image verification to build process"

# 푸시
git push origin main
```

### 방법 2: 파일이 Git에 없는 경우

```bash
# 파일 추가
git add public/og-image.png

# 커밋
git commit -m "Add og-image.png for social sharing"

# 푸시
git push origin main
```

### 방법 3: GitHub Actions 재실행

1. GitHub 저장소 > **Actions** 탭
2. 실패한 워크플로우 클릭
3. "Re-run jobs" 클릭

## 검증 추가

이제 빌드 검증에 `og-image.png`가 포함되었습니다:

- ✅ `scripts/verify-build.js`: og-image.png 확인 추가
- ✅ `.github/workflows/deploy.yml`: 배포 전 og-image.png 확인 추가

빌드 시 파일이 없으면 **빌드가 실패**합니다.

## 배포 후 확인

배포 완료 후 (약 2-5분):

1. **파일 직접 확인**:
   ```
   https://snaptrail.funnyfunny.cloud/og-image.png
   ```

2. **카카오톡 디버거**:
   - https://developers.kakao.com/tool/clear/og
   - URL 입력 후 "스크랩 새로고침"

3. **Facebook 디버거**:
   - https://developers.facebook.com/tools/debug/
   - URL 입력 후 "스크랩 새로고침"

## 예상 결과

✅ `og-image.png` 파일이 배포됨
✅ 카카오톡 공유 시 이미지 표시
✅ 링크 미리보기 썸네일 표시
✅ Facebook/Twitter 공유 시 이미지 표시

