
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, Staff, 
  Dispenser, Shift, Sale, Incident, ActivityLog, Tank, Price, 
  Product, ProductType, DeliveryDetails
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
  
  // State initialization
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

  // Load data from Supabase on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      try {
        // Fetch purchase orders
        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .select('*');
          
        if (poError) throw poError;
        setPurchaseOrders(poData.map(po => fromSupabaseFormat.purchaseOrder(po)));
        
        // Fetch suppliers
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('*');
          
        if (supplierError) throw supplierError;
        setSuppliers(supplierData.map(supplier => fromSupabaseFormat.supplier(supplier)));
        
        // Fetch drivers
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*');
          
        if (driverError) throw driverError;
        setDrivers(driverData.map(driver => fromSupabaseFormat.driver(driver)));
        
        // Fetch trucks
        const { data: truckData, error: truckError } = await supabase
          .from('trucks')
          .select('*');
          
        if (truckError) throw truckError;
        setTrucks(truckData.map(truck => fromSupabaseFormat.truck(truck)));
        
        // Fetch tanks
        const { data: tankData, error: tankError } = await supabase
          .from('tanks')
          .select('*');
          
        if (tankError) throw tankError;
        setTanks(tankData.map(tank => fromSupabaseFormat.tank(tank)));
        
        // Fetch incidents
        const { data: incidentData, error: incidentError } = await supabase
          .from('incidents')
          .select('*');
          
        if (incidentError) throw incidentError;
        setIncidents(incidentData.map(incident => fromSupabaseFormat.incident(incident)));
        
        // Continue with other data fetching (logs, gpsData, etc.)
        // ...
        
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

  // Fix the updateTank and setTankActive functions to return boolean instead of Tank
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
      
      // Return boolean from the updateTank method
      return !!tankActionsMethods.updateTank(tankId, { isActive });
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

  // Use Supabase for all database operations
  const addIncident = async (incident: Omit<Incident, 'id'>): Promise<Incident> => {
    try {
      const dbIncident = toSupabaseFormat.incident(incident);
      
      const { data, error } = await supabase
        .from('incidents')
        .insert(dbIncident)
        .select()
        .single();
        
      if (error) throw error;
      
      const newIncident = fromSupabaseFormat.incident(data);
      
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (error) {
      console.error("Error adding incident:", error);
      toast({
        title: "Error",
        description: "Failed to add incident. Please try again.",
        variant: "destructive",
      });
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

  // Helper function to get paginated data
  const getPaginatedData = <T>(
    collection: T[],
    params: PaginationParams
  ): PaginatedResult<T> => {
    let filteredData = [...collection];
    
    // Apply filters if provided
    if (params.filter) {
      filteredData = filteredData.filter(item => {
        return Object.entries(params.filter || {}).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          
          const itemValue = (item as any)[key];
          
          // Handle different filter types
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          
          // Date range filtering
          if (value.start && value.end && itemValue instanceof Date) {
            const start = new Date(value.start);
            const end = new Date(value.end);
            return itemValue >= start && itemValue <= end;
          }
          
          // Exact match
          return itemValue === value;
        });
      });
    }
    
    // Apply sorting if provided
    if (params.sort) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[params.sort?.field || ''];
        const bValue = (b as any)[params.sort?.field || ''];
        
        // Handle different value types
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
    
    // Calculate pagination values
    const totalCount = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));
    const currentPage = Math.min(Math.max(1, params.page), totalPages);
    const startIndex = (currentPage - 1) * params.limit;
    const endIndex = Math.min(startIndex + params.limit, totalCount);
    
    // Get the page of data
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      totalCount,
      totalPages,
      currentPage
    };
  };

  // Database management functions
  const resetDatabase = async (includeSeedData: boolean = true) => {
    try {
      // Call the reset_database function in Supabase
      const { error } = await supabase.rpc('reset_database');
      
      if (error) throw error;
      
      // Reset all state variables
      setPurchaseOrders([]);
      setLogs([]);
      setSuppliers([]);
      setDrivers([]);
      setTrucks([]);
      setGPSData([]);
      setAIInsights([]);
      setStaff([]);
      setDispensers([]);
      setShifts([]);
      setSales([]);
      setPrices([]);
      setIncidents([]);
      setActivityLogs([]);
      setTanks([]);
      
      toast({
        title: 'Database Reset',
        description: 'The database has been reset successfully.'
      });
      
      if (includeSeedData) {
        // Add seed data if requested
        // This would add initial test data to the database
        // Implementation would depend on your specific needs
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset the database.',
        variant: 'destructive'
      });
    }
  };

  const exportDatabase = () => {
    return JSON.stringify({});
  };

  const importDatabase = (jsonData: string) => {
    return true;
  };

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
      speed: Math.random() * 60,
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
  
  const updateDeliveryStatus = (orderId: string, updates: Partial<DeliveryDetails> | string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;
    
    const updatedOrder = { ...purchaseOrders[orderIndex] };
    if (!updatedOrder.deliveryDetails) {
      if (typeof updates === 'string') {
        updatedOrder.deliveryDetails = {
          status: updates as 'pending' | 'in_transit' | 'delivered'
        };
      } else {
        updatedOrder.deliveryDetails = {
          status: updates.status || 'pending',
          ...updates
        };
      }
    } else {
      if (typeof updates === 'string') {
        updatedOrder.deliveryDetails.status = updates as 'pending' | 'in_transit' | 'delivered';
      } else {
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
  
  const getAllShifts = (params?: PaginationParams): PaginatedResult<Shift> => {
    return getPaginatedData(shifts, params || { page: 1, limit: 10 });
  };

  const getShiftsByStaffId = (staffId: string): Shift[] => {
    return shifts.filter(shift => shift.staffId === staffId);
  };

  const getCurrentStaffShift = (staffId: string): Shift | null => {
    return shifts.find(shift => shift.staffId === staffId && !shift.endTime) || null;
  };

  const deleteStaff = (id: string): boolean => {
    let deleted = false;
    setStaff(prev => {
      const filtered = prev.filter(s => s.id !== id);
      deleted = filtered.length < prev.length;
      if (deleted) {
      }
      return filtered;
    });
    return deleted;
  };

  const addShift = (shift: Omit<Shift, 'id'>): Shift => {
    const newShift = {
      ...shift,
      id: `shift-${uuidv4().substring(0, 8)}`,
      startTime: new Date(),
      endTime: null
    };
    
    setShifts(prev => [...prev, newShift]);
    return newShift;
  };

  const updateShift = (id: string, updates: Partial<Shift>): boolean => {
    let updated = false;
    const shiftIndex = shifts.findIndex(shift => shift.id === id);
    if (shiftIndex === -1) return false;

    const updatedShift = { ...shifts[shiftIndex], ...updates };

    setShifts(prev => {
      const newShifts = [...prev];
      newShifts[shiftIndex] = updatedShift;
      updated = true;
      return newShifts;
    });

    return updated;
  };

  const deleteShift = (id: string): boolean => {
    let deleted = false;
    setShifts(prev => {
      const filtered = prev.filter(s => s.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };

  const getShiftById = (id: string): Shift | null => {
    return shifts.find(shift => shift.id === id) || null;
  };

  const addSale = (sale: Omit<Sale, 'id'>): Sale => {
    const newSale = {
      ...sale,
      id: `sale-${uuidv4().substring(0, 8)}`,
      timestamp: new Date()
    };
    
    setSales(prev => [...prev, newSale]);
    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>): boolean => {
    let updated = false;
    const saleIndex = sales.findIndex(sale => sale.id === id);
    if (saleIndex === -1) return false;

    const updatedSale = { ...sales[saleIndex], ...updates };
    
    setSales(prev => {
      const newSales = [...prev];
      newSales[saleIndex] = updatedSale;
      updated = true;
      return newSales;
    });

    return updated;
  };

  const deleteSale = (id: string): boolean => {
    let deleted = false;
    setSales(prev => {
      const filtered = prev.filter(sale => sale.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };
  
  const getAllSales = (params?: PaginationParams): PaginatedResult<Sale> => {
    return getPaginatedData(sales, params || { page: 1, limit: 10 });
  };

  // Create context value
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
    
    // Purchase Order methods
    ...purchaseOrderActions,
    getOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    
    // Log methods
    ...logActions,
    logAIInteraction,
    
    // Supplier methods
    ...supplierActions,
    
    // Driver & Truck methods
    ...driverTruckActions,
    getNonGPSTrucks,
    tagTruckWithGPS,
    untagTruckGPS,
    
    // GPS data methods  
    recordGPSData,
    getGPSDataForTruck,
    updateGPSData,
    
    // Delivery methods
    ...deliveryActions,
    updateDeliveryDetails,
    markOrderAsDelivered,
    startDelivery,
    completeDelivery,
    updateDeliveryStatus,
    recordOffloadingDetails,
    recordOffloadingToTank,
    assignDriverToOrder,
    
    // AI methods
    ...aiActions,
    
    // Staff methods
    ...staffActions,
    deleteStaff,
    
    // Dispenser methods
    addDispenser,
    updateDispenser: dispenserActions.updateDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    setDispenserActive,
    recordManualSale: dispenserActions.recordManualSale,
    getDispenserSalesStats,
    recordDispensing,
    
    // Shift methods
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getAllShifts,
    startShift: shiftActions.startShift,
    endShift: shiftActions.endShift,
    getShiftsByStaffId,
    getCurrentStaffShift,
    
    // Sale methods
    addSale,
    updateSale,
    deleteSale,
    getSaleById,
    getAllSales,
    
    // Price methods
    ...priceActions,
    
    // Tank methods
    ...tankActionsMethods,
    setTankActive,
    
    // Incident methods
    addIncident,
    
    // Database management
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
