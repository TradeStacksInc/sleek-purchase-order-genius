
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, 
  LogEntry, 
  Supplier, 
  Driver,
  Truck,
  GPSData,
  AIInsight,
  Staff,
  Dispenser,
  Shift,
  Sale,
  PriceRecord,
  Incident,
  ActivityLog,
  Tank
} from '../types';

export interface AppState {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  aiInsights: AIInsight[];
  staff: Staff[];
  dispensers: Dispenser[];
  shifts: Shift[];
  sales: Sale[];
  prices: PriceRecord[];
  incidents: Incident[];
  activityLogs: ActivityLog[];
  tanks: Tank[];
}

// Initial empty state with no mock data
export const defaultInitialState: AppState = {
  purchaseOrders: [],
  logs: [],
  suppliers: [],
  drivers: [],
  trucks: [],
  gpsData: [],
  aiInsights: [],
  staff: [],
  dispensers: [],
  shifts: [],
  sales: [],
  prices: [],
  incidents: [],
  activityLogs: [],
  tanks: []
};
