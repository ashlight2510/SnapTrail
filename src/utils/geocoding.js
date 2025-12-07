// GPS 좌표를 주소로 변환 (역지오코딩)
export async function getAddressFromGPS(lat, lon) {
  if (!lat || !lon) return null;
  
  try {
    // OpenStreetMap Nominatim API 사용 (무료, 제한 있음)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SnapTrail/1.0' // Nominatim은 User-Agent 필수
      }
    });
    
    if (!response.ok) {
      throw new Error('주소 변환 실패');
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      const addr = data.address;
      
      // 주소 구성 (우선순위: 도로명 > 지번)
      let addressParts = [];
      
      // 도로명 주소
      if (addr.road) {
        addressParts.push(addr.road);
        if (addr.house_number) {
          addressParts[addressParts.length - 1] += ` ${addr.house_number}`;
        }
      }
      
      // 지번 주소 (도로명이 없을 때)
      if (!addr.road && addr.village) {
        addressParts.push(addr.village);
      }
      if (!addr.road && addr.town) {
        addressParts.push(addr.town);
      }
      
      // 시/군/구
      if (addr.city || addr.county || addr.state_district) {
        addressParts.push(addr.city || addr.county || addr.state_district);
      }
      
      // 시/도
      if (addr.state || addr.region) {
        addressParts.push(addr.state || addr.region);
      }
      
      // 국가
      if (addr.country) {
        const countryName = addr.country_code === 'KR' ? '대한민국' : addr.country;
        addressParts.push(countryName);
      }
      
      return addressParts.length > 0 ? addressParts.join(', ') : data.display_name || null;
    }
    
    return data.display_name || null;
  } catch (error) {
    console.warn('주소 변환 실패:', error);
    return null;
  }
}

// 주소 캐싱 (같은 좌표는 다시 요청하지 않음)
const addressCache = new Map();

export async function getCachedAddress(lat, lon) {
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  
  if (addressCache.has(key)) {
    return addressCache.get(key);
  }
  
  const address = await getAddressFromGPS(lat, lon);
  if (address) {
    addressCache.set(key, address);
  }
  
  return address;
}

