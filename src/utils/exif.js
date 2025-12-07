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
  
  // GPS 정보 추출 (여러 방법 시도)
  let gps = null;
  
  // 방법 1: description에서 직접 읽기
  let lat = tags.GPSLatitude?.description;
  let lon = tags.GPSLongitude?.description;
  
  // 방법 2: value에서 직접 읽기 (HEIC 파일의 경우)
  if (!lat && tags.GPSLatitude?.value) {
    lat = tags.GPSLatitude.value;
  }
  if (!lon && tags.GPSLongitude?.value) {
    lon = tags.GPSLongitude.value;
  }
  
  // 방법 3: 배열 형태로 저장된 경우 (도분초)
  if (!lat && tags.GPSLatitude && Array.isArray(tags.GPSLatitude.value)) {
    const latArr = tags.GPSLatitude.value;
    const latRef = tags.GPSLatitudeRef?.value || 'N';
    if (latArr.length >= 3) {
      const latDeg = latArr[0] || 0;
      const latMin = latArr[1] || 0;
      const latSec = latArr[2] || 0;
      lat = latDeg + latMin / 60 + latSec / 3600;
      if (latRef === 'S') lat = -lat;
    }
  }
  
  if (!lon && tags.GPSLongitude && Array.isArray(tags.GPSLongitude.value)) {
    const lonArr = tags.GPSLongitude.value;
    const lonRef = tags.GPSLongitudeRef?.value || 'E';
    if (lonArr.length >= 3) {
      const lonDeg = lonArr[0] || 0;
      const lonMin = lonArr[1] || 0;
      const lonSec = lonArr[2] || 0;
      lon = lonDeg + lonMin / 60 + lonSec / 3600;
      if (lonRef === 'W') lon = -lon;
    }
  }

  // GPS 좌표 파싱
  if (lat && lon) {
    // 숫자로 변환 시도
    const latNum = typeof lat === 'number' ? lat : parseFloat(lat);
    const lonNum = typeof lon === 'number' ? lon : parseFloat(lon);
    
    if (!isNaN(latNum) && !isNaN(lonNum) && latNum !== 0 && lonNum !== 0) {
      gps = { lat: latNum, lon: lonNum };
    } else if (typeof lat === 'string' && typeof lon === 'string') {
      // 도분초 형식인 경우 파싱 시도
      const latMatch = lat.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
      const lonMatch = lon.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"/);
      
      if (latMatch && lonMatch) {
        const latDecimal = parseFloat(latMatch[1]) + parseFloat(latMatch[2]) / 60 + parseFloat(latMatch[3]) / 3600;
        const lonDecimal = parseFloat(lonMatch[1]) + parseFloat(lonMatch[2]) / 60 + parseFloat(lonMatch[3]) / 3600;
        gps = { lat: latDecimal, lon: lonDecimal };
      }
    }
  }
  
  // 디버깅을 위한 로그
  if (tags.GPSLatitude || tags.GPSLongitude) {
    console.log('GPS 태그 발견:', {
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
