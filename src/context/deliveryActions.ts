
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, LogEntry, DeliveryDetails, OffloadingDetails, Incident, Driver, Truck } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  drivers: Driver[],
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>,
  trucks: Truck[],
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

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

  return {
    assignDriverToOrder,
    startDelivery,
    completeDelivery,
    updateDeliveryStatus,
    recordOffloadingDetails,
    addIncident
  };
};
