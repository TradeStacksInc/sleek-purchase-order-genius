
import { STORAGE_KEYS } from './localStorage';
import { saveToLocalStorage } from './localStorage';

export function getDatabaseInfo() {
  const recordCounts: Record<string, number> = {};
  
  // Count records for each storage key
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(data)) {
        recordCounts[key] = data.length;
      }
    } catch (e) {
      console.error(`Error counting records for ${key}:`, e);
      recordCounts[key] = 0;
    }
  }
  
  return {
    recordCounts,
    lastUpdate: new Date()
  };
}

export function exportDatabase() {
  const exportData: Record<string, any> = {};
  
  // Export data for each storage key
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    try {
      exportData[name] = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      console.error(`Error exporting ${name}:`, e);
      exportData[name] = [];
    }
  }
  
  return JSON.stringify(exportData, null, 2);
}

export function importDatabase(jsonData: string) {
  try {
    const importData = JSON.parse(jsonData);
    
    // Import data for each storage key
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      if (importData[name]) {
        saveToLocalStorage(key, importData[name]);
      }
    }
    
    return true;
  } catch (e) {
    console.error('Error importing database:', e);
    return false;
  }
}

export function resetDatabase() {
  // Clear all data in localStorage
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
  
  // Seed with initial data if needed
  // Implementation would depend on app requirements
  
  return true;
}
