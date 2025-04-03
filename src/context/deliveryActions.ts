import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { 
  PurchaseOrder, 
  DeliveryDetails, 
  LogEntry, 
  GPSData,
  OffloadingDetails, 
  Incident 
} from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';
import GPSTrackingService from '@/services/GPSTrackingService';

export const useDeliveryActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  gpsData: GPSData[],
  setGpsData: React.Dispatch<React.SetStateAction<GPSData[]>>,
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  trucks: any[],
  setTrucks: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const { toast } = useToast();
  
  const assignDriverToOrder = (orderId: string, driverId: string, truckId: string) => {
    setPurchaseOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => {
        if (order.id === orderId) {
          const deliveryId = uuidv4();
          const deliveryDetails: DeliveryDetails = {
            id: deliveryId,
            poId: orderId,
            driverId,
            truckId,
            status: 'pending',
            isGPSTagged: trucks.find(t => t.id === truckId)?.isGPSTagged || false,
            gpsDeviceId: trucks.find(t => t.id === truckId)?.gpsDeviceId
          };
          
          return {
            ...order,
            deliveryDetails,
            updatedAt: new Date()
          };
        }
        return order;
      });
      
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      return newOrders;
    });
    
    // Update driver availability
    // ... existing code
    
    // Update truck availability
    // ... existing code
    
    const order = purchaseOrders.find((po) => po.id === orderId);
    if (!order) return;
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Driver and truck assigned to Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    toast({
      title: "Driver Assigned",
      description: `Driver has been assigned to PO #${order.poNumber}.`,
    });
  };

  const updateDeliveryStatus = (
    orderId: string, 
    updates: Partial<DeliveryDetails>
  ) => {
    let updatedOrder: PurchaseOrder | undefined;
    
    setPurchaseOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => {
        if (order.id === orderId && order.deliveryDetails) {
          const updatedDeliveryDetails = {
            ...order.deliveryDetails,
            ...updates
          };
          
          // If status changed to 'in_transit', start GPS tracking
          if (
            updates.status === 'in_transit' && 
            order.deliveryDetails.status !== 'in_transit' &&
            order.deliveryDetails.truckId
          ) {
            const truck = trucks.find(t => t.id === order.deliveryDetails?.truckId);
            if (truck && truck.isGPSTagged) {
              // Set initial position for tracking
              const gpsService = GPSTrackingService.getInstance();
              gpsService.startTracking(
                truck.id,
                truck.lastLatitude || 6.5244,
                truck.lastLongitude || 3.3792,
                updates.totalDistance || 100
              );
            }
          }
          
          // If status changed to 'delivered', stop GPS tracking
          if (
            updates.status === 'delivered' && 
            order.deliveryDetails.status !== 'delivered' &&
            order.deliveryDetails.truckId
          ) {
            const gpsService = GPSTrackingService.getInstance();
            gpsService.stopTracking(order.deliveryDetails.truckId);
          }
          
          updatedOrder = {
            ...order,
            deliveryDetails: updatedDeliveryDetails,
            updatedAt: new Date()
          };
          return updatedOrder;
        }
        return order;
      });
      
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      return newOrders;
    });
    
    const order = purchaseOrders.find((po) => po.id === orderId);
    if (!order) return;
    
    const statusText = 
      updates.status === 'in_transit' ? 'In Transit' :
      updates.status === 'delivered' ? 'Delivered' :
      updates.status;
      
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Delivery status updated to ${statusText} for Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    toast({
      title: "Delivery Status Updated",
      description: `PO #${order.poNumber} delivery is now ${statusText}.`,
    });
    
    return updatedOrder;
  };

  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number) => {
    // Create new GPS data entry
    const newGPSData: GPSData = {
      id: uuidv4(),
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date()
    };
    
    // Add to state
    setGpsData((prevData) => {
      // Keep only the last 100 GPS data points per truck to prevent memory issues
      const filteredPrevData = prevData.filter(d => d.truckId !== truckId || 
        prevData.filter(pd => pd.truckId === truckId).indexOf(d) >= 
        prevData.filter(pd => pd.truckId === truckId).length - 99);
      
      const newData = [...filteredPrevData, newGPSData];
      
      // Save to localStorage
      saveToLocalStorage(STORAGE_KEYS.GPS_DATA, newData);
      
      return newData;
    });
    
    // Update the truck's last known position
    setTrucks((prevTrucks) => {
      const newTrucks = prevTrucks.map((truck) => {
        if (truck.id === truckId) {
          return {
            ...truck,
            lastLatitude: latitude,
            lastLongitude: longitude,
            lastSpeed: speed,
            lastUpdate: new Date()
          };
        }
        return truck;
      });
      
      saveToLocalStorage(STORAGE_KEYS.TRUCKS, newTrucks);
      
      return newTrucks;
    });
    
    // Update delivery distance for all orders with this truck
    setPurchaseOrders((prevOrders) => {
      const ordersToUpdate = prevOrders.filter(
        po => po.deliveryDetails?.truckId === truckId && 
             po.deliveryDetails?.status === 'in_transit'
      );
      
      if (ordersToUpdate.length === 0) return prevOrders;
      
      const newOrders = prevOrders.map((order) => {
        if (
          order.deliveryDetails?.truckId === truckId && 
          order.deliveryDetails?.status === 'in_transit'
        ) {
          // Get tracking info to get accurate distance covered
          const gpsService = GPSTrackingService.getInstance();
          const trackingInfo = gpsService.getTrackingInfo(truckId);
          
          if (trackingInfo) {
            const updatedDeliveryDetails = {
              ...order.deliveryDetails,
              distanceCovered: trackingInfo.distanceCovered
            };
            
            return {
              ...order,
              deliveryDetails: updatedDeliveryDetails
            };
          }
        }
        return order;
      });
      
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      return newOrders;
    });
  };

  // ... keep existing code (remaining functions)
  
  return {
    assignDriverToOrder,
    updateDeliveryStatus,
    updateGPSData,
    // ... existing exports
  };
};
