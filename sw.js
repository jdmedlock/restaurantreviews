const cacheID = 'jdm-restaurantreviews-001';
const NOT_FOUND = -1;

// Cache our app resources when the install event is fired
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