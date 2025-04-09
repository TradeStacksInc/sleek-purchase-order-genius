import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/localStorage';
import { useLogActions } from './logActions';
import { usePurchaseOrderActions } from './purchaseOrderActions';
import { useDriverTruckActions } from './driverTruckActions';
import { useDeliveryActions } from './deliveryActions';
import { 
  PurchaseOrder, 
  LogEntry, 
  ActivityLog, 
  Driver, 
  Truck, 
  Supplier,
  GPSData
} from '@/types';

interface AppContextType {
  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => boolean;
  deletePurchaseOrder: (id: string) => boolean;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  getAllPurchaseOrders: (params?: any) => any;
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled', note?: string) => boolean;
  
  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => LogEntry;
  deleteLog: (id: string) => boolean;
  getLogById: (id: string) => LogEntry | undefined;
  getAllLogs: (params?: any) => any;
  getLogsByOrderId: (orderId: string) => LogEntry[];
  
  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => ActivityLog;
  getAllActivityLogs: (params?: any) => any;
  getActivityLogsByEntityType: (entityType: string) => ActivityLog[];
  getActivityLogsByAction: (action: string) => ActivityLog[];
  getRecentActivityLogs: (limit?: number) => ActivityLog[];
  logFraudDetection: (description: string, severity: 'low' | 'medium' | 'high', entityId?: string) => ActivityLog;
  logGpsActivity: (truckId: string, description: string) => ActivityLog;
  logAIInteraction: (prompt: string, response: string) => LogEntry;
  setLogPageVisits: (enabled: boolean) => void;
  
  // Drivers
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => Driver;
  deleteDriver: (id: string) => boolean;
  getDriverById: (id: string) => Driver | undefined;
  getAllDrivers: (params?: any) => any;
  getAvailableDrivers: () => Driver[];
  
  // Trucks
  trucks: Truck[];
  addTruck: (truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>) => Truck;
  updateTruck: (id: string, updates: Partial<Truck>) => Truck;
  deleteTruck: (id: string) => boolean;
  getTruckById: (id: string) => Truck | undefined;
  getAllTrucks: (params?: any) => any;
  getAvailableTrucks: () => Truck[];
  tagTruckWithGPS: (truckId: string | null, gpsDeviceId: string) => boolean;
  untagTruckGPS: (truckId: string) => boolean;
  getNonGPSTrucks: () => Truck[];
  
  // GPS Data
  gpsData: GPSData[];
  getGPSDataForTruck: (truckId: string, limit?: number) => GPSData[];
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => GPSData | null;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => boolean;
  getSupplierById: (id: string) => Supplier | undefined;
  getAllSuppliers: () => Supplier[];
  
  // Delivery Actions
  updateDeliveryStatus: (orderId: string, status: 'pending' | 'in_transit' | 'delivered') => boolean;
  assignDriverToDelivery: (orderId: string, driverId: string) => boolean;
  assignTruckToDelivery: (orderId: string, truckId: string) => boolean;
  recordDepotDeparture: (orderId: string, departureTime: Date) => boolean;
  recordExpectedArrival: (orderId: string, arrivalTime: Date) => boolean;
  recordDestinationArrival: (orderId: string, arrivalTime: Date) => boolean;
  updateTruckLocation: (truckId: string, latitude: number, longitude: number, speed: number) => GPSData | null;
  recordDeliveryDistance: (orderId: string, totalDistance: number, distanceCovered: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useLocalStorage<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, []);
  
  // Logs
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(STORAGE_KEYS.LOGS, []);
  const [activityLogs, setActivityLogs] = useLocalStorage<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  
  // Drivers & Trucks
  const [drivers, setDrivers] = useLocalStorage<Driver[]>(STORAGE_KEYS.DRIVERS, []);
  const [trucks, setTrucks] = useLocalStorage<Truck[]>(STORAGE_KEYS.TRUCKS, []);
  
  // GPS Data
  const [gpsData, setGPSData] = useLocalStorage<GPSData[]>(STORAGE_KEYS.GPS_DATA, []);
  
