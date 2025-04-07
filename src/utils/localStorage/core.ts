
// Update the core localStorage functions to use Supabase
import { broadcastStorageUpdate } from '../storageSync';
import { supabase } from '@/integrations/supabase/client';
import { syncToSupabase, fetchFromSupabase } from './index';
import { fromSupabaseFormat, toSupabaseFormat } from '../supabaseAdapters';

// Date reviver function to convert date strings back to Date objects
export const dateReviver = (_key: string, value: any): any => {
  // ISO date regex pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (typeof value === 'string' && datePattern.test(value)) {
    return new Date(value);
  }
  return value;
};

// Save function that first saves to Supabase and then to localStorage as backup
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    if (!Array.isArray(data)) {
      console.error(`Cannot save ${key}: value is not an array`);
      return false;
    }
    
    // Save to Supabase first
    syncToSupabase(key, data);
    
    // Then save to localStorage as backup
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    
    console.info(`Successfully saved data to ${key} (${serializedData.length} bytes)`);
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
};

// Retrieve function that tries to get data from Supabase first, falls back to localStorage
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    // Try to get from localStorage first for instant load
    const serializedData = localStorage.getItem(key);
    const localData = serializedData ? JSON.parse(serializedData, dateReviver) as T : null;
    
    // Attempt to fetch from Supabase asynchronously
    const tableName = key.replace('po_system_', '');
    fetchFromSupabase(tableName).then(supabaseData => {
      // If we got data from Supabase and it's different from localStorage, update localStorage
      if (supabaseData && Array.isArray(supabaseData) && supabaseData.length > 0) {
        const supabaseJson = JSON.stringify(supabaseData);
        const localJson = serializedData || '';
        
        if (supabaseJson !== localJson) {
          localStorage.setItem(key, supabaseJson);
          console.info(`Updated ${key} in localStorage with newer data from Supabase`);
          
          // Broadcast update to other components
          broadcastStorageUpdate(key);
        }
      }
    }).catch(err => {
      console.error(`Error fetching ${key} from Supabase:`, err);
    });
    
    // Return local data if available, otherwise default
    if (localData) {
      console.info(`Loaded ${key} from localStorage (${Array.isArray(localData) ? localData.length : 'non-array'} items)`);
      return localData;
    }
    
    console.info(`No data found in storage for ${key}, using default value`);
    return defaultValue;
  } catch (error) {
    console.error(`Error retrieving from storage (${key}):`, error);
    return defaultValue;
  }
};
