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

export function updateMapMarkers(photos) {
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
  
  photosWithGPS.forEach(photo => {
    const { lat, lon } = photo.gps;
    
    const marker = L.marker([lat, lon]);
    
    const popupContent = `
      <div class="map-popup">
        <img src="${photo.thumbnail || photo.previewUrl}" alt="${photo.file?.name || photo.name}" style="max-width: 200px; max-height: 200px;">
        <p><strong>${photo.file?.name || photo.name}</strong></p>
        ${photo.date ? `<p>${photo.date}</p>` : ''}
        ${photo.model ? `<p>${photo.model}</p>` : ''}
      </div>
    `;
    
    marker.bindPopup(popupContent);
    markers.addLayer(marker);
    bounds.push([lat, lon]);
  });
  
  // 모든 마커가 보이도록 지도 범위 조정
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  
  console.log(`${photosWithGPS.length}개의 GPS 마커가 추가되었습니다.`);
}

