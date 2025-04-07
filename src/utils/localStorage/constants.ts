
// Storage keys for local storage
export const STORAGE_KEYS = {
  PURCHASE_ORDERS: 'po_system_purchase_orders',
  LOGS: 'po_system_logs',
  SUPPLIERS: 'po_system_suppliers',
  DRIVERS: 'po_system_drivers',
  TRUCKS: 'po_system_trucks',
  GPS_DATA: 'po_system_gps_data',
  AI_INSIGHTS: 'po_system_ai_insights',
  STAFF: 'po_system_staff',
  DISPENSERS: 'po_system_dispensers',
  SHIFTS: 'po_system_shifts',
  SALES: 'po_system_sales',
  PRICES: 'po_system_prices',
  INCIDENTS: 'po_system_incidents',
  ACTIVITY_LOGS: 'po_system_activity_logs',
  TANKS: 'po_system_tanks'
};

export const VALID_SUPABASE_TABLES = [
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
];
