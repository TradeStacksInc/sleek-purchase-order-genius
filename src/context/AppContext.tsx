import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  PriceRecord, 
  Incident, 
  ActivityLog, 
  Tank,
  OrderStatus,
  ProductType,
  DeliveryDetails
} from '../types';
import { 
  saveToLocalStorage, 
  getFromLocalStorage, 
  STORAGE_KEYS, 
  PaginationParams, 
  PaginatedResult, 
  getPaginatedData 
} from '../utils/localStorage';
import { defaultCompany } from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { fromSupabaseFormat, toSupabaseFormat } from '@/utils/supabaseAdapters';

// Define the shape of our context
interface AppContextType {
  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => Promise<PurchaseOrder | null>;
  getPurchaseOrder: (id: string) => PurchaseOrder | null;
  getAllPurchaseOrders: (params?: PaginationParams) => PaginatedResult<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => boolean;
  
  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => LogEntry;
  getLogsForPO: (poId: string) => LogEntry[];
  getAllLogs: (params?: PaginationParams) => PaginatedResult<LogEntry>;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Supplier | null;
  getSupplier: (id: string) => Supplier | null;
  getAllSuppliers: (params?: PaginationParams) => PaginatedResult<Supplier>;
  deleteSupplier: (id: string) => boolean;
  
  // Drivers
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Driver;
  updateDriver: (id: string, driver: Partial<Driver>) => Driver | null;
  getDriver: (id: string) => Driver | null;
  getAllDrivers: (params?: PaginationParams) => PaginatedResult<Driver>;
  deleteDriver: (id: string) => boolean;
  getAvailableDrivers: () => Driver[];
  
  // Trucks
  trucks: Truck[];
  addTruck: (truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>) => Truck;
  updateTruck: (id: string, truck: Partial<Truck>) => Truck | null;
  getTruck: (id: string) => Truck | null;
  getAllTrucks: (params?: PaginationParams) => PaginatedResult<Truck>;
  deleteTruck: (id: string) => boolean;
  getAvailableTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  getNonGPSTrucks: () => Truck[];
  
  // GPS Data
  gpsData: GPSData[];
  addGPSData: (data: Omit<GPSData, 'id' | 'timestamp'>) => GPSData;
  getGPSDataForTruck: (truckId: string, limit?: number) => GPSData[];
  getAllGPSData: (params?: PaginationParams) => PaginatedResult<GPSData>;
  
