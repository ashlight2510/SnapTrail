const CACHE_NAME = "snaptrail-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.js",
  "/manifest.json",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
];

// 설치 이벤트
self.addEventListener("install", (e) => {
  console.log("Service Worker 설치 중...");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("캐시에 리소스 추가 중...");
      return cache.addAll(ASSETS).catch(err => {
        console.warn("일부 리소스 캐싱 실패:", err);
      });
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener("activate", (e) => {
  console.log("Service Worker 활성화 중...");
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("오래된 캐시 삭제:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// fetch 이벤트
self.addEventListener("fetch", (e) => {
  const request = e.request;
  const url = new URL(request.url);
  
  // 지원하지 않는 스킴 필터링 (chrome-extension, chrome 등)
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'chrome:' || 
      url.protocol === 'moz-extension:' ||
      !url.protocol.startsWith('http')) {
    // 지원하지 않는 스킴은 그냥 fetch만 시도
    e.respondWith(fetch(request).catch(() => {
      return new Response('Unsupported scheme', { status: 400 });
    }));
    return;
  }
  
  // 외부 리소스는 네트워크 우선
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(request).catch(() => {
      // 네트워크 실패 시 캐시 확인
      return caches.match(request);
    }));
    return;
  }

  // 개발 모드에서는 네트워크 우선 (캐시 무시)
  const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
  
  if (isDev) {
    // 개발 모드: 네트워크 우선, 캐시는 백업용
    e.respondWith(
      fetch(request).then((response) => {
        // 유효한 응답만 캐시 (HTTP/HTTPS만)
        if (response && 
            response.status === 200 && 
            response.type === "basic" &&
            url.protocol.startsWith('http')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(err => {
              console.warn('캐시 저장 실패:', err);
            });
          });
        }
        return response;
      }).catch(() => {
        // 네트워크 실패 시 캐시 확인
        return caches.match(request);
      })
    );
  } else {
    // 프로덕션 모드: 캐시 우선
    e.respondWith(
      caches.match(request).then((res) => {
        if (res) {
          return res;
        }
        return fetch(request).then((response) => {
          // 유효한 응답만 캐시 (HTTP/HTTPS만)
          if (!response || 
              response.status !== 200 || 
              response.type !== "basic" ||
              !url.protocol.startsWith('http')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(err => {
              console.warn('캐시 저장 실패:', err);
            });
          });
          return response;
        });
      })
    );
  }
});

