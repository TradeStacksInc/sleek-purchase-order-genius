
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LogEntry, PurchaseOrder, Supplier, Driver, Truck, DeliveryDetails, GPSData, Incident, AIInsight } from '../types';
import { AppContextType } from './appContextTypes';
import { defaultInitialState } from './initialState';
import { usePurchaseOrderActions } from './purchaseOrderActions';
import { useLogActions } from './logActions';
import { useSupplierActions } from './supplierActions';
import { useDriverTruckActions } from './driverTruckActions';
import { useDeliveryActions } from './deliveryActions';
import { useAIActions } from './aiActions';
import { loadAppState, saveToLocalStorage, STORAGE_KEYS } from '../utils/localStorage';
import { useToast } from '@/hooks/use-toast';

// Create the context with an undefined initial value
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Load data from local storage or use default initial state
  const loadedState = loadAppState(defaultInitialState);
  
  // Initialize state with loaded data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(loadedState.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(loadedState.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadedState.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(loadedState.drivers);
  const [trucks, setTrucks] = useState<Truck[]>(loadedState.trucks);
  const [gpsData, setGPSData] = useState<GPSData[]>(loadedState.gpsData);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(loadedState.aiInsights);

  // Log state load completion
  useEffect(() => {
    console.log('AppContext initialized with data:', {
      purchaseOrders: purchaseOrders.length,
      logs: logs.length,
      suppliers: suppliers.length,
      drivers: drivers.length,
      trucks: trucks.length,
      gpsData: gpsData.length,
      aiInsights: aiInsights.length
    });
  }, []);

  // Setup persistent state handlers with silent error handling
  const persistentSetPurchaseOrders: typeof setPurchaseOrders = (value) => {
    setPurchaseOrders((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      
      if (!Array.isArray(newValue)) {
        console.error('Cannot save purchase orders: value is not an array');
        return prev;
      }
      
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newValue);
      return newValue;
    });
  };

  const persistentSetLogs: typeof setLogs = (value) => {
    setLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
        saveToLocalStorage(STORAGE_KEYS.LOGS, newValue);
      }
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

  // Initialize action hooks with persistent state handlers
  const purchaseOrderActions = usePurchaseOrderActions(
    purchaseOrders, 
    persistentSetPurchaseOrders, 
    logs, 
    persistentSetLogs
  );
  
  const logActions = useLogActions(logs, persistentSetLogs);
  
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

  // Combine all actions and state into the context value
  const contextValue: AppContextType = {
    purchaseOrders,
    logs,
    suppliers,
    drivers,
    trucks,
    gpsData,
    aiInsights,
    ...purchaseOrderActions,
    ...logActions,
    ...supplierActions,
    ...driverTruckActions,
    ...deliveryActions,
    ...aiActions
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