  // AI Insights
  aiInsights: AIInsight[];
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'timestamp' | 'isRead'>) => AIInsight;
  markAIInsightAsRead: (id: string) => boolean;
  getUnreadAIInsights: () => AIInsight[];
  getAllAIInsights: (params?: PaginationParams) => PaginatedResult<AIInsight>;
  resetAIInsights: () => boolean;
  
  // Staff
  staff: Staff[];
  addStaff: (staffMember: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Staff;
  updateStaff: (id: string, staffMember: Partial<Staff>) => Staff | null;
  getStaff: (id: string) => Staff | null;
  getAllStaff: (params?: PaginationParams) => PaginatedResult<Staff>;
  deleteStaff: (id: string) => boolean;
  getActiveStaff: () => Staff[];
  
  // Dispensers
  dispensers: Dispenser[];
  addDispenser: (dispenser: Omit<Dispenser, 'id' | 'createdAt' | 'updatedAt'>) => Dispenser;
  updateDispenser: (id: string, dispenser: Partial<Dispenser>) => Dispenser | null;
  getDispenser: (id: string) => Dispenser | null;
  getAllDispensers: (params?: PaginationParams) => PaginatedResult<Dispenser>;
  deleteDispenser: (id: string) => boolean;
  getActiveDispensers: () => Dispenser[];
  
  // Shifts
  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, shift: Partial<Shift>) => Shift | null;
  getShift: (id: string) => Shift | null;
  getAllShifts: (params?: PaginationParams) => PaginatedResult<Shift>;
  deleteShift: (id: string) => boolean;
  getCurrentShift: () => Shift | null;
  
  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, sale: Partial<Sale>) => Sale | null;
  getSale: (id: string) => Sale | null;
  getAllSales: (params?: PaginationParams) => PaginatedResult<Sale>;
  deleteSale: (id: string) => boolean;
  getSalesForShift: (shiftId: string) => Sale[];
  
  // Prices
  prices: PriceRecord[];
  addPrice: (price: Omit<PriceRecord, 'id'>) => PriceRecord;
  updatePrice: (id: string, price: Partial<PriceRecord>) => PriceRecord | null;
  getPrice: (id: string) => PriceRecord | null;
  getAllPrices: (params?: PaginationParams) => PaginatedResult<PriceRecord>;
  deletePrice: (id: string) => boolean;
  getCurrentPrices: () => Record<ProductType, number>;
  
  // Incidents
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id'>) => Incident;
  updateIncident: (id: string, incident: Partial<Incident>) => Incident | null;
  getIncident: (id: string) => Incident | null;
  getAllIncidents: (params?: PaginationParams) => PaginatedResult<Incident>;
  deleteIncident: (id: string) => boolean;
  
  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => ActivityLog;
  getAllActivityLogs: (params?: PaginationParams) => PaginatedResult<ActivityLog>;
  
  // Tanks
  tanks: Tank[];
  addTank: (tank: Omit<Tank, 'id'>) => Tank;
  updateTank: (id: string, tank: Partial<Tank>) => Tank | null;
  getTank: (id: string) => Tank | null;
  getAllTanks: (params?: PaginationParams) => PaginatedResult<Tank>;
  deleteTank: (id: string) => boolean;
  getTanksByProduct: (productType: ProductType) => Tank[];
  
  // Company
  company: typeof defaultCompany;
  updateCompany: (data: Partial<typeof defaultCompany>) => void;

  // Additional methods required by components
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getLogsByOrderId: (orderId: string) => LogEntry[];
  getOrdersWithDeliveryStatus: (status: string) => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  completeDelivery: (orderId: string) => Promise<boolean>;
  recordOffloadingDetails: (orderId: string, details: any) => boolean;
  recordOffloadingToTank: (tankId: string, volume: number, source: string, sourceId: string) => boolean;
  startDelivery: (orderId: string) => Promise<boolean>;
  updateDeliveryStatus: (orderId: string, status: any) => boolean;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => boolean;
  generateAIInsights: (data: any) => AIInsight;
  getInsightsByType: (type: string) => AIInsight[];
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  logAIInteraction: (prompt: string, response: string) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for all our data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [gpsData, setGpsData] = useState<GPSData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [company, setCompany] = useState(defaultCompany);

  // Load data from localStorage on initial render
  useEffect(() => {
    setPurchaseOrders(getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, []));
    setLogs(getFromLocalStorage(STORAGE_KEYS.LOGS, []));
    setSuppliers(getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, []));
    setDrivers(getFromLocalStorage(STORAGE_KEYS.DRIVERS, []));
    setTrucks(getFromLocalStorage(STORAGE_KEYS.TRUCKS, []));
    setGpsData(getFromLocalStorage(STORAGE_KEYS.GPS_DATA, []));
    setAiInsights(getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, []));
    setStaff(getFromLocalStorage(STORAGE_KEYS.STAFF, []));
    setDispensers(getFromLocalStorage(STORAGE_KEYS.DISPENSERS, []));
    setShifts(getFromLocalStorage(STORAGE_KEYS.SHIFTS, []));
    setSales(getFromLocalStorage(STORAGE_KEYS.SALES, []));
    setPrices(getFromLocalStorage(STORAGE_KEYS.PRICES, []));
    setIncidents(getFromLocalStorage(STORAGE_KEYS.INCIDENTS, []));
    setActivityLogs(getFromLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, []));
    setTanks(getFromLocalStorage(STORAGE_KEYS.TANKS, []));
  }, []);

  // Purchase Order functions
  const addPurchaseOrder = useCallback(async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> => {
    const now = new Date();
    const newOrder: PurchaseOrder = {
      ...order,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    // Try to save to Supabase first
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(toSupabaseFormat.purchaseOrder(newOrder))
        .select()
        .single();
        
      if (error) throw error;
      
      // If successful, use the returned data with its database ID
      const savedOrder = fromSupabaseFormat.purchaseOrder(data);
      setPurchaseOrders(prev => [...prev, savedOrder]);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, savedOrder]);
      return savedOrder;
    } catch (error) {
      console.error('Error saving purchase order to Supabase:', error);
      
      // Fall back to local storage only
      setPurchaseOrders(prev => [...prev, newOrder]);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, newOrder]);
      return newOrder;
    }
  }, [purchaseOrders]);

  const updatePurchaseOrder = useCallback(async (id: string, orderUpdate: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...purchaseOrders[orderIndex],
      ...orderUpdate,
      updatedAt: new Date()
    };

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('purchase_orders')
        .update(toSupabaseFormat.purchaseOrder(updatedOrder))
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating purchase order in Supabase:', error);
      
      // Fall back to local storage only
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return updatedOrder;
    }
  }, [purchaseOrders]);

  const getPurchaseOrder = useCallback((id: string): PurchaseOrder | null => {
    return purchaseOrders.find(order => order.id === id) || null;
  }, [purchaseOrders]);

  const getAllPurchaseOrders = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<PurchaseOrder> => {
    return getPaginatedData(purchaseOrders, params);
  }, [purchaseOrders]);

  const deletePurchaseOrder = useCallback((id: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;

    try {
      // Delete from Supabase
      supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        });
      
      // Update local state
      const newOrders = purchaseOrders.filter(order => order.id !== id);
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return true;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      
      // Fall back to local storage only
      const newOrders = purchaseOrders.filter(order => order.id !== id);
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return true;
    }
  }, [purchaseOrders]);

  // Log functions
  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    const newLogs = [...logs, newLog];
    setLogs(newLogs);
    saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
    return newLog;
  }, [logs]);

  const getLogsForPO = useCallback((poId: string): LogEntry[] => {
    return logs.filter(log => log.poId === poId);
  }, [logs]);

  const getAllLogs = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<LogEntry> => {
    return getPaginatedData(logs, params);
  }, [logs]);

  // Supplier functions
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4()
    };
    
    const newSuppliers = [...suppliers, newSupplier];
    setSuppliers(newSuppliers);
    saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
    return newSupplier;
  }, [suppliers]);

  const updateSupplier = useCallback((id: string, supplierUpdate: Partial<Supplier>): Supplier | null => {
    const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);
    if (supplierIndex === -1) return null;

    const updatedSupplier = {
      ...suppliers[supplierIndex],
      ...supplierUpdate
    };

    const newSuppliers = [...suppliers];
    newSuppliers[supplierIndex] = updatedSupplier;
    setSuppliers(newSuppliers);
    saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
    return updatedSupplier;
  }, [suppliers]);

  const getSupplier = useCallback((id: string): Supplier | null => {
    return suppliers.find(supplier => supplier.id === id) || null;
  }, [suppliers]);

  const getAllSuppliers = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Supplier> => {
    return getPaginatedData(suppliers, params);
  }, [suppliers]);

  const deleteSupplier = useCallback((id: string): boolean => {
    const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);
    if (supplierIndex === -1) return false;

    const newSuppliers = suppliers.filter(supplier => supplier.id !== id);
    setSuppliers(newSuppliers);
    saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
    return true;
  }, [suppliers]);

  // Driver functions
  const addDriver = useCallback((driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Driver => {
    const now = new Date();
    const newDriver: Driver = {
      ...driver,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const newDrivers = [...drivers, newDriver];
    setDrivers(newDrivers);
    saveToLocalStorage(STORAGE_KEYS.DRIVERS, newDrivers);
    return newDriver;
  }, [drivers]);

  const updateDriver = useCallback((id: string, driverUpdate: Partial<Driver>): Driver | null => {
    const driverIndex = drivers.findIndex(driver => driver.id === id);
    if (driverIndex === -1) return null;

    const updatedDriver = {
      ...drivers[driverIndex],
      ...driverUpdate,
      updatedAt: new Date()
    };

    const newDrivers = [...drivers];
    newDrivers[driverIndex] = updatedDriver;
    setDrivers(newDrivers);
    saveToLocalStorage(STORAGE_KEYS.DRIVERS, newDrivers);
    return updatedDriver;
  }, [drivers]);

  const getDriver = useCallback((id: string): Driver | null => {
    return drivers.find(driver => driver.id === id) || null;
  }, [drivers]);

  const getAllDrivers = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Driver> => {
    return getPaginatedData(drivers, params);
  }, [drivers]);

  const deleteDriver = useCallback((id: string): boolean => {
    const driverIndex = drivers.findIndex(driver => driver.id === id);
    if (driverIndex === -1) return false;

    const newDrivers = drivers.filter(driver => driver.id !== id);
    setDrivers(newDrivers);
    saveToLocalStorage(STORAGE_KEYS.DRIVERS, newDrivers);
    return true;
  }, [drivers]);

  const getAvailableDrivers = useCallback((): Driver[] => {
    return drivers.filter(driver => driver.isAvailable);
  }, [drivers]);

  // Truck functions
  const addTruck = useCallback((truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Truck => {
    const now = new Date();
    const newTruck: Truck = {
      ...truck,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const newTrucks = [...trucks, newTruck];
    setTrucks(newTrucks);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
    return newTruck;
  }, [trucks]);

  const updateTruck = useCallback((id: string, truckUpdate: Partial<Truck>): Truck | null => {
    const truckIndex = trucks.findIndex(truck => truck.id === id);
    if (truckIndex === -1) return null;

    const updatedTruck = {
      ...trucks[truckIndex],
      ...truckUpdate,
      updatedAt: new Date()
    };

    const newTrucks = [...trucks];
    newTrucks[truckIndex] = updatedTruck;
    setTrucks(newTrucks);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
    return updatedTruck;
  }, [trucks]);

  const getTruck = useCallback((id: string): Truck | null => {
    return trucks.find(truck => truck.id === id) || null;
  }, [trucks]);

  const getAllTrucks = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Truck> => {
    return getPaginatedData(trucks, params);
  }, [trucks]);

  const deleteTruck = useCallback((id: string): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === id);
    if (truckIndex === -1) return false;

    const newTrucks = trucks.filter(truck => truck.id !== id);
    setTrucks(newTrucks);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
    return true;
  }, [trucks]);

  const getAvailableTrucks = useCallback((): Truck[] => {
    return trucks.filter(truck => truck.isAvailable);
  }, [trucks]);

  const tagTruckWithGPS = useCallback((truckId: string, gpsDeviceId: string): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return false;

    const updatedTruck = {
      ...trucks[truckIndex],
      isGPSTagged: true,
      gpsDeviceId,
      updatedAt: new Date()
    };

    const newTrucks = [...trucks];
    newTrucks[truckIndex] = updatedTruck;
    setTrucks(newTrucks);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
    return true;
  }, [trucks]);

  const untagTruckGPS = useCallback((truckId: string): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return false;

    const updatedTruck = {
      ...trucks[truckIndex],
      isGPSTagged: false,
      gpsDeviceId: undefined,
      updatedAt: new Date()
    };

    const newTrucks = [...trucks];
    newTrucks[truckIndex] = updatedTruck;
    setTrucks(newTrucks);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
    return true;
  }, [trucks]);

  const getNonGPSTrucks = useCallback((): Truck[] => {
    return trucks.filter(truck => !truck.isGPSTagged);
  }, [trucks]);

  // GPS Data functions
  const addGPSData = useCallback((data: Omit<GPSData, 'id' | 'timestamp'>): GPSData => {
    const newData: GPSData = {
      ...data,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    const newGpsData = [...gpsData, newData];
    setGpsData(newGpsData);
    saveToLocalStorage(STORAGE_KEYS.GPS_DATA, newGpsData);
    return newData;
  }, [gpsData]);

  const getGPSDataForTruck = useCallback((truckId: string, limit: number = 100): GPSData[] => {
    return gpsData
      .filter(data => data.truckId === truckId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [gpsData]);

  const getAllGPSData = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<GPSData> => {
    return getPaginatedData(gpsData, params);
  }, [gpsData]);

  // AI Insights functions
  const addAIInsight = useCallback((insight: Omit<AIInsight, 'id' | 'timestamp' | 'isRead'>): AIInsight => {
    const newInsight: AIInsight = {
      ...insight,
      id: uuidv4(),
      timestamp: new Date(),
      isRead: false
    };
    
    const newInsights = [...aiInsights, newInsight];
    setAiInsights(newInsights);
    saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, newInsights);
    return newInsight;
  }, [aiInsights]);

  const markAIInsightAsRead = useCallback((id: string): boolean => {
    const insightIndex = aiInsights.findIndex(insight => insight.id === id);
    if (insightIndex === -1) return false;

    const updatedInsight = {
      ...aiInsights[insightIndex],
      isRead: true
    };

    const newInsights = [...aiInsights];
    newInsights[insightIndex] = updatedInsight;
    setAiInsights(newInsights);
    saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, newInsights);
    return true;
  }, [aiInsights]);

  const getUnreadAIInsights = useCallback((): AIInsight[] => {
    return aiInsights.filter(insight => !insight.isRead);
  }, [aiInsights]);

  const getAllAIInsights = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<AIInsight> => {
    return getPaginatedData(aiInsights, params);
  }, [aiInsights]);

  const resetAIInsights = useCallback((): boolean => {
    setAiInsights([]);
    return true;
  }, []);

  // Staff functions
  const addStaff = useCallback((staffMember: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Staff => {
    const now = new Date();
    const newStaff: Staff = {
      ...staffMember,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const newStaffList = [...staff, newStaff];
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    return newStaff;
  }, [staff]);

  const updateStaff = useCallback((id: string, staffUpdate: Partial<Staff>): Staff | null => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return null;

    const updatedStaff = {
      ...staff[staffIndex],
      ...staffUpdate,
      updatedAt: new Date()
    };

    const newStaffList = [...staff];
    newStaffList[staffIndex] = updatedStaff;
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    return updatedStaff;
  }, [staff]);

  const getStaff = useCallback((id: string): Staff | null => {
    return staff.find(s => s.id === id) || null;
  }, [staff]);

  const getAllStaff = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Staff> => {
    return getPaginatedData(staff, params);
  }, [staff]);

  const deleteStaff = useCallback((id: string): boolean => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return false;

    const newStaffList = staff.filter(s => s.id !== id);
    setStaff(newStaffList);
    saveTo
