import { createPhotoCard } from './PhotoCard.js';
import { downloadZip } from '../utils/zip.js';

export async function renderTimeline(groupedPhotos, container) {
  container.innerHTML = '';
  
  if (!groupedPhotos || Object.keys(groupedPhotos).length === 0) {
    container.innerHTML = '<p class="empty-message">업로드된 사진이 없습니다.</p>';
    return;
  }
  
  // 연도별로 정렬 (최신순)
  const years = Object.keys(groupedPhotos).sort((a, b) => parseInt(b) - parseInt(a));
  
  for (const year of years) {
    const yearSection = document.createElement('section');
    yearSection.className = 'year-section';
    
    const yearHeader = document.createElement('h2');
    yearHeader.className = 'year-header';
    yearHeader.textContent = `${year}년`;
    yearSection.appendChild(yearHeader);
    
    // 월별로 정렬 (최신순)
    const months = Object.keys(groupedPhotos[year]).sort((a, b) => parseInt(b) - parseInt(a));
    
    for (const month of months) {
      const monthSection = document.createElement('div');
      monthSection.className = 'month-section';
      
      const monthHeader = document.createElement('h3');
      monthHeader.className = 'month-header';
      monthHeader.textContent = `${parseInt(month)}월`;
      monthSection.appendChild(monthHeader);
      
      const photos = groupedPhotos[year][month];
      
      // ZIP 다운로드 버튼
      const zipBtn = document.createElement('button');
      zipBtn.className = 'zip-download-btn';
      zipBtn.textContent = `📦 ${year}-${month} ZIP 다운로드`;
      zipBtn.addEventListener('click', () => {
        downloadZip(`${year}-${month}`, photos);
      });
      monthSection.appendChild(zipBtn);
      
      // 사진 그리드
      const photoGrid = document.createElement('div');
      photoGrid.className = 'photo-grid';
      monthSection.appendChild(photoGrid);
      
      // 사진 카드 생성 (비동기)
      const cardPromises = photos.map(photo => createPhotoCard(photo));
      const cards = await Promise.all(cardPromises);
      cards.forEach(card => {
        photoGrid.appendChild(card);
      });
      
      yearSection.appendChild(monthSection);
    }
    
    container.appendChild(yearSection);
  }
}

