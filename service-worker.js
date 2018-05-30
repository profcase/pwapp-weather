/**
 * Provides a fully asynchronous service worker to 
 * manage application behavior based on network access.
 * 
 * - Download (on accessing page, every 24 hours)
 * - Install (if new): yields install event
 * - Activate: yields activate after pages load and old service worker is no longer used
 *  
 * Use Chrome Dev Tools / Application / ServiceWorker to debug.
 * 
 * Check "update on reload" to force service worker update on page reload.
 * 
 * JSDoc comments are written in Markdown.
 * 
 */

const cacheName = 'pwapp-weather'
const dataCacheName = 'pwapp-weather-data'

const filesToCache = [
  '/',
  '/index.html',
  '/scripts/app-min.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
]

self.addEventListener('install', function (e) {
  console.log('Starting [ServiceWorker] install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('  [ServiceWorker] caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

// activate is fired when worker starts up
self.addEventListener('activate', function (e) {
  console.log('Starting [ServiceWorker] activate')
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('  [ServiceWorker] removing old cache', key)
          return caches.delete(key)
        }
      }));
    })
  );
  // fix corner case and enable faster activation
  return self.clients.claim();
});

// serve the app shell from the cache
self.addEventListener('fetch', function (e) {
  console.log('Starting [ServiceWorker] fetch', e.request.url);
  const dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function (cache) {
        return fetch(e.request).then(function (response) {
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request)
      })
    );
  }
});