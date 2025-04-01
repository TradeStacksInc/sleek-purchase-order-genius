
import { useState } from 'react';
import { PurchaseOrder, LogEntry } from '../types';
import { useToast } from '@/hooks/use-toast';

export const usePurchaseOrderActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addPurchaseOrder = (order: PurchaseOrder) => {
    setPurchaseOrders((prevOrders) => [order, ...prevOrders]);
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: order.id,
      action: `Purchase Order ${order.poNumber} created`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => [newLog, ...prevLogs]);
    
    toast({
      title: "Purchase Order Created",
      description: `PO #${order.poNumber} has been created successfully.`,
    });
  };

  const updateOrderStatus = (id: string, status: 'pending' | 'active' | 'fulfilled') => {
    setPurchaseOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              updatedAt: new Date(),
            }
          : order
      )
    );

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
    
    setLogs((prevLogs) => [newLog, ...prevLogs]);
    
    toast({
      title: "Status Updated",
      description: `PO #${order.poNumber} is now ${status}.`,
    });
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
