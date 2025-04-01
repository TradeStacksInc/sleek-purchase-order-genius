
import React, { createContext, useContext, useState } from 'react';
import { LogEntry, PurchaseOrder, Supplier, Driver, Truck, DeliveryDetails, GPSData, OffloadingDetails, Incident, AIInsight } from '../types';
import { appData } from '../data/mockData';
import { AppContextType } from './appContextTypes';
import { initialDrivers, initialTrucks } from './initialState';
import { usePurchaseOrderActions } from './purchaseOrderActions';
import { useLogActions } from './logActions';
import { useSupplierActions } from './supplierActions';
import { useDriverTruckActions } from './driverTruckActions';
import { useDeliveryActions } from './deliveryActions';
import { useAIActions } from './aiActions';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(appData.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(appData.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(appData.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [gpsData, setGPSData] = useState<GPSData[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);

  // Initialize action hooks
  const purchaseOrderActions = usePurchaseOrderActions(purchaseOrders, setPurchaseOrders, logs, setLogs);
  const logActions = useLogActions(logs, setLogs);
  const supplierActions = useSupplierActions(suppliers, setSuppliers, setLogs);
  const driverTruckActions = useDriverTruckActions(
    drivers, setDrivers, trucks, setTrucks, 
    purchaseOrders, setPurchaseOrders, setLogs, 
    gpsData, setGPSData
  );
  const deliveryActions = useDeliveryActions(
    purchaseOrders, setPurchaseOrders, 
    drivers, setDrivers, 
    trucks, setTrucks, 
    setLogs
  );
  const aiActions = useAIActions(
    purchaseOrders, aiInsights, setAIInsights, 
    driverTruckActions.getDriverById, driverTruckActions.getTruckById
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
