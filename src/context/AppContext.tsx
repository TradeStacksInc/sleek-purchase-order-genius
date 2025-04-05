import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, Staff, 
  Dispenser, Shift, Sale, Incident, ActivityLog, Tank, Price, 
  Product, ProductType
} from '../types';
import { useToast } from '@/hooks/use-toast';
import { STORAGE_KEYS, saveToLocalStorage, getPaginatedData } from '@/utils/localStorage';
import { loadAppState, defaultInitialState } from '@/utils/localStorage/appState';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';

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
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(loadedState.aiInsights);
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

  const getDispenserSalesStats = (id: string, dateRange?: { from: Date, to: Date }) => {
    // Default implementation
    return {
      volume: 0,
      amount: 0,
      transactions: 0
    };
  };

  // Combine all actions and state into the context value
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
    // Add the missing dispenser functions
    addDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    setDispenserActive,
    recordDispensing,
    getDispenserSalesStats,
    // Add database management functions
    resetDatabase,
    exportDatabase,
    importDatabase
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Export the context for direct usage if needed
export default AppContext;
