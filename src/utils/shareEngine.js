import html2canvas from 'html2canvas';

/**
 * 공유 이미지 생성
 * @param {string} elementId - 캡처할 DOM 요소 ID
 * @returns {Promise<string>} - Data URL 이미지
 */
export async function generateShareImage(elementId) {
  const target = document.getElementById(elementId);
  if (!target) {
    console.error('공유 이미지 생성 실패: 요소를 찾을 수 없습니다.', elementId);
    return null;
  }

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('이미지 생성 실패:', error);
    return null;
  }
}

/**
 * 공유 이미지 저장
 * @param {string} imageUrl - Data URL 이미지
 * @param {string} filename - 저장할 파일명
 */
export function saveShareImage(imageUrl, filename = 'snaptrail-share.png') {
  if (!imageUrl) {
    alert('이미지를 생성할 수 없습니다.');
    return;
  }

  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('이미지 저장 완료:', filename);
}

/**
 * 링크 복사
 * @param {string} url - 복사할 URL
 */
export async function copyShareLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    alert('링크가 클립보드에 복사되었습니다!');
  } catch (error) {
    // 폴백: 텍스트 영역 사용
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('링크가 클립보드에 복사되었습니다!');
    } catch (err) {
      alert('링크 복사에 실패했습니다. 수동으로 복사해주세요: ' + url);
    }
    document.body.removeChild(textArea);
  }
}

/**
 * 공유 문구 생성
 * @param {Object} data - 공유 데이터
 * @returns {string} - 공유 문구
 */
export function generateShareMessage(data) {
  return `📍 ${data.title}\n${data.description}\n👉 ${data.shareUrl}`;
}

/**
 * Base64 Data URL인지 확인
 * @param {string} url - 확인할 URL
 * @returns {boolean}
 */
function isDataUrl(url) {
  return url && (url.startsWith('data:') || url.startsWith('blob:'));
}

/**
 * 카카오톡 공유
 * @param {Object} data - 공유 데이터
 */
export function shareToKakao(data) {
  if (typeof Kakao === 'undefined') {
    alert('카카오 SDK가 로드되지 않았습니다. 카카오 SDK 스크립트를 확인해주세요.');
    return;
  }
  
  if (!Kakao.isInitialized()) {
    alert('카카오 SDK가 초기화되지 않았습니다. index.html에서 카카오 앱 키를 설정해주세요.\n\n예: Kakao.init("YOUR_KAKAO_APP_KEY");');
    return;
  }

  try {
    // Base64 Data URL은 카카오에서 지원하지 않으므로 기본 이미지 사용
    // 실제 운영 환경에서는 이미지를 서버에 업로드하고 HTTPS URL을 사용해야 함
    let imageUrl = 'https://snaptrail.ashlight.store/og-image.png?v=2';
    
    if (data.previewImageUrl && !isDataUrl(data.previewImageUrl)) {
      // HTTPS URL인 경우에만 사용
      if (data.previewImageUrl.startsWith('http')) {
        imageUrl = data.previewImageUrl;
      }
    }
    
    // payload 크기 제한을 위해 설명 길이 제한
    const description = data.description.length > 200 
      ? data.description.substring(0, 197) + '...' 
      : data.description;
    
    Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: data.title,
        description: description,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: data.shareUrl,
          webUrl: data.shareUrl,
        },
      },
      buttons: [
        {
          title: '자세히 보기',
          link: {
            mobileWebUrl: data.shareUrl,
            webUrl: data.shareUrl,
          },
        },
      ],
    });
  } catch (error) {
    console.error('카카오톡 공유 실패:', error);
    if (error.status === 413) {
      alert('공유 데이터가 너무 큽니다. 기본 이미지로 공유합니다.');
      // 기본 이미지로 재시도
      shareToKakao({
        ...data,
        previewImageUrl: 'https://snaptrail.ashlight.store/og-image.png'
      });
    } else {
      alert('카카오톡 공유에 실패했습니다: ' + error.message);
    }
  }
}

/**
 * 트위터 공유
 * @param {string} url - 공유할 URL
 * @param {string} text - 공유 텍스트
 */
export function shareTwitter(url, text) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
}

/**
 * 페이스북 공유
 * @param {string} url - 공유할 URL
 */
export function shareFacebook(url) {
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(fbUrl, '_blank', 'width=600,height=400');
}

/**
 * 공유 기록 저장
 * @param {boolean} shared - 공유 여부
 */
export function saveShareRecord(shared = true) {
  try {
    localStorage.setItem('snaptrail_shared', JSON.stringify({
      shared,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('공유 기록 저장 실패:', error);
  }
}

/**
 * 공유 기록 확인
 * @returns {boolean} - 공유 여부
 */
export function checkShareRecord() {
  try {
    const record = localStorage.getItem('snaptrail_shared');
    if (!record) return false;
    const data = JSON.parse(record);
    return data.shared === true;
  } catch (error) {
    return false;
  }
}

