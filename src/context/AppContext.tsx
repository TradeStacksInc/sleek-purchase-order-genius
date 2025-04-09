import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/utils/localStorage';
import { useLogActions } from './logActions';
import { usePurchaseOrderActions } from './purchaseOrderActions';
import { useDriverTruckActions } from './driverTruckActions';
import { useDeliveryActions } from './deliveryActions';
import { useAIActions } from './aiActions';
import { defaultCompany } from '@/data/mockData';
import { 
  PurchaseOrder, 
  LogEntry, 
  ActivityLog, 
  Driver, 
  Truck, 
  Supplier,
  GPSData,
  AIInsight,
  Staff,
  Dispenser,
  Shift,
  Sale,
  Price,
  Incident,
  Tank,
  OrderStatus,
  ProductType
} from '@/types';

const emptyArray = [];

const AppContext = createContext<any>(undefined);

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

  // Add missing state objects
  const [aiInsights, setAIInsights] = useLocalStorage<AIInsight[]>(STORAGE_KEYS.AI_INSIGHTS, []);
  const [staff, setStaff] = useLocalStorage<Staff[]>(STORAGE_KEYS.STAFF, []);
  const [dispensers, setDispensers] = useLocalStorage<Dispenser[]>(STORAGE_KEYS.DISPENSERS, []);
  const [shifts, setShifts] = useLocalStorage<Shift[]>(STORAGE_KEYS.SHIFTS, []);
  const [sales, setSales] = useLocalStorage<Sale[]>(STORAGE_KEYS.SALES, []);
  const [prices, setPrices] = useLocalStorage<Price[]>(STORAGE_KEYS.PRICES, []);
  const [incidents, setIncidents] = useLocalStorage<Incident[]>(STORAGE_KEYS.INCIDENTS, []);
  const [tanks, setTanks] = useLocalStorage<Tank[]>(STORAGE_KEYS.TANKS, []);
  const [company, setCompany] = useLocalStorage('company', defaultCompany);

  // Initialize actions
  const { addLog, deleteLog, getLogById, getAllLogs, getLogsByOrderId, addActivityLog, clearAllActivityLogs, 
         getAllActivityLogs, getActivityLogsByEntityType, getActivityLogsByAction, getRecentActivityLogs, 
         logFraudDetection, logGpsActivity, logAIInteraction, setLogPageVisits } = useLogActions(
          logs, setLogs, activityLogs, setActivityLogs
         );
  
  const { addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getPurchaseOrderById, 
         getAllPurchaseOrders, updateOrderStatus } = usePurchaseOrderActions(
          purchaseOrders, setPurchaseOrders, logs, setLogs
         );
  
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

  // Initialize AI actions
  const { generateAIInsights, getInsightsByType } = useAIActions(
    purchaseOrders, 
    aiInsights, 
    setAIInsights, 
    getDriverById, 
    getTruckById
  );

  // Initialize with page visits disabled
  useEffect(() => {
    // Disable automatic page visit logging
    setLogPageVisits(false);
    
    // Clear existing activity logs on application startup
    clearAllActivityLogs();
  }, [setLogPageVisits, clearAllActivityLogs]);
  
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

  // Add new functions for delivery handling
  const startDelivery = async (orderId: string): Promise<boolean> => {
    try {
      const order = purchaseOrders.find(po => po.id === orderId);
      if (!order) return false;

      // Update order status
      await updateOrderStatus(orderId, 'active' as OrderStatus);
      
      // Update delivery status
      updateDeliveryStatus(orderId, 'in_transit');
      
      // Log the activity
      addActivityLog({
        action: 'start_delivery',
        entityType: 'purchase_order',
        entityId: orderId,
        details: `Delivery started for Purchase Order ${order.poNumber}`,
        user: 'Admin'
      });
      
      return true;
    } catch (err) {
      console.error('Error starting delivery:', err);
      return false;
    }
  };

  const completeDelivery = async (orderId: string): Promise<boolean> => {
    try {
      const order = purchaseOrders.find(po => po.id === orderId);
      if (!order) return false;

      // Update order status
      await updateOrderStatus(orderId, 'fulfilled' as OrderStatus);
      
      // Update delivery status
      updateDeliveryStatus(orderId, 'delivered');
      
      // Log the activity
      addActivityLog({
        action: 'complete_delivery',
        entityType: 'purchase_order',
        entityId: orderId,
        details: `Delivery completed for Purchase Order ${order.poNumber}`,
        user: 'Admin'
      });
      
      return true;
    } catch (err) {
      console.error('Error completing delivery:', err);
      return false;
    }
  };

  // Add mock implementations for missing functions
  const getOrdersWithDeliveryStatus = (status: string): PurchaseOrder[] => {
    return purchaseOrders.filter(po => 
      po.deliveryDetails && po.deliveryDetails.status === status
    );
  };

  const getOrdersWithDiscrepancies = (): PurchaseOrder[] => {
    return purchaseOrders.filter(po => 
      po.offloadingDetails && po.offloadingDetails.isDiscrepancyFlagged
    );
  };

  const recordOffloadingDetails = (orderId: string, details: any): boolean => {
    try {
      const orderIndex = purchaseOrders.findIndex(po => po.id === orderId);
      if (orderIndex === -1) return false;
      
      const updatedOrders = [...purchaseOrders];
      updatedOrders[orderIndex] = {
        ...updatedOrders[orderIndex],
        offloadingDetails: {
          ...details,
          timestamp: new Date()
        }
      };
      
      setPurchaseOrders(updatedOrders);
      
      // Log the offloading
      addLog({
        action: 'offload_recorded',
        entityType: 'purchase_order',
        entityId: orderId,
        details: `Offloaded ${details.deliveredVolume}L of ${details.productType}`,
        poId: orderId,
        user: details.measuredBy
      });
      
      return true;
    } catch (err) {
      console.error('Error recording offloading details:', err);
      return false;
    }
  };

  const recordOffloadingToTank = (tankId: string, volume: number, source: string, sourceId: string): boolean => {
    try {
      const tankIndex = tanks.findIndex(tank => tank.id === tankId);
      if (tankIndex === -1) return false;
      
      const updatedTanks = [...tanks];
      const tank = updatedTanks[tankIndex];
      
      // Add volume to tank
      const currentVolume = tank.currentVolume || 0;
      updatedTanks[tankIndex] = {
        ...tank,
        currentVolume: currentVolume + volume,
        lastRefillDate: new Date()
      };
      
      setTanks(updatedTanks);
      
      // Log the tank refill
      addLog({
        action: 'tank_refill',
        entityType: 'tank',
        entityId: tankId,
        details: `Tank refilled with ${volume}L from ${source} ${sourceId}`,
        user: 'System'
      });
      
      return true;
    } catch (err) {
      console.error('Error recording offloading to tank:', err);
      return false;
    }
  };

  // Mock functions for tanks management
  const getAllTanks = (params?: {page: number, limit: number}) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = tanks.slice(startIndex, endIndex);
    
    return {
      data,
      page,
      pageSize: limit,
      totalItems: tanks.length,
      totalPages: Math.ceil(tanks.length / limit)
    };
  };
  
  const addTank = (tank: Omit<Tank, 'id'>) => {
    const newTank = {
      ...tank,
      id: `tank-${Math.random().toString(36).substring(2, 9)}`,
    };
    
    setTanks(prev => [...prev, newTank]);
    return newTank;
  };
  
  const updateTank = (id: string, updates: Partial<Tank>) => {
    let updated = null;
    
    setTanks(prev => {
      const tankIndex = prev.findIndex(t => t.id === id);
      if (tankIndex === -1) return prev;
      
      const updatedTanks = [...prev];
      updatedTanks[tankIndex] = {
        ...updatedTanks[tankIndex],
        ...updates
      };
      
      updated = updatedTanks[tankIndex];
      return updatedTanks;
    });
    
    return updated;
  };
  
  const getTanksByProduct = (productType: ProductType) => {
    return tanks.filter(tank => tank.productType === productType);
  };
  
  const setTankActive = (id: string, isActive: boolean) => {
    updateTank(id, { isActive });
    return true;
  };
  
  const deleteTank = (id: string) => {
    let deleted = false;
    
    setTanks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    
    return deleted;
  };
  
  // Mock function for adding incidents
  const addIncident = (incident: Omit<Incident, 'id'>) => {
    const newIncident = {
      ...incident,
      id: `incident-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };
    
    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  };
  
  // Add company update function
  const updateCompany = (data: Partial<typeof defaultCompany>) => {
    setCompany(prev => ({...prev, ...data}));
  };

  const contextValue = {
    // Purchase Orders
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    updateOrderStatus,
    getOrderById: getPurchaseOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    
    // Logs
    logs,
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId,
    logAIInteraction,
    clearAllActivityLogs,
    
    // Activity Logs
    activityLogs,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs,
    logFraudDetection,
    logGpsActivity,
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
    
    // AI Insights
    aiInsights,
    generateAIInsights,
    getInsightsByType,
    
    // Delivery Actions
    updateDeliveryStatus,
    assignDriverToDelivery,
    assignTruckToDelivery,
    recordDepotDeparture,
    recordExpectedArrival,
    recordDestinationArrival,
    updateTruckLocation,
    recordDeliveryDistance,
    startDelivery,
    completeDelivery,
    recordOffloadingDetails,
    recordOffloadingToTank,
    
    // Tanks
    tanks,
    getAllTanks,
    addTank,
    updateTank,
    getTanksByProduct,
    setTankActive,
    deleteTank,
    
    // Additional entities
    staff,
    dispensers,
    shifts,
    sales,
    prices,
    incidents,
    addIncident,
    
    // Company
    company,
    updateCompany
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): any => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
