export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered.');
  } catch (err) {
    console.warn('Service worker registration failed:', err);
  }
}

export async function setupNotifications() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported.');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Permission denied.');
    return;
  }

  console.log('Notifications ready.');
}

export async function sendNotification(title, body) {
  // Use service worker if one is actively controlling the page
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'NOTIFY', title, body });
  } else {
    new Notification(title, { body });
  }
}
