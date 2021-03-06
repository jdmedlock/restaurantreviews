// Array of currently supported cache names. The first cache name in this
// array is expected to be the most recent cache name.
const cacheID = 'jdm-restaurantreviews-001';
const NOT_FOUND = -1;

// Cache our app resources when the install event is fired
// Note that this logic was patterned after an example provided by
// Doug Brown (https://www.youtube.com/watch?v=92dtrNU1GQc)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheID).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/data/restaurants.json',
        '/js/',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/sw.js',
        '/img/notfound.jpg',
      ])
      .catch((error) => {
        console.log('Failed to open the cache - ', error);
      });
    })
  );
});

// When a new service worker is activated remove any old caches that are
// no longer needed.
//
// This `activate` event handler is patterned after one presented in
// "The Service Worker Lifecycle" by Jake Archibald
// (see https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
self.addEventListener('activate', event => {
  event.waitUntil(
    // Compare the cache id's against the list of currently supported id's
    // and delete any that are no longer supported.
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (![cacheID].includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => {
      console.log(cacheID,' now ready to handle fetches!');
    })
  );
});

// Use resources from the cache if not available
self.addEventListener('fetch', (event) => {
  let cacheRequest = event.request;
  let cacheUrlObject = new URL(event.request.url);
  if (event.request.url.indexOf('restaurant.html') > NOT_FOUND) {
    cacheRequest = new Request('restaurant.html');
  }
  if (cacheUrlObject.hostname !== 'localhost') {
    event.request.mode = 'no-cors';
  }
  event.respondWith(
    caches.match(cacheRequest).then((response) => {
      return response || fetch(event.request)
        .then((response) => {
          return caches.open(cacheID).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch((error) => {
          // If an image is not available substitute the not found image
          if (event.request.url.indexOf('.jpg') > NOT_FOUND) {
            return caches.match('/img/notfound.jpg');
          }
          return new Response('Internet connection is not available', {
            status: 404,
            statusText: 'Internet connection is not available'
          });
        });
    })
  );
});