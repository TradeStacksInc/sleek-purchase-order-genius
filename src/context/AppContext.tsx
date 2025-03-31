import React, { createContext, useContext, useState } from 'react';
import { LogEntry, PurchaseOrder, Supplier } from '../types';
import { appData } from '../data/mockData';
import { useToast } from '../hooks/use-toast';

interface AppContextType {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  addPurchaseOrder: (order: PurchaseOrder) => void;
  addSupplier: (supplier: Supplier) => void;
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getLogsByOrderId: (id: string) => LogEntry[];
  logAIInteraction: (query: string, response: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(appData.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(appData.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(appData.suppliers);
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

  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prevSuppliers) => [supplier, ...prevSuppliers]);
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `New supplier "${supplier.name}" added to the system`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => [newLog, ...prevLogs]);
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

  const getLogsByOrderId = (id: string) => {
    return logs.filter((log) => log.poId === id).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const logAIInteraction = (query: string, response: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `AI Interaction - User asked: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}" and received a response`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <AppContext.Provider
      value={{
        purchaseOrders,
        logs,
        suppliers,
        addPurchaseOrder,
        addSupplier,
        updateOrderStatus,
        getOrderById,
        getLogsByOrderId,
        logAIInteraction,
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
