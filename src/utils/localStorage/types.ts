
import { Driver, GPSData, LogEntry, PurchaseOrder, Supplier, Truck, AIInsight, Staff, Dispenser, Shift, Sale, PriceRecord, Incident, ActivityLog, Tank } from '../../types';

// Type for all storable data
export interface StoredAppData {
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

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  filter?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// Paginated result
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
