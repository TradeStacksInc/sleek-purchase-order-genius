
import { formatBytes as formatSizeBytes } from './formatBytes';

// Event name for broadcasting storage updates
const STORAGE_UPDATE_EVENT = 'PO_SYSTEM_STORAGE_UPDATE';

// Interface for event data
interface StorageUpdateEvent {
  key: string;
  timestamp: number;
}

// Format bytes to human readable format
export const formatBytes = (bytes: number): string => {
  return formatSizeBytes(bytes);
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
