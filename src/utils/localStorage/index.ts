
// Modify the localStorage module to sync with Supabase
import { supabase } from '@/integrations/supabase/client';
import { fromSupabaseFormat, toSupabaseFormat } from '../supabaseAdapters';
import { Truck, PurchaseOrder, Driver, Supplier, GPSData, Tank, Price } from '@/types';

// Re-export everything from the modules for easy imports
export * from './constants';
export * from './types';
export * from './core';
export * from './appState';
export * from './export';

// Add Supabase synchronization functionality
export const syncToSupabase = async (key: string, data: any): Promise<boolean> => {
  try {
    const tableName = key.replace('po_system_', '');
    
    // Different tables require different handling
    switch (tableName) {
      case 'trucks':
        // Convert to Supabase format and upsert
        const truckData = (data as Truck[]).map(truck => toSupabaseFormat.truck(truck));
        const { error: truckError } = await supabase.from('trucks').upsert(truckData);
        if (truckError) throw truckError;
        break;
        
      case 'purchase_orders':
        // Handle POs with their complex structure
        const poData = (data as PurchaseOrder[]).map(po => toSupabaseFormat.purchaseOrder(po));
        const { error: poError } = await supabase.from('purchase_orders').upsert(poData);
        if (poError) throw poError;
        break;
        
      case 'drivers':
        const driverData = (data as Driver[]).map(driver => toSupabaseFormat.driver(driver));
        const { error: driverError } = await supabase.from('drivers').upsert(driverData);
        if (driverError) throw driverError;
        break;
        
      case 'suppliers':
        const supplierData = (data as Supplier[]).map(supplier => toSupabaseFormat.supplier(supplier));
        const { error: supplierError } = await supabase.from('suppliers').upsert(supplierData);
        if (supplierError) throw supplierError;
        break;
        
      // Add more cases for other entity types
      default:
        console.log(`Table ${tableName} sync not implemented yet`);
        return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error syncing to Supabase (${key}):`, error);
    return false;
  }
};

// Function to fetch data from Supabase
export const fetchFromSupabase = async <T>(tableName: string): Promise<T[]> => {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) throw error;
    
    // Convert from Supabase format based on table name
    switch (tableName) {
      case 'trucks':
        return data.map((item) => fromSupabaseFormat.truck(item)) as unknown as T[];
        
      case 'purchase_orders':
        return data.map((item) => fromSupabaseFormat.purchaseOrder(item)) as unknown as T[];
        
      case 'drivers':
        return data.map((item) => fromSupabaseFormat.driver(item)) as unknown as T[];
        
      case 'suppliers':
        return data.map((item) => fromSupabaseFormat.supplier(item)) as unknown as T[];
        
      case 'tanks':
        return data.map((item) => fromSupabaseFormat.tank(item)) as unknown as T[];
        
      case 'prices':
        return data.map((item) => fromSupabaseFormat.price(item)) as unknown as T[];
        
      default:
        console.warn(`No conversion defined for table ${tableName}`);
        return data as unknown as T[];
    }
  } catch (error) {
    console.error(`Error fetching from Supabase (${tableName}):`, error);
    return [];
  }
};
