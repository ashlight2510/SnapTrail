import { getCachedAddress } from '../utils/geocoding.js';

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
  let dateText = '';
  if (photo.date) {
    dateText = photo.date;
  } else if (photo.dateParsed) {
    dateText = photo.dateParsed.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
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
    
    const locationText = address 
      ? `<p><strong>위치정보:</strong> ${address}</p>`
      : photo.gps 
        ? `<p><strong>위치정보:</strong> ${photo.gps.lat.toFixed(6)}, ${photo.gps.lon.toFixed(6)}</p>`
        : '';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img src="${photo.previewUrl || photo.thumbnail}" alt="${photo.file?.name || photo.name}">
        <div class="modal-info">
          <p><strong>파일명:</strong> ${photo.file?.name || photo.name}</p>
          <p><strong>촬영일:</strong> ${dateText}</p>
          <p><strong>카메라:</strong> ${model.textContent}</p>
          ${locationText}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });
  
  return card;
}

