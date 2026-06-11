// Minimal service worker registration helper
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      navigator.serviceWorker.register(swUrl).then(reg => {
        reg.onupdatefound = () => {
          const installing = reg.installing;
          installing && (installing.onstatechange = () => {
            if (installing.state === 'installed') {
              // New content is available; dispatch event
              window.dispatchEvent(new Event('swUpdated'));
            }
          });
        };
      }).catch(() => {});
    });
  }
}

export function skipWaiting() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}
