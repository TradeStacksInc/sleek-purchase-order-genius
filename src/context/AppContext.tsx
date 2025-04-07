import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PurchaseOrder, 
  Supplier, 
  LogEntry, 
  Driver, 
  Truck, 
  GPSData, 
  AIInsight, 
  Staff, 
  Dispenser, 
  Shift, 
  Sale, 
  Price, 
  Incident, 
  ActivityLog, 
  Tank,
  OrderStatus,
  ProductType,
  DeliveryDetails,
  OffloadingDetails
} from '../types';
import { 
  saveToLocalStorage, 
  getFromLocalStorage, 
  STORAGE_KEYS,
  PaginationParams, 
  PaginatedResult, 
  getPaginatedData 
} from '../utils/localStorage';
import { defaultCompany } from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { fromSupabaseFormat, toSupabaseFormat } from '@/utils/supabaseAdapters';
import { AppContextType } from './appContextTypes';
import { useLogActions } from './logActions';
import { useDriverTruckActions } from './driverTruckActions';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [gpsData, setGpsData] = useState<GPSData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [company, setCompany] = useState(defaultCompany);
  
  const { 
    addLog, 
    deleteLog, 
    getLogById, 
    getAllLogs, 
    getLogsByOrderId,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs 
  } = useLogActions(logs, setLogs, activityLogs, setActivityLogs);

  const {
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    getAllDrivers,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruckById,
    getAllTrucks,
    tagTruckWithGPS,
    untagTruckGPS
  } = useDriverTruckActions(
    drivers,
    setDrivers,
    trucks,
    setTrucks,
    purchaseOrders,
    setPurchaseOrders,
    setLogs,
    gpsData,
    setGpsData
  );

  const addPurchaseOrder = useCallback(async (order: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const now = new Date();
    const newOrder: PurchaseOrder = {
      ...order,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(toSupabaseFormat.purchaseOrder(newOrder))
        .select()
        .single();
        
      if (error) throw error;
      
      const savedOrder = fromSupabaseFormat.purchaseOrder(data);
      setPurchaseOrders(prev => [...prev, savedOrder]);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, savedOrder]);
      
      addActivityLog({
        action: 'create',
        entityType: 'purchase_order',
        entityId: savedOrder.id,
        details: `Purchase order ${savedOrder.poNumber} created`,
        user: 'Current User'
      });
      
      return savedOrder;
    } catch (error) {
      console.error('Error saving purchase order to Supabase:', error);
      
      setPurchaseOrders(prev => [...prev, newOrder]);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, [...purchaseOrders, newOrder]);
      
      addActivityLog({
        action: 'create',
        entityType: 'purchase_order',
        entityId: newOrder.id,
        details: `Purchase order ${newOrder.poNumber} created (offline)`,
        user: 'Current User'
      });
      
      return newOrder;
    }
  }, [purchaseOrders, addActivityLog]);

  const updatePurchaseOrder = useCallback(async (id: string, orderUpdate: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...purchaseOrders[orderIndex],
      ...orderUpdate,
      updatedAt: new Date()
    };

    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update(toSupabaseFormat.purchaseOrder(updatedOrder))
        .eq('id', id);
        
      if (error) throw error;
      
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      addActivityLog({
        action: 'update',
        entityType: 'purchase_order',
        entityId: id,
        details: `Purchase order ${updatedOrder.poNumber} updated`,
        user: 'Current User'
      });
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating purchase order in Supabase:', error);
      
      const newOrders = [...purchaseOrders];
      newOrders[orderIndex] = updatedOrder;
      setPurchaseOrders(newOrders);
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      addActivityLog({
        action: 'update',
        entityType: 'purchase_order',
        entityId: id,
        details: `Purchase order ${updatedOrder.poNumber} updated (offline)`,
        user: 'Current User'
      });
      
      return updatedOrder;
    }
  }, [purchaseOrders, addActivityLog]);

  const deletePurchaseOrder = useCallback((id: string): boolean => {
    let deleted = false;
    setPurchaseOrders(prev => {
      const filteredOrders = prev.filter(order => order.id !== id);
      deleted = filteredOrders.length < prev.length;
      return filteredOrders;
    });
    return deleted;
  }, []);

  const getPurchaseOrderById = useCallback((id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(order => order.id === id);
  }, [purchaseOrders]);

  const getAllPurchaseOrders = useCallback((params?: PaginationParams): PaginatedResult<PurchaseOrder> => {
    return getPaginatedData(purchaseOrders, params || { page: 1, limit: 10 });
  }, [purchaseOrders]);

  const getOrderById = useCallback((id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(order => order.id === id);
  }, [purchaseOrders]);

  const getOrdersWithDeliveryStatus = useCallback((status: string): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.deliveryDetails && order.deliveryDetails.status === status
    );
  }, [purchaseOrders]);

  const getOrdersWithDiscrepancies = useCallback((): PurchaseOrder[] => {
    return purchaseOrders.filter(order => 
      order.offloadingDetails && order.offloadingDetails.discrepancyPercentage > 0
    );
  }, [purchaseOrders]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus): Promise<boolean> => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;
    
    const oldStatus = purchaseOrders[orderIndex].status;
    await updatePurchaseOrder(id, { status });
    
    addActivityLog({
      action: 'update',
      entityType: 'purchase_order',
      entityId: id,
      details: `Order status changed from ${oldStatus} to ${status} for order ${purchaseOrders[orderIndex].poNumber}`,
      user: 'Current User'
    });
    
    return true;
  }, [purchaseOrders, updatePurchaseOrder, addActivityLog]);

  const getAvailableDrivers = useCallback((): Driver[] => {
    return drivers.filter(driver => driver.isAvailable);
  }, [drivers]);

  const getAvailableTrucks = useCallback((): Truck[] => {
    return trucks.filter(truck => truck.isAvailable);
  }, [trucks]);

  const getNonGPSTrucks = useCallback((): Truck[] => {
    return trucks.filter(truck => !truck.isGPSTagged);
  }, [trucks]);

  const addGPSData = useCallback((data: Omit<GPSData, "id" | "timestamp">): GPSData => {
    const newData: GPSData = {
      ...data,
      id: `gps-${uuidv4().substring(0, 8)}`,
      timestamp: new Date()
    };
    
    setGpsData(prev => [newData, ...prev]);
    return newData;
  }, []);

  const getGPSDataForTruck = useCallback((truckId: string, limit?: number): GPSData[] => {
    let truckData = gpsData.filter(data => data.truckId === truckId);
    
    truckData.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit) {
      truckData = truckData.slice(0, limit);
    }
    
    return truckData;
  }, [gpsData]);

  const getAllGPSData = useCallback((params?: PaginationParams): PaginatedResult<GPSData> => {
    return getPaginatedData(gpsData, params || { page: 1, limit: 10 });
  }, [gpsData]);

  const updateGPSData = useCallback((truckId: string, latitude: number, longitude: number, speed: number): GPSData => {
    updateTruck(truckId, { 
      lastLatitude: latitude, 
      lastLongitude: longitude,
      lastSpeed: speed,
      updatedAt: new Date()
    });
    
    const newGpsData: GPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date(),
      fuelLevel: Math.floor(Math.random() * 40) + 60,
      location: 'En route'
    };
    
    setGpsData(prev => [newGpsData, ...prev]);
    
    return newGpsData;
  }, [updateTruck]);

  const addTank = useCallback((tank: Omit<Tank, 'id'>): Tank => {
    const newTank: Tank = {
      ...tank,
      id: `tank-${uuidv4().substring(0, 8)}`
    };
    
    setTanks(prev => [...prev, newTank]);
    return newTank;
  }, []);

  const updateTank = useCallback((id: string, updates: Partial<Tank>): Tank | null => {
    let updatedTank: Tank | null = null;
    setTanks(prev => {
      const updatedTanks = prev.map(tank => {
        if (tank.id === id) {
          updatedTank = { ...tank, ...updates };
          return updatedTank;
        }
        return tank;
      });
      return updatedTank;
    });
    return updatedTank;
  }, []);

  const deleteTank = useCallback((id: string): boolean => {
    let deleted = false;
    setTanks(prev => {
      const filteredTanks = prev.filter(tank => tank.id !== id);
      deleted = filteredTanks.length < prev.length;
      return filteredTanks;
    });
    return deleted;
  }, []);

  const getTankById = useCallback((id: string): Tank | undefined => {
    return tanks.find(tank => tank.id === id);
  }, [tanks]);

  const getAllTanks = useCallback((params?: PaginationParams): PaginatedResult<Tank> => {
    return getPaginatedData(tanks, params || { page: 1, limit: 10 });
  }, [tanks]);

  const getTanksByProduct = useCallback((productType: ProductType): Tank[] => {
    return tanks.filter(tank => tank.productType === productType);
  }, [tanks]);

  const setTankActive = useCallback((id: string, active: boolean): boolean => {
    const tank = updateTank(id, { isActive: active });
    return tank !== null;
  }, [updateTank]);

  const addIncident = useCallback((incident: Omit<Incident, 'id'>): Incident => {
    const newIncident: Incident = {
      ...incident,
      id: `incident-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      status: 'open'
    };
    
    setIncidents(prev => [...prev, newIncident]);
    return newIncident;
  }, []);

  const updateIncident = useCallback((id: string, updates: Partial<Incident>): Incident | null => {
    let updatedIncident: Incident | null = null;
    setIncidents(prev => {
      const updatedIncidents = prev.map(incident => {
        if (incident.id === id) {
          updatedIncident = { ...incident, ...updates };
          return updatedIncident;
        }
        return incident;
      });
      return updatedIncidents;
    });
    return updatedIncident;
  }, []);

  const deleteIncident = useCallback((id: string): boolean => {
    let deleted = false;
    setIncidents(prev => {
      const filteredIncidents = prev.filter(incident => incident.id !== id);
      deleted = filteredIncidents.length < prev.length;
      return filteredIncidents;
    });
    return deleted;
  }, []);

  const getIncidentById = useCallback((id: string): Incident | undefined => {
    return incidents.find(incident => incident.id === id);
  }, [incidents]);

  const getAllIncidents = useCallback((params?: PaginationParams): PaginatedResult<Incident> => {
    return getPaginatedData(incidents, params || { page: 1, limit: 10 });
  }, [incidents]);

  const completeDelivery = useCallback(async (orderId: string): Promise<boolean> => {
    const orderIndex = purchaseOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = purchaseOrders[orderIndex];
    const deliveryDetails = order.deliveryDetails;
    
    if (!deliveryDetails) return false;
    
    const updatedDeliveryDetails: DeliveryDetails = {
      ...deliveryDetails,
      status: "delivered",
      destinationArrivalTime: new Date()
    };
    
    const updatedOrder = {
      ...order,
      updatedAt: new Date(),
      deliveryDetails: updatedDeliveryDetails
    };
    
    await updatePurchaseOrder(orderId, updatedOrder);
    
    addActivityLog({
      action: 'complete',
      entityType: 'delivery',
      entityId: orderId,
      details: `Delivery for order ${order.poNumber} marked as complete`,
      user: 'Current User'
    });
    
    return true;
  }, [purchaseOrders, updatePurchaseOrder, addActivityLog]);

  const recordOffloadingDetails = useCallback((orderId: string, details: OffloadingDetails): boolean => {
    const orderIndex = purchaseOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = purchaseOrders[orderIndex];
    
    const updatedOrder = {
      ...order,
      updatedAt: new Date(),
      offloadingDetails: details
    };
    
    updatePurchaseOrder(orderId, updatedOrder);
    
    addActivityLog({
      action: 'offload',
      entityType: 'delivery',
      entityId: orderId,
      details: `Product offloaded for order ${order.poNumber}`,
      user: 'Current User'
    });
    
    return true;
  }, [purchaseOrders, updatePurchaseOrder, addActivityLog]);

  const updateDeliveryStatus = useCallback((orderId: string, status: string | Partial<DeliveryDetails>): boolean => {
    const orderIndex = purchaseOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = purchaseOrders[orderIndex];
    const oldStatus = order.deliveryDetails?.status || 'pending';
    
    const updatedDeliveryDetails = typeof status === 'string'
      ? { ...(order.deliveryDetails || {}), status: status as "pending" | "delivered" | "in_transit" }
      : { ...(order.deliveryDetails || {}), ...status };
    
    const updatedOrder = {
      ...order,
      updatedAt: new Date(),
      deliveryDetails: updatedDeliveryDetails as DeliveryDetails
    };
    
    const updatedOrdersList = [...purchaseOrders];
    updatedOrdersList[orderIndex] = updatedOrder;
    setPurchaseOrders(updatedOrdersList);
    saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, updatedOrdersList);
    
    const logEntry = {
      poId: orderId,
      action: 'update_delivery_status',
      details: `Delivery status updated for order ${orderId}`,
      entityType: 'delivery',
      entityId: updatedDeliveryDetails.id || '',
      user: 'Current User'
    };
    
    addLog(logEntry);
    
    addActivityLog({
      action: 'update',
      entityType: 'delivery',
      entityId: orderId,
      details: `Delivery status for order ${order.poNumber} updated`,
      user: 'Current User'
    });
    
    return true;
  }, [purchaseOrders, setPurchaseOrders, addLog, addActivityLog]);

  const assignDriverToOrder = useCallback((orderId: string, driverId: string, truckId: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const driverData = getDriverById(driverId);
    const truckData = getTruckById(truckId);
    
    if (!driverData || !truckData) return false;
    
    const order = purchaseOrders[orderIndex];
    
    const deliveryDetails: DeliveryDetails = {
      ...(order.deliveryDetails || {}),
      driverId,
      truckId,
      driverName: driverData.name,
      vehicleDetails: `${truckData.model} - ${truckData.plateNumber}`,
      status: 'pending'
    };
    
    const updatedOrder = {
      ...order,
      updatedAt: new Date(),
      deliveryDetails
    };
    
    updatePurchaseOrder(orderId, updatedOrder);
    
    updateDriver(driverId, { isAvailable: false });
    updateTruck(truckId, { isAvailable: false, driverId });
    
    addLog({
      poId: orderId,
      action: 'assign_driver',
      details: `Driver ${driverData.name} with truck ${truckData.plateNumber} assigned to order ${orderId}`,
      entityType: 'delivery',
      entityId: '',
      user: 'Current User'
    });
    
    addActivityLog({
      action: 'assign',
      entityType: 'driver',
      entityId: driverId,
      details: `Driver ${driverData.name} assigned to order ${order.poNumber} with truck ${truckData.plateNumber}`,
      user: 'Current User'
    });
    
    return true;
  }, [
    purchaseOrders, 
    updatePurchaseOrder, 
    getDriverById, 
    getTruckById,
    updateDriver,
    updateTruck,
    addLog,
    addActivityLog
  ]);

  const logUserLogin = useCallback((userId: string, username: string): void => {
    addActivityLog({
      action: 'login',
      entityType: 'authentication',
      entityId: userId,
      details: `User ${username} logged in`,
      user: username
    });
  }, [addActivityLog]);

  const logUserLogout = useCallback((userId: string, username: string): void => {
    addActivityLog({
      action: 'logout',
      entityType: 'authentication',
      entityId: userId,
      details: `User ${username} logged out`,
      user: username
    });
  }, [addActivityLog]);

  const addPrice = useCallback((price: Omit<Price, 'id'>): Price => {
    const newPrice: Price = {
      ...price,
      id: uuidv4()
    };
    
    setPrices(prev => [...prev, newPrice]);
    saveToLocalStorage(STORAGE_KEYS.PRICES, [...prices, newPrice]);
    
    addActivityLog({
      action: 'create',
      entityType: 'price',
      entityId: newPrice.id,
      details: `New price set for ${newPrice.productType}: ₦${newPrice.price}`,
      user: 'Current User'
    });
    
    return newPrice;
  }, [prices, addActivityLog]);
  
  const updatePrice = useCallback((id: string, priceUpdate: Partial<Price>): Price | null => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) return null;
    
    const oldPrice = prices[priceIndex];
    const updatedPrice = {
      ...oldPrice,
      ...priceUpdate
    };
    
    const newPrices = [...prices];
    newPrices[priceIndex] = updatedPrice;
    setPrices(newPrices);
    saveToLocalStorage(STORAGE_KEYS.PRICES, newPrices);
    
    if (priceUpdate.price !== undefined && priceUpdate.price !== oldPrice.price) {
      addActivityLog({
        action: 'update',
        entityType: 'price',
        entityId: id,
        details: `Price for ${oldPrice.productType} updated from ₦${oldPrice.price} to ₦${priceUpdate.price}`,
        user: 'Current User'
      });
    }
    
    return updatedPrice;
  }, [prices, addActivityLog]);

  const addStaff = useCallback((staffMember: Omit<Staff, 'id'>): Staff => {
    const now = new Date();
    const newStaff: Staff = {
      ...staffMember,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    const newStaffList = [...staff, newStaff];
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    
    addActivityLog({
      action: 'create',
      entityType: 'staff',
      entityId: newStaff.id,
      details: `New staff member ${newStaff.name} added with role ${newStaff.role}`,
      user: 'Current User'
    });
    
    return newStaff;
  }, [staff, addActivityLog]);
  
  const updateStaff = useCallback((id: string, staffUpdate: Partial<Staff>): Staff | null => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return null;

    const oldStaff = staff[staffIndex];
    const updatedStaff = {
      ...oldStaff,
      ...staffUpdate,
      updatedAt: new Date()
    };

    const newStaffList = [...staff];
    newStaffList[staffIndex] = updatedStaff;
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    
    addActivityLog({
      action: 'update',
      entityType: 'staff',
      entityId: id,
      details: `Staff member ${updatedStaff.name} details updated`,
      user: 'Current User'
    });
    
    return updatedStaff;
  }, [staff, addActivityLog]);

  const deleteStaff = useCallback((id: string): boolean => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return false;
    
    const staffMember = staff[staffIndex];
    
    const newStaffList = staff.filter(s => s.id !== id);
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    
    addActivityLog({
      action: 'delete',
      entityType: 'staff',
      entityId: id,
      details: `Staff member ${staffMember.name} deleted`,
      user: 'Current User'
    });
    
    return true;
  }, [staff, addActivityLog]);

  const recordOffloadingToTank = useCallback((tankId: string, volume: number, source: string, sourceId: string): boolean => {
    const tankIndex = tanks.findIndex(t => t.id === tankId);
    if (tankIndex === -1) return false;
    
    const tank = tanks[tankIndex];
    const updatedTank = {
      ...tank,
      currentVolume: (tank.currentVolume || 0) + volume,
      currentLevel: ((tank.currentVolume || 0) + volume) / tank.capacity * 100,
      lastRefillDate: new Date()
    };
    
    updateTank(tankId, updatedTank);
    
    addActivityLog({
      action: 'refill',
      entityType: 'tank',
      entityId: tankId,
      details: `Tank ${tank.name} refilled with ${volume} liters from ${source} ${sourceId}`,
      user: 'Current User'
    });
    
    return true;
  }, [tanks, updateTank, addActivityLog]);

  const addSale = useCallback((sale: Omit<Sale, 'id'>): Sale => {
    const newSale: Sale = {
      ...sale,
      id: uuidv4()
    };
    
    const newSales = [...sales, newSale];
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    
    addActivityLog({
      action: 'create',
      entityType: 'sale',
      entityId: newSale.id,
      details: `New sale recorded: ${newSale.volume} liters of ${newSale.productType} for ₦${newSale.amount}`,
      user: 'Current User'
    });
    
    return newSale;
  }, [sales, addActivityLog]);

  const logFraudDetection = useCallback((description: string, severity: 'low' | 'medium' | 'high', entityId?: string): void => {
    addActivityLog({
      action: 'detect',
      entityType: 'fraud',
      entityId: entityId || 'system',
      details: `Fraud detection: ${description} (Severity: ${severity})`,
      user: 'System'
    });
    
    addIncident({
      type: 'fraud',
      severity,
      description,
      location: 'System',
      reportedBy: 'Fraud Detection System'
    });
  }, [addActivityLog, addIncident]);

  const logGpsActivity = useCallback((truckId: string, description: string): void => {
    const truck = getTruckById(truckId);
    if (!truck) return;
    
    addActivityLog({
      action: 'track',
      entityType: 'gps',
      entityId: truckId,
      details: `GPS Activity for truck ${truck.plateNumber}: ${description}`,
      user: 'System'
    });
  }, [getTruckById, addActivityLog]);

  const getStaffById = useCallback((id: string): Staff | undefined => {
    return staff.find(s => s.id === id);
  }, [staff]);

  const getAllStaff = useCallback((params?: PaginationParams): PaginatedResult<Staff> => {
    return getPaginatedData(staff, params || { page: 1, limit: 10 });
  }, [staff]);

  const getActiveStaff = useCallback((): Staff[] => {
    return staff.filter(s => s.isActive);
  }, [staff]);

  const addDispenser = useCallback((dispenser: Omit<Dispenser, 'id'>): Dispenser => {
    const newDispenser: Dispenser = {
      ...dispenser,
      id: uuidv4()
    };
    setDispensers(prev => [...prev, newDispenser]);
    return newDispenser;
  }, []);

  const updateDispenser = useCallback((id: string, dispenser: Partial<Dispenser>): Dispenser | null => {
    let updatedDispenser: Dispenser | null = null;
    setDispensers(prev => {
      return prev.map(d => {
        if (d.id === id) {
          updatedDispenser = { ...d, ...dispenser };
          return updatedDispenser;
        }
        return d;
      });
    });
    return updatedDispenser;
  }, []);

  const deleteDispenser = useCallback((id: string): boolean => {
    let deleted = false;
    setDispensers(prev => {
      const filtered = prev.filter(d => d.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  }, []);

  const getDispenserById = useCallback((id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  }, [dispensers]);

  const getAllDispensers = useCallback((params?: PaginationParams): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params || { page: 1, limit: 10 });
  }, [dispensers]);

  const getActiveDispensers = useCallback((): Dispenser[] => {
    return dispensers.filter(d => d.isActive);
  }, [dispensers]);

  const addShift = useCallback((shift: Omit<Shift, 'id'>): Shift => {
    const newShift: Shift = {
      ...shift,
      id: uuidv4()
    };
    setShifts(prev => [...prev, newShift]);
    return newShift;
  }, []);

  const updateShift = useCallback((id: string, shift: Partial<Shift>): Shift | null => {
    let updatedShift: Shift | null = null;
    setShifts(prev => {
      return prev.map(s => {
        if (s.id === id) {
          updatedShift = { ...s, ...shift };
          return updatedShift;
        }
        return s;
      });
    });
    return updatedShift;
  }, []);

  const deleteShift = useCallback((id: string): boolean => {
    let deleted = false;
    setShifts(prev => {
      const filtered = prev.filter(s => s.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  }, []);

  const getShiftById = useCallback((id: string): Shift | undefined => {
    return shifts.find(s => s.id === id);
  }, [shifts]);

  const getAllShifts = useCallback((params?: PaginationParams): PaginatedResult<Shift> => {
    return getPaginatedData(shifts, params || { page: 1, limit: 10 });
  }, [shifts]);

  const getCurrentShift = useCallback((): Shift | undefined => {
    const now = new Date();
    return shifts.find(s => s.status === 'active');
  }, [shifts]);

  const updateSale = useCallback((id: string, sale: Partial<Sale>): Sale | null => {
    let updatedSale: Sale | null = null;
    setSales(prev => {
      return prev.map(s => {
        if (s.id === id) {
          updatedSale = { ...s, ...sale };
          return updatedSale;
        }
        return s;
      });
    });
    return updatedSale;
  }, []);

  const deleteSale = useCallback((id: string): boolean => {
    let deleted = false;
    setSales(prev => {
      const filtered = prev.filter(s => s.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  }, []);

  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales.find(s => s.id === id);
  }, [sales]);

  const getAllSales = useCallback((params?: PaginationParams): PaginatedResult<Sale> => {
    return getPaginatedData(sales, params || { page: 1, limit: 10 });
  }, [sales]);

  const getSalesForShift = useCallback((shiftId: string): Sale[] => {
    return sales.filter(s => s.shiftId === shiftId);
  }, [sales]);

  const deletePrice = useCallback((id: string): boolean => {
    let deleted = false;
    setPrices(prev => {
      const filteredPrices = prev.filter(price => price.id !== id);
      deleted = filteredPrices.length < prev.length;
      return filteredPrices;
    });
    
    if (deleted) {
      saveToLocalStorage(STORAGE_KEYS.PRICES, prices.filter(price => price.id !== id));
      
      addActivityLog({
        action: 'delete',
        entityType: 'price',
        entityId: id,
        details: `Price record deleted`,
        user: 'Current User'
      });
    }
    
    return deleted;
  }, [prices, addActivityLog]);

  const getPriceById = useCallback((id: string): Price | undefined => {
    return prices.find(p => p.id === id);
  }, [prices]);

  const getAllPrices = useCallback((params?: PaginationParams): PaginatedResult<Price> => {
    return getPaginatedData(prices, params || { page: 1, limit: 10 });
  }, [prices]);

  const getCurrentPrices = useCallback((): Record<ProductType, number> => {
    const currentPrices: Partial<Record<ProductType, number>> = {};
    
    prices.forEach(price => {
      if (price.isActive) {
        currentPrices[price.productType] = price.price;
      }
    });
    
    return currentPrices as Record<ProductType, number>;
  }, [prices]);

  const contextValue = {
    purchaseOrders,
    setPurchaseOrders,
    logs,
    setLogs,
    suppliers,
    setSuppliers,
    drivers,
    setDrivers,
    trucks,
    setTrucks,
    gpsData,
    setGpsData,
    aiInsights,
    setAiInsights,
    incidents,
    setIncidents,
    activityLogs,
    setActivityLogs,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs,
    
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    getOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    updateOrderStatus,
    
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    getAllDrivers,
    getAvailableDrivers,
    
    addTruck,
    updateTruck,
    deleteTruck,
    getTruckById,
    getAllTrucks,
    getAvailableTrucks,
    getNonGPSTrucks,
    
    tagTruckWithGPS,
    untagTruckGPS,
    addGPSData,
    getGPSDataForTruck,
    getAllGPSData,
    updateGPSData,
    
    addTank,
    updateTank,
    deleteTank,
    getTankById, 
    getAllTanks,
    getTanksByProduct,
    setTankActive,
    
    addIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    getAllIncidents,
    
    completeDelivery,
    recordOffloadingDetails,
    updateDeliveryStatus,
    assignDriverToOrder,
    
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    getAllStaff,
    getActiveStaff,
    
    logUserLogin,
    logUserLogout,
    
    addPrice,
    updatePrice,
    deletePrice,
    getPriceById,
    getAllPrices,
    getCurrentPrices,
    
    recordOffloadingToTank,
    
    logFraudDetection,
    logGpsActivity,
    
    company,
    setCompany
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

export default AppContext;
