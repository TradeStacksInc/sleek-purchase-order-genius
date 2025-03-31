
import React, { createContext, useContext, useState } from 'react';
import { LogEntry, PurchaseOrder, Supplier } from '../types';
import { appData } from '../data/mockData';
import { useToast } from '../hooks/use-toast';

interface AppContextType {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  addPurchaseOrder: (order: PurchaseOrder) => void;
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getLogsByOrderId: (id: string) => LogEntry[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(appData.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(appData.logs);
  const { toast } = useToast();

  const addPurchaseOrder = (order: PurchaseOrder) => {
    setPurchaseOrders((prevOrders) => [order, ...prevOrders]);
    
    // Add log entry for new order
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

    // Add log entry for status update
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

  const getLogsByOrderId = (id: string) => {
    return logs.filter((log) => log.poId === id).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  return (
    <AppContext.Provider
      value={{
        purchaseOrders,
        logs,
        suppliers: appData.suppliers,
        addPurchaseOrder,
        updateOrderStatus,
        getOrderById,
        getLogsByOrderId,
      }}
    >
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
