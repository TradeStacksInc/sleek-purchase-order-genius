
import { 
  PurchaseOrder, 
  Supplier, 
  LogEntry, 
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
  Tank,
  OrderStatus,
  ProductType
} from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { defaultCompany } from '../data/mockData';

export interface AppContextType {
  // State
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
  prices: Price[];
  incidents: Incident[];
  activityLogs: ActivityLog[];
  tanks: Tank[];
  company: typeof defaultCompany;
  
  // Purchase Order functions
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => Promise<PurchaseOrder | null>;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getOrdersWithDeliveryStatus: (status: string) => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  
  // Log functions
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => LogEntry;
  deleteLog: (id: string) => boolean;
  getLogById: (id: string) => LogEntry | undefined;
  getAllLogs: (params?: PaginationParams) => PaginatedResult<LogEntry>;
  getLogsByOrderId: (orderId: string) => LogEntry[];
  logAIInteraction: (prompt: string, response: string) => LogEntry;
  
  // Supplier functions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Supplier | null;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
  
  // Driver functions
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, driver: Partial<Driver>) => Driver | null;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | undefined;
  getAllDrivers: (params?: PaginationParams) => PaginatedResult<Driver>;
  getAvailableDrivers: () => Driver[];
  
  // Truck functions
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  updateTruck: (id: string, truck: Partial<Truck>) => Truck | null;
  deleteTruck: (id: string) => boolean;
  getTruckById: (id: string) => Truck | undefined;
  getAllTrucks: (params?: PaginationParams) => PaginatedResult<Truck>;
  getAvailableTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string, latitude?: number, longitude?: number) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  getNonGPSTrucks: () => Truck[];
  
  // GPS Data functions
  addGPSData: (data: Omit<GPSData, 'id' | 'timestamp'>) => GPSData;
  getGPSDataForTruck: (truckId: string, limit?: number) => GPSData[];
  getAllGPSData: (params?: PaginationParams) => PaginatedResult<GPSData>;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => GPSData;
  
  // AI Insights functions
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'isRead'>) => AIInsight;
  markAIInsightAsRead: (id: string) => boolean;
  getUnreadAIInsights: () => AIInsight[];
  getAllAIInsights: (params?: PaginationParams) => PaginatedResult<AIInsight>;
  resetAIInsights: () => boolean;
  generateAIInsights: (data: any) => AIInsight;
  getInsightsByType: (type: string) => AIInsight[];
  
  // Staff functions
  addStaff: (staffMember: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, staffMember: Partial<Staff>) => Staff | null;
  deleteStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  getActiveStaff: () => Staff[];
  
  // Dispenser functions
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser: (id: string, dispenser: Partial<Dispenser>) => Dispenser | null;
  deleteDispenser: (id: string) => boolean;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  getActiveDispensers: () => Dispenser[];
  
  // Shift functions
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, shift: Partial<Shift>) => Shift | null;
  deleteShift: (id: string) => boolean;
  getShiftById: (id: string) => Shift | undefined;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  getCurrentShift: () => Shift | null;
  
  // Sale functions
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, sale: Partial<Sale>) => Sale | null;
  deleteSale: (id: string) => boolean;
  getSaleById: (id: string) => Sale | undefined;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  getSalesForShift: (shiftId: string) => Sale[];
  
  // Price functions
  addPrice: (price: Omit<Price, 'id'>) => Price;
  updatePrice: (id: string, price: Partial<Price>) => Price | null;
  deletePrice: (id: string) => boolean;
  getPriceById: (id: string) => Price | undefined;
  getAllPrices: (params?: PaginationParams) => PaginatedResult<Price>;
  getCurrentPrices: () => Record<ProductType, number>;
  
  // Incident functions
  addIncident: (incident: Omit<Incident, 'id'>) => Incident;
  updateIncident: (id: string, incident: Partial<Incident>) => Incident | null;
  deleteIncident: (id: string) => boolean;
  getIncidentById: (id: string) => Incident | undefined;
  getAllIncidents: (params?: PaginationParams) => PaginatedResult<Incident>;
  
  // Activity Log functions
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => ActivityLog;
  getAllActivityLogs: (params?: PaginationParams) => PaginatedResult<ActivityLog>;
  
  // Tank functions
  addTank: (tank: Omit<Tank, 'id'>) => Tank;
  updateTank: (id: string, tank: Partial<Tank>) => Tank | null;
  deleteTank: (id: string) => boolean;
  getTankById: (id: string) => Tank | undefined;
  getAllTanks: (params?: PaginationParams) => PaginatedResult<Tank>;
  getTanksByProduct: (productType: ProductType) => Tank[];
  setTankActive: (id: string, isActive: boolean) => boolean;
  
  // User Authentication logging functions
  logUserLogin: (userId: string, username: string) => void;
  logUserLogout: (userId: string, username: string) => void;
  
  // Company functions
  updateCompany: (data: Partial<typeof defaultCompany>) => void;
  
  // Delivery functions
  completeDelivery: (orderId: string) => Promise<boolean>;
  recordOffloadingDetails: (orderId: string, details: any) => boolean;
  recordOffloadingToTank: (tankId: string, volume: number, source: string, sourceId: string) => boolean;
  startDelivery: (orderId: string) => Promise<boolean>;
  updateDeliveryStatus: (orderId: string, status: 'pending' | 'delivered' | 'in_transit') => boolean;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => boolean;

  // Fraud detection and GPS tracking functions
  logFraudDetection: (description: string, severity: 'low' | 'medium' | 'high', entityId?: string) => void;
  logGpsActivity: (truckId: string, description: string) => void;
}
