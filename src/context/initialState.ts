
import { Driver, Truck, Supplier, PurchaseOrder, LogEntry, GPSData, AIInsight, StatusHistoryEntry } from '../types';

// Initial empty states for all data types
export const initialDrivers: Driver[] = [];
export const initialTrucks: Truck[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialPurchaseOrders: PurchaseOrder[] = [];
export const initialLogs: LogEntry[] = [];
export const initialGPSData: GPSData[] = [];
export const initialAIInsights: AIInsight[] = [];
export const initialStatusHistory: StatusHistoryEntry[] = [];

// Default initial state for the entire app
export const defaultInitialState = {
  purchaseOrders: initialPurchaseOrders,
  logs: initialLogs,
  suppliers: initialSuppliers,
  drivers: initialDrivers,
  trucks: initialTrucks,
  gpsData: initialGPSData,
  aiInsights: initialAIInsights
};
