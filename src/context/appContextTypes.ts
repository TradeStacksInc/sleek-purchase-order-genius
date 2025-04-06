
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
  Tank,
  ProductType,
  OffloadingDetails,
  LogEntry,
  DeliveryDetails 
} from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';

export type AppContextType = {
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
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => boolean;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  updateOrderStatus: (orderId: string, status: string, note: string) => boolean;
  getOrdersWithDeliveryStatus: (status: string) => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  
  // Log methods
  addLog: (log: any) => void;
  deleteLog: (id: string) => void;
  getLogById: (id: string) => any | undefined;
  getAllLogs: (params?: PaginationParams) => PaginatedResult<any>;
  getLogsByOrderId: (orderId: string) => any[];
  logAIInteraction: (prompt: string, response: string) => void;
  
  // Supplier methods
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
  
  // Driver & Truck methods
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => boolean;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | undefined;
  getAllDrivers: (params?: PaginationParams) => PaginatedResult<Driver>;
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  updateTruck: (id: string, updates: Partial<Truck>) => boolean;
  deleteTruck: (id: string) => boolean;
  getTruckById: (id: string) => Truck | undefined;
  getAllTrucks: (params?: PaginationParams) => PaginatedResult<Truck>;
  tagTruckWithGPS: (truckId: string, deviceId: string, initialLatitude: number, initialLongitude: number) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  getNonGPSTrucks: () => Truck[];
  
  // GPS data methods
  recordGPSData: (truckId: string, latitude: number, longitude: number) => GPSData;
  getGPSDataForTruck: (truckId: string, params?: PaginationParams) => PaginatedResult<GPSData>;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  
  // Delivery methods
  updateDeliveryDetails: (orderId: string, driverId: string, truckId: string, deliveryDate: Date) => boolean;
  markOrderAsDelivered: (orderId: string) => boolean;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => boolean;
  startDelivery: (orderId: string) => boolean;
  completeDelivery: (orderId: string) => boolean;
  updateDeliveryStatus: (orderId: string, status: string) => boolean;
  recordOffloadingDetails: (orderId: string, details: OffloadingDetails) => boolean;
  recordOffloadingToTank: (tankId: string, volume: number, source: string, sourceId: string) => boolean;
  
  // Staff methods
  addStaff: (staff: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => boolean;
  deleteStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  
  // Dispenser methods
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser?: (id: string, updates: Partial<Dispenser>) => boolean | undefined;
  deleteDispenser: (id: string) => boolean;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  setDispenserActive: (id: string, isActive: boolean) => Dispenser | undefined;
  recordManualSale: (dispenserId: string, volume: number, amount: number, staffId: string, shiftId: string, paymentType: string) => boolean;
  getDispenserSalesStats: (dispenserId: string, dateRange?: { start: Date, end: Date }) => { volume: number; amount: number; transactions: number; };
  recordDispensing: (id: string, volume: number, staffId: string, shiftId: string) => boolean;
  
  // Shift methods
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, updates: Partial<Shift>) => boolean;
  deleteShift: (id: string) => boolean;
  getShiftById: (id: string) => Shift | undefined;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  startShift: (staffId: string) => Shift | undefined;
  endShift: (staffId: string) => Shift | undefined;
  
  // Sale methods
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => boolean;
  deleteSale: (id: string) => boolean;
  getSaleById: (id: string) => Sale | undefined;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  
  // Price methods
  addPrice: (price: Omit<Price, 'id'>) => Price;
  updatePrice: (id: string, updates: Partial<Price>) => boolean;
  deletePrice: (id: string) => boolean;
  getPriceById: (id: string) => Price | undefined;
  getAllPrices: (params?: PaginationParams) => PaginatedResult<Price>;
  
  // Helper methods
  getAvailableDrivers: () => Driver[];
  getAvailableTrucks: () => Truck[];
  getGPSTaggedTrucks: () => Truck[];
  getNonTaggedTrucks: () => Truck[];
  getShiftsByStaffId: (staffId: string) => Shift[];
  getCurrentStaffShift: (staffId: string) => Shift | null;
  
  // Tank methods
  getTankByProductType: (productType: ProductType) => Tank | undefined;
  getActiveDispensersByTankId: (tankId: string) => Dispenser[];
  getActiveTanksByProductType: (productType: ProductType) => Tank[];
  addTank: (tank: Omit<Tank, 'id'>) => Tank;
  updateTank: (id: string, updates: Partial<Tank>) => boolean;
  deleteTank: (id: string) => boolean;
  getAllTanks: (params?: PaginationParams) => PaginatedResult<Tank>;
  connectTankToDispenser: (tankId: string, dispenserId: string) => boolean;
  disconnectTankFromDispenser: (tankId: string, dispenserId: string) => boolean;
  setTankActive: (id: string, isActive: boolean) => boolean;
  
  // AI methods
  generateAIInsights: () => void;
  getInsightsByType: (type: string) => AIInsight[];
  
  // Incident methods
  addIncident: (incident: Omit<Incident, 'id'>) => Incident;
  
  // Database management
  resetDatabase: (includeSeedData?: boolean) => void;
  exportDatabase: () => string;
  importDatabase: (jsonData: string) => boolean;
};
