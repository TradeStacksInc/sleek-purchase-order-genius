
import { Driver, GPSData, LogEntry, PurchaseOrder, Supplier, Truck, AIInsight } from '../../types';

// Type for all storable data
export interface StoredAppData {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  aiInsights: AIInsight[];
}
