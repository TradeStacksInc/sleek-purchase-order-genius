import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, Driver, Truck, GPSData, ActivityLog } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryActions = (
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  drivers: Driver[],
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>,
  trucks: Truck[],
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>,
  setLogs: React.Dispatch<React.SetStateAction<any[]>>,
  gpsData: GPSData[],
  setGPSData: React.Dispatch<React.SetStateAction<GPSData[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
  };

  const getTruckById = (id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
  };

  const updateDeliveryStatus = (orderId: string, status: 'pending' | 'in_transit' | 'delivered') => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                status: status
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to update delivery status. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Delivery status updated to ${status}`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Delivery Status Updated",
        description: `Delivery status updated to ${status} successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const assignDriverToDelivery = (orderId: string, driverId: string) => {
    try {
      const driver = getDriverById(driverId);
      if (!driver) {
        toast({
          title: "Error",
          description: "Driver not found.",
          variant: "destructive",
        });
        return false;
      }

      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                driverId: driverId
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to assign driver to delivery. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Driver ${driver.name} assigned to delivery`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Driver Assigned",
        description: `Driver ${driver.name} assigned to delivery successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error assigning driver to delivery:", error);
      toast({
        title: "Error",
        description: "Failed to assign driver to delivery. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const assignTruckToDelivery = (orderId: string, truckId: string) => {
    try {
      const truck = getTruckById(truckId);
      if (!truck) {
        toast({
          title: "Error",
          description: "Truck not found.",
          variant: "destructive",
        });
        return false;
      }

      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                truckId: truckId
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to assign truck to delivery. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Truck ${truck.plateNumber} assigned to delivery`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Truck Assigned",
        description: `Truck ${truck.plateNumber} assigned to delivery successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error assigning truck to delivery:", error);
      toast({
        title: "Error",
        description: "Failed to assign truck to delivery. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const recordDepotDeparture = (orderId: string, departureTime: Date) => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                depotDepartureTime: departureTime
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to record depot departure. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Depot departure recorded at ${departureTime.toLocaleTimeString()}`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Depot Departure Recorded",
        description: `Depot departure recorded successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error recording depot departure:", error);
      toast({
        title: "Error",
        description: "Failed to record depot departure. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const recordExpectedArrival = (orderId: string, arrivalTime: Date) => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                expectedArrivalTime: arrivalTime
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to record expected arrival. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Expected arrival recorded at ${arrivalTime.toLocaleTimeString()}`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Expected Arrival Recorded",
        description: `Expected arrival recorded successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error recording expected arrival:", error);
      toast({
        title: "Error",
        description: "Failed to record expected arrival. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const recordDestinationArrival = (orderId: string, arrivalTime: Date) => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                destinationArrivalTime: arrivalTime
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to record destination arrival. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Destination arrival recorded at ${arrivalTime.toLocaleTimeString()}`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Destination Arrival Recorded",
        description: `Destination arrival recorded successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error recording destination arrival:", error);
      toast({
        title: "Error",
        description: "Failed to record destination arrival. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTruckLocation = (truckId: string, latitude: number, longitude: number, speed: number) => {
    const truck = getTruckById(truckId);
    if (!truck) return null;
    
    // Create a complete GPSData object with all required fields
    const newGPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId: truckId,
      latitude: latitude,
      longitude: longitude,
      speed: speed,
      timestamp: new Date(),
      fuelLevel: 80, // Default value
      location: 'In transit' // Default value
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Update truck with latest position data
    const updatedTruck = {
      ...truck,
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastSpeed: speed
    };
    
    setTrucks(prev => 
      prev.map(t => t.id === truckId ? updatedTruck : t)
    );
    
    return newGPSData;
  };

  const recordDeliveryDistance = (orderId: string, totalDistance: number, distanceCovered: number) => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                totalDistance: totalDistance,
                distanceCovered: distanceCovered
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to record delivery distance. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'delivery',
        entityId: orderId,
        action: 'update',
        details: `Delivery distance recorded: Total ${totalDistance} km, Covered ${distanceCovered} km`,
        user: 'System',
        timestamp: new Date()
      };

      setActivityLogs(prev => [newActivityLog, ...prev]);

      toast({
        title: "Delivery Distance Recorded",
        description: `Delivery distance recorded successfully.`,
      });

      return true;
    } catch (error) {
      console.error("Error recording delivery distance:", error);
      toast({
        title: "Error",
        description: "Failed to record delivery distance. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    updateDeliveryStatus,
    assignDriverToDelivery,
    assignTruckToDelivery,
    recordDepotDeparture,
    recordExpectedArrival,
    recordDestinationArrival,
    updateTruckLocation,
    recordDeliveryDistance
  };
};
