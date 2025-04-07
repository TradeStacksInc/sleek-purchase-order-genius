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

  useEffect(() => {
    setPurchaseOrders(getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, []));
    setLogs(getFromLocalStorage(STORAGE_KEYS.LOGS, []));
    setSuppliers(getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, []));
    setDrivers(getFromLocalStorage(STORAGE_KEYS.DRIVERS, []));
    setTrucks(getFromLocalStorage(STORAGE_KEYS.TRUCKS, []));
    setGpsData(getFromLocalStorage(STORAGE_KEYS.GPS_DATA, []));
    setAiInsights(getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, []));
    setStaff(getFromLocalStorage(STORAGE_KEYS.STAFF, []));
    setDispensers(getFromLocalStorage(STORAGE_KEYS.DISPENSERS, []));
    setShifts(getFromLocalStorage(STORAGE_KEYS.SHIFTS, []));
    setSales(getFromLocalStorage(STORAGE_KEYS.SALES, []));
    setPrices(getFromLocalStorage(STORAGE_KEYS.PRICES, []));
    setIncidents(getFromLocalStorage(STORAGE_KEYS.INCIDENTS, []));
    setActivityLogs(getFromLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, []));
    setTanks(getFromLocalStorage(STORAGE_KEYS.TANKS, []));
  }, []);

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

  const updateDeliveryStatus = useCallback((orderId: string, status: 'pending' | 'delivered' | 'in_transit'): boolean => {
    const orderIndex = purchaseOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;
    
    const order = purchaseOrders[orderIndex];
    const oldStatus = order.deliveryDetails?.status || 'pending';
    
    const updatedDeliveryDetails = {
      ...(order.deliveryDetails || {}),
      status
    };
    
    const updatedOrder = {
      ...order,
      updatedAt: new Date(),
      deliveryDetails: updatedDeliveryDetails as DeliveryDetails
    };
    
    updatePurchaseOrder(orderId, updatedOrder);
    
    const logEntry = {
      poId: orderId,
      action: 'update_delivery_status',
      details: `Delivery status updated to ${status} for order ${orderId}`,
      entityType: 'delivery',
      entityId: updatedDeliveryDetails.id || '',
      user: 'Current User'
    };
    
    addLog(logEntry);
    
    addActivityLog({
      action: 'update',
      entityType: 'delivery',
      entityId: orderId,
      details: `Delivery status for order ${order.poNumber} changed from ${oldStatus} to ${status}`,
      user: 'Current User'
    });
    
    return true;
  }, [purchaseOrders, updatePurchaseOrder, addLog, addActivityLog]);

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

  const contextValue = {
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
    company,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    updateOrderStatus,
    getOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId,
    logAIInteraction,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getAllSuppliers,
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
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks,
    addGPSData,
    getGPSDataForTruck,
    getAllGPSData,
    updateGPSData,
    addAIInsight,
    markAIInsightAsRead,
    getUnreadAIInsights,
    getAllAIInsights,
    resetAIInsights,
    generateAIInsights,
    getInsightsByType,
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    getAllStaff,
    getActiveStaff,
    addDispenser,
    updateDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    getActiveDispensers,
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getAllShifts,
    getCurrentShift,
    addSale,
    updateSale,
    deleteSale,
    getSaleById,
    getAllSales,
    getSalesForShift,
    addPrice,
    updatePrice,
    deletePrice,
    getPriceById,
    getAllPrices,
    getCurrentPrices,
    addIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    getAllIncidents,
    addTank,
    updateTank,
    deleteTank,
    getTankById,
    getAllTanks,
    getTanksByProduct,
    setTankActive,
    updateCompany,
    completeDelivery,
    recordOffloadingDetails,
    recordOffloadingToTank,
    startDelivery,
    updateDeliveryStatus,
    assignDriverToOrder,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs,
    logUserLogin,
    logUserLogout,
    logFraudDetection,
    logGpsActivity
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
