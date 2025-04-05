
import { broadcastStorageUpdate } from '../storageSync';

// Date reviver function to convert date strings back to Date objects
export const dateReviver = (_key: string, value: any): any => {
  // ISO date regex pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (typeof value === 'string' && datePattern.test(value)) {
    return new Date(value);
  }
  return value;
};

// Base save function with retry mechanism and error handling
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    if (!Array.isArray(data)) {
      console.error(`Cannot save ${key}: value is not an array`);
      return false;
    }
    
    // Try to optimize the data before saving
    const serializedData = JSON.stringify(data);
    
    // Attempt to save with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        localStorage.setItem(key, serializedData);
        success = true;
      } catch (retryError) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw retryError; // Re-throw after max attempts
        }
        // Wait briefly before retry
        setTimeout(() => {}, 100 * attempts);
      }
    }
    
    // Broadcast the update to other tabs - without causing page reloads
    broadcastStorageUpdate(key);
    
    console.info(`Successfully saved data to ${key} (${serializedData.length} bytes)`);
    return true;
  } catch (error) {
    // Handle storage quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Storage quota exceeded when saving to ${key}. Attempting cleanup...`);
      // This is just a placeholder - real implementation would be more sophisticated
    }
    
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
};

// Base retrieve function with error handling and improved logging
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      console.info(`No data found in local storage for ${key}, using default value`);
      return defaultValue;
    }

    // Parse JSON with date reviver and validation
    try {
      const parsedData = JSON.parse(serializedData, dateReviver);
      
      // Validate that parsed data is an array if defaultValue is an array
      if (Array.isArray(defaultValue) && !Array.isArray(parsedData)) {
        console.warn(`Invalid data format in ${key}, expected array. Using default value.`);
        return defaultValue;
      }
      
      console.info(`Successfully loaded data from ${key} (${parsedData.length} items)`);
      return parsedData;
    } catch (parseError) {
      console.error(`Error parsing data from ${key}:`, parseError);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error retrieving from local storage (${key}):`, error);
    return defaultValue;
  }
};
