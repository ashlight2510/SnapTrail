import { 
  generateShareImage, 
  saveShareImage, 
  copyShareLink, 
  generateShareMessage,
  shareToKakao,
  shareTwitter,
  shareFacebook,
  saveShareRecord
} from '../utils/shareEngine.js';
import { uploadImageToImgBB } from '../utils/imageUpload.js';

let currentShareData = null;

/**
 * 공유 Bottom Sheet 열기
 * @param {Object} shareData - 공유 데이터
 */
export async function openShareSheet(shareData) {
  currentShareData = shareData;
  const sheet = document.getElementById('share-sheet');
  const previewContainer = document.getElementById('share-preview');
  const messageText = document.getElementById('share-message-text');
  const instagramHint = document.getElementById('share-instagram-hint');
  
  // 공유 데이터 설정
  if (!shareData.shareUrl) {
    shareData.shareUrl = window.location.href;
  }
  
  // 공유 문구 생성 및 표시
  const shareMessage = generateShareMessage(shareData);
  messageText.textContent = shareMessage;
  
  // 프리뷰 컨테이너에 내용 표시
  previewContainer.innerHTML = '';
  
  // 타임라인 또는 지도 프리뷰 생성
  if (shareData.previewElementId) {
    const previewElement = document.getElementById(shareData.previewElementId);
    if (previewElement && previewElement.children.length > 0) {
      // 프리뷰용 작은 썸네일 생성
      const previewInfo = document.createElement('div');
      previewInfo.style.padding = '10px';
      previewInfo.style.textAlign = 'center';
      previewInfo.style.color = 'var(--text-color)';
      previewInfo.innerHTML = `
        <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">
          공유 이미지는 타임라인/지도 화면을 캡처하여 생성됩니다
        </p>
      `;
      previewContainer.appendChild(previewInfo);
    } else {
      // 사진이 없을 때
      const emptyPreview = document.createElement('div');
      emptyPreview.style.padding = '40px';
      emptyPreview.style.textAlign = 'center';
      emptyPreview.style.color = 'var(--text-color)';
      emptyPreview.innerHTML = `
        <p style="font-size: 3rem; margin-bottom: 10px;">📸</p>
        <p style="margin: 0; opacity: 0.7;">SnapTrail - 사진 타임라인 뷰어</p>
      `;
      previewContainer.appendChild(emptyPreview);
    }
  }
  
  // Bottom Sheet 표시
  sheet.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // 이벤트 바인딩
  setupShareEvents(shareData);
}

/**
 * 공유 Bottom Sheet 닫기
 */
export function closeShareSheet() {
  const sheet = document.getElementById('share-sheet');
  sheet.classList.remove('active');
  document.body.style.overflow = '';
  currentShareData = null;
}

/**
 * 공유 이벤트 설정
 * @param {Object} shareData - 공유 데이터
 */
function setupShareEvents(shareData) {
  // 닫기 버튼
  const closeBtn = document.getElementById('share-close-btn');
  const backdrop = document.getElementById('share-sheet-backdrop');
  
  closeBtn.onclick = closeShareSheet;
  backdrop.onclick = closeShareSheet;
  
  // 카카오톡 공유
  const kakaoBtn = document.getElementById('share-kakao-btn');
  kakaoBtn.onclick = async () => {
    try {
      // 카카오톡 공유는 Base64 이미지를 사용할 수 없으므로 HTTPS URL 필요
      // 옵션 1: 기본 OG 이미지 사용 (간단)
      shareData.previewImageUrl = 'https://snaptrail.ashlight.store/og-image.png';
      
      // 옵션 2: 이미지를 생성하고 서버에 업로드 (고급)
      // const img = await generateShareImage(shareData.previewElementId || 'timeline-view');
      // if (img) {
      //   shareData.previewImageUrl = await uploadImageToImgBB(img);
      // }
      
      shareToKakao(shareData);
      saveShareRecord(true);
    } catch (error) {
      console.error('카카오톡 공유 오류:', error);
      alert('카카오톡 공유에 실패했습니다.');
    }
  };
  
  // 인스타그램용 이미지 저장
  const instaBtn = document.getElementById('share-insta-btn');
  instaBtn.onclick = async () => {
    try {
      const img = await generateShareImage(shareData.previewElementId || 'timeline-view');
      if (img) {
        saveShareImage(img, 'snaptrail-instagram.png');
        document.getElementById('share-instagram-hint').style.display = 'block';
        saveShareRecord(true);
      } else {
        alert('이미지를 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  };
  
  // 링크 복사
  const copyBtn = document.getElementById('share-copy-btn');
  copyBtn.onclick = () => {
    copyShareLink(shareData.shareUrl);
    saveShareRecord(true);
  };
  
  // 대표 이미지 저장
  const imageBtn = document.getElementById('share-image-btn');
  imageBtn.onclick = async () => {
    try {
      const img = await generateShareImage(shareData.previewElementId || 'timeline-view');
      if (img) {
        saveShareImage(img, 'snaptrail-share.png');
        saveShareRecord(true);
      } else {
        alert('이미지를 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  };
  
  // 트위터 공유
  const twitterBtn = document.getElementById('share-twitter-btn');
  twitterBtn.onclick = () => {
    shareTwitter(shareData.shareUrl, shareData.title);
    saveShareRecord(true);
  };
  
  // 페이스북 공유
  const fbBtn = document.getElementById('share-fb-btn');
  fbBtn.onclick = () => {
    shareFacebook(shareData.shareUrl);
    saveShareRecord(true);
  };
  
  // 공유 문구 복사
  const copyMessageBtn = document.getElementById('share-copy-message-btn');
  copyMessageBtn.onclick = async () => {
    const message = generateShareMessage(shareData);
    try {
      await navigator.clipboard.writeText(message);
      alert('공유 문구가 클립보드에 복사되었습니다!');
    } catch (error) {
      // 폴백
      const textArea = document.createElement('textarea');
      textArea.value = message;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('공유 문구가 클립보드에 복사되었습니다!');
      } catch (err) {
        alert('복사에 실패했습니다.');
      }
      document.body.removeChild(textArea);
    }
  };
}

