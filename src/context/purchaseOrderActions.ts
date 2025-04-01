
import { useState } from 'react';
import { PurchaseOrder, LogEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';

export const usePurchaseOrderActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addPurchaseOrder = (order: PurchaseOrder) => {
    // Add to state
    setPurchaseOrders((prevOrders) => {
      const newOrders = [order, ...prevOrders];
      
      // Save to localStorage immediately
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      if (!saveSuccess) {
        toast({
          title: "Save Error",
          description: "There was a problem saving your purchase order. Please try again.",
          variant: "destructive"
        });
      }
      
      return newOrders;
    });
    
    // Create log entry
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: order.id,
      action: `Purchase Order ${order.poNumber} created`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    // Add log entry
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    toast({
      title: "Purchase Order Created",
      description: `PO #${order.poNumber} has been created successfully.`,
    });
    
    return order;
  };

  const updateOrderStatus = (id: string, status: 'pending' | 'active' | 'fulfilled') => {
    let updatedOrder: PurchaseOrder | undefined;
    
    setPurchaseOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => {
        if (order.id === id) {
          updatedOrder = {
            ...order,
            status,
            updatedAt: new Date(),
          };
          return updatedOrder;
        }
        return order;
      });
      
      // Save to localStorage immediately
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      return newOrders;
    });

    const order = purchaseOrders.find((po) => po.id === id);
    if (!order) return;

    const statusAction = 
      status === 'active' ? 'Active (Paid)' :
      status === 'fulfilled' ? 'Fulfilled (Delivered)' : 'Pending';
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: id,
      action: `Status updated to ${statusAction} for Purchase Order ${order.poNumber}`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    toast({
      title: "Status Updated",
      description: `PO #${order.poNumber} is now ${status}.`,
    });
    
    return updatedOrder;
  };

  const getOrderById = (id: string) => {
    return purchaseOrders.find((order) => order.id === id);
  };

  const getOrdersWithDeliveryStatus = (status: 'pending' | 'in_transit' | 'delivered'): PurchaseOrder[] => {
    return purchaseOrders.filter(po => po.deliveryDetails?.status === status);
  };

  const getOrdersWithDiscrepancies = (): PurchaseOrder[] => {
    return purchaseOrders.filter(po => po.offloadingDetails?.isDiscrepancyFlagged);
  };

  return {
    addPurchaseOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies
  };
};
