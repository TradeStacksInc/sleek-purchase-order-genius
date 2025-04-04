import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LogEntry, 
  PurchaseOrder, 
  Supplier, 
  Driver, 
  Truck, 
  DeliveryDetails, 
  GPSData, 
  Incident, 
  AIInsight,
  Staff,
  Dispenser,
  Shift,
  Sale,
  PriceRecord,
  ActivityLog,
  Tank
} from '../types';
import { AppContextType } from './appContextTypes';
import { defaultInitialState } from './initialState';
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
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { loadAppState, saveToLocalStorage, STORAGE_KEYS } from '../utils/localStorage';
import { resetDatabase, exportDatabase, importDatabase } from '../utils/databaseManager';
import { useToast } from '@/hooks/use-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const loadedState = loadAppState(defaultInitialState);
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(loadedState.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(loadedState.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadedState.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(loadedState.drivers);
  const [trucks, setTrucks] = useState<Truck[]>(loadedState.trucks);
  const [gpsData, setGPSData] = useState<GPSData[]>(loadedState.gpsData);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(loadedState.aiInsights);
  const [staff, setStaff] = useState<Staff[]>(loadedState.staff || []);
  const [dispensers, setDispensers] = useState<Dispenser[]>(loadedState.dispensers || []);
  const [shifts, setShifts] = useState<Shift[]>(loadedState.shifts || []);
  const [sales, setSales] = useState<Sale[]>(loadedState.sales || []);
  const [prices, setPrices] = useState<PriceRecord[]>(loadedState.prices || []);
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

  const persistentSetPurchaseOrders: typeof setPurchaseOrders = (value) => {
    setPurchaseOrders((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newValue);
      return newValue;
    });
  };

  const persistentSetLogs: typeof setLogs = (value) => {
    setLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      saveToLocalStorage(STORAGE_KEYS.LOGS, newValue);
      return newValue;
    });
  };

  const persistentSetSuppliers: typeof setSuppliers = (value) => {
    setSuppliers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetDrivers: typeof setDrivers = (value) => {
    setDrivers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.DRIVERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetTrucks: typeof setTrucks = (value) => {
    setTrucks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.TRUCKS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetGPSData: typeof setGPSData = (value) => {
    setGPSData((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.GPS_DATA, newValue);
      }
      return newValue;
    });
  };

  const persistentSetAIInsights: typeof setAIInsights = (value) => {
    setAIInsights((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetStaff: typeof setStaff = (value) => {
    setStaff((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.STAFF, newValue);
      }
      return newValue;
    });
  };

  const persistentSetDispensers: typeof setDispensers = (value) => {
    setDispensers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.DISPENSERS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetShifts: typeof setShifts = (value) => {
    setShifts((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SHIFTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetSales: typeof setSales = (value) => {
    setSales((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.SALES, newValue);
      }
      return newValue;
    });
  };

  const persistentSetPrices: typeof setPrices = (value) => {
    setPrices((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.PRICES, newValue);
      }
      return newValue;
    });
  };

  const persistentSetIncidents: typeof setIncidents = (value) => {
    setIncidents((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.INCIDENTS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetActivityLogs: typeof setActivityLogs = (value) => {
    setActivityLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, newValue);
      }
      return newValue;
    });
  };

  const persistentSetTanks: typeof setTanks = (value) => {
    setTanks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.TANKS, newValue);
      }
      return newValue;
    });
  };

  const purchaseOrderActions = usePurchaseOrderActions(
    purchaseOrders, 
    persistentSetPurchaseOrders, 
    logs, 
    persistentSetLogs
  );
  
  const logActions = useLogActions(
    logs, persistentSetLogs,
    activityLogs, persistentSetActivityLogs
  );
  
  const supplierActions = useSupplierActions(
    suppliers, 
    persistentSetSuppliers, 
    persistentSetLogs
  );
  
  const driverTruckActions = useDriverTruckActions(
    drivers, persistentSetDrivers, 
    trucks, persistentSetTrucks, 
    purchaseOrders, persistentSetPurchaseOrders, 
    persistentSetLogs, 
    gpsData, persistentSetGPSData
  );
  
  const deliveryActions = useDeliveryActions(
    purchaseOrders, persistentSetPurchaseOrders,
    drivers, persistentSetDrivers,
    trucks, persistentSetTrucks, 
    persistentSetLogs,
    gpsData, persistentSetGPSData
  );
  
  const aiActions = useAIActions(
    purchaseOrders, 
    aiInsights, persistentSetAIInsights, 
    driverTruckActions.getDriverById, 
    driverTruckActions.getTruckById
  );

  const staffActions = useStaffActions(
    staff, persistentSetStaff,
    persistentSetActivityLogs
  );

  const dispenserActions = useDispenserActions(
    dispensers, persistentSetDispensers,
    persistentSetActivityLogs
  );

  const shiftActions = useShiftActions(
    shifts, persistentSetShifts,
    staff, persistentSetStaff,
    persistentSetActivityLogs
  );

  const saleActions = useSaleActions(
    sales, persistentSetSales,
    shifts, persistentSetShifts,
    dispensers, persistentSetDispensers,
    persistentSetActivityLogs
  );

  const priceActions = usePriceActions(
    prices, persistentSetPrices,
    persistentSetActivityLogs
  );

  const tankActions = useTankActions(
    tanks, persistentSetTanks,
    persistentSetActivityLogs
  );

  const handleResetDatabase = (includeSeedData = false) => {
    resetDatabase(includeSeedData);
    
    window.location.reload();
  };

  const handleExportDatabase = () => {
    return exportDatabase();
  };

  const handleImportDatabase = (jsonData: string) => {
    const success = importDatabase(jsonData);
    
    if (success) {
      window.location.reload();
    }
    
    return success;
  };

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
    ...tankActions,
    resetDatabase: handleResetDatabase,
    exportDatabase: handleExportDatabase,
    importDatabase: handleImportDatabase
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
