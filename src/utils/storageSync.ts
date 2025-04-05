import { StoredAppData } from './localStorage';

/**
 * Utility for cross-tab synchronization of localStorage data
 */
export const setupStorageSync = () => {
  // Listen for storage events from other tabs, but don't reload the page
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('po_system_')) {
      // Instead of reloading, we'll log the change
      console.info('Storage updated in another tab:', event.key);
      // In a production environment, we would dispatch an update event
      // that components could listen to and refresh their state
    }
  });
};

/**
 * Broadcast a storage update to other tabs without causing page reloads
 * @param key The storage key that was updated
 */
export const broadcastStorageUpdate = (key: string) => {
  // Create a custom storage event to notify other tabs
  const customEvent = new StorageEvent('storage', {
    key: `po_system_broadcast_${key}`,
    newValue: new Date().toISOString(), // Using timestamp as value
    url: window.location.href,
  });
  
  // Dispatch the event to notify other tabs
  window.dispatchEvent(customEvent);
};

/**
 * Format a number as a file size string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get the current localStorage usage
 */
export const getStorageUsage = (): { used: number, total: number, percentage: number } => {
  let totalSize = 0;
  let available = 5 * 1024 * 1024; // Assume 5MB as default
  
  try {
    // Calculate current usage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16 characters = 2 bytes
      }
    }
    
    // Attempt to estimate total storage by testing
    const testKey = '__storage_test__';
    let i = 0;
    try {
      // Try to fill up storage to test capacity
      // This is just a rough estimation approach
      localStorage.setItem(testKey, '1');
      const testString = '0'.repeat(1024 * 1024); // 1MB string
      while (true) {
        i++;
        localStorage.setItem(testKey, testString.substring(0, i));
      }
    } catch (e) {
      // When storage is full, estimate the total
      available = i * 2; // Approximate available space
      localStorage.removeItem(testKey);
    }
  } catch (e) {
    console.error('Error calculating storage usage:', e);
  }
  
  const totalAvailable = totalSize + available;
  const usagePercentage = (totalSize / totalAvailable) * 100;
  
  return {
    used: totalSize,
    total: totalAvailable,
    percentage: usagePercentage
  };
};

/**
 * Optimize localStorage by removing duplicate or redundant data
 */
export const optimizeStorage = () => {
  console.info('Optimizing localStorage...');
  // Implementation would depend on specific data structure and optimization needs
};
