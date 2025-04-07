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
  Price, 
  Incident, 
  ActivityLog, 
  Tank,
  OrderStatus,
  ProductType,
  DeliveryDetails,
  OffloadingDetails
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
import { AppContextType } from './appContextTypes';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [prices, setPrices] = useState<Price[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [company, setCompany] = useState(defaultCompany);

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

  const addPurchaseOrder = useCallback(async (order: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const now = new Date();
    const newOrder: PurchaseOrder = {
      ...order,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(toSupabaseFormat.purchaseOrder(newOrder))
        .select()
        .single();
        
      if (error) throw error;
      
      const savedOrder = fromSupabaseFormat.purchaseOrder(data);
      setPurchaseOrders(prev => [...prev, savedOrder]);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, savedOrder]);
      return savedOrder;
    } catch (error) {
      console.error('Error saving purchase order to Supabase:', error);
      
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
      const { error } = await supabase
        .from('purchase_orders')
        .update(toSupabaseFormat.purchaseOrder(updatedOrder))
        .eq('id', id);
        
      if (error) throw error;
      
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating purchase order in Supabase:', error);
      
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return updatedOrder;
    }
  }, [purchaseOrders]);

  const getPurchaseOrderById = useCallback((id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(order => order.id === id);
  }, [purchaseOrders]);
  
  const getOrderById = useCallback((id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(order => order.id === id);
  }, [purchaseOrders]);

  const getAllPurchaseOrders = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<PurchaseOrder> => {
    return getPaginatedData(purchaseOrders, params);
  }, [purchaseOrders]);

  const deletePurchaseOrder = useCallback((id: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;

    try {
      supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        });
      
      const newOrders = purchaseOrders.filter(order => order.id !== id);
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return true;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      
      const newOrders = purchaseOrders.filter(order => order.id !== id);
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      return true;
    }
  }, [purchaseOrders]);

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

  const getLogsByOrderId = useCallback((orderId: string): LogEntry[] => {
    return logs.filter(log => log.poId === orderId);
  }, [logs]);
  
  const getLogById = useCallback((id: string): LogEntry | undefined => {
    return logs.find(log => log.id === id);
  }, [logs]);
  
  const deleteLog = useCallback((id: string): boolean => {
    const logIndex = logs.findIndex(log => log.id === id);
    if (logIndex === -1) return false;

    const newLogs = logs.filter(log => log.id !== id);
    setLogs(newLogs);
    saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
    return true;
  }, [logs]);

  const getAllLogs = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<LogEntry> => {
    return getPaginatedData(logs, params);
  }, [logs]);

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

  const getSupplierById = useCallback((id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
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

  const addDriver = useCallback((driver: Omit<Driver, 'id'>): Driver => {
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

  const getDriverById = useCallback((id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
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

  const addTruck = useCallback((truck: Omit<Truck, 'id'>): Truck => {
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

  const getTruckById = useCallback((id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
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

  const tagTruckWithGPS = useCallback((truckId: string, gpsDeviceId: string, latitude?: number, longitude?: number): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return false;

    const updatedTruck = {
      ...trucks[truckIndex],
      isGPSTagged: true,
      gpsDeviceId,
      lastLatitude: latitude || trucks[truckIndex].lastLatitude,
      lastLongitude: longitude || trucks[truckIndex].lastLongitude,
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
  
  const updateGPSData = useCallback((truckId: string, latitude: number, longitude: number, speed: number): void => {
    const newGPSData: GPSData = {
      id: uuidv4(),
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date(),
      heading: 0,
      location: "Unknown",
      fuelLevel: 100
    };
    
    setGpsData(prev => [...prev, newGPSData]);
    
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex !== -1) {
      const updatedTruck = {
        ...trucks[truckIndex],
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastSpeed: speed,
        updatedAt: new Date()
      };
      
      const newTrucks = [...trucks];
      newTrucks[truckIndex] = updatedTruck;
      setTrucks(newTrucks);
    }
  }, [gpsData, trucks]);

  const addAIInsight = useCallback((insight: Omit<AIInsight, 'id' | 'isRead'>): AIInsight => {
    const newInsight: AIInsight = {
      ...insight,
      id: uuidv4(),
      isRead: false,
      generatedAt: new Date()
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
  
  const getInsightsByType = useCallback((type: string): AIInsight[] => {
    return aiInsights.filter(insight => insight.type === type);
  }, [aiInsights]);
  
  const generateAIInsights = useCallback((data: any): AIInsight => {
    const newInsight: AIInsight = {
      id: uuidv4(),
      type: "system_generated",
      description: `AI insight generated based on system data: ${JSON.stringify(data).substring(0, 50)}...`,
      timestamp: new Date(),
      severity: "low",
      isRead: false,
      generatedAt: new Date(),
      relatedEntityIds: []
    };
    
    setAiInsights(prev => [...prev, newInsight]);
    return newInsight;
  }, []);

  const addStaff = useCallback((staffMember: Omit<Staff, 'id'>): Staff => {
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

  const getStaffById = useCallback((id: string): Staff | undefined => {
    return staff.find(s => s.id === id);
  }, [staff]);

  const getAllStaff = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Staff> => {
    return getPaginatedData(staff, params);
  }, [staff]);

  const deleteStaff = useCallback((id: string): boolean => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return false;

    const newStaffList = staff.filter(s => s.id !== id);
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    return true;
  }, [staff]);
  
  const getActiveStaff = useCallback((): Staff[] => {
    return staff.filter(s => s.isActive);
  }, [staff]);

  const addDispenser = useCallback((dispenser: Omit<Dispenser, 'id'>): Dispenser => {
    const newDispenser: Dispenser = {
      ...dispenser,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newDispensers = [...dispensers, newDispenser];
    setDispensers(newDispensers);
    saveToLocalStorage(STORAGE_KEYS.DISPENSERS, newDispensers);
    return newDispenser;
  }, [dispensers]);

  const updateDispenser = useCallback((id: string, dispenserUpdate: Partial<Dispenser>): Dispenser | null => {
    const dispenserIndex = dispensers.findIndex(d => d.id === id);
    if (dispenserIndex === -1) return null;

    const updatedDispenser = {
      ...dispensers[dispenserIndex],
      ...dispenserUpdate,
      updatedAt: new Date()
    };

    const newDispensers = [...dispensers];
    newDispensers[dispenserIndex] = updatedDispenser;
    setDispensers(newDispensers);
    saveToLocalStorage(STORAGE_KEYS.DISPENSERS, newDispensers);
    return updatedDispenser;
  }, [dispensers]);

  const getDispenserById = useCallback((id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  }, [dispensers]);

  const getAllDispensers = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params);
  }, [dispensers]);

  const deleteDispenser = useCallback((id: string): boolean => {
    const dispenserIndex = dispensers.findIndex(d => d.id === id);
    if (dispenserIndex === -1) return false;

    const newDispensers = dispensers.filter(d => d.id !== id);
    setDispensers(newDispensers);
    saveToLocalStorage(STORAGE_KEYS.DISPENSERS, newDispensers);
    return true;
  }, [dispensers]);
  
  const getActiveDispensers = useCallback((): Dispenser[] => {
    return dispensers.filter(d => d.isActive);
  }, [dispensers]);

  const addShift = useCallback((shift: Omit<Shift, 'id'>): Shift => {
    const newShift: Shift = {
      ...shift,
      id: uuidv4()
    };
    
    const newShifts = [...shifts, newShift];
    setShifts(newShifts);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, newShifts);
    return newShift;
  }, [shifts]);

  const updateShift = useCallback((id: string, shiftUpdate: Partial<Shift>): Shift | null => {
    const shiftIndex = shifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return null;

    const updatedShift = {
      ...shifts[shiftIndex],
      ...shiftUpdate
    };

    const newShifts = [...shifts];
    newShifts[shiftIndex] = updatedShift;
    setShifts(newShifts);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, newShifts);
    return updatedShift;
  }, [shifts]);

  const getShiftById = useCallback((id: string): Shift | undefined => {
    return shifts.find(s => s.id === id);
  }, [shifts]);

  const getAllShifts = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Shift> => {
    return getPaginatedData(shifts, params);
  }, [shifts]);

  const deleteShift = useCallback((id: string): boolean => {
    const shiftIndex = shifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return false;

    const newShifts = shifts.filter(s => s.id !== id);
    setShifts(newShifts);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, newShifts);
    return true;
  }, [shifts]);
  
  const getCurrentShift = useCallback((): Shift | null => {
    return shifts.find(s => s.status === 'active') || null;
  }, [shifts]);

  const addSale = useCallback((sale: Omit<Sale, 'id'>): Sale => {
    const newSale: Sale = {
      ...sale,
      id: uuidv4()
    };
    
    const newSales = [...sales, newSale];
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    return newSale;
  }, [sales]);

  const updateSale = useCallback((id: string, saleUpdate: Partial<Sale>): Sale | null => {
    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return null;

    const updatedSale = {
      ...sales[saleIndex],
      ...saleUpdate
    };

    const newSales = [...sales];
    newSales[saleIndex] = updatedSale;
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    return updatedSale;
  }, [sales]);

  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales.find(s => s.id === id);
  }, [sales]);

  const getAllSales = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Sale> => {
    return getPaginatedData(sales, params);
  }, [sales]);

  const deleteSale = useCallback((id: string): boolean => {
    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return false;

    const newSales = sales.filter(s => s.id !== id);
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    return true;
  }, [sales]);

  // Add missing functions required by AppContextType
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus): Promise<boolean> => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;
    
    await updatePurchaseOrder(id, { status });
    return true;
  }, [purchaseOrders, updatePurchaseOrder]);
  
  const getOrdersWithDeliveryStatus = useCallback((status: string): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.deliveryDetails && order.deliveryDetails.status === status
    );
  }, [purchaseOrders]);
  
  const getOrdersWithDiscrepancies = useCallback((): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.offloadingDetails && order.offloadingDetails.isDiscrepancyFlagged
    );
  }, [purchaseOrders]);
  
  const logAIInteraction = useCallback((prompt: string, response: string): void => {
    const newLog: ActivityLog = {
      id: `log-${uuidv4()}`,
      entityType: 'ai',
      entityId: 'chat',
      action: 'interaction',
      details: `AI chat interaction`,
      user: 'Current User',
      timestamp: new Date(),
      metadata: { prompt, response }
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);
  
  const getSalesForShift = useCallback((shiftId: string): Sale[] => {
    return sales.filter(sale => sale.shiftId === shiftId);
  }, [sales]);
  
  const addPrice = useCallback((price: Omit<Price, 'id'>): Price => {
    const newPrice: Price = {
      ...price,
      id: uuidv4()
    };
    
    setPrices(prev => [...prev, newPrice]);
    saveToLocalStorage(STORAGE_KEYS.PRICES, [...prices, newPrice]);
    return newPrice;
  }, [prices]);
  
  const updatePrice = useCallback((id: string, priceUpdate: Partial<Price>): Price | null => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) return null;
    
    const updatedPrice = {
      ...prices[priceIndex],
      ...priceUpdate
    };
    
    const newPrices = [...prices];
    newPrices[priceIndex] = updatedPrice;
    setPrices(newPrices);
    saveToLocalStorage(STORAGE_KEYS.PRICES, newPrices);
    return updatedPrice;
  }, [prices]);
  
  const deletePrice = useCallback((id: string): boolean => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) return false;
    
    const newPrices = prices.filter(p => p.id !== id);
    setPrices(newPrices);
    saveToLocalStorage(STORAGE_KEYS.PRICES, newPrices);
    return true;
  }, [prices]);
  
  const getPriceById = useCallback((id: string): Price | undefined => {
    return prices.find(p => p.id === id);
  }, [prices]);
  
  const getAllPrices = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Price> => {
    return getPaginatedData(prices, params);
  }, [prices]);
  
  const getCurrentPrices = useCallback((): Record<ProductType, number> => {
    const currentPrices: Partial<Record<ProductType, number>> = {};
    
    prices.forEach(price => {
      if (price.isActive) {
        currentPrices[price.productType as ProductType] = price.price;
      }
    });
    
    return currentPrices as Record<ProductType, number>;
  }, [prices]);
  
  // Incident functions
  const addIncident = useCallback((incident: Omit<Incident, 'id'>): Incident => {
    const newIncident: Incident = {
      ...incident,
      id: uuidv4()
    };
    
    setIncidents(prev => [...prev, newIncident]);
    saveToLocalStorage(STORAGE_KEYS.INCIDENTS, [...incidents, newIncident]);
    return newIncident;
  }, [incidents]);
  
  const updateIncident = useCallback((id: string, incidentUpdate: Partial<Incident>): Incident | null => {
    const incidentIndex = incidents.findIndex(i => i.id === id);
    if (incidentIndex === -1) return null;
    
    const updatedIncident = {
      ...incidents[incidentIndex],
      ...incidentUpdate
    };
    
    const newIncidents = [...incidents];
