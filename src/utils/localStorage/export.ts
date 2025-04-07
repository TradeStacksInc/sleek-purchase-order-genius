
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

// Function to export data to file (CSV, JSON)
export const exportDataToFile = (data: any[], fileName: string, format: 'csv' | 'json' = 'csv'): void => {
  try {
    let content: string;
    let mimeType: string;
    let fileExtension: string;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else {
      // CSV format
      if (!data.length) {
        throw new Error('No data to export');
      }
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => {
        return Object.values(item).map(value => {
          // Handle different types of values
          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          } else if (value instanceof Date) {
            return `"${value.toISOString()}"`;
          } else if (value === null || value === undefined) {
            return '""';
          } else if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};
