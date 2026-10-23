const CHANNEL_NAME = 'hs_catalog_sync_channel';

export const notifyCatalogSync = (payload = {}) => {
  const syncData = {
    timestamp: Date.now(),
    ...payload
  };

  // 1. BroadcastChannel for cross-tab communication
  try {
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(syncData);
      channel.close();
    }
  } catch (err) {
    console.warn('BroadcastChannel sync failed:', err);
  }

  // 2. LocalStorage event for cross-window / tab fallback
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hs_catalog_sync_timestamp', JSON.stringify(syncData));
    }
  } catch (err) {
    console.warn('LocalStorage sync failed:', err);
  }

  // 3. Local window CustomEvent for same-tab subscribers
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hs_catalog_sync', { detail: syncData }));
    }
  } catch (err) {
    console.warn('CustomEvent sync failed:', err);
  }
};

export const subscribeToCatalogSync = (callback) => {
  let channel = null;

  const handleData = (data) => {
    if (typeof callback === 'function') {
      try {
        callback(data);
      } catch (err) {
        console.error('Error in catalog sync subscriber callback:', err);
      }
    }
  };

  try {
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event && event.data) {
          handleData(event.data);
        }
      };
    }
  } catch (err) {
    console.warn('Failed to initialize BroadcastChannel listener:', err);
  }

  const handleStorageEvent = (e) => {
    if (e.key === 'hs_catalog_sync_timestamp' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleData(parsed);
      } catch (err) {
        handleData({ timestamp: Date.now() });
      }
    }
  };

  const handleCustomEvent = (e) => {
    if (e.detail) {
      handleData(e.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('hs_catalog_sync', handleCustomEvent);
  }

  return () => {
    if (channel) {
      try {
        channel.close();
      } catch (err) {}
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('hs_catalog_sync', handleCustomEvent);
    }
  };
};
