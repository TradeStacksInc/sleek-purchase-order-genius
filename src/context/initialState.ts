
import { 
  Driver, 
  Truck, 
  Supplier, 
  PurchaseOrder, 
  LogEntry, 
  GPSData, 
  AIInsight, 
  StatusHistoryEntry,
  Staff,
  Dispenser,
  Shift,
  Sale,
  PriceRecord,
  ActivityLog,
  Tank,
  Incident
} from '../types';

// Initial empty states for all data types
export const initialDrivers: Driver[] = [];
export const initialTrucks: Truck[] = [];
export const initialSuppliers: Supplier[] = [];
export const initialPurchaseOrders: PurchaseOrder[] = [];
export const initialLogs: LogEntry[] = [];
export const initialGPSData: GPSData[] = [];
export const initialAIInsights: AIInsight[] = [];
export const initialStatusHistory: StatusHistoryEntry[] = [];
export const initialStaff: Staff[] = [];
export const initialDispensers: Dispenser[] = [];
export const initialShifts: Shift[] = [];
export const initialSales: Sale[] = [];
export const initialPrices: PriceRecord[] = [];
export const initialIncidents: Incident[] = [];
export const initialActivityLogs: ActivityLog[] = [];
export const initialTanks: Tank[] = [];

// Default initial state for the entire app
export const defaultInitialState = {
  purchaseOrders: initialPurchaseOrders,
  logs: initialLogs,
  suppliers: initialSuppliers,
  drivers: initialDrivers,
  trucks: initialTrucks,
  gpsData: initialGPSData,
  aiInsights: initialAIInsights,
  staff: initialStaff,
  dispensers: initialDispensers,
  shifts: initialShifts,
  sales: initialSales,
  prices: initialPrices,
  incidents: initialIncidents,
  activityLogs: initialActivityLogs
};
