/**
 * 날짜를 통일된 형식으로 변환
 * @param {string|Date} dateInput - EXIF 날짜 문자열 또는 Date 객체
 * @returns {string} - "2025년 12월 7일 오후 8:03" 형식
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  
  let date;
  
  // 문자열인 경우 (EXIF 형식: "2025:12:07 20:03:02" 또는 "2025-12-07T20:03:02")
  if (typeof dateInput === 'string') {
    // EXIF 날짜 형식 변환: "2025:12:07 20:03:02" -> ISO 형식
    const dateStr = dateInput.replace(/(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6');
    date = new Date(dateStr);
    
    // 유효하지 않은 날짜인 경우 원본 문자열 반환
    if (isNaN(date.getTime())) {
      return dateInput;
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return '';
  }
  
  // 한국어 형식으로 변환
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

