
// Add importing of types needed
import { STORAGE_KEYS } from './constants';
import { PaginationParams, PaginatedResult } from './types';
import { saveToLocalStorage, getFromLocalStorage, dateReviver } from './core';
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './appState';
import { exportDataToJson } from './export';
import { supabase } from '@/integrations/supabase/client';

// Function to determine Supabase table name from storage key
const getSupabaseTableName = (key: string): string => {
  switch(key) {
    case STORAGE_KEYS.PURCHASE_ORDERS:
      return 'purchase_orders';
    case STORAGE_KEYS.LOGS:
      return 'logs';
    case STORAGE_KEYS.SUPPLIERS:
      return 'suppliers';
    case STORAGE_KEYS.DRIVERS:
      return 'drivers';
    case STORAGE_KEYS.TRUCKS:
      return 'trucks';
    case STORAGE_KEYS.GPS_DATA:
      return 'gps_data';
    case STORAGE_KEYS.AI_INSIGHTS:
      return 'ai_insights';
    case STORAGE_KEYS.STAFF:
      return 'staff';
    case STORAGE_KEYS.DISPENSERS:
      return 'dispensers';
    case STORAGE_KEYS.SHIFTS:
      return 'shifts';
    case STORAGE_KEYS.SALES:
      return 'sales';
    case STORAGE_KEYS.PRICES:
      return 'prices';
    case STORAGE_KEYS.INCIDENTS:
      return 'incidents';
    case STORAGE_KEYS.ACTIVITY_LOGS:
      return 'activity_logs';
    case STORAGE_KEYS.TANKS:
      return 'tanks';
    default:
      return key.replace('po_system_', '');
  }
};

// Function to sync data to Supabase
export const syncToSupabase = async <T extends any[]>(key: string, data: T) => {
  try {
    const tableName = getSupabaseTableName(key);
    
    // Skip if no table name could be determined
    if (!tableName) {
      console.warn(`No Supabase table defined for key: ${key}`);
      return;
    }
    
    // Convert data to Supabase format if needed
    // For now, we'll just use the data as-is
    
    console.log(`Syncing ${data.length} items to Supabase table: ${tableName}`);
    
    // Bulk upsert not implemented yet
    // Would need to check if each item exists and update/insert accordingly
    
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
  }
};

// Function to fetch data from Supabase
export const fetchFromSupabase = async <T>(tableName: string): Promise<T[]> => {
  try {
    const { data, error } = await supabase
      .from(getSupabaseTableName(tableName))
      .select('*');
      
    if (error) throw error;
    
    return data as T[];
  } catch (error) {
    console.error(`Error fetching from Supabase table ${tableName}:`, error);
    return [];
  }
};

// Pagination helper function
export const getPaginatedData = <T>(data: T[], params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<T> => {
  const { page = 1, limit = 10 } = params;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / limit);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalItems: data.length,
      totalPages
    }
  };
};

// Export everything
export {
  STORAGE_KEYS,
  saveToLocalStorage,
  getFromLocalStorage,
  getAppStateFromLocalStorage,
  saveAppStateToLocalStorage,
  exportDataToJson,
  dateReviver
};

// Export types
export type { PaginationParams, PaginatedResult };
