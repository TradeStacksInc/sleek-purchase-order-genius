
// Export all functionality from the new modular structure
export * from './types';
export * from './core';
export { STORAGE_KEYS } from './constants';
export * from './export';

// Add getPaginatedData export for use in actions
export const getPaginatedData = <T>(data: T[], params: { page: number; limit: number }): {
  data: T[];
  pageSize: number;
  totalItems: number;
  page: number;
  totalPages: number;
} => {
  const { page, limit } = params;
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalItems: total,
    page,
    pageSize: limit,
    totalPages
  };
};

// Add the missing functions that core.ts is trying to import
export const syncToSupabase = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    const tableName = key.replace('po_system_', '');
    // This will be a no-op if the Supabase client isn't initialized
    // The actual implementation can be added later
    console.log(`Syncing ${tableName} to Supabase...`);
  } catch (error) {
    console.error(`Error syncing ${key} to Supabase:`, error);
  }
};

export const fetchFromSupabase = async (tableName: string): Promise<any[] | null> => {
  try {
    // This will be a no-op if the Supabase client isn't initialized
    // The actual implementation can be added later
    console.log(`Fetching ${tableName} from Supabase...`);
    return null;
  } catch (error) {
    console.error(`Error fetching ${tableName} from Supabase:`, error);
    return null;
  }
};

// Define a type for valid Supabase tables
export type ValidSupabaseTable = 
  | 'logs'
  | 'suppliers'
  | 'drivers'
  | 'trucks'
  | 'staff'
  | 'dispensers'
  | 'shifts'
  | 'sales'
  | 'prices'
  | 'incidents'
  | 'tanks'
  | 'activity_logs'
  | 'ai_insights'
  | 'delivery_details'
  | 'purchase_orders'
  | 'gps_data'
  | 'offloading_details'
  | 'purchase_order_items';

// Fix the function signature based on the VALID_SUPABASE_TABLES
export const isValidSupabaseTable = (tableName: string): tableName is ValidSupabaseTable => {
  const validTables = [
    'logs',
    'suppliers',
    'drivers',
    'trucks',
    'staff',
    'dispensers',
    'shifts',
    'sales',
    'prices',
    'incidents',
    'tanks',
    'activity_logs',
    'ai_insights',
    'delivery_details',
    'purchase_orders',
    'gps_data',
    'offloading_details',
    'purchase_order_items'
  ] as const;
  
  return validTables.includes(tableName as any);
};

export function getTableFromSupabase<T>(tableName: ValidSupabaseTable, supabase: any): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isValidSupabaseTable(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      const { data, error } = await supabase.from(tableName).select('*');
      
      if (error) {
        throw error;
      }
      
      resolve(data as T[]);
    } catch (error) {
      console.error(`Error fetching data from Supabase table ${tableName}:`, error);
      reject(error);
    }
  });
}
