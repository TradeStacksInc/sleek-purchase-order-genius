
import { PurchaseOrder, LogEntry, OrderStatus, StatusHistoryEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

export const usePurchaseOrderActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addPurchaseOrder = (order: PurchaseOrder) => {
    try {
      console.log("Adding purchase order:", order);
      
      // Add initial status history
      const orderWithHistory = {
        ...order,
        statusHistory: [
          {
            id: uuidv4(),
            status: order.status,
            timestamp: new Date(),
            user: 'Current User', // In a real app, get from auth
            note: 'Order created'
          }
        ]
      };
      
      // Create new array directly
      const newOrders = [orderWithHistory, ...purchaseOrders];
      
      // Save to localStorage immediately
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      if (!saveSuccess) {
        toast({
          title: "Save Error",
          description: "There was a problem saving your purchase order. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      // Update state only after successful save
      setPurchaseOrders(newOrders);
      
      // Create log entry
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: order.id,
        action: `Purchase Order ${order.poNumber} created with status ${order.status}`,
        user: 'Current User', // In a real app, get from auth
        timestamp: new Date(),
      };
      
      // Add log directly
      const newLogs = [newLog, ...logs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      setLogs(newLogs);
      
      toast({
        title: "Purchase Order Created",
        description: `PO #${order.poNumber} has been created successfully.`,
      });
      
      return orderWithHistory;
    } catch (error) {
      console.error("Error adding purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to create purchase order. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateOrderStatus = (
    id: string, 
    status: OrderStatus, 
    notes?: string,
    approvedBy?: string,
    rejectionReason?: string
  ) => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      
      // Find the order to update
      const order = purchaseOrders.find((po) => po.id === id);
      if (!order) {
        toast({
          title: "Error",
          description: "Could not find the specified order.",
          variant: "destructive"
        });
        return null;
      }
      
      // Create the status history entry
      const statusHistoryEntry: StatusHistoryEntry = {
        id: uuidv4(),
        status,
        timestamp: new Date(),
        user: 'Current User', // In a real app, get from auth
        note: notes
      };
      
      const statusHistory = order.statusHistory 
        ? [...order.statusHistory, statusHistoryEntry]
        : [statusHistoryEntry];
      
      // Create the updated order
      updatedOrder = {
        ...order,
        status,
        statusHistory,
        updatedAt: new Date(),
        ...(status === 'approved' && approvedBy ? { approvedBy } : {}),
        ...(status === 'rejected' && rejectionReason ? { rejectionReason } : {})
      };
      
      // Create the new orders array
      const newOrders = purchaseOrders.map((po) => 
        po.id === id ? updatedOrder! : po
      );
      
      // Save to localStorage first
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, newOrders);
      
      if (!saveSuccess) {
        toast({
          title: "Save Error",
          description: "There was a problem updating the order status. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      // Update state only after successful save
      setPurchaseOrders(newOrders);

      const statusDescription = getStatusDescription(status);
      
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: id,
        action: `Status updated to ${statusDescription} for Purchase Order ${order.poNumber}`,
        user: 'Current User', // In a real app, get from auth
        timestamp: new Date(),
      };
      
      const newLogs = [newLog, ...logs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      setLogs(newLogs);
      
      toast({
        title: "Status Updated",
        description: `PO #${order.poNumber} is now ${statusDescription}.`,
      });
      
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getStatusDescription = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'active': return 'Active (Paid)';
      case 'delivered': return 'Delivered';
      case 'fulfilled': return 'Fulfilled';
      default: return status;
    }
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

  const getOrdersByStatus = (status: OrderStatus): PurchaseOrder[] => {
    return purchaseOrders.filter(po => po.status === status);
  };

  return {
    addPurchaseOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersWithDeliveryStatus,
    getOrdersWithDiscrepancies,
    getOrdersByStatus,
    getStatusDescription
  };
};
