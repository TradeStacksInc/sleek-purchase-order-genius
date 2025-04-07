
/**
 * Custom type definitions that work with the generated Supabase types
 */

import type { Database } from '@/integrations/supabase/types';

// Type aliases for direct database tables
export type DbPurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
export type DbSupplier = Database['public']['Tables']['suppliers']['Row'];
export type DbDriver = Database['public']['Tables']['drivers']['Row'];
export type DbTruck = Database['public']['Tables']['trucks']['Row'];
export type DbGPSData = Database['public']['Tables']['gps_data']['Row'];
export type DbIncident = Database['public']['Tables']['incidents']['Row'];
export type DbTank = Database['public']['Tables']['tanks']['Row'];
export type DbDispenser = Database['public']['Tables']['dispensers']['Row'];
export type DbStaff = Database['public']['Tables']['staff']['Row'];
export type DbShift = Database['public']['Tables']['shifts']['Row'];
export type DbSale = Database['public']['Tables']['sales']['Row'];
export type DbPrice = Database['public']['Tables']['prices']['Row'];
export type DbDeliveryDetails = Database['public']['Tables']['delivery_details']['Row'];
export type DbOffloadingDetails = Database['public']['Tables']['offloading_details']['Row'];
export type DbActivityLog = Database['public']['Tables']['activity_logs']['Row'];
export type DbAIInsight = Database['public']['Tables']['ai_insights']['Row'];

// Type guards for runtime type checking
export function isDbPurchaseOrder(obj: any): obj is DbPurchaseOrder {
  return obj && typeof obj.id === 'string' && typeof obj.status === 'string';
}

export function isDbSupplier(obj: any): obj is DbSupplier {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

export function isDbDriver(obj: any): obj is DbDriver {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.license_number === 'string';
}
