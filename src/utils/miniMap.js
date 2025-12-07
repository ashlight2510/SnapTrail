import L from 'leaflet';

// Leaflet 기본 아이콘 설정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * 작은 지도를 생성하고 표시
 * @param {string} containerId - 지도를 표시할 컨테이너 ID
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @returns {L.Map} - Leaflet 지도 객체
 */
export function createMiniMap(containerId, lat, lon) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('지도 컨테이너를 찾을 수 없습니다:', containerId);
    return null;
  }
  
  // 기존 지도가 있으면 제거
  const existingMap = container._leaflet;
  if (existingMap) {
    existingMap.remove();
  }
  
  // 작은 지도 생성
  const miniMap = L.map(container, {
    center: [lat, lon],
    zoom: 15,
    zoomControl: true,
    attributionControl: false,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: false,
    keyboard: false
  });
  
  // 타일 레이어 추가
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(miniMap);
  
  // 마커 추가
  L.marker([lat, lon]).addTo(miniMap);
  
  return miniMap;
}

