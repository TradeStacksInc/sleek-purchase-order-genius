import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, OrderStatus } from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { getPaginatedData } from '@/utils/localStorage';

export const usePurchaseOrderActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  logs: any[],
  setLogs: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>): PurchaseOrder => {
    const id = `po-${uuidv4().substring(0, 8)}`;
    const poNumber = `FMN-${Math.floor(100000 + Math.random() * 900000)}`; // Generate a random 6-digit PO number
    
    const newOrder: PurchaseOrder = {
      ...order,
      id,
      poNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          status: order.status || 'pending',
          timestamp: new Date(),
          user: 'Admin',
          note: 'Purchase Order created'
        }
      ]
    };
    
    setPurchaseOrders([...purchaseOrders, newOrder]);
    
    // Log the creation - properly formatted with numeric types
    const actionLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action: `create_purchase_order`,
      user: 'Admin',
      entityType: 'purchase_order',
      entityId: id,
      poId: id,
      details: `Purchase Order ${poNumber} created with status ${order.status || 'pending'}`
    };
    
    setLogs([...logs, actionLog]);
    
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note: string = ''): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;
    
    const updatedOrder = { ...purchaseOrders[orderIndex] };
    updatedOrder.status = status;
    updatedOrder.updatedAt = new Date();
    
    // Add status history entry
    if (!updatedOrder.statusHistory) {
      updatedOrder.statusHistory = [];
    }
    
    updatedOrder.statusHistory.push({
      status,
      timestamp: new Date(),
      user: 'Admin',
      note: note || `Status updated to ${status}`
    });
    
    // Special handling for paid status
    if (status === 'active') {
      updatedOrder.paymentStatus = 'paid';
    }
    
    setPurchaseOrders(prev => {
      const updated = [...prev];
      updated[orderIndex] = updatedOrder;
      return updated;
    });
    
    // Log the status update - properly formatted with numeric types
    const actionLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action: `update_order_status`,
      user: 'Admin',
      entityType: 'purchase_order',
      entityId: orderId,
      poId: orderId,
      details: `Status updated to ${status} for Purchase Order ${updatedOrder.poNumber}`
    };
    
    setLogs(prev => [...prev, actionLog]);
    
    return true;
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;

    const updatedOrder = { ...purchaseOrders[orderIndex], ...updates, updatedAt: new Date() };

    setPurchaseOrders(prev => {
      const updated = [...prev];
      updated[orderIndex] = updatedOrder;
      return updated;
    });

    return true;
  };

  const deletePurchaseOrder = (id: string): boolean => {
    const orderIndex = purchaseOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) return false;

    setPurchaseOrders(prev => {
      const updated = [...prev];
      updated.splice(orderIndex, 1);
      return updated;
    });

    return true;
  };

  const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
    return purchaseOrders.find(order => order.id === id);
  };

  const getAllPurchaseOrders = (params?: PaginationParams): PaginatedResult<PurchaseOrder> => {
    return getPaginatedData(purchaseOrders, params || { page: 1, limit: 10 });
  };

  return {
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    updateOrderStatus
  };
};
