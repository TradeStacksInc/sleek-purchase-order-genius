
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
  addPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => boolean;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  updateOrderStatus: (id: string, status: OrderStatus) => boolean;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getOrdersWithDeliveryStatus: (status: string) => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  
  // Log methods
  addLog: (logData: any) => any;
  deleteLog: (id: string) => boolean;
  getLogById: (id: string) => any;
  getAllLogs: (params?: PaginationParams) => PaginatedResult<any>;
  getLogsByOrderId: (orderId: string, params?: PaginationParams) => PaginatedResult<any>;
  logAIInteraction: (prompt: string, response: string) => void;
  
  // Supplier methods
  addSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
  
  // Driver methods
  addDriver: (driverData: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => boolean;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | undefined;
  getAllDrivers: (params?: PaginationParams) => PaginatedResult<Driver>;
  
  // Truck methods
  addTruck: (truckData: Omit<Truck, 'id'>) => Truck;
  updateTruck: (id: string, updates: Partial<Truck>) => boolean;
  deleteTruck: (id: string) => boolean;
  getTruckById: (id: string) => Truck | undefined;
  getAllTrucks: (params?: PaginationParams) => PaginatedResult<Truck>;
  getNonGPSTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string, deviceId: string, initialLatitude: number, initialLongitude: number) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  
  // GPS methods
  recordGPSData: (truckId: string, latitude: number, longitude: number) => GPSData;
  getGPSDataForTruck: (truckId: string, params?: PaginationParams) => PaginatedResult<GPSData>;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  
  // Delivery methods
  updateDeliveryDetails: (orderId: string, driverId: string, truckId: string, deliveryDate: Date) => boolean;
  markOrderAsDelivered: (orderId: string) => boolean;
  startDelivery: (orderId: string) => boolean;
  completeDelivery: (orderId: string) => boolean;
  updateDeliveryStatus: (orderId: string, updates: Partial<DeliveryDetails> | string) => boolean;
  recordOffloadingDetails: (orderId: string, details: any) => boolean;
  recordOffloadingToTank: (tankId: string, volume: number, source: string, sourceId: string) => boolean;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => boolean;
  
  // AI methods
  generateAIInsights: (data: any) => AIInsight;
  getInsightsByType: (type: string) => AIInsight[];
  
  // Staff methods
  addStaff: (staffData: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => boolean;
  deleteStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  
  // Dispenser methods
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser: (id: string, updates: Partial<Dispenser>) => boolean;
  deleteDispenser: (id: string) => boolean;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  setDispenserActive: (id: string, isActive: boolean) => Dispenser | undefined;
  recordManualSale: (id: string, volume: number, amount: number, staffId: string, shiftId: string, paymentMethod: string) => boolean;
  getDispenserSalesStats: (id: string, dateRange?: { start: Date, end: Date }) => { volume: number, amount: number, transactions: number };
  recordDispensing: (id: string, volume: number, staffId: string, shiftId: string) => boolean;
  
  // Shift methods
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, updates: Partial<Shift>) => boolean;
  deleteShift: (id: string) => boolean;
  getShiftById: (id: string) => Shift | null;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  startShift: (staffId: string) => Shift | null;
  endShift: (shiftId: string) => boolean;
  getShiftsByStaffId: (staffId: string) => Shift[];
  getCurrentStaffShift: (staffId: string) => Shift | null;
  
  // Sale methods
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => boolean;
  deleteSale: (id: string) => boolean;
  getSaleById: (id: string) => Sale | undefined;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  
  // Price methods
  addPrice: (priceData: Omit<Price, 'id' | 'effectiveDate'>) => Price;
  updatePrice: (id: string, updates: Partial<Price>) => Price;
  deletePrice: (id: string) => boolean;
  getPriceById: (id: string) => Price | null;
  getAllPrices: (productType: string, params?: PaginationParams) => PaginatedResult<Price>;
  
  // Tank methods
  getTankByProductType: (productType: ProductType) => Tank | null;
  getActiveDispensersByTankId: (tankId: string) => Dispenser[];
  getActiveTanksByProductType: (productType: ProductType) => Tank[];
  addTank: (tankData: Omit<Tank, "id">) => Promise<Tank>;
  updateTank: (id: string, updates: Partial<Tank>) => boolean;
  deleteTank: (id: string) => boolean;
  getAllTanks: (params?: PaginationParams) => PaginatedResult<Tank>;
  connectTankToDispenser: (tankId: string, dispenserId: string) => boolean;
  disconnectTankFromDispenser: (tankId: string, dispenserId: string) => boolean;
  setTankActive: (tankId: string, isActive: boolean) => boolean;
  
  // Incident management
  addIncident: (incidentData: Omit<Incident, 'id'>) => Incident;
  
  // Database management
  resetDatabase: (includeSeedData?: boolean) => Promise<void>;
  exportDatabase: () => string;
  importDatabase: (jsonData: string) => boolean;
}
