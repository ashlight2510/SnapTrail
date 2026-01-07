/**
 * 이미지 업로드 유틸리티
 * 
 * Base64 이미지를 서버에 업로드하여 HTTPS URL을 받는 함수들
 * 
 * 사용 예시:
 * - Supabase Storage
 * - Firebase Storage
 * - Cloudflare R2
 * - 자체 서버/S3
 */

/**
 * Base64 이미지를 Blob으로 변환
 * @param {string} base64 - Base64 Data URL
 * @returns {Blob}
 */
export function base64ToBlob(base64) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 이미지를 서버에 업로드 (예시: Supabase)
 * @param {string} base64Image - Base64 Data URL
 * @param {string} filename - 파일명
 * @returns {Promise<string>} - 업로드된 이미지의 HTTPS URL
 * 
 * 사용 예시:
 * ```js
 * // Supabase 사용 시
 * import { createClient } from '@supabase/supabase-js';
 * const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
 * 
 * export async function uploadImageToSupabase(base64Image, filename) {
 *   const blob = base64ToBlob(base64Image);
 *   const { data, error } = await supabase.storage
 *     .from('share-images')
 *     .upload(`preview-${Date.now()}.png`, blob, {
 *       contentType: 'image/png',
 *       upsert: false
 *     });
 *   
 *   if (error) throw error;
 *   
 *   const { data: urlData } = supabase.storage
 *     .from('share-images')
 *     .getPublicUrl(data.path);
 *   
 *   return urlData.publicUrl;
 * }
 * ```
 */
export async function uploadImageToServer(base64Image, filename) {
  // TODO: 실제 서버 업로드 로직 구현
  // 현재는 기본 이미지 URL 반환
  console.warn('이미지 업로드 기능이 구현되지 않았습니다. 기본 이미지를 사용합니다.');
  return 'https://snaptrail.funnyfunny.cloud/og-image.png';
}

/**
 * 이미지 업로드 (ImgBB API 사용 예시)
 * 무료 이미지 호스팅 서비스 사용
 * @param {string} base64Image - Base64 Data URL
 * @returns {Promise<string>} - 업로드된 이미지 URL
 */
export async function uploadImageToImgBB(base64Image) {
  // ImgBB API 키 필요 (https://api.imgbb.com/)
  const API_KEY = 'YOUR_IMGBB_API_KEY';
  
  if (!API_KEY || API_KEY === 'YOUR_IMGBB_API_KEY') {
    console.warn('ImgBB API 키가 설정되지 않았습니다.');
    return 'https://snaptrail.funnyfunny.cloud/og-image.png?v=2';
  }
  
  try {
    const blob = base64ToBlob(base64Image);
    const formData = new FormData();
    formData.append('image', blob, 'preview.png');
    formData.append('key', API_KEY);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || '이미지 업로드 실패');
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return 'https://snaptrail.funnyfunny.cloud/og-image.png?v=2';
  }
}

