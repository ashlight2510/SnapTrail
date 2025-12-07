const CACHE_KEY = 'snaptrailCache';
const CACHE_VERSION = 1;

// 썸네일 생성 (canvas 사용)
export function createThumbnail(file, maxSize = 300) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    
    img.src = url;
  });
}

// 사진 데이터를 캐시에 저장
export function saveToCache(photos) {
  try {
    const cacheData = {
      version: CACHE_VERSION,
      photos: photos.map(p => ({
        name: p.file.name,
        date: p.date,
        model: p.model,
        gps: p.gps,
        dateParsed: p.dateParsed.toISOString(),
        thumbnail: p.thumbnail,
        size: p.file.size,
        type: p.file.type,
        lastModified: p.file.lastModified
      })),
      timestamp: Date.now()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('캐시 저장 완료:', photos.length, '개 사진');
  } catch (e) {
    console.error('캐시 저장 실패:', e);
  }
}

// 캐시에서 사진 데이터 복원
export function loadFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // 버전 체크
    if (cacheData.version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 캐시 무시');
      return null;
    }
    
    // 데이터 복원 (File 객체는 복원 불가능하므로 메타데이터만 사용)
    const photos = cacheData.photos.map(p => ({
      name: p.name,
      date: p.date,
      model: p.model,
      gps: p.gps,
      dateParsed: new Date(p.dateParsed),
      thumbnail: p.thumbnail,
      size: p.size,
      type: p.type,
      lastModified: p.lastModified,
      // File 객체 대신 메타데이터만 사용
      file: {
        name: p.name,
        size: p.size,
        type: p.type,
        lastModified: p.lastModified
      }
    }));
    
    console.log('캐시 복원 완료:', photos.length, '개 사진');
    return photos;
  } catch (e) {
    console.error('캐시 로드 실패:', e);
    return null;
  }
}

// 캐시 초기화
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('캐시 초기화 완료');
  } catch (e) {
    console.error('캐시 초기화 실패:', e);
  }
}

