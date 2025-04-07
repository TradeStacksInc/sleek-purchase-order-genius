
// Export all functionality from the new modular structure
export * from './types';
export * from './core';
export { STORAGE_KEYS } from './constants';
export * from './export';

// Add getPaginatedData export for use in actions
export const getPaginatedData = <T>(data: T[], params: { page: number; limit: number }): {
  data: T[];
  total: number;
  page: number;
  limit: number;
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
    total,
    page,
    limit,
    totalPages
  };
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
