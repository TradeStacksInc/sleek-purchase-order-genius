import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { 
  PurchaseOrder, 
  DeliveryDetails, 
  LogEntry, 
  GPSData,
  OffloadingDetails, 
  Incident,
  ActivityLog
} from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';
import GPSTrackingService from '@/services/GPSTrackingService';

export const useDeliveryActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  drivers: any[],
  setDrivers: React.Dispatch<React.SetStateAction<any[]>>,
  trucks: any[],
  setTrucks: React.Dispatch<React.SetStateAction<any[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  gpsData: GPSData[],
  setGpsData: React.Dispatch<React.SetStateAction<GPSData[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const logActivity = (
    entityType: string, 
    entityId: string,
    action: string,
    details: string,
    metadata?: Record<string, any>
  ) => {
    const newActivityLog: ActivityLog = {
      id: `log-${uuidv4()}`,
      entityType: entityType as any,
      entityId,
      action: action as any,
      details,
      user: 'Current User',
      timestamp: new Date(),
      ...(metadata ? { metadata } : {})
    };
    
    setActivityLogs(prev => [newActivityLog, ...prev]);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, prev => [newActivityLog, ...prev]);
  };
  
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
    
    logActivity(
      'purchase_order',
      orderId,
      'update',
      `Driver and truck assigned to Purchase Order ${order.poNumber}`,
      {
        driverId,
        truckId,
        assignment: 'delivery'
      }
    );
    
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
          
          if (
            updates.status === 'in_transit' && 
            order.deliveryDetails.status !== 'in_transit' &&
            order.deliveryDetails.truckId
          ) {
            const truck = trucks.find(t => t.id === order.deliveryDetails?.truckId);
            if (truck && truck.isGPSTagged) {
              const gpsService = GPSTrackingService.getInstance();
              gpsService.startTracking(
                truck.id,
                truck.lastLatitude || 6.5244,
                truck.lastLongitude || 3.3792,
                updates.totalDistance || 100
              );
            }
          }
          
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
      
    logActivity(
      'purchase_order',
      orderId,
      'update',
      `Delivery status updated to ${statusText} for Purchase Order ${order.poNumber}`,
      {
        status: updates.status,
        updateType: 'delivery_status'
      }
    );
    
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
    const newGPSData: GPSData = {
      id: uuidv4(),
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date()
    };
    
    setGpsData((prevData) => {
      const filteredPrevData = prevData.filter(d => d.truckId !== truckId || 
        prevData.filter(pd => pd.truckId === truckId).indexOf(d) >= 
        prevData.filter(pd => pd.truckId === truckId).length - 99);
      
      const newData = [...filteredPrevData, newGPSData];
      
      saveToLocalStorage(STORAGE_KEYS.GPS_DATA, newData);
      
      return newData;
    });
    
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
          const gpsService = GPSTrackingService.getInstance();
          const trackingInfo = gpsService.getTrackingInfo(truckId);
          
          if (trackingInfo) {
            const updatedDeliveryDetails = {
              ...order.deliveryDetails,
              distanceCovered: trackingInfo.distanceCovered || 0
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

  const recordOffloadingDetails = (
    orderId: string, 
    offloadingData: Omit<OffloadingDetails, 'id' | 'deliveryId' | 'timestamp' | 'discrepancyPercentage' | 'isDiscrepancyFlagged' | 'status'>
  ) => {
    setPurchaseOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => {
        if (order.id === orderId && order.deliveryDetails) {
          const deliveryId = order.deliveryDetails.id;
          
          const loadedVolume = offloadingData.loadedVolume;
          const deliveredVolume = offloadingData.deliveredVolume;
          const discrepancyPercentage = Math.abs(((deliveredVolume - loadedVolume) / loadedVolume) * 100);
          const isDiscrepancyFlagged = discrepancyPercentage > 2;
          
          const offloadingDetails: OffloadingDetails = {
            ...offloadingData,
            id: `offload-${uuidv4().substring(0, 8)}`,
            deliveryId,
            timestamp: new Date(),
            discrepancyPercentage,
            isDiscrepancyFlagged,
            status: isDiscrepancyFlagged ? 'under_investigation' : 'approved'
          };
          
          return {
            ...order,
            offloadingDetails,
            updatedAt: new Date()
          };
        }
        return order;
      });
      
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      return newOrders;
    });
    
    const order = purchaseOrders.find((po) => po.id === orderId);
    if (!order) return;
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Offloading details recorded for Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    logActivity(
      'purchase_order',
      orderId,
      'update',
      `Product offloaded for PO #${order.poNumber}: ${offloadingData.deliveredVolume.toLocaleString()} liters to tank ${offloadingData.tankId}`,
      {
        loadedVolume: offloadingData.loadedVolume,
        deliveredVolume: offloadingData.deliveredVolume,
        tankId: offloadingData.tankId,
        productType: offloadingData.productType,
        discrepancyPercentage: Math.abs(((offloadingData.deliveredVolume - offloadingData.loadedVolume) / offloadingData.loadedVolume) * 100),
        measuredBy: offloadingData.measuredBy,
        measuredByRole: offloadingData.measuredByRole
      }
    );
    
    toast({
      title: "Offloading Recorded",
      description: `Fuel offloading details for PO #${order.poNumber} have been recorded.`,
    });
  };

  const addIncident = (
    orderId: string, 
    incident: Omit<Incident, 'id' | 'deliveryId' | 'timestamp'>
  ) => {
    let updatedOrder: PurchaseOrder | undefined;
    
    setPurchaseOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => {
        if (order.id === orderId && order.deliveryDetails) {
          const deliveryId = order.deliveryDetails.id;
          
          const newIncident: Incident = {
            ...incident,
            id: `incident-${uuidv4().substring(0, 8)}`,
            deliveryId,
            timestamp: new Date()
          };
          
          const incidents = order.incidents ? [...order.incidents, newIncident] : [newIncident];
          
          updatedOrder = {
            ...order,
            incidents,
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
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `New ${incident.type} incident reported for Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    logActivity(
      'incident',
      incident.id,
      'create',
      `New ${incident.type} incident reported for Purchase Order ${order.poNumber}: ${incident.description.substring(0, 50)}${incident.description.length > 50 ? '...' : ''}`,
      {
        incidentType: incident.type,
        severity: incident.severity,
        impact: incident.impact,
        poId: orderId
      }
    );
    
    toast({
      title: "Incident Reported",
      description: `A new incident has been reported for PO #${order.poNumber}.`,
    });
    
    return updatedOrder;
  };

  const startDelivery = (orderId: string) => {
    const totalDistance = Math.floor(Math.random() * 50) + 70;
    
    const updatedOrder = updateDeliveryStatus(orderId, {
      status: 'in_transit',
      depotDepartureTime: new Date(),
      distanceCovered: 0,
      totalDistance,
    });
    
    const order = purchaseOrders.find(po => po.id === orderId);
    if (order) {
      logActivity(
        'purchase_order',
        orderId,
        'update',
        `Delivery started for PO #${order.poNumber} - estimated distance: ${totalDistance} km`,
        {
          status: 'in_transit',
          totalDistance,
          departure: new Date()
        }
      );
    }
    
    return updatedOrder;
  };

  const completeDelivery = (orderId: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    if (!order || !order.deliveryDetails) return;
    
    const totalDistance = order.deliveryDetails.totalDistance || 100;
    
    const updatedOrder = updateDeliveryStatus(orderId, {
      status: 'delivered',
      destinationArrivalTime: new Date(),
      distanceCovered: totalDistance
    });
    
    if (order) {
      logActivity(
        'purchase_order',
        orderId,
        'update',
        `Delivery completed for PO #${order.poNumber} - arrived at destination after covering ${totalDistance} km`,
        {
          status: 'delivered',
          totalDistance,
          arrival: new Date()
        }
      );
    }
    
    return updatedOrder;
  };
  
  return {
    assignDriverToOrder,
    updateDeliveryStatus,
    updateGPSData,
    recordOffloadingDetails,
    addIncident,
    startDelivery,
    completeDelivery
  };
};
