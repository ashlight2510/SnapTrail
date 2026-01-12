import { readExif } from './utils/exif.js';
import { groupPhotosByDate } from './utils/grouping.js';
import { createThumbnail, saveToCache, loadFromCache, clearCache } from './utils/cache.js';
import { convertHeicFiles } from './utils/heic.js';
import { renderTimeline } from './components/Timeline.js';
import { initMap, updateMapMarkers } from './components/MapView.js';
import { openShareSheet } from './components/ShareSheet.js';
// CSS는 HTML에서 직접 로드 (정적 배포용)
// import './style.css';

let allPhotos = [];

// 초기화
async function init() {
  // 캐시에서 데이터 로드
  const cachedPhotos = loadFromCache();
  if (cachedPhotos && cachedPhotos.length > 0) {
    allPhotos = cachedPhotos;
    updateUI();
    console.log('캐시에서 데이터 복원 완료');
  }
  
  setupEventListeners();
  setupTabs();
}

// 이벤트 리스너 설정
function setupEventListeners() {
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const clearBtn = document.getElementById('clear-btn');
  const shareBtn = document.getElementById('share-btn');
  
  // 파일 입력
  fileInput.addEventListener('change', (e) => {
    handleFiles(Array.from(e.target.files));
  });
  
  // 드래그 앤 드롭
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('image/') || 
      f.name.toLowerCase().endsWith('.heic') || 
      f.name.toLowerCase().endsWith('.heif')
    );
    if (files.length > 0) {
      handleFiles(files);
    }
  });
  
  // 공유 버튼
  shareBtn.addEventListener('click', () => {
    const photoCount = allPhotos.length;
    const gpsCount = allPhotos.filter(p => p.gps).length;
    
    // 현재 활성화된 탭 확인
    const activeTab = document.querySelector('.tab-content.active');
    const previewElementId = activeTab?.id || 'timeline-view';
    
    // 공유 데이터 생성
    const shareData = {
      title: photoCount > 0 
        ? `${photoCount}장의 사진 타임라인` 
        : 'SnapTrail - 사진 타임라인 뷰어',
      description: photoCount > 0
        ? `촬영한 ${photoCount}장의 사진을 타임라인으로 확인하세요.${gpsCount > 0 ? ` 위치 정보가 있는 사진 ${gpsCount}장이 지도에 표시됩니다.` : ''}`
        : '사진의 EXIF 메타데이터를 분석하여 타임라인으로 보여주는 무료 웹앱',
      shareUrl: window.location.href,
      previewElementId: previewElementId
    };
    
    openShareSheet(shareData);
  });
  
  // 초기화 버튼
  clearBtn.addEventListener('click', async () => {
    if (confirm('모든 사진과 캐시를 삭제하시겠습니까?')) {
      allPhotos = [];
      clearCache();
      
      // Service Worker 캐시도 삭제
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('Service Worker 캐시 삭제 완료');
        } catch (error) {
          console.error('Service Worker 캐시 삭제 실패:', error);
        }
      }
      
      // Service Worker 재등록
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.unregister();
            console.log('Service Worker 등록 해제 완료');
          }
        } catch (error) {
          console.error('Service Worker 등록 해제 실패:', error);
        }
      }
      
      updateUI();
      alert('모든 데이터가 삭제되었습니다. 페이지를 새로고침해주세요.');
    }
  });
}

// 탭 전환
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // 탭 버튼 활성화
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 탭 컨텐츠 표시
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-view`) {
          content.classList.add('active');
          
          // 지도 탭인 경우 지도 초기화
          if (targetTab === 'map' && !window.mapInitialized) {
            setTimeout(() => {
              initMap('map-view');
              window.mapInitialized = true;
              updateMapMarkers(allPhotos);
            }, 100);
          }
        }
      });
    });
  });
}

// 파일 처리
async function handleFiles(files) {
  if (files.length === 0) return;
  
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';
  
  try {
    // HEIC 파일 변환 (원본과 변환된 파일 쌍 반환)
    const filePairs = await convertHeicFiles(files);
    
    const newPhotos = [];
    
    for (const { original, converted } of filePairs) {
      try {
        // 원본 파일에서 EXIF 읽기 (HEIC 파일의 경우 원본에서 읽어야 메타데이터 보존)
        const exif = await readExif(original);
        
        console.log(`EXIF 읽기 완료: ${original.name}`, {
          date: exif.date,
          model: exif.model,
          gps: exif.gps
        });
        
        // 날짜 파싱 (통일된 형식으로 변환)
        let dateParsed = new Date(original.lastModified);
        if (exif.date) {
          // EXIF 날짜 형식: "2025:12:07 20:03:02" 또는 "2025-12-07T20:03:02"
          const dateStr = exif.date.replace(/(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6');
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            dateParsed = parsed;
          }
        }
        
        // 변환된 파일로 썸네일 생성 (HEIC는 변환된 JPEG로, 일반 파일은 원본으로)
        const thumbnail = await createThumbnail(converted);
        
        // 미리보기 URL (변환된 파일 사용)
        const previewUrl = URL.createObjectURL(converted);
        
        const photo = {
          file: original, // 원본 파일 정보 유지
          name: original.name,
          date: exif.date,
          model: exif.model,
          gps: exif.gps,
          dateParsed,
          thumbnail,
          previewUrl
        };
        
        newPhotos.push(photo);
      } catch (error) {
        console.error(`파일 처리 실패: ${original.name}`, error);
      }
    }
    
    // 기존 사진에 추가
    allPhotos = [...allPhotos, ...newPhotos];
    
    // 날짜순 정렬
    allPhotos.sort((a, b) => b.dateParsed.getTime() - a.dateParsed.getTime());
    
    // 캐시 저장
    saveToCache(allPhotos);
    
    // UI 업데이트
    updateUI();
    
    console.log(`${newPhotos.length}개의 사진이 추가되었습니다.`);
  } catch (error) {
    console.error('파일 처리 중 오류:', error);
    alert('파일 처리 중 오류가 발생했습니다.');
  } finally {
    loading.style.display = 'none';
  }
}

// UI 업데이트
async function updateUI() {
  // 타임라인 렌더링
  const grouped = groupPhotosByDate(allPhotos);
  const timelineContainer = document.getElementById('timeline-view');
  await renderTimeline(grouped, timelineContainer);
  
  // 지도 마커 업데이트
  if (window.mapInitialized) {
    await updateMapMarkers(allPhotos);
  }
  
  // 드롭존 숨기기/보이기
  const dropZone = document.getElementById('drop-zone');
  if (allPhotos.length > 0) {
    dropZone.style.display = 'none';
  } else {
    dropZone.style.display = 'flex';
  }
}

// 앱 시작
init();

