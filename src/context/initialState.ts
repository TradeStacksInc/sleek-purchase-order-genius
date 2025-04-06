
import { 
  PurchaseOrder, 
  Supplier, 
  Driver, 
  Truck, 
  GPSData, 
  AIInsight, 
  Staff, 
  Dispenser, 
  Shift, 
  Sale, 
  Price, 
  Incident, 
  ActivityLog, 
  Tank 
} from '../types';

interface InitialState {
  purchaseOrders: PurchaseOrder[];
  logs: any[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  aiInsights: AIInsight[];
  staff: Staff[];
  dispensers: Dispenser[];
  shifts: Shift[];
  sales: Sale[];
  prices: Price[];
  incidents: Incident[];
  activityLogs: ActivityLog[];
  tanks: Tank[];
}

export const defaultInitialState: InitialState = {
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
