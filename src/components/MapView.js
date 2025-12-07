import L from 'leaflet';
import 'leaflet.markercluster';

let map = null;
let markers = null;

// Leaflet 기본 아이콘 설정 (Webpack/Vite 환경에서 필요)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function initMap(containerId) {
  if (map) {
    map.remove();
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('지도 컨테이너를 찾을 수 없습니다:', containerId);
    return null;
  }
  
  // 기본 위치: 서울
  map = L.map(container, {
    center: [37.5665, 126.9780],
    zoom: 5
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  markers = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50
  });
  
  map.addLayer(markers);
  
  return map;
}

export async function updateMapMarkers(photos) {
  if (!map || !markers) {
    console.warn('지도가 초기화되지 않았습니다.');
    return;
  }
  
  markers.clearLayers();
  
  const photosWithGPS = photos.filter(p => p.gps && p.gps.lat && p.gps.lon);
  
  if (photosWithGPS.length === 0) {
    console.log('GPS 정보가 있는 사진이 없습니다.');
    return;
  }
  
  const bounds = [];
  
  // 주소를 비동기로 가져와서 마커에 표시
  const markerPromises = photosWithGPS.map(async (photo) => {
    const { lat, lon } = photo.gps;
    
    // 주소 가져오기
    let address = null;
    try {
      const { getCachedAddress } = await import('../utils/geocoding.js');
      address = await getCachedAddress(lat, lon);
    } catch (error) {
      console.warn('주소 가져오기 실패:', error);
    }
    
    // 날짜 형식 통일
    let dateText = '';
    try {
      const { formatDate } = await import('../utils/dateFormat.js');
      dateText = formatDate(photo.date || photo.dateParsed);
    } catch (error) {
      dateText = photo.date || '';
    }
    
    const marker = L.marker([lat, lon]);
    
    const popupContent = `
      <div class="map-popup">
        <img src="${photo.thumbnail || photo.previewUrl}" alt="${photo.file?.name || photo.name}" style="max-width: 200px; max-height: 200px;">
        <p><strong>${photo.file?.name || photo.name}</strong></p>
        ${dateText ? `<p>📅 ${dateText}</p>` : ''}
        ${photo.model ? `<p>📷 ${photo.model}</p>` : ''}
        ${address ? `<p>📍 ${address}</p>` : `<p>📍 ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>`}
        <p><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="color: #4285f4; text-decoration: none;">🗺️ Google 지도에서 보기</a></p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    markers.addLayer(marker);
    bounds.push([lat, lon]);
  });
  
  // 모든 마커가 준비될 때까지 대기
  await Promise.all(markerPromises);
  
  // 모든 마커가 보이도록 지도 범위 조정
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  
  console.log(`${photosWithGPS.length}개의 GPS 마커가 추가되었습니다.`);
}