  // Suppliers
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);

  // Initialize actions
  const { addLog, deleteLog, getLogById, getAllLogs, getLogsByOrderId, addActivityLog, getAllActivityLogs, 
         getActivityLogsByEntityType, getActivityLogsByAction, getRecentActivityLogs, logFraudDetection,
         logGpsActivity, logAIInteraction, setLogPageVisits } = useLogActions(logs, setLogs, activityLogs, setActivityLogs);
  
  const { addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getPurchaseOrderById, 
         getAllPurchaseOrders, updateOrderStatus } = usePurchaseOrderActions(purchaseOrders, setPurchaseOrders, logs, setLogs);
  
  const { addDriver, updateDriver, deleteDriver, getDriverById, getAllDrivers, getAvailableDrivers,
         addTruck, updateTruck, deleteTruck, getTruckById, getAllTrucks, getAvailableTrucks,
         tagTruckWithGPS, untagTruckGPS, getNonGPSTrucks } = useDriverTruckActions(
           drivers, setDrivers, trucks, setTrucks, purchaseOrders, setPurchaseOrders, 
           setLogs, gpsData, setGPSData
         );
  
  const { updateDeliveryStatus, assignDriverToDelivery, assignTruckToDelivery, recordDepotDeparture,
         recordExpectedArrival, recordDestinationArrival, updateTruckLocation, 
         recordDeliveryDistance } = useDeliveryActions(
           purchaseOrders, setPurchaseOrders, drivers, setDrivers, trucks, setTrucks, 
           setLogs, gpsData, setGPSData, setActivityLogs
         );

  // Initialize with page visits disabled
  useEffect(() => {
    // Disable automatic page visit logging
    setLogPageVisits(false);
  }, [setLogPageVisits]);
  
  // Supplier functions
  const addSupplier = (supplier: Omit<Supplier, 'id'>): Supplier => {
    const newSupplier = {
      ...supplier,
      id: `supplier-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };
  
  const updateSupplier = (id: string, updates: Partial<Supplier>): boolean => {
    let updated = false;
    setSuppliers(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      
      const updatedSuppliers = [...prev];
      updatedSuppliers[index] = { ...updatedSuppliers[index], ...updates };
      updated = true;
      return updatedSuppliers;
    });
    return updated;
  };
  
  const deleteSupplier = (id: string): boolean => {
    let deleted = false;
    setSuppliers(prev => {
      const filtered = prev.filter(s => s.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };
  
  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(s => s.id === id);
  };
  
  const getAllSuppliers = (): Supplier[] => {
    return suppliers;
  };
  
  // GPS Data functions
  const getGPSDataForTruck = (truckId: string, limit: number = 10): GPSData[] => {
    return gpsData
      .filter(data => data.truckId === truckId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };
  
  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number): GPSData | null => {
    const truck = getTruckById(truckId);
    if (!truck) return null;
    
    const newGPSData: GPSData = {
      id: `gps-${Math.random().toString(36).substring(2, 9)}`,
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date(),
      fuelLevel: 80, // Default value
      location: 'In transit' // Default value
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Update truck with latest position data
    updateTruck(truckId, {
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastSpeed: speed
    });
    
    return newGPSData;
  };

  const contextValue: AppContextType = {
    // Purchase Orders
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    updateOrderStatus,
    
    // Logs
    logs,
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId,
    
    // Activity Logs
    activityLogs,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs,
    logFraudDetection,
    logGpsActivity,
    logAIInteraction,
    setLogPageVisits,
    
    // Drivers
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    getAllDrivers,
    getAvailableDrivers,
    
    // Trucks
    trucks,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruckById,
    getAllTrucks,
    getAvailableTrucks,
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks,
    
    // GPS Data
    gpsData,
    getGPSDataForTruck,
    updateGPSData,
    
    // Suppliers
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getAllSuppliers,
    
    // Delivery Actions
    updateDeliveryStatus,
    assignDriverToDelivery,
    assignTruckToDelivery,
    recordDepotDeparture,
    recordExpectedArrival,
    recordDestinationArrival,
    updateTruckLocation,
    recordDeliveryDistance
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
