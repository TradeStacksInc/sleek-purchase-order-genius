
// Export functions for localStorage
import { formatBytes } from '../storageSync';

// Function to export all data in localStorage as JSON
export const exportDataAsJSON = (): string => {
  const allData: Record<string, any> = {};
  
  // Iterate through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('po_system_')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          allData[key] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error parsing localStorage item ${key}:`, error);
      }
    }
  }
  
  return JSON.stringify(allData, null, 2);
};

// Function to get the total size of localStorage data in bytes
export const getLocalStorageSize = (): number => {
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
    }
  }
  
  return totalSize;
};

// Function to get the formatted size of localStorage data
export const getFormattedLocalStorageSize = (): string => {
  const sizeInBytes = getLocalStorageSize();
  return formatBytes(sizeInBytes);
};

// Function to import data from JSON
export const importDataFromJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    Object.keys(data).forEach(key => {
      if (key.startsWith('po_system_')) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Function to clear all application data from localStorage
export const clearAllData = (): boolean => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('po_system_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
