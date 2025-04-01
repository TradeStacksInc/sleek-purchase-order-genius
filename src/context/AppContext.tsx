
import React, { createContext, useContext, useState } from 'react';
import { LogEntry, PurchaseOrder, Supplier, Driver, Truck, DeliveryDetails, GPSData, OffloadingDetails, Incident, AIInsight } from '../types';
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
  recordOffloadingDetails: (orderId: string, offloadingData: Omit<OffloadingDetails, 'id' | 'deliveryId' | 'timestamp' | 'discrepancyPercentage' | 'isDiscrepancyFlagged' | 'status'>) => void;
  addIncident: (orderId: string, incident: Omit<Incident, 'id' | 'deliveryId' | 'timestamp'>) => void;
  getOrdersWithDeliveryStatus: (status: 'pending' | 'in_transit' | 'delivered') => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  aiInsights: AIInsight[];
  generateDiscrepancyInsights: () => void;
  markInsightAsRead: (id: string) => void;
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string, initialLatitude: number, initialLongitude: number) => void;
  startDelivery: (orderId: string) => void;
  completeDelivery: (orderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
    isAvailable: true,
    isGPSTagged: false
  },
  {
    id: "truck-2",
    plateNumber: "AJ-567-LGS",
    capacity: 45000,
    model: "Scania P410 2020",
    hasGPS: true,
    isAvailable: true,
    isGPSTagged: false
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(appData.purchaseOrders);
  const [logs, setLogs] = useState<LogEntry[]>(appData.logs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(appData.suppliers);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [gpsData, setGPSData] = useState<GPSData[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
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
    
    if (order.status !== 'active') {
      toast({
        title: "Assignment Failed",
        description: "Only paid (active) orders can be assigned to drivers.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if truck with GPS capability is properly tagged
    if (truck.hasGPS && !truck.isGPSTagged) {
      toast({
        title: "GPS Tagging Required",
        description: "This truck has GPS capability but hasn't been tagged with a GPS device yet.",
        variant: "destructive"
      });
      return;
    }
    
    const deliveryDetails: DeliveryDetails = {
      id: order.deliveryDetails?.id || `delivery-${uuidv4().substring(0, 8)}`,
      poId: orderId,
      driverId,
      truckId,
      status: 'pending',
      expectedArrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isGPSTagged: truck.isGPSTagged,
      gpsDeviceId: truck.gpsDeviceId
    };
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => po.id === orderId ? { ...po, deliveryDetails } : po)
    );
    
    setDrivers(prevDrivers =>
      prevDrivers.map(d => d.id === driverId ? { ...d, isAvailable: false } : d)
    );
    
    setTrucks(prevTrucks =>
      prevTrucks.map(t => t.id === truckId ? { ...t, isAvailable: false } : t)
    );
    
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

  const tagTruckWithGPS = (truckId: string, gpsDeviceId: string, initialLatitude: number, initialLongitude: number) => {
    const truck = trucks.find(t => t.id === truckId);
    
    if (!truck) {
      toast({
        title: "GPS Tagging Failed",
        description: "Could not find truck with the provided ID.",
        variant: "destructive"
      });
      return;
    }
    
    if (!truck.hasGPS) {
      toast({
        title: "GPS Tagging Failed",
        description: "This truck does not have GPS capability.",
        variant: "destructive"
      });
      return;
    }
    
    // Update truck with GPS device information
    setTrucks(prevTrucks =>
      prevTrucks.map(t => 
        t.id === truckId 
          ? { ...t, isGPSTagged: true, gpsDeviceId } 
          : t
      )
    );
    
    // Create initial GPS data point
    const newGPSData: GPSData = {
      id: `gps-${Date.now()}`,
      truckId,
      latitude: initialLatitude,
      longitude: initialLongitude,
      speed: 0,
      timestamp: new Date()
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Log the GPS tagging
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `Truck ${truck.plateNumber} tagged with GPS device ${gpsDeviceId}`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "GPS Tagged Successfully",
      description: `Truck ${truck.plateNumber} is now GPS-enabled and ready for tracking.`,
    });
  };

  const startDelivery = (orderId: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    
    if (!order || !order.deliveryDetails) {
      toast({
        title: "Start Delivery Failed",
        description: "Could not find order or delivery details.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the assigned truck has GPS tagging
    const truck = trucks.find(t => t.id === order.deliveryDetails?.truckId);
    
    if (!truck) {
      toast({
        title: "Start Delivery Failed",
        description: "Could not find the assigned truck.",
        variant: "destructive"
      });
      return;
    }
    
    if (truck.hasGPS && !truck.isGPSTagged) {
      toast({
        title: "GPS Tagging Required",
        description: "The assigned truck requires GPS tagging before starting delivery.",
        variant: "destructive"
      });
      return;
    }
    
    // Update delivery status to in_transit
    const depotDepartureTime = new Date();
    const expectedArrivalTime = new Date(depotDepartureTime.getTime() + 24 * 60 * 60 * 1000);
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId && po.deliveryDetails) {
          return {
            ...po,
            deliveryDetails: {
              ...po.deliveryDetails,
              status: 'in_transit',
              depotDepartureTime,
              expectedArrivalTime,
              distanceCovered: 0,
              totalDistance: 100 // Placeholder for real distance calculation
            },
            updatedAt: new Date()
          };
        }
        return po;
      })
    );
    
    // Log the delivery start
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Delivery started for Purchase Order ${order.poNumber}. Truck departed from depot.`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Delivery Started",
      description: `Truck departed from depot for PO #${order.poNumber}.`,
    });
  };

  const completeDelivery = (orderId: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    
    if (!order || !order.deliveryDetails) {
      toast({
        title: "Complete Delivery Failed",
        description: "Could not find order or delivery details.",
        variant: "destructive"
      });
      return;
    }
    
    if (order.deliveryDetails.status !== 'in_transit') {
      toast({
        title: "Complete Delivery Failed",
        description: "Only deliveries in transit can be marked as delivered.",
        variant: "destructive"
      });
      return;
    }
    
    // Update delivery status to delivered
    const destinationArrivalTime = new Date();
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId && po.deliveryDetails) {
          return {
            ...po,
            deliveryDetails: {
              ...po.deliveryDetails,
              status: 'delivered',
              destinationArrivalTime,
              distanceCovered: po.deliveryDetails.totalDistance || 100
            },
            updatedAt: new Date()
          };
        }
        return po;
      })
    );
    
    // Log the delivery completion
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: `Delivery completed for Purchase Order ${order.poNumber}. Truck arrived at destination.`,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Delivery Completed",
      description: `Truck arrived at destination for PO #${order.poNumber}. Please record offloading details.`,
    });
  };

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

    // If changing to in_transit, check if GPS is tagged for trucks with GPS
    if (updates.status === 'in_transit') {
      const truck = trucks.find(t => t.id === order.deliveryDetails?.truckId);
      
      if (truck && truck.hasGPS && !truck.isGPSTagged) {
        toast({
          title: "GPS Tagging Required",
          description: "This truck requires GPS tagging before it can be marked as in transit.",
          variant: "destructive"
        });
        return;
      }
      
      // If starting delivery, set departure time
      if (!updates.depotDepartureTime) {
        updates.depotDepartureTime = new Date();
      }
    }
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId && po.deliveryDetails) {
          const updatedDetails = { ...po.deliveryDetails, ...updates };
          
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
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.deliveryDetails?.truckId === truckId && po.deliveryDetails.status === 'in_transit') {
          const distanceCovered = po.deliveryDetails.distanceCovered || 0;
          const totalDistance = po.deliveryDetails.totalDistance || 100;
          const newDistanceCovered = Math.min(distanceCovered + (speed / 10), totalDistance);
          
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

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
  };

  const getTruckById = (id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
  };

  const getAvailableDrivers = (): Driver[] => {
    return drivers.filter(driver => driver.isAvailable);
  };

  const getAvailableTrucks = (): Truck[] => {
    return trucks.filter(truck => truck.isAvailable);
  };

  const recordOffloadingDetails = (
    orderId: string, 
    offloadingData: Omit<OffloadingDetails, 'id' | 'deliveryId' | 'timestamp' | 'discrepancyPercentage' | 'isDiscrepancyFlagged' | 'status'>
  ) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    
    if (!order || !order.deliveryDetails) {
      toast({
        title: "Error Recording Offloading",
        description: "Could not find order or delivery details.",
        variant: "destructive"
      });
      return;
    }
    
    const loadedVolume = offloadingData.loadedVolume;
    const deliveredVolume = offloadingData.deliveredVolume;
    const discrepancyPercentage = ((loadedVolume - deliveredVolume) / loadedVolume) * 100;
    
    const isDiscrepancyFlagged = discrepancyPercentage > 5;
    
    const newOffloadingDetails: OffloadingDetails = {
      id: `offloading-${uuidv4().substring(0, 8)}`,
      deliveryId: order.deliveryDetails.id,
      ...offloadingData,
      discrepancyPercentage,
      isDiscrepancyFlagged,
      status: isDiscrepancyFlagged ? 'under_investigation' : 'approved',
      timestamp: new Date()
    };
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId) {
          return { 
            ...po, 
            offloadingDetails: newOffloadingDetails,
            updatedAt: new Date() 
          };
        }
        return po;
      })
    );
    
    let actionDescription = `Offloading details recorded for Purchase Order ${order.poNumber}`;
    
    if (isDiscrepancyFlagged) {
      actionDescription += ` - FLAGGED for investigation (${discrepancyPercentage.toFixed(2)}% discrepancy)`;
    }
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: actionDescription,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    if (isDiscrepancyFlagged) {
      toast({
        title: "Discrepancy Detected",
        description: `A ${discrepancyPercentage.toFixed(2)}% volume discrepancy has been flagged for investigation.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Offloading Recorded",
        description: `Offloading details have been successfully recorded.`,
      });
    }
  };

  const addIncident = (
    orderId: string, 
    incident: Omit<Incident, 'id' | 'deliveryId' | 'timestamp'>
  ) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    
    if (!order || !order.deliveryDetails) {
      toast({
        title: "Error Adding Incident",
        description: "Could not find order or delivery details.",
        variant: "destructive"
      });
      return;
    }
    
    const newIncident: Incident = {
      id: `incident-${uuidv4().substring(0, 8)}`,
      deliveryId: order.deliveryDetails.id,
      ...incident,
      timestamp: new Date()
    };
    
    setPurchaseOrders(prevOrders =>
      prevOrders.map(po => {
        if (po.id === orderId) {
          return { 
            ...po, 
            incidents: [...(po.incidents || []), newIncident],
            updatedAt: new Date() 
          };
        }
        return po;
      })
    );
    
    const impactIcon = incident.impact === 'positive' ? '+' : incident.impact === 'negative' ? '-' : '';
    const actionDescription = `${impactIcon} Incident reported: ${incident.type} - ${incident.description}`;
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: orderId,
      action: actionDescription,
      user: 'Current User',
      timestamp: new Date(),
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    toast({
      title: "Incident Recorded",
      description: `${incident.type} incident has been added to the delivery log.`,
    });
  };

  const generateDiscrepancyInsights = () => {
    const driversWithDiscrepancies = new Map<string, number>();
    const trucksWithDiscrepancies = new Map<string, number>();
    
    purchaseOrders.forEach(order => {
      if (order.offloadingDetails?.isDiscrepancyFlagged && order.deliveryDetails) {
        if (order.deliveryDetails.driverId) {
          const driverId = order.deliveryDetails.driverId;
          driversWithDiscrepancies.set(
            driverId, 
            (driversWithDiscrepancies.get(driverId) || 0) + 1
          );
        }
        
        if (order.deliveryDetails.truckId) {
          const truckId = order.deliveryDetails.truckId;
          trucksWithDiscrepancies.set(
            truckId, 
            (trucksWithDiscrepancies.get(truckId) || 0) + 1
          );
        }
      }
    });
    
    const newInsights: AIInsight[] = [];
    
    driversWithDiscrepancies.forEach((count, driverId) => {
      if (count >= 2) {
        const driver = getDriverById(driverId);
        if (driver) {
          newInsights.push({
            id: `insight-${uuidv4().substring(0, 8)}`,
            type: 'discrepancy_pattern',
            description: `Driver ${driver.name} has been involved in ${count} flagged deliveries with volume discrepancies. Consider additional monitoring or training.`,
            severity: count >= 3 ? 'high' : 'medium',
            relatedEntityIds: [driverId],
            generatedAt: new Date(),
            isRead: false
          });
        }
      }
    });
    
    trucksWithDiscrepancies.forEach((count, truckId) => {
      if (count >= 2) {
        const truck = getTruckById(truckId);
        if (truck) {
          newInsights.push({
            id: `insight-${uuidv4().substring(0, 8)}`,
            type: 'discrepancy_pattern',
            description: `Truck ${truck.plateNumber} has been involved in ${count} flagged deliveries with volume discrepancies. Consider mechanical inspection.`,
            severity: count >= 3 ? 'high' : 'medium',
            relatedEntityIds: [truckId],
            generatedAt: new Date(),
            isRead: false
          });
        }
      }
    });
    
    const totalDeliveries = purchaseOrders.filter(order => 
      order.deliveryDetails?.status === 'delivered'
    ).length;
    
    const discrepancyDeliveries = purchaseOrders.filter(order => 
      order.offloadingDetails?.isDiscrepancyFlagged
    ).length;
    
    if (totalDeliveries > 0) {
      const discrepancyRate = (discrepancyDeliveries / totalDeliveries) * 100;
      
      if (discrepancyRate > 15) {
        newInsights.push({
          id: `insight-${uuidv4().substring(0, 8)}`,
          type: 'efficiency_recommendation',
          description: `High volume discrepancy rate (${discrepancyRate.toFixed(1)}%) detected across deliveries. Consider implementing stricter volume verification at loading points and driver training programs.`,
          severity: 'high',
          relatedEntityIds: [],
          generatedAt: new Date(),
          isRead: false
        });
      } else if (discrepancyRate > 5) {
        newInsights.push({
          id: `insight-${uuidv4().substring(0, 8)}`,
          type: 'efficiency_recommendation',
          description: `Moderate volume discrepancy rate (${discrepancyRate.toFixed(1)}%) detected. Consider reviewing loading procedures and implementing spot checks.`,
          severity: 'medium',
          relatedEntityIds: [],
          generatedAt: new Date(),
          isRead: false
        });
      }
    }
    
    if (newInsights.length > 0) {
      setAIInsights(prev => [...newInsights, ...prev]);
      
      toast({
        title: "AI Insights Generated",
        description: `${newInsights.length} new insights have been generated based on delivery data.`,
      });
    } else {
      toast({
        title: "AI Analysis Complete",
        description: "No significant patterns found in the current delivery data.",
      });
    }
  };

  const markInsightAsRead = (id: string) => {
    setAIInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, isRead: true } : insight
      )
    );
  };

  const getOrdersWithDeliveryStatus = (status: 'pending' | 'in_transit' | 'delivered'): PurchaseOrder[] => {
    return purchaseOrders.filter(po => po.deliveryDetails?.status === status);
  };

  const getOrdersWithDiscrepancies = (): PurchaseOrder[] => {
    return purchaseOrders.filter(po => po.offloadingDetails?.isDiscrepancyFlagged);
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
        getAvailableTrucks,
        recordOffloadingDetails,
        addIncident,
        getOrdersWithDeliveryStatus,
        getOrdersWithDiscrepancies,
        aiInsights,
        generateDiscrepancyInsights,
        markInsightAsRead,
        tagTruckWithGPS,
        startDelivery,
        completeDelivery
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
