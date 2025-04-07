
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

  // Implement missing functions
  const getOrdersWithDeliveryStatus = (status: string): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.deliveryDetails?.status === status
    );
  };

  const getOrdersWithDiscrepancies = (): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.offloadingDetails?.isDiscrepancyFlagged === true
    );
  };

  const logAIInteraction = (prompt: string, response: string): void => {
    const newLog = {
      id: `log-${uuidv4()}`,
      type: 'ai_interaction',
      timestamp: new Date(),
      details: { prompt, response }
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const getNonGPSTrucks = (): Truck[] => {
    return trucks.filter(truck => !truck.isGPSTagged);
  };

  const tagTruckWithGPS = (truckId: string, deviceId: string, initialLatitude: number, initialLongitude: number): boolean => {
    try {
      const truck = trucks.find(t => t.id === truckId);
      if (!truck) return false;

      setTrucks(prev => prev.map(t => 
        t.id === truckId 
          ? { 
              ...t, 
              isGPSTagged: true, 
              hasGPS: true,
              gpsDeviceId: deviceId,
              lastLatitude: initialLatitude,
              lastLongitude: initialLongitude
            } 
          : t
      ));

      // Add initial GPS data
      recordGPSData(truckId, initialLatitude, initialLongitude);
      return true;
    } catch (error) {
      console.error("Error tagging truck with GPS:", error);
      return false;
    }
  };

  const untagTruckGPS = (truckId: string): boolean => {
    try {
      setTrucks(prev => prev.map(t => 
        t.id === truckId 
          ? { 
              ...t, 
              isGPSTagged: false,
              gpsDeviceId: undefined
            } 
          : t
      ));
      return true;
    } catch (error) {
      console.error("Error untagging truck GPS:", error);
      return false;
    }
  };

  const recordGPSData = (truckId: string, latitude: number, longitude: number): GPSData => {
    const newGPSData: GPSData = {
      id: `gps-${uuidv4()}`,
      truckId,
      latitude,
      longitude,
      timestamp: new Date(),
      location: `${latitude},${longitude}`,
      speed: Math.floor(Math.random() * 80) + 20, // Random speed between 20-100 km/h
      fuelLevel: Math.floor(Math.random() * 100) + 1, // Random fuel level 1-100%
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Update truck's last known position
    setTrucks(prev => prev.map(truck =>
      truck.id === truckId 
        ? { 
            ...truck, 
            lastLatitude: latitude,
            lastLongitude: longitude,
            lastSpeed: newGPSData.speed
          }
        : truck
    ));
    
    return newGPSData;
  };

  const getGPSDataForTruck = (truckId: string, params?: PaginationParams): PaginatedResult<GPSData> => {
    const truckGPSData = gpsData.filter(data => data.truckId === truckId);
    return getPaginatedData(truckGPSData, params);
  };

  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number): void => {
    const newGPSData: GPSData = {
      id: `gps-${uuidv4()}`,
      truckId,
      latitude,
      longitude,
      timestamp: new Date(),
      location: `${latitude},${longitude}`,
      speed,
      fuelLevel: Math.floor(Math.random() * 100) + 1, // Random fuel level 1-100%
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Update truck's last known position
    setTrucks(prev => prev.map(truck =>
      truck.id === truckId 
        ? { 
            ...truck, 
            lastLatitude: latitude,
            lastLongitude: longitude,
            lastSpeed: speed
          }
        : truck
    ));

    // Update delivery progress for any active deliveries with this truck
    setPurchaseOrders(prev => prev.map(order => {
      if (order.deliveryDetails?.truckId === truckId && order.deliveryDetails?.status === 'in_transit') {
        const totalDistance = order.deliveryDetails.totalDistance || 100;
        const currentDistance = order.deliveryDetails.distanceCovered || 0;
        
        // Simulate progress based on speed (faster trucks make more progress)
        const progressIncrement = Math.min((speed / 100) * 5, 10); // 0-10% progress based on speed
        const newDistance = Math.min(currentDistance + progressIncrement, totalDistance);
        
        return {
          ...order,
          deliveryDetails: {
            ...order.deliveryDetails,
            distanceCovered: newDistance
          }
        };
      }
      return order;
    }));
  };

  const updateDeliveryDetails = (orderId: string, driverId: string, truckId: string, deliveryDate: Date): boolean => {
    try {
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            deliveryDetails: {
              ...order.deliveryDetails,
              driverId,
              truckId,
              status: 'pending',
            },
            deliveryDate
          };
        }
        return order;
      }));
      return true;
    } catch (error) {
      console.error("Error updating delivery details:", error);
      return false;
    }
  };

  const markOrderAsDelivered = (orderId: string): boolean => {
    try {
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            deliveryDetails: {
              ...order.deliveryDetails,
              status: 'delivered',
              destinationArrivalTime: new Date()
            },
            status: 'delivered'
          };
        }
        return order;
      }));
      return true;
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      return false;
    }
  };

  const startDelivery = (orderId: string): boolean => {
    try {
      const order = purchaseOrders.find(o => o.id === orderId);
      if (!order?.deliveryDetails?.truckId) return false;
      
      // Update purchase order
      setPurchaseOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            deliveryDetails: {
              ...o.deliveryDetails,
              status: 'in_transit',
              depotDepartureTime: new Date(),
              distanceCovered: 0,
              totalDistance: o.deliveryDetails?.totalDistance || Math.floor(Math.random() * 100) + 50, // 50-150 km
              expectedArrivalTime: new Date(Date.now() + 3600000 + Math.random() * 7200000) // 1-3 hours from now
            }
          };
        }
        return o;
      }));
      
      return true;
    } catch (error) {
      console.error("Error starting delivery:", error);
      return false;
    }
  };

  const completeDelivery = (orderId: string): boolean => {
    try {
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const totalDistance = order.deliveryDetails?.totalDistance || 100;
          return {
            ...order,
            deliveryDetails: {
              ...order.deliveryDetails,
              status: 'delivered',
              destinationArrivalTime: new Date(),
              distanceCovered: totalDistance // Complete the journey
            }
          };
        }
        return order;
      }));
      
      return true;
    } catch (error) {
      console.error("Error completing delivery:", error);
      return false;
    }
  };

  const updateDeliveryStatus = (orderId: string, updates: Partial<DeliveryDetails> | string): boolean => {
    try {
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          if (typeof updates === 'string') {
            return {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                status: updates as 'pending' | 'in_transit' | 'delivered'
              }
            };
          } else {
            return {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                ...updates
              }
            };
          }
        }
        return order;
      }));
      return true;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      return false;
    }
  };

  const recordOffloadingDetails = (orderId: string, details: any): boolean => {
    try {
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          // Calculate discrepancy percentage
          const loadedVolume = details.loadedVolume || 0;
          const deliveredVolume = details.deliveredVolume || 0;
          const discrepancy = loadedVolume > 0 ? Math.abs((loadedVolume - deliveredVolume) / loadedVolume * 100) : 0;
          const isDiscrepancyFlagged = discrepancy > 2; // Flag if more than 2% difference
          
          return {
            ...order,
            offloadingDetails: {
              ...details,
              discrepancyPercentage: discrepancy,
              isDiscrepancyFlagged
            }
          };
        }
        return order;
      }));
      return true;
    } catch (error) {
      console.error("Error recording offloading details:", error);
      return false;
    }
  };

  const recordOffloadingToTank = (tankId: string, volume: number, source: string, sourceId: string): boolean => {
    try {
      // Update tank volume
      setTanks(prev => prev.map(tank => {
        if (tank.id === tankId) {
          const currentVolume = tank.currentVolume || 0;
          return {
            ...tank,
            currentVolume: currentVolume + volume,
            lastRefillDate: new Date()
          };
        }
        return tank;
      }));
      
      // Log the activity
      const tank = tanks.find(t => t.id === tankId);
      const activityLog: ActivityLog = {
        id: `activity-${uuidv4()}`,
        entityType: 'tank',
        entityId: tankId,
        action: 'refill',
        details: `Tank ${tank?.name} refilled with ${volume.toLocaleString()} liters from ${source} (ID: ${sourceId})`,
        user: 'System',
        timestamp: new Date()
      };
      setActivityLogs(prev => [activityLog, ...prev]);
      
      return true;
    } catch (error) {
      console.error("Error recording offloading to tank:", error);
      return false;
    }
  };

  const assignDriverToOrder = (orderId: string, driverId: string, truckId: string): boolean => {
    try {
      // Check if driver and truck exist
      const driver = drivers.find(d => d.id === driverId);
      const truck = trucks.find(t => t.id === truckId);
      
      if (!driver || !truck) {
        toast({
          title: "Error",
          description: "Driver or truck not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update purchase order
      setPurchaseOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            deliveryDetails: {
              ...order.deliveryDetails,
              driverId,
              truckId,
              status: 'pending'
            }
          };
        }
        return order;
      }));
      
      return true;
    } catch (error) {
      console.error("Error assigning driver to order:", error);
      return false;
    }
  };

  const deleteStaff = (id: string): boolean => {
    try {
      const staffExists = staff.some(s => s.id === id);
      if (!staffExists) return false;
      
      setStaff(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting staff:", error);
      return false;
    }
  };

  const addDispenser = (dispenserData: Omit<Dispenser, 'id'>): Dispenser => {
    const newDispenser: Dispenser = {
      ...dispenserData,
      id: `dispenser-${uuidv4()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      totalSales: 0,
      totalVolume: 0,
      totalVolumeSold: 0,
      currentShiftSales: 0,
      currentShiftVolume: 0
    };
    
    setDispensers(prev => [...prev, newDispenser]);
    return newDispenser;
  };

  const deleteDispenser = (id: string): boolean => {
    const exists = dispensers.some(d => d.id === id);
    if (!exists) return false;
    
    setDispensers(prev => prev.filter(d => d.id !== id));
    return true;
  };

  const getDispenserById = (id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  };

  const getAllDispensers = (params?: PaginationParams): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params);
  };

  const setDispenserActive = (id: string, isActive: boolean): Dispenser | undefined => {
    let updatedDispenser: Dispenser | undefined;
    
    setDispensers(prev => prev.map(d => {
      if (d.id === id) {
        updatedDispenser = { ...d, isActive };
        return updatedDispenser;
      }
      return d;
    }));
    
    return updatedDispenser;
  };

  const getDispenserSalesStats = (id: string, dateRange?: { start: Date, end: Date }): { volume: number, amount: number, transactions: number } => {
    const dispenserSales = sales.filter(sale => {
      const matchesDispenser = sale.dispenserId === id;
      if (!dateRange) return matchesDispenser;
      
      const saleDate = new Date(sale.timestamp);
      return matchesDispenser && 
        saleDate >= dateRange.start && 
        saleDate <= dateRange.end;
    });
    
    return {
      volume: dispenserSales.reduce((sum, sale) => sum + sale.volume, 0),
      amount: dispenserSales.reduce((sum, sale) => sum + sale.amount, 0),
      transactions: dispenserSales.length
    };
  };

  const recordDispensing = (id: string, volume: number, staffId: string, shiftId: string): boolean => {
    try {
      const dispenser = dispensers.find(d => d.id === id);
      if (!dispenser) return false;
      
      const unitPrice = dispenser.unitPrice || 0;
      const amount = unitPrice * volume;
      
      // Update dispenser totals
      setDispensers(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            totalVolumeSold: (d.totalVolumeSold || 0) + volume,
            totalSales: (d.totalSales || 0) + amount,
            currentShiftVolume: (d.currentShiftVolume || 0) + volume,
            currentShiftSales: (d.currentShiftSales || 0) + amount,
            lastActivity: new Date()
          };
        }
        return d;
      }));
      
      // Record sale
      const newSale: Sale = {
        id: `sale-${uuidv4()}`,
        dispenserId: id,
        staffId,
        shiftId,
        volume,
        amount,
        unitPrice,
        timestamp: new Date(),
        productType: dispenser.productType || 'unknown',
        isManualEntry: false,
        totalAmount: amount,
        paymentMethod: 'cash', // Default payment method
        dispenserNumber: dispenser.number || 'unknown'
      };
      
      setSales(prev => [newSale, ...prev]);
      return true;
    } catch (error) {
      console.error("Error recording dispensing:", error);
      return false;
    }
  };

  const addShift = (shiftData: Omit<Shift, 'id'>): Shift => {
    const newShift: Shift = {
      ...shiftData,
      id: `shift-${uuidv4()}`,
      salesAmount: 0,
      salesVolume: 0,
      status: 'active'
    };
    
    setShifts(prev => [...prev, newShift]);
    return newShift;
  };

  const updateShift = (id: string, updates: Partial<Shift>): boolean => {
    let updated = false;
    
    setShifts(prev => {
      const newShifts = prev.map(shift => {
        if (shift.id === id) {
          updated = true;
          return { ...shift, ...updates };
        }
        return shift;
      });
      return newShifts;
    });
    
    return updated;
  };

  const deleteShift = (id: string): boolean => {
    let deleted = false;
    
    setShifts(prev => {
      const filtered = prev.filter(shift => {
        if (shift.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      return filtered;
    });
    
    return deleted;
  };

  const getShiftById = (id: string): Shift | null => {
    return shifts.find(shift => shift.id === id) || null;
  };

  const getAllShifts = (params?: PaginationParams): PaginatedResult<Shift> => {
    return getPaginatedData(shifts, params);
  };

  const getShiftsByStaffId = (staffId: string): Shift[] => {
    return shifts.filter(shift => shift.staffId === staffId);
  };

  const getCurrentStaffShift = (staffId: string): Shift | null => {
    return shifts.find(shift => shift.staffId === staffId && !shift.endTime) || null;
  };

  const addSale = (saleData: Omit<Sale, 'id'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${uuidv4()}`,
      timestamp: new Date()
    };
    
    setSales(prev => [...prev, newSale]);
    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>): boolean => {
    let updated = false;
    
    setSales(prev => {
      const newSales = prev.map(sale => {
        if (sale.id === id) {
          updated = true;
          return { ...sale, ...updates };
        }
        return sale;
      });
      return newSales;
    });
    
    return updated;
  };

  const deleteSale = (id: string): boolean => {
    let deleted = false;
    
    setSales(prev => {
      const filtered = prev.filter(sale => {
        if (sale.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      return filtered;
    });
    
    return deleted;
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };

  const getAllSales = (params?: PaginationParams): PaginatedResult<Sale> => {
    return getPaginatedData(sales, params);
  };

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

  const resetDatabase = async (includeSeedData?: boolean): Promise<void> => {
    try {
      // Call the Supabase function to reset the database
      const { error } = await supabase.rpc('reset_database');
      if (error) throw error;
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error("Error resetting database:", error);
      toast({
        title: "Error",
        description: "Failed to reset the database. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const exportDatabase = (): string => {
    try {
      const data = {
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
        tanks
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error exporting database:", error);
      toast({
        title: "Error",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
      return '{}';
    }
  };
  
  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
      if (data.logs) setLogs(data.logs);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.drivers) setDrivers(data.drivers);
      if (data.trucks) setTrucks(data.trucks);
      if (data.gpsData) setGPSData(data.gpsData);
      if (data.aiInsights) setAIInsights(data.aiInsights);
      if (data.staff) setStaff(data.staff);
      if (data.dispensers) setDispensers(data.dispensers);
      if (data.shifts) setShifts(data.shifts);
      if (data.sales) setSales(data.sales);
      if (data.prices) setPrices(data.prices);
      if (data.incidents) setIncidents(data.incidents);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.tanks) setTanks(data.tanks);
      
      return true;
    } catch (error) {
      console.error("Error importing database:", error);
      toast({
        title: "Error",
        description: "Failed to import database. Please check the JSON format and try again.",
        variant: "destructive",
      });
      return false;
    }
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
    recordOffloadingToTank,
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
