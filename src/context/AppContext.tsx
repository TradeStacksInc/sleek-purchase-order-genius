import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, Staff, 
  Dispenser, Shift, Sale, Incident, ActivityLog, Tank, Price, 
  ProductType, DeliveryDetails, OrderStatus
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { defaultInitialState } from '@/context/initialState';
import { fromSupabaseFormat, toSupabaseFormat } from '@/utils/supabaseAdapters';

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

const getPaginatedData = <T extends {}>(
  collection: T[],
  params: PaginationParams = { page: 1, limit: 10 }
): PaginatedResult<T> => {
  let filteredData = [...collection];
  
  if (params.filter) {
    filteredData = filteredData.filter(item => {
      return Object.entries(params.filter || {}).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        
        const itemValue = (item as any)[key];
        
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        if (value.start && value.end && itemValue instanceof Date) {
          const start = new Date(value.start);
          const end = new Date(value.end);
          return itemValue >= start && itemValue <= end;
        }
        
        return itemValue === value;
      });
    });
  }
  
  if (params.sort) {
    filteredData.sort((a, b) => {
      const aValue = (a as any)[params.sort?.field || ''];
      const bValue = (b as any)[params.sort?.field || ''];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return params.sort?.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return params.sort?.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return params.sort?.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));
  const currentPage = Math.min(Math.max(1, params.page), totalPages);
  const startIndex = (currentPage - 1) * params.limit;
  const endIndex = Math.min(startIndex + params.limit, totalCount);
  
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    totalCount,
    totalPages,
    currentPage
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [gpsData, setGPSData] = useState<GPSData[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      try {
        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .select('*');
          
        if (poError) throw poError;
        setPurchaseOrders(poData.map(po => fromSupabaseFormat.purchaseOrder(po)));
        
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('*');
          
        if (supplierError) throw supplierError;
        setSuppliers(supplierData.map(supplier => fromSupabaseFormat.supplier(supplier)));
        
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*');
          
        if (driverError) throw driverError;
        setDrivers(driverData.map(driver => fromSupabaseFormat.driver(driver)));
        
        const { data: truckData, error: truckError } = await supabase
          .from('trucks')
          .select('*');
          
        if (truckError) throw truckError;
        setTrucks(truckData.map(truck => fromSupabaseFormat.truck(truck)));
        
        const { data: tankData, error: tankError } = await supabase
          .from('tanks')
          .select('*');
          
        if (tankError) throw tankError;
        setTanks(tankData.map(tank => fromSupabaseFormat.tank(tank)));
        
        const { data: incidentData, error: incidentError } = await supabase
          .from('incidents')
          .select('*');
          
        if (incidentError) throw incidentError;
        setIncidents(incidentData.map(incident => fromSupabaseFormat.incident(incident)));
        
        console.log('Initial data loaded from Supabase');
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        toast({
          title: 'Data Loading Error',
          description: 'Failed to load data from the database.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [toast]);

  const persistentSetPurchaseOrders = (value: React.SetStateAction<PurchaseOrder[]>) => {
    setPurchaseOrders((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      return newValue;
    });
  };

  const persistentSetLogs = (value: React.SetStateAction<any[]>) => {
    setLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      return newValue;
    });
  };

  const persistentSetSuppliers = (value: React.SetStateAction<Supplier[]>) => {
    setSuppliers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetDrivers = (value: React.SetStateAction<Driver[]>) => {
    setDrivers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetTrucks = (value: React.SetStateAction<Truck[]>) => {
    setTrucks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetGPSData = (value: React.SetStateAction<GPSData[]>) => {
    setGPSData((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetAIInsights = (value: React.SetStateAction<AIInsight[]>) => {
    setAIInsights((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetStaff = (value: React.SetStateAction<Staff[]>) => {
    setStaff((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetDispensers: typeof setDispensers = (value: React.SetStateAction<Dispenser[]>) => {
    setDispensers((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetShifts = (value: React.SetStateAction<Shift[]>) => {
    setShifts((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetSales = (value: React.SetStateAction<Sale[]>) => {
    setSales((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetPrices = (value: React.SetStateAction<Price[]>) => {
    setPrices((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetIncidents = (value: React.SetStateAction<Incident[]>) => {
    setIncidents((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetActivityLogs = (value: React.SetStateAction<ActivityLog[]>) => {
    setActivityLogs((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const persistentSetTanks = (value: React.SetStateAction<Tank[]>) => {
    setTanks((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      if (Array.isArray(newValue)) {
      }
      return newValue;
    });
  };

  const setTankActive = (tankId: string, isActive: boolean): boolean => {
    try {
      const tank = tanks.find(t => t.id === tankId);
      
      if (!tank) {
        toast({
          title: "Error",
          description: "Tank not found.",
          variant: "destructive",
        });
        return false;
      }
      
      const result = tankActionsMethods.updateTank(tankId, { isActive });
      return true;
    } catch (error) {
      console.error("Error setting tank active state:", error);
      toast({
        title: "Error",
        description: "Failed to update tank state. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDispenser = (id: string, updates: Partial<Dispenser>): boolean => {
    const result = dispenserActions.updateDispenser?.(id, updates);
    return result !== undefined;
  };

  const addIncident = (incidentData: Omit<Incident, 'id'>): Incident => {
    try {
      const tempId = `temp-incident-${uuidv4()}`;
      const newIncident: Incident = {
        ...incidentData,
        id: tempId
      };
      
      setIncidents(prev => [newIncident, ...prev]);
      
      (async () => {
        try {
          const dbIncident = toSupabaseFormat.incident(incidentData);
          const { data, error } = await supabase
            .from('incidents')
            .insert(dbIncident)
            .select()
            .single();
            
          if (error) throw error;
          
          const finalIncident = fromSupabaseFormat.incident(data);
          setIncidents(prev => prev.map(inc => 
            inc.id === tempId ? finalIncident : inc
          ));
        } catch (err) {
          console.error("Error in background save:", err);
          setIncidents(prev => prev.filter(inc => inc.id !== tempId));
          toast({
            title: "Error",
            description: "Failed to save incident to database.",
            variant: "destructive",
          });
        }
      })();
      
      return newIncident;
    } catch (error) {
      console.error("Error adding incident:", error);
      throw error;
    }
  };

  const purchaseOrderActions = usePurchaseOrderActions(
    purchaseOrders, 
    setPurchaseOrders, 
    logs, 
    setLogs
  );
  
  const logActions = useLogActions(
    logs, setLogs,
    activityLogs, setActivityLogs
  );
  
  const supplierActions = useSupplierActions(
    suppliers, 
    setSuppliers, 
    setLogs
  );
  
  const driverTruckActions = useDriverTruckActions(
    drivers, setDrivers, 
    trucks, setTrucks, 
    purchaseOrders, setPurchaseOrders, 
    setLogs, 
    gpsData, setGPSData
  );
  
  const deliveryActions = useDeliveryActions(
    purchaseOrders, setPurchaseOrders,
    drivers, setDrivers,
    trucks, setTrucks, 
    setLogs,
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

  const updateOrderStatusWrapper = (orderId: string, status: OrderStatus): boolean => {
    return purchaseOrderActions.updateOrderStatus(orderId, status, `Status updated to ${status}`);
  };

  const getLogsByOrderIdWrapper = (orderId: string, params?: PaginationParams): PaginatedResult<any> => {
    const orderLogs = logActions.getLogsByOrderId(orderId);
    
    return {
      data: orderLogs,
      totalCount: orderLogs.length,
      totalPages: 1,
      currentPage: 1
    };
  };

  const generateAIInsightsWrapper = (data: any): AIInsight => {
    aiActions.generateAIInsights(data);
    return {
      id: `insight-${uuidv4()}`,
      type: 'generated',
      description: 'AI Insights generated',
      severity: 'low',
      relatedEntityIds: [],
      generatedAt: new Date(),
      isRead: false
    };
  };

  const endShiftWrapper = (shiftId: string): boolean => {
    const result = shiftActions.endShift(shiftId);
    return result !== undefined;
  };

  const addPriceWrapper = (priceData: Omit<Price, 'id' | 'effectiveDate'>): Price => {
    return priceActions.setPriceRecord(priceData);
  };

  const updatePriceWrapper = (id: string, updates: Partial<Price>): Price => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) {
      throw new Error(`Price with ID ${id} not found`);
    }
    
    const currentPrice = prices[priceIndex];
    
    const updatedPrice: Price = {
      ...currentPrice,
      ...updates
    };
    
    setPrices(prev => {
      const newPrices = [...prev];
      newPrices[priceIndex] = updatedPrice;
      return newPrices;
    });
    
    return updatedPrice;
  };

  const deletePriceWrapper = (id: string): boolean => {
    let deleted = false;
    setPrices(prev => {
      const filtered = prev.filter(p => p.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };

  const getPriceByIdWrapper = (id: string): Price | null => {
    return prices.find(p => p.id === id) || null;
  };

  const getAllPricesWrapper = (productType: string, params?: PaginationParams): PaginatedResult<Price> => {
    const filteredPrices = productType 
      ? prices.filter(p => p.productType === productType)
      : prices;
    
    return getPaginatedData(filteredPrices, params || { page: 1, limit: 10 });
  };

  const getTankByProductTypeWrapper = (productType: ProductType): Tank | null => {
    return tanks.find(t => t.productType === productType && t.isActive) || null;
  };

  const getActiveDispensersByTankIdWrapper = (tankId: string): Dispenser[] => {
    return dispensers.filter(d => d.tankId === tankId || d.connectedTankId === tankId);
  };

  const getActiveTanksByProductTypeWrapper = (productType: ProductType): Tank[] => {
    return tanks.filter(t => t.productType === productType && t.isActive);
  };

  const updateTankWrapper = (id: string, updates: Partial<Tank>): boolean => {
    try {
      tankActionsMethods.updateTank(id, updates);
      return true;
    } catch (error) {
      console.error("Error updating tank:", error);
      return false;
    }
  };

  const deleteTankWrapper = (id: string): boolean => {
    try {
      tankActionsMethods.deleteTank(id);
      return true;
    } catch (error) {
      console.error("Error deleting tank:", error);
      return false;
    }
  };

  const getAllTanksWrapper = (params?: PaginationParams): PaginatedResult<Tank> => {
    const allTanks = tankActionsMethods.getAllTanks();
    return getPaginatedData(allTanks, params || { page: 1, limit: 10 });
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
    
    addPurchaseOrder: purchaseOrderActions.addPurchaseOrder,
    updatePurchaseOrder: purchaseOrderActions.updatePurchaseOrder,
    deletePurchaseOrder: purchaseOrderActions.deletePurchaseOrder,
    getPurchaseOrderById: purchaseOrderActions.getPurchaseOrderById,
    getAllPurchaseOrders: purchaseOrderActions.getAllPurchaseOrders,
    updateOrderStatus: updateOrderStatusWrapper,
    getOrderById: purchaseOrderActions.getPurchaseOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    
    addLog: logActions.addLog,
    deleteLog: logActions.deleteLog,
    getLogById: logActions.getLogById,
    getAllLogs: logActions.getAllLogs,
    getLogsByOrderId: getLogsByOrderIdWrapper,
    logAIInteraction,
    
    addSupplier: supplierActions.addSupplier,
    updateSupplier: supplierActions.updateSupplier,
    deleteSupplier: supplierActions.deleteSupplier,
    getSupplierById: supplierActions.getSupplierById,
    getAllSuppliers: supplierActions.getAllSuppliers,
    
    addDriver: driverTruckActions.addDriver,
    updateDriver: driverTruckActions.updateDriver,
    deleteDriver: driverTruckActions.deleteDriver, 
    getDriverById: driverTruckActions.getDriverById,
    getAllDrivers: driverTruckActions.getAllDrivers,
    addTruck: driverTruckActions.addTruck,
    updateTruck: driverTruckActions.updateTruck,
    deleteTruck: driverTruckActions.deleteTruck,
    getTruckById: driverTruckActions.getTruckById,
    getAllTrucks: driverTruckActions.getAllTrucks,
    getNonGPSTrucks,
    tagTruckWithGPS,
    untagTruckGPS,
    
    recordGPSData,
    getGPSDataForTruck,
    updateGPSData,
    
    updateDeliveryDetails,
    markOrderAsDelivered,
    startDelivery,
    completeDelivery,
    updateDeliveryStatus,
    recordOffloadingDetails,
    recordOffloadingToTank: handleTankOffloading,
    assignDriverToOrder,
    
    generateAIInsights: generateAIInsightsWrapper,
    getInsightsByType: aiActions.getInsightsByType,
    
    addStaff: staffActions.addStaff,
    updateStaff: staffActions.updateStaff,
    deleteStaff,
    getStaffById: staffActions.getStaffById,
    getAllStaff: staffActions.getAllStaff,
    
    addDispenser,
    updateDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    setDispenserActive,
    recordManualSale: dispenserActions.recordManualSale,
    getDispenserSalesStats,
    recordDispensing,
    
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getAllShifts,
    startShift: shiftActions.startShift,
    endShift: endShiftWrapper,
    getShiftsByStaffId,
    getCurrentStaffShift,
    
    addSale,
    updateSale,
    deleteSale,
    getSaleById,
    getAllSales,
    
    addPrice: addPriceWrapper,
    updatePrice: updatePriceWrapper,
    deletePrice: deletePriceWrapper,
    getPriceById: getPriceByIdWrapper,
    getAllPrices: getAllPricesWrapper,
    
    getTankByProductType: getTankByProductTypeWrapper,
    getActiveDispensersByTankId: getActiveDispensersByTankIdWrapper,
    getActiveTanksByProductType: getActiveTanksByProductTypeWrapper,
    addTank: tankActionsMethods.addTank,
    updateTank: updateTankWrapper,
    deleteTank: deleteTankWrapper,
    getAllTanks: getAllTanksWrapper,
    connectTankToDispenser: tankActionsMethods.connectTankToDispenser,
    disconnectTankFromDispenser: tankActionsMethods.disconnectTankFromDispenser,
    setTankActive,
    
    addIncident,
    
    resetDatabase,
    exportDatabase,
    importDatabase,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
