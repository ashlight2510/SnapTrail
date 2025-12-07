import { getCachedAddress } from '../utils/geocoding.js';
import { formatDate } from '../utils/dateFormat.js';
import { createMiniMap } from '../utils/miniMap.js';

export async function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  
  const img = document.createElement('img');
  img.src = photo.thumbnail || photo.previewUrl;
  img.alt = photo.file?.name || photo.name;
  img.loading = 'lazy';
  
  const info = document.createElement('div');
  info.className = 'photo-info';
  
  const date = document.createElement('p');
  date.className = 'photo-date';
  // 날짜 형식 통일
  const dateText = formatDate(photo.date || photo.dateParsed);
  date.textContent = dateText;
  
  const model = document.createElement('p');
  model.className = 'photo-model';
  model.textContent = photo.model || '카메라 정보 없음';
  
  info.appendChild(date);
  info.appendChild(model);
  
  card.appendChild(img);
  card.appendChild(info);
  
  // 주소 가져오기 (비동기)
  let address = null;
  if (photo.gps && photo.gps.lat && photo.gps.lon) {
    try {
      address = await getCachedAddress(photo.gps.lat, photo.gps.lon);
    } catch (error) {
      console.warn('주소 가져오기 실패:', error);
    }
  }
  
  // 클릭 시 원본 크기로 보기
  card.addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    
    // 위치 정보 및 지도 링크
    let locationText = '';
    if (address) {
      locationText = `
        <p><strong>위치정보:</strong> ${address}</p>
        ${photo.gps ? `<p><a href="https://www.google.com/maps?q=${photo.gps.lat},${photo.gps.lon}" target="_blank" class="map-link">📍 지도에서 보기</a></p>` : ''}
      `;
    } else if (photo.gps) {
      locationText = `
        <p><strong>위치정보:</strong> ${photo.gps.lat.toFixed(6)}, ${photo.gps.lon.toFixed(6)}</p>
        <p><a href="https://www.google.com/maps?q=${photo.gps.lat},${photo.gps.lon}" target="_blank" class="map-link">📍 지도에서 보기</a></p>
      `;
    }
    
    // 지도 컨테이너 ID 생성 (고유한 ID)
    const mapId = `mini-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img src="${photo.previewUrl || photo.thumbnail}" alt="${photo.file?.name || photo.name}">
        <div class="modal-info">
          <p><strong>파일명:</strong> ${photo.file?.name || photo.name}</p>
          <p><strong>촬영일:</strong> ${dateText}</p>
          <p><strong>카메라:</strong> ${model.textContent}</p>
          ${locationText}
          ${photo.gps ? `<div id="${mapId}" class="mini-map"></div>` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // GPS 정보가 있으면 작은 지도 생성
    let miniMap = null;
    if (photo.gps && photo.gps.lat && photo.gps.lon) {
      // DOM이 완전히 렌더링된 후 지도 생성
      setTimeout(() => {
        try {
          miniMap = createMiniMap(mapId, photo.gps.lat, photo.gps.lon);
          if (miniMap) {
            // 지도 크기 조정
            setTimeout(() => {
              miniMap.invalidateSize();
            }, 100);
          }
        } catch (error) {
          console.error('작은 지도 생성 실패:', error);
        }
      }, 50);
    }
    
    const closeBtn = modal.querySelector('.modal-close');
    const closeModal = () => {
      // 지도 제거
      if (miniMap) {
        try {
          miniMap.remove();
        } catch (error) {
          console.warn('지도 제거 실패:', error);
        }
      }
      document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });
  
  return card;
}

