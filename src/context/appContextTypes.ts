import { 
  LogEntry, 
  PurchaseOrder, 
  Supplier, 
  Driver, 
  Truck, 
  DeliveryDetails, 
  GPSData, 
  OffloadingDetails, 
  Incident, 
  AIInsight, 
  OrderStatus, 
  Staff, 
  Dispenser, 
  Shift, 
  Sale, 
  PriceRecord, 
  ActivityLog,
  Tank 
} from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';

export interface AppContextType {
  // Data collections
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
  
  // Purchase Order actions
  addPurchaseOrder: (order: PurchaseOrder) => PurchaseOrder | null;
  updateOrderStatus: (id: string, status: OrderStatus, notes?: string, approvedBy?: string, rejectionReason?: string) => void;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getOrdersWithDeliveryStatus: (status: 'pending' | 'in_transit' | 'delivered') => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  getOrdersByStatus: (status: OrderStatus) => PurchaseOrder[];
  getStatusDescription: (status: OrderStatus) => string;
  
  // Supplier actions
  addSupplier: (supplier: Supplier) => Supplier | null;
  
  // Log actions
  getLogsByOrderId: (id: string) => LogEntry[];
  logAIInteraction: (query: string, response: string) => void;
  getActivityLogs: (params?: PaginationParams) => PaginatedResult<ActivityLog>;
  
  // Driver and Truck actions
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  getDriverById: (id: string) => Driver | undefined;
  getTruckById: (id: string) => Truck | undefined;
  getAvailableDrivers: () => Driver[];
  getAvailableTrucks: () => Truck[];
  getGPSTaggedTrucks: () => Truck[];
  getNonTaggedTrucks: () => Truck[];
  getNonGPSTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string, initialLatitude: number, initialLongitude: number) => void;
  untagTruckGPS: (truckId: string) => void;
  
  // Delivery actions
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => void;
  updateDeliveryStatus: (
    orderId: string, 
    updates: Partial<DeliveryDetails>
  ) => PurchaseOrder | undefined;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  recordOffloadingDetails: (orderId: string, offloadingData: Omit<OffloadingDetails, 'id' | 'deliveryId' | 'timestamp' | 'discrepancyPercentage' | 'isDiscrepancyFlagged' | 'status'>) => void;
  addIncident: (orderId: string, incident: Omit<Incident, 'id' | 'deliveryId' | 'timestamp'>) => void;
  startDelivery: (orderId: string) => void;
  completeDelivery: (orderId: string) => void;
  
  // AI actions
  generateDiscrepancyInsights: () => void;
  markInsightAsRead: (id: string) => void;
  
  // Staff actions
  addStaff: (staff: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, data: Partial<Staff>) => Staff | undefined;
  removeStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  
  // Dispenser actions
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser: (id: string, data: Partial<Dispenser>) => Dispenser | undefined;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  
  // Shift actions
  startShift: (staffId: string) => Shift;
  endShift: (shiftId: string) => Shift | undefined;
  getShiftById: (id: string) => Shift | undefined;
  getShiftsByStaffId: (staffId: string, params?: PaginationParams) => PaginatedResult<Shift>;
  
  // Sale actions
  recordSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => Sale;
  getSaleById: (id: string) => Sale | undefined;
  getSalesByStaffId: (staffId: string, params?: PaginationParams) => PaginatedResult<Sale>;
  getSalesByProductType: (productType: string, params?: PaginationParams) => PaginatedResult<Sale>;
  
  // Price actions
  setPriceRecord: (price: Omit<PriceRecord, 'id' | 'effectiveDate'>) => PriceRecord;
  getCurrentPrice: (productType: string) => PriceRecord | undefined;
  getPriceHistory: (productType: string, params?: PaginationParams) => PaginatedResult<PriceRecord>;
  
  // Database management
  resetDatabase: (includeSeedData?: boolean) => void;
  exportDatabase: () => string;
  importDatabase: (jsonData: string) => boolean;
  
  // Tank actions
  addTank: (tank: Omit<Tank, 'id'>) => Tank;
  updateTank: (id: string, data: Partial<Tank>) => Tank | undefined;
  getTankById: (id: string) => Tank | undefined;
  getAllTanks: () => Tank[];
  recordOffloadingToTank: (tankId: string, volume: number, productType: string) => Tank | undefined;
}
