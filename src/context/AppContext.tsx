
import React, { createContext, useContext, useState } from 'react';
import { LogEntry, PurchaseOrder, Supplier, Driver, Truck, DeliveryDetails, GPSData } from '../types';
import { appData } from '../data/mockData';
import { useToast } from '../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  addPurchaseOrder: (order: PurchaseOrder) => void;
  addSupplier: (supplier: Supplier) => void;
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getLogsByOrderId: (id: string) => LogEntry[];
  logAIInteraction: (query: string, response: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => void;
  updateDeliveryStatus: (
    orderId: string, 
    updates: Partial<DeliveryDetails>
  ) => void;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  getDriverById: (id: string) => Driver | undefined;
  getTruckById: (id: string) => Truck | undefined;
  getAvailableDrivers: () => Driver[];
  getAvailableTrucks: () => Truck[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data for drivers and trucks
const initialDrivers: Driver[] = [
  {
    id: "driver-1",
    name: "John Doe",
    contact: "+234 801-234-5678",
    licenseNumber: "DL-12345-NG",
    isAvailable: true
  },
  {
    id: "driver-2",
    name: "Sarah Johnson",
    contact: "+234 802-345-6789",
    licenseNumber: "DL-67890-NG",
    isAvailable: true
  }
];

const initialTrucks: Truck[] = [
  {
    id: "truck-1",
    plateNumber: "LG-234-KJA",
    capacity: 33000,
    model: "MAN Diesel 2018",
    hasGPS: true,
    isAvailable: true
  },
  {
    id: "truck-2",
    plateNumber: "AJ-567-LGS",
    capacity: 45000,
    model: "Scania P410 2020",
    hasGPS: true,
    isAvailable: true
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(appData.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(appData.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(appData.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [gpsData, setGPSData] = useState<GPSData[]>([]);
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

  // Driver management functions
  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: `driver-${uuidv4().substring(0, 8)}`
    };
    
    setDrivers(prev => [newDriver, ...prev]);
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `New driver "${newDriver.name}" added to the system`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Driver Added",
      description: `${newDriver.name} has been added successfully.`,
    });
    
    return newDriver;
  };

  // Truck management functions
  const addTruck = (truckData: Omit<Truck, 'id'>) => {
    const newTruck: Truck = {
      ...truckData,
      id: `truck-${uuidv4().substring(0, 8)}`
    };
    
    setTrucks(prev => [newTruck, ...prev]);
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `New truck "${newTruck.plateNumber}" added to the system`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Truck Added",
      description: `Truck ${newTruck.plateNumber} has been added successfully.`,
    });
    
    return newTruck;
  };

  // Assign driver to order
  const assignDriverToOrder = (orderId: string, driverId: string, truckId: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    const driver = drivers.find(d => d.id === driverId);
    const truck = trucks.find(t => t.id === truckId);
    
    if (!order || !driver || !truck) {
      toast({
        title: "Assignment Failed",
        description: "Could not find order, driver, or truck with the provided IDs.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if order is paid (active)
    if (order.status !== 'active') {
      toast({
        title: "Assignment Failed",
        description: "Only paid (active) orders can be assigned to drivers.",
        variant: "destructive"
      });
      return;
    }
    
    // Create or update delivery details
    const deliveryDetails: DeliveryDetails = {
      id: order.deliveryDetails?.id || `delivery-${uuidv4().substring(0, 8)}`,
      poId: orderId,
      driverId,
      truckId,
      status: 'pending',
      expectedArrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default ETA: 24 hours
    };
    
    // Update purchase order with delivery details
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => po.id === orderId ? { ...po, deliveryDetails } : po)
    );
    
    // Update driver and truck availability
    setDrivers(prevDrivers =>
      prevDrivers.map(d => d.id === driverId ? { ...d, isAvailable: false } : d)
    );
    
    setTrucks(prevTrucks =>
      prevTrucks.map(t => t.id === truckId ? { ...t, isAvailable: false } : t)
    );
    
    // Log the assignment
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Driver ${driver.name} with truck ${truck.plateNumber} assigned to Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Driver Assigned",
      description: `${driver.name} has been assigned to PO #${order.poNumber}.`,
    });
  };

  // Update delivery status
  const updateDeliveryStatus = (
    orderId: string, 
    updates: Partial<DeliveryDetails>
  ) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    
    if (!order || !order.deliveryDetails) {
      toast({
        title: "Update Failed",
        description: "Could not find order or delivery details.",
        variant: "destructive"
      });
      return;
    }
    
    // Update purchase order delivery details
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId && po.deliveryDetails) {
          const updatedDetails = { ...po.deliveryDetails, ...updates };
          
          // If status changed to delivered, update order status to fulfilled
          if (updates.status === 'delivered' && po.status !== 'fulfilled') {
            return { 
              ...po, 
              status: 'fulfilled', 
              deliveryDetails: updatedDetails,
              updatedAt: new Date() 
            };
          }
          
          return { ...po, deliveryDetails: updatedDetails, updatedAt: new Date() };
        }
        return po;
      })
    );
    
    // Log the update
    let actionDescription = "Delivery details updated";
    
    if (updates.depotDepartureTime) {
      actionDescription = `Truck departed from depot at ${updates.depotDepartureTime.toLocaleTimeString()}`;
    } else if (updates.destinationArrivalTime) {
      actionDescription = `Truck arrived at destination at ${updates.destinationArrivalTime.toLocaleTimeString()}`;
    } else if (updates.status === 'in_transit') {
      actionDescription = "Delivery status changed to In Transit";
    } else if (updates.status === 'delivered') {
      actionDescription = "Delivery completed successfully";
    }
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `${actionDescription} for Purchase Order ${order.poNumber}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    // If delivery completed, make driver and truck available again
    if (updates.status === 'delivered') {
      const { driverId, truckId } = order.deliveryDetails;
      
      if (driverId) {
        setDrivers(prevDrivers =>
          prevDrivers.map(d => d.id === driverId ? { ...d, isAvailable: true } : d)
        );
      }
      
      if (truckId) {
        setTrucks(prevTrucks =>
          prevTrucks.map(t => t.id === truckId ? { ...t, isAvailable: true } : t)
        );
      }
      
      toast({
        title: "Delivery Completed",
        description: `PO #${order.poNumber} has been successfully delivered.`,
      });
    } else {
      toast({
        title: "Delivery Updated",
        description: actionDescription,
      });
    }
  };

  // Update GPS data
  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number) => {
    const newGPSData: GPSData = {
      id: `gps-${Date.now()}`,
      truckId,
      latitude,
      longitude,
      speed,
      timestamp: new Date()
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Find all orders with this truck and update their distance/ETA
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.deliveryDetails?.truckId === truckId && po.deliveryDetails.status === 'in_transit') {
          // This is simplified - in a real app, you'd calculate actual distance from GPS coordinates
          const distanceCovered = po.deliveryDetails.distanceCovered || 0;
          const totalDistance = po.deliveryDetails.totalDistance || 100;
          const newDistanceCovered = Math.min(distanceCovered + (speed / 10), totalDistance);
          
          // Recalculate ETA based on new distance and speed
          const remainingDistance = totalDistance - newDistanceCovered;
          const estimatedTimeInHours = remainingDistance / (speed > 0 ? speed : 10);
          const expectedArrivalTime = new Date(Date.now() + estimatedTimeInHours * 60 * 60 * 1000);
          
          return {
            ...po,
            deliveryDetails: {
              ...po.deliveryDetails,
              distanceCovered: newDistanceCovered,
              expectedArrivalTime
            }
          };
        }
        return po;
      })
    );
  };

  // Get a driver by ID
  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
  };

  // Get a truck by ID
  const getTruckById = (id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
  };

  // Get available drivers
  const getAvailableDrivers = (): Driver[] => {
    return drivers.filter(driver => driver.isAvailable);
  };

  // Get available trucks
  const getAvailableTrucks = (): Truck[] => {
    return trucks.filter(truck => truck.isAvailable);
  };

  return (
    <AppContext.Provider
      value={{
        purchaseOrders,
        logs,
        suppliers,
        drivers,
        trucks,
        gpsData,
        addPurchaseOrder,
        addSupplier,
        updateOrderStatus,
        getOrderById,
        getLogsByOrderId,
        logAIInteraction,
        addDriver,
        addTruck,
        assignDriverToOrder,
        updateDeliveryStatus,
        updateGPSData,
        getDriverById,
        getTruckById,
        getAvailableDrivers,
        getAvailableTrucks
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
