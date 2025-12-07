import ExifReader from "exifreader";

export async function readExif(file) {
  const buffer = await file.arrayBuffer();
  let tags = {};
  
  try {
    tags = ExifReader.load(buffer);
  } catch (e) {
    console.warn("EXIF load failed", e);
  }

  const date = tags.DateTimeOriginal?.description || null;
  const model = tags.Model?.description || null;
  
  // iPhone 사진 디버깅: 모든 GPS 관련 태그 확인
  const fileName = file.name || 'unknown';
  const isHeic = fileName.toLowerCase().endsWith('.heic') || 
                 fileName.toLowerCase().endsWith('.heif') ||
                 file.type === 'image/heic' ||
                 file.type === 'image/heif';
  
  if (isHeic) {
    console.log(`[HEIC 파일] ${fileName} - 모든 EXIF 태그:`, tags);
    console.log(`[HEIC 파일] GPS 관련 태그:`, {
      GPSLatitude: tags.GPSLatitude,
      GPSLongitude: tags.GPSLongitude,
      GPSLatitudeRef: tags.GPSLatitudeRef,
      GPSLongitudeRef: tags.GPSLongitudeRef,
      GPSInfo: tags.GPSInfo,
      GPSVersionID: tags.GPSVersionID,
      GPSTimeStamp: tags.GPSTimeStamp,
      GPSDateStamp: tags.GPSDateStamp
    });
  }
  
  // GPS 정보 추출 (여러 방법 시도)
  let gps = null;
  
  // 방법 1: description에서 직접 읽기
  let lat = tags.GPSLatitude?.description;
  let lon = tags.GPSLongitude?.description;
  
  // 방법 2: value에서 직접 읽기 (HEIC 파일의 경우)
  if (!lat && tags.GPSLatitude?.value) {
    const latValue = tags.GPSLatitude.value;
    if (typeof latValue === 'number') {
      lat = latValue;
    } else if (Array.isArray(latValue) && latValue.length > 0) {
      // 배열의 첫 번째 요소가 숫자인 경우
      lat = typeof latValue[0] === 'number' ? latValue[0] : parseFloat(latValue[0]);
    } else {
      lat = latValue;
    }
  }
  
  if (!lon && tags.GPSLongitude?.value) {
    const lonValue = tags.GPSLongitude.value;
    if (typeof lonValue === 'number') {
      lon = lonValue;
    } else if (Array.isArray(lonValue) && lonValue.length > 0) {
      // 배열의 첫 번째 요소가 숫자인 경우
      lon = typeof lonValue[0] === 'number' ? lonValue[0] : parseFloat(lonValue[0]);
    } else {
      lon = lonValue;
    }
  }
  
  // 방법 3: 배열 형태로 저장된 경우 (도분초) - iPhone HEIC 파일
  if (!lat && tags.GPSLatitude && Array.isArray(tags.GPSLatitude.value)) {
    const latArr = tags.GPSLatitude.value;
    const latRef = tags.GPSLatitudeRef?.value || tags.GPSLatitudeRef?.description || 'N';
    
    if (latArr.length >= 3) {
      // 분수 형태일 수도 있음
      const latDeg = typeof latArr[0] === 'object' && latArr[0].numerator !== undefined
        ? latArr[0].numerator / (latArr[0].denominator || 1)
        : parseFloat(latArr[0]) || 0;
      const latMin = typeof latArr[1] === 'object' && latArr[1].numerator !== undefined
        ? latArr[1].numerator / (latArr[1].denominator || 1)
        : parseFloat(latArr[1]) || 0;
      const latSec = typeof latArr[2] === 'object' && latArr[2].numerator !== undefined
        ? latArr[2].numerator / (latArr[2].denominator || 1)
        : parseFloat(latArr[2]) || 0;
      
      lat = latDeg + latMin / 60 + latSec / 3600;
      if (latRef === 'S' || latRef === 'South') lat = -lat;
    } else if (latArr.length === 1) {
      // 십진수로 이미 변환된 경우
      lat = typeof latArr[0] === 'number' ? latArr[0] : parseFloat(latArr[0]);
    }
  }
  
  if (!lon && tags.GPSLongitude && Array.isArray(tags.GPSLongitude.value)) {
    const lonArr = tags.GPSLongitude.value;
    const lonRef = tags.GPSLongitudeRef?.value || tags.GPSLongitudeRef?.description || 'E';
    
    if (lonArr.length >= 3) {
      // 분수 형태일 수도 있음
      const lonDeg = typeof lonArr[0] === 'object' && lonArr[0].numerator !== undefined
        ? lonArr[0].numerator / (lonArr[0].denominator || 1)
        : parseFloat(lonArr[0]) || 0;
      const lonMin = typeof lonArr[1] === 'object' && lonArr[1].numerator !== undefined
        ? lonArr[1].numerator / (lonArr[1].denominator || 1)
        : parseFloat(lonArr[1]) || 0;
      const lonSec = typeof lonArr[2] === 'object' && lonArr[2].numerator !== undefined
        ? lonArr[2].numerator / (lonArr[2].denominator || 1)
        : parseFloat(lonArr[2]) || 0;
      
      lon = lonDeg + lonMin / 60 + lonSec / 3600;
      if (lonRef === 'W' || lonRef === 'West') lon = -lon;
    } else if (lonArr.length === 1) {
      // 십진수로 이미 변환된 경우
      lon = typeof lonArr[0] === 'number' ? lonArr[0] : parseFloat(lonArr[0]);
    }
  }

  // GPS 좌표 파싱
  if (lat && lon) {
    // 숫자로 변환 시도
    const latNum = typeof lat === 'number' ? lat : parseFloat(lat);
    const lonNum = typeof lon === 'number' ? lon : parseFloat(lon);
    
    if (!isNaN(latNum) && !isNaN(lonNum) && latNum !== 0 && lonNum !== 0) {
      // 유효한 좌표 범위 체크
      if (latNum >= -90 && latNum <= 90 && lonNum >= -180 && lonNum <= 180) {
        gps = { lat: latNum, lon: lonNum };
      }
    } else if (typeof lat === 'string' && typeof lon === 'string') {
      // 도분초 형식인 경우 파싱 시도
      const latMatch = lat.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
      const lonMatch = lon.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
      
      if (latMatch && lonMatch) {
        const latDecimal = parseFloat(latMatch[1]) + parseFloat(latMatch[2]) / 60 + parseFloat(latMatch[3]) / 3600;
        const lonDecimal = parseFloat(lonMatch[1]) + parseFloat(lonMatch[2]) / 60 + parseFloat(lonMatch[3]) / 3600;
        if (latDecimal >= -90 && latDecimal <= 90 && lonDecimal >= -180 && lonDecimal <= 180) {
          gps = { lat: latDecimal, lon: lonDecimal };
        }
      }
    }
  }
  
  // 디버깅을 위한 로그
  if (isHeic) {
    console.log(`[HEIC 파일] ${fileName} - GPS 추출 결과:`, {
      원본lat: lat,
      원본lon: lon,
      추출된GPS: gps,
      GPSLatitude태그: tags.GPSLatitude,
      GPSLongitude태그: tags.GPSLongitude
    });
  } else if (tags.GPSLatitude || tags.GPSLongitude) {
    console.log(`[일반 파일] ${fileName} - GPS 태그 발견:`, {
      GPSLatitude: tags.GPSLatitude,
      GPSLongitude: tags.GPSLongitude,
      GPSLatitudeRef: tags.GPSLatitudeRef,
      GPSLongitudeRef: tags.GPSLongitudeRef,
      추출된GPS: gps
    });
  }

  return {
    date,
    model,
    gps
  };
}
