// Register a ServiceWorker if supported by the browser
console.log('GOT HERE');
if ('serviceworker' in navigator) {
  navigator.serviceWorker
    .register('/js/sw.js')
    .then((reg) => {
      console.log('ServiceWorker registration succeeded - ', reg.scope);
    })
    .catch((error) => {
      console.log('ServiceWorker registration failed - ', error);
    });
}