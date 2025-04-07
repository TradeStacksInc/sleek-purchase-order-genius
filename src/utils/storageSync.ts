
import { StoredAppData } from './localStorage/appState';

// Event name for broadcasting storage updates
const STORAGE_UPDATE_EVENT = 'PO_SYSTEM_STORAGE_UPDATE';

// Interface for event data
interface StorageUpdateEvent {
  key: string;
  timestamp: number;
}

// Format bytes to human readable format
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Broadcast a storage update to other components/tabs
export const broadcastStorageUpdate = (key: string): void => {
  const event = new CustomEvent<StorageUpdateEvent>(STORAGE_UPDATE_EVENT, {
    detail: {
      key,
      timestamp: Date.now(),
    },
  });
  
  document.dispatchEvent(event);
};

// Listen for storage updates
export const listenForStorageUpdates = (
  key: string,
  callback: () => void
): (() => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<StorageUpdateEvent>;
    if (customEvent.detail.key === key) {
      callback();
    }
  };
  
  document.addEventListener(STORAGE_UPDATE_EVENT, handler);
  
  // Return a function to remove the listener
  return () => {
    document.removeEventListener(STORAGE_UPDATE_EVENT, handler);
  };
};
