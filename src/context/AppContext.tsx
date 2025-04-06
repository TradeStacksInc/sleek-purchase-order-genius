import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, Staff, 
  Dispenser, Shift, Sale, Incident, ActivityLog, Tank, Price, 
  Product, ProductType, DeliveryDetails
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { STORAGE_KEYS, saveToLocalStorage, getPaginatedData } from '@/utils/localStorage';
import { loadAppState } from '@/utils/localStorage/appState';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { defaultInitialState } from '@/context/initialState';

// Import all the action hooks
import { usePurchaseOrderActions } from './purchaseOrderActions';
import { useLogActions } from './logActions';
import { useSupplierActions } from './supplierActions';
import { useDriverTruckActions } from './driverTruckActions';
import { useDeliveryActions } from './deliveryActions';
import { useAIActions } from './aiActions';
import { useStaffActions } from './staffActions';
import { useDispenserActions } from './dispenserActions';
import { useShiftActions } from './shiftActions';
import { useSaleActions } from './saleActions';
import { usePriceActions } from './priceActions';
import { useTankActions } from './tankActions';
import { AppContextType } from './appContextTypes';

// Create the app context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the useApp hook for consuming the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const loadedState = loadAppState(defaultInitialState);
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(loadedState.purchaseOrders);
  const [logs, setLogs] = useState<any[]>(loadedState.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadedState.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(loadedState.drivers);
  const [trucks, setTrucks] = useState<Truck[]>(loadedState.trucks);
  const [gpsData, setGPSData] = useState<GPSData[]>(loadedState.gpsData);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(loadedState.aiInsights || []);
  const [staff, setStaff] = useState<Staff[]>(loadedState.staff || []);
  const [dispensers, setDispensers] = useState<Dispenser[]>(loadedState.dispensers || []);
  const [shifts, setShifts] = useState<Shift[]>(loadedState.shifts || []);
  const [sales, setSales] = useState<Sale[]>(loadedState.sales || []);
  const [prices, setPrices] = useState<Price[]>(loadedState.prices || []);
  const [incidents, setIncidents] = useState<Incident[]>(loadedState.incidents || []);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(loadedState.activityLogs || []);
  const [tanks, setTanks] = useState<Tank[]>(loadedState.tanks || []);

  useEffect(() => {
    console.log('AppContext initialized with data:', {
      purchaseOrders: purchaseOrders.length,
      logs: logs.length,
      suppliers: suppliers.length,
      drivers: drivers.length,
      trucks: trucks.length,
      gpsData: gpsData.length,
      aiInsights: aiInsights.length,
      staff: staff.length,
      dispensers: dispensers.length,
      shifts: shifts.length,
      sales: sales.length,
      prices: prices.length,
      incidents: incidents.length,
      activityLogs: activityLogs.length,
      tanks: tanks.length
    });
  }, []);

  // State persistence helper functions
  const persistentSetPurchaseOrders = (value: React.SetStateAction<PurchaseOrder[]>) => {
    setPurchaseOrders((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newValue);
      return newValue;
    });
  };

  const persistentSetLogs = (value: React.SetStateAction<any[]>) => {
    setLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      saveToLocalStorage(STORAGE_KEYS.LOGS, newValue);
      return newValue;
    });
  };

  const persistentSetSuppliers = (value: React.SetStateAction<Supplier[]>) => {
    setSuppliers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetDrivers = (value: React.SetStateAction<Driver[]>) => {
    setDrivers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.DRIVERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetTrucks = (value: React.SetStateAction<Truck[]>) => {
    setTrucks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.TRUCKS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetGPSData = (value: React.SetStateAction<GPSData[]>) => {
    setGPSData((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.GPS_DATA, newValue);
      }
      return newValue;
    });
  };

  const persistentSetAIInsights = (value: React.SetStateAction<AIInsight[]>) => {
    setAIInsights((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetStaff = (value: React.SetStateAction<Staff[]>) => {
    setStaff((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.STAFF, newValue);
      }
      return newValue;
    });
  };

  const persistentSetDispensers: typeof setDispensers = (value: React.SetStateAction<Dispenser[]>) => {
    setDispensers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.DISPENSERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetShifts = (value: React.SetStateAction<Shift[]>) => {
    setShifts((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SHIFTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetSales = (value: React.SetStateAction<Sale[]>) => {
    setSales((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SALES, newValue);
      }
      return newValue;
    });
  };

  const persistentSetPrices = (value: React.SetStateAction<Price[]>) => {
    setPrices((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.PRICES, newValue);
      }
      return newValue;
    });
  };

  const persistentSetIncidents = (value: React.SetStateAction<Incident[]>) => {
    setIncidents((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.INCIDENTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetActivityLogs = (value: React.SetStateAction<ActivityLog[]>) => {
    setActivityLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetTanks = (value: React.SetStateAction<Tank[]>) => {
    setTanks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.TANKS, newValue);
      }
      return newValue;
    });
  };

  // Initialize action hooks
  const purchaseOrderActions = usePurchaseOrderActions(
    purchaseOrders, 
    persistentSetPurchaseOrders, 
    logs, 
    persistentSetLogs
  );
  
  const logActions = useLogActions(
    logs, persistentSetLogs,
    activityLogs, setActivityLogs
  );
  
  const supplierActions = useSupplierActions(
    suppliers, 
    persistentSetSuppliers, 
    persistentSetLogs
  );
  
  const driverTruckActions = useDriverTruckActions(
    drivers, setDrivers, 
    trucks, setTrucks, 
    purchaseOrders, persistentSetPurchaseOrders, 
    persistentSetLogs, 
    gpsData, setGPSData
  );
  
  const deliveryActions = useDeliveryActions(
    purchaseOrders, persistentSetPurchaseOrders,
    drivers, setDrivers,
    trucks, setTrucks, 
    persistentSetLogs,
    gpsData, setGPSData,
    setActivityLogs
  );
  
  const aiActions = useAIActions(
    purchaseOrders, 
    aiInsights, setAIInsights, 
    driverTruckActions.getDriverById, 
    driverTruckActions.getTruckById
  );

  const staffActions = useStaffActions(
    staff, setStaff,
    setActivityLogs
  );

  const priceActions = usePriceActions(
    prices, setPrices,
    setActivityLogs
  );

  const dispenserActions = useDispenserActions(
    dispensers, setDispensers,
    setActivityLogs,
    setSales
  );

  const shiftActions = useShiftActions(
    shifts, setShifts,
    staff, setStaff,
    setActivityLogs
  );

  const saleActions = useSaleActions(
    sales, setSales,
    shifts, setShifts,
    dispensers, setDispensers,
    setActivityLogs
  );

  const tankActionsMethods = useTankActions(
    tanks, setTanks, 
    setActivityLogs,
    dispensers, setDispensers
  );

  // Database management functions
  const resetDatabase = (includeSeedData: boolean = true) => {
    // Implementation would go here
  };

  const exportDatabase = () => {
    // Implementation would go here
    return JSON.stringify({});
  };

  const importDatabase = (jsonData: string) => {
    // Implementation would go here
    return true;
  };

  // Create the dispenser actions that were missing
  const addDispenser = (dispenser: Omit<Dispenser, 'id'>): Dispenser => {
    const newDispenser = {
      ...dispenser,
      id: `dispenser-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDispensers(prev => [...prev, newDispenser]);
    return newDispenser;
  };

  const deleteDispenser = (id: string): boolean => {
    let deleted = false;
    setDispensers(prev => {
      const filtered = prev.filter(d => d.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };

  const getDispenserById = (id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  };

  const getAllDispensers = (params?: PaginationParams): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params || { page: 1, limit: 10 });
  };

  const setDispenserActive = (id: string, isActive: boolean): Dispenser | undefined => {
    return dispenserActions.updateDispenser?.(id, { isActive }) || undefined;
  };

  const recordDispensing = (id: string, volume: number, staffId: string, shiftId: string): boolean => {
    const dispenser = dispensers.find(d => d.id === id);
    if (!dispenser) return false;
    
    const amount = volume * (dispenser.unitPrice || 0);
    return dispenserActions.recordManualSale?.(id, volume, amount, staffId, shiftId, 'cash') || false;
  };

  const getDispenserSalesStats = (id: string, dateRange?: { start: Date, end: Date }) => {
    return {
      volume: 0,
      amount: 0,
      transactions: 0
    };
  };

  const getOrderById = (id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(po => po.id === id);
  };

  const getOrdersWithDeliveryStatus = (status: string): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.deliveryDetails && order.deliveryDetails.status === status
    );
  };

  const startDelivery = (orderId: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) return false;

    updatedOrder.deliveryDetails.status = 'in_transit';
    updatedOrder.deliveryDetails.depotDepartureTime = new Date();

    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });

    return true;
  };

  const completeDelivery = (orderId: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) return false;

    updatedOrder.deliveryDetails.status = 'delivered';
    updatedOrder.deliveryDetails.destinationArrivalTime = new Date();

    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });

    return true;
  };

  const addIncident = (incident: Omit<Incident, 'id'>): Incident => {
    const newIncident = {
      ...incident,
      id: `incident-${uuidv4().substring(0, 8)}`,
      timestamp: new Date()
    };
    
    setIncidents(prev => [...prev, newIncident]);
    return newIncident;
  };

  const recordOffloadingDetails = (orderId: string, details: any): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const updatedOrder = { ...purchaseOrders[orderIndex] };
    updatedOrder.offloadingDetails = details;

    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });

    return true;
  };

  const recordOffloadingToTank = (tankId: string, volume: number, source: string, sourceId: string): boolean => {
    const tankIndex = tanks.findIndex(tank => tank.id === tankId);
    if (tankIndex === -1) return false;

    const updatedTank = { ...tanks[tankIndex] };
    const currentVolume = updatedTank.currentVolume || 0;
    updatedTank.currentVolume = currentVolume + volume;
    updatedTank.lastRefillDate = new Date();

    persistentSetTanks(prev => {
      const newTanks = [...prev];
      newTanks[tankIndex] = updatedTank;
      return newTanks;
    });

    return true;
  };

  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number): void => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return;

    const updatedTruck = { ...trucks[truckIndex] };
    updatedTruck.lastLatitude = latitude;
    updatedTruck.lastLongitude = longitude;
    updatedTruck.lastSpeed = speed;

    persistentSetTrucks(prev => {
      const newTrucks = [...prev];
      newTrucks[truckIndex] = updatedTruck;
      return newTrucks;
    });

    const newGPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date(),
      fuelLevel: Math.random() * 100,
      location: 'On route'
    };
    
    persistentSetGPSData(prev => [...prev, newGPSData]);
  };

  const getOrdersWithDiscrepancies = (): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.offloadingDetails && 
      order.offloadingDetails.isDiscrepancyFlagged
    );
  };

  const assignDriverToOrder = (orderId: string, driverId: string, truckId: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const driver = drivers.find(d => d.id === driverId);
    const truck = trucks.find(t => t.id === truckId);
    if (!driver || !truck) return false;

    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) {
      updatedOrder.deliveryDetails = {
        status: 'pending',
        driverId,
        truckId
      };
    } else {
      updatedOrder.deliveryDetails.driverId = driverId;
      updatedOrder.deliveryDetails.truckId = truckId;
    }

    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });

    persistentSetDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, isAvailable: false } : d))
    );

    persistentSetTrucks(prev =>
      prev.map(t => (t.id === truckId ? { ...t, isAvailable: false, driverId } : t))
    );

    return true;
  };

  const tagTruckWithGPS = (
    truckId: string,
    deviceId: string,
    initialLatitude: number,
    initialLongitude: number
  ): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return false;

    const updatedTruck = { ...trucks[truckIndex] };
    updatedTruck.isGPSTagged = true;
    updatedTruck.gpsDeviceId = deviceId;
    updatedTruck.lastLatitude = initialLatitude;
    updatedTruck.lastLongitude = initialLongitude;

    persistentSetTrucks(prev => {
      const newTrucks = [...prev];
      newTrucks[truckIndex] = updatedTruck;
      return newTrucks;
    });

    return true;
  };

  const untagTruckGPS = (truckId: string): boolean => {
    const truckIndex = trucks.findIndex(truck => truck.id === truckId);
    if (truckIndex === -1) return false;

    const updatedTruck = { ...trucks[truckIndex] };
    updatedTruck.isGPSTagged = false;
    updatedTruck.gpsDeviceId = undefined;

    persistentSetTrucks(prev => {
      const newTrucks = [...prev];
      newTrucks[truckIndex] = updatedTruck;
      return newTrucks;
    });

    return true;
  };

  const getNonGPSTrucks = (): Truck[] => {
    return trucks.filter(truck => !truck.hasGPS || !truck.isGPSTagged);
  };

  const logAIInteraction = (prompt: string, response: string): void => {
    const truncatedPrompt = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
    const log = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action: "ai_interaction",
      user: "AI System",
      entityType: "ai_chat",
      details: `AI Interaction - User asked: "${truncatedPrompt}" and received a response`
    };
    
    persistentSetLogs(prev => [...prev, log]);
  };

  const recordGPSData = (truckId: string, latitude: number, longitude: number): GPSData => {
    const newGpsData: GPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId,
      latitude,
      longitude,
      timestamp: new Date(),
      speed: Math.random() * 60, // Random speed for simulation
      fuelLevel: Math.random() * 100,
      location: 'In transit'
    };
    
    persistentSetGPSData(prev => [...prev, newGpsData]);
    return newGpsData;
  };
  
  const getGPSDataForTruck = (truckId: string, params?: PaginationParams): PaginatedResult<GPSData> => {
    const truckGPSData = gpsData.filter(item => item.truckId === truckId);
    return getPaginatedData(truckGPSData, params || { page: 1, limit: 10 });
  };
  
  // Add missing delivery methods
  const updateDeliveryDetails = (orderId: string, driverId: string, truckId: string, deliveryDate: Date): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;
    
    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) {
      updatedOrder.deliveryDetails = {
        status: 'pending',
        driverId,
        truckId,
        expectedArrivalTime: deliveryDate
      };
    } else {
      updatedOrder.deliveryDetails.driverId = driverId;
      updatedOrder.deliveryDetails.truckId = truckId;
      updatedOrder.deliveryDetails.expectedArrivalTime = deliveryDate;
    }
    
    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });
    
    return true;
  };
  
  const markOrderAsDelivered = (orderId: string): boolean => {
    return updateDeliveryStatus(orderId, {
      status: 'delivered',
      destinationArrivalTime: new Date()
    });
  };
  
  // Fixed updateDeliveryStatus to accept either status string or partial DeliveryDetails
  const updateDeliveryStatus = (orderId: string, updates: Partial<DeliveryDetails> | string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;
    
    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) {
      // If updates is a string, treat it as status
      if (typeof updates === 'string') {
        updatedOrder.deliveryDetails = {
          status: updates as 'pending' | 'in_transit' | 'delivered'
        };
      } else {
        // Otherwise, it's a partial DeliveryDetails object
        updatedOrder.deliveryDetails = {
          status: updates.status || 'pending',
          ...updates
        };
      }
    } else {
      // If updates is a string, update only status
      if (typeof updates === 'string') {
        updatedOrder.deliveryDetails.status = updates as 'pending' | 'in_transit' | 'delivered';
      } else {
        // Otherwise, merge the updates
        updatedOrder.deliveryDetails = {
          ...updatedOrder.deliveryDetails,
          ...updates
        };
      }
    }
    
    persistentSetPurchaseOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });
    
    return true;
  };
  
  // Create contextValue with all required properties
  const contextValue: AppContextType = {
    purchaseOrders,
    logs,
    suppliers,
    drivers,
    trucks,
    gpsData,
    aiInsights,
    staff,
    dispensers,
    shifts,
    sales,
    prices,
    incidents,
    activityLogs,
    tanks,
    ...purchaseOrderActions,
    ...logActions,
    ...supplierActions,
    ...driverTruckActions,
    ...deliveryActions,
    ...aiActions,
    ...staffActions,
    ...dispenserActions,
    ...shiftActions,
    ...saleActions,
    ...priceActions,
    ...tankActionsMethods,
    addDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    setDispenserActive,
    recordDispensing,
    getDispenserSalesStats,
    resetDatabase,
    exportDatabase,
    importDatabase,
    generateAIInsights: aiActions.generateAIInsights,
    getInsightsByType: aiActions.getInsightsByType,
    getOrderById,
    getOrdersWithDeliveryStatus,
    startDelivery,
    completeDelivery,
    updateDeliveryStatus,
    addIncident,
    recordOffloadingDetails,
    recordOffloadingToTank,
    updateGPSData,
    getOrdersWithDiscrepancies,
    assignDriverToOrder,
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks,
    logAIInteraction,
    recordGPSData,
    getGPSDataForTruck,
    updateDeliveryDetails,
    markOrderAsDelivered,
    deleteStaff,
    addShift,
    updateShift,
    deleteShift,
    getShiftById: shiftActions.getShiftById,
    getAllShifts,
    startShift: shiftActions.startShift,
    endShift: shiftActions.endShift,
    getShiftsByStaffId,
    getCurrentStaffShift
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
