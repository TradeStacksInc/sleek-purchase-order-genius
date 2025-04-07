
import { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight,
  Staff, Dispenser, Shift, Sale, Incident, ActivityLog, Tank,
  Price, ProductType, DeliveryDetails, OrderStatus
} from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';

export interface AppContextType {
  // State
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
  
  // Purchase Order methods
  addPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id'>) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<PurchaseOrder | null>;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => Promise<boolean>;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getOrdersWithDeliveryStatus: (status: string) => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  
  // Log methods
  addLog: (logData: Omit<any, 'id' | 'timestamp'>) => any;
  deleteLog: (id: string) => boolean;
  getLogById: (id: string) => any;
  getAllLogs: (params?: PaginationParams) => PaginatedResult<any>;
  getLogsByOrderId: (orderId: string, params?: PaginationParams) => any[];
  logAIInteraction: (prompt: string, response: string) => void;
  
  // Supplier methods
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Supplier | null;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
  
  // Driver methods
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => Driver | null;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | undefined;
  getAllDrivers: (params?: PaginationParams) => PaginatedResult<Driver>;
  getAvailableDrivers: () => Driver[];
  
  // Truck methods
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  updateTruck: (id: string, updates: Partial<Truck>) => Truck | null;
  deleteTruck: (id: string) => boolean;
  getTruckById: (id: string) => Truck | undefined;
  getAllTrucks: (params?: PaginationParams) => PaginatedResult<Truck>;
  getAvailableTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string, latitude?: number, longitude?: number) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  getNonGPSTrucks: () => Truck[];
  
  // GPS methods
  addGPSData: (data: Omit<GPSData, 'id' | 'timestamp'>) => GPSData;
  getGPSDataForTruck: (truckId: string, limit?: number) => GPSData[];
  getAllGPSData: (params?: PaginationParams) => PaginatedResult<GPSData>;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  
  // AI Insight methods
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'isRead'>) => AIInsight;
  markAIInsightAsRead: (id: string) => boolean;
  getUnreadAIInsights: () => AIInsight[];
  getAllAIInsights: (params?: PaginationParams) => PaginatedResult<AIInsight>;
  resetAIInsights: () => boolean;
  getInsightsByType: (type: string) => AIInsight[];
  generateAIInsights: (data: any) => AIInsight;
  
  // Staff methods
  addStaff: (staff: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => Staff | null;
  deleteStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  getActiveStaff: () => Staff[];
  
  // Dispenser methods
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser: (id: string, updates: Partial<Dispenser>) => Dispenser | null;
  deleteDispenser: (id: string) => boolean;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  getActiveDispensers: () => Dispenser[];
  
  // Shift methods
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, updates: Partial<Shift>) => Shift | null;
  deleteShift: (id: string) => boolean;
  getShiftById: (id: string) => Shift | undefined;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  getCurrentShift: () => Shift | null;
  
  // Sale methods
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => Sale | null;
  deleteSale: (id: string) => boolean;
  getSaleById: (id: string) => Sale | undefined;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  getSalesForShift: (shiftId: string) => Sale[];
  
  // Price methods
  addPrice: (price: Omit<Price, 'id'>) => Price;
  updatePrice: (id: string, updates: Partial<Price>) => Price | null;
  deletePrice: (id: string) => boolean;
  getPriceById: (id: string) => Price | undefined;
  getAllPrices: (params?: PaginationParams) => PaginatedResult<Price>;
  getCurrentPrices: () => Record<ProductType, number>;
  
  // Incident methods
  addIncident: (incident: Omit<Incident, 'id'>) => Incident;
  updateIncident: (id: string, updates: Partial<Incident>) => Incident | null;
  deleteIncident: (id: string) => boolean;
  getIncidentById: (id: string) => Incident | undefined;
  getAllIncidents: (params?: PaginationParams) => PaginatedResult<Incident>;
  
  // Activity log methods
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => ActivityLog;
  getAllActivityLogs: (params?: PaginationParams) => PaginatedResult<ActivityLog>;
  
  // Tank methods
  addTank: (tank: Omit<Tank, 'id'>) => Tank;
  updateTank: (id: string, updates: Partial<Tank>) => Tank | null;
  deleteTank: (id: string) => boolean;
  getTankById: (id: string) => Tank | undefined;
  getAllTanks: (params?: PaginationParams) => PaginatedResult<Tank>;
  getTanksByProduct: (productType: ProductType) => Tank[];
  setTankActive: (id: string, isActive: boolean) => boolean;
  
  // Company methods
  company: any;
  updateCompany: (data: Partial<any>) => void;
  
  // Delivery methods
  completeDelivery: (orderId: string) => Promise<boolean>;
  recordOffloadingDetails: (orderId: string, details: any) => boolean;
  recordOffloadingToTank: (tankId: string, volume: number, source: string, sourceId: string) => boolean;
  startDelivery: (orderId: string) => Promise<boolean>;
  updateDeliveryStatus: (orderId: string, status: string) => boolean;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => boolean;
}
