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
  ProductType 
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
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => boolean;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  addLog: (log: any) => void;
  deleteLog: (id: string) => void;
  getLogById: (id: string) => any | undefined;
  getAllLogs: (params?: PaginationParams) => PaginatedResult<any>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
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
  recordGPSData: (truckId: string, latitude: number, longitude: number) => GPSData;
  getGPSDataForTruck: (truckId: string, params?: PaginationParams) => PaginatedResult<GPSData>;
  updateDeliveryDetails: (
    orderId: string,
    driverId: string,
    truckId: string,
    deliveryDate: Date
  ) => boolean;
  markOrderAsDelivered: (orderId: string) => boolean;
  addStaff: (staff: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => boolean;
  deleteStaff: (id: string) => boolean;
  getStaffById: (id: string) => Staff | undefined;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  addDispenser: (dispenser: Omit<Dispenser, 'id'>) => Dispenser;
  updateDispenser: (id: string, updates: Partial<Dispenser>) => boolean | undefined;
  deleteDispenser: (id: string) => boolean;
  getDispenserById: (id: string) => Dispenser | undefined;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  setDispenserActive: (id: string, isActive: boolean) => Dispenser | undefined;
  recordManualSale: (dispenserId: string, volume: number, amount: number, staffId: string, shiftId: string, paymentType: string) => boolean;
  getDispenserSalesStats: (dispenserId: string, dateRange?: { from: Date, to: Date }) => { volume: number; amount: number; transactions: number; };
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, updates: Partial<Shift>) => boolean;
  deleteShift: (id: string) => boolean;
  getShiftById: (id: string) => Shift | undefined;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  startShift: (staffId: string) => Shift | undefined;
  endShift: (staffId: string) => Shift | undefined;
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => boolean;
  deleteSale: (id: string) => boolean;
  getSaleById: (id: string) => Sale | undefined;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  addPrice: (price: Omit<Price, 'id'>) => Price;
  updatePrice: (id: string, updates: Partial<Price>) => boolean;
  deletePrice: (id: string) => boolean;
  getPriceById: (id: string) => Price | undefined;
  getAllPrices: (params?: PaginationParams) => PaginatedResult<Price>;
  getAvailableDrivers: () => Driver[];
  getAvailableTrucks: () => Truck[];
  getGPSTaggedTrucks: () => Truck[];
  getNonTaggedTrucks: () => Truck[];
  getShiftsByStaffId: (staffId: string) => Shift[];
  getCurrentStaffShift: (staffId: string) => Shift | null;
  getTankByProductType: (productType: ProductType) => Tank | undefined;
  getActiveDispensersByTankId: (tankId: string) => Dispenser[];
  getActiveTanksByProductType: (productType: ProductType) => Tank[];
  generateAIInsights: () => void;
  getInsightsByType: (type: string) => AIInsight[];
  resetDatabase: (includeSeedData?: boolean) => void;
  exportDatabase: () => string;
  importDatabase: (jsonData: string) => boolean;
};
