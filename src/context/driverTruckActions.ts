import { v4 as uuidv4 } from 'uuid';
import { Driver, Truck, PurchaseOrder, LogEntry, DeliveryDetails, GPSData } from '../types';
import { useToast } from '@/hooks/use-toast';
import GPSTrackingService from '@/services/GPSTrackingService'; 

export const useDriverTruckActions = (
  drivers: Driver[],
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>,
  trucks: Truck[],
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>,
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  gpsData: GPSData[],
  setGPSData: React.Dispatch<React.SetStateAction<GPSData[]>>
) => {
  const { toast } = useToast();

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    try {
      console.log("Adding driver:", driverData);
      
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
    } catch (error) {
      console.error("Error adding driver:", error);
      toast({
        title: "Error",
        description: "Failed to add driver. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const addTruck = (truckData: Omit<Truck, 'id'>) => {
    try {
      console.log("Adding truck:", truckData);
      
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
    } catch (error) {
      console.error("Error adding truck:", error);
      toast({
        title: "Error",
        description: "Failed to add truck. Please try again.",
        variant: "destructive",
      });
      return null;
    }
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

  const getGPSTaggedTrucks = (): Truck[] => {
    return trucks.filter(truck => truck.hasGPS && truck.isGPSTagged);
  };

  const getNonTaggedTrucks = (): Truck[] => {
    return trucks.filter(truck => truck.hasGPS && !truck.isGPSTagged);
  };

  const getNonGPSTrucks = (): Truck[] => {
    return trucks.filter(truck => !truck.hasGPS);
  };

  const tagTruckWithGPS = (truckId: string, gpsDeviceId: string, initialLatitude: number, initialLongitude: number) => {
    try {
      console.log("Tagging truck with GPS:", truckId, gpsDeviceId);
      
      const truck = trucks.find(t => t.id === truckId);
      
      if (!truck) {
        console.error("Could not find truck with the provided ID.");
        toast({
          title: "Error",
          description: "Could not find truck with the provided ID.",
          variant: "destructive"
        });
        return;
      }
      
      if (!truck.hasGPS) {
        console.error("This truck does not have GPS capability.");
        toast({
          title: "Error",
          description: "This truck does not have GPS capability.",
          variant: "destructive"
        });
        return;
      }
      
      // Update truck with GPS device information
      setTrucks(prevTrucks =>
        prevTrucks.map(t => 
          t.id === truckId 
            ? { 
                ...t, 
                isGPSTagged: true, 
                gpsDeviceId,
                lastLatitude: initialLatitude,
                lastLongitude: initialLongitude,
                lastUpdate: new Date()
              } 
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
    } catch (error) {
      console.error("Error tagging truck with GPS:", error);
      toast({
        title: "Error",
        description: "Failed to tag truck with GPS. Please try again.",
        variant: "destructive",
      });
    }
  };

  const untagTruckGPS = (truckId: string) => {
    try {
      const truck = trucks.find(t => t.id === truckId);
      
      if (!truck) {
        console.error("Could not find truck with the provided ID.");
        return;
      }
      
      // Stop any active GPS tracking
      const gpsService = GPSTrackingService.getInstance();
      if (gpsService.isTracking(truckId)) {
        gpsService.stopTracking(truckId);
      }
      
      // Update truck to remove GPS tagging
      setTrucks(prevTrucks =>
        prevTrucks.map(t => 
          t.id === truckId 
            ? { 
                ...t, 
                isGPSTagged: false, 
                gpsDeviceId: undefined,
                lastLatitude: undefined,
                lastLongitude: undefined,
                lastSpeed: undefined,
                lastUpdate: undefined
              } 
            : t
        )
      );
      
      // Log the GPS untagging
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: "system",
        action: `GPS device untagged from truck ${truck.plateNumber}`,
        user: 'Current User',
        timestamp: new Date(),
      };
      
      setLogs(prev => [newLog, ...prev]);
      
      toast({
        title: "GPS Untagged",
        description: `GPS device has been removed from truck ${truck.plateNumber}.`,
      });
    } catch (error) {
      console.error("Error untagging truck GPS:", error);
      toast({
        title: "Error",
        description: "Failed to untag truck GPS. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateGPSData = (truckId: string, latitude: number, longitude: number, speed: number) => {
    try {
      const newGPSData: GPSData = {
        id: `gps-${Date.now()}`,
        truckId,
        latitude,
        longitude,
        speed,
        timestamp: new Date()
      };
      
      // Add to GPS data with limit to prevent excessive memory usage
      setGPSData(prev => {
        // Keep only the latest 1000 GPS points total
        let newData = [newGPSData, ...prev];
        if (newData.length > 1000) {
          newData = newData.slice(0, 1000);
        }
        return newData;
      });
      
      // Update truck's last known position
      setTrucks(prevTrucks =>
        prevTrucks.map(t => 
          t.id === truckId 
            ? { 
                ...t, 
                lastLatitude: latitude,
                lastLongitude: longitude,
                lastSpeed: speed,
                lastUpdate: new Date()
              } 
            : t
        )
      );
      
      // Update PO details for in-transit orders
      setPurchaseOrders(prevOrders =>
        prevOrders.map(po => {
          if (po.deliveryDetails?.truckId === truckId && po.deliveryDetails.status === 'in_transit') {
            // Calculate remaining distance and ETA
            const distanceCovered = po.deliveryDetails.distanceCovered || 0;
            const totalDistance = po.deliveryDetails.totalDistance || 100;
            
            // Update with new position info
            const newDistanceCovered = Math.min(distanceCovered + (speed * 0.01), totalDistance);
            const remainingDistance = Math.max(0, totalDistance - newDistanceCovered);
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
    } catch (error) {
      console.error("Error updating GPS data:", error);
      // Not showing toast here as this function is called frequently
    }
  };

  return {
    addDriver,
    addTruck,
    getDriverById,
    getTruckById,
    getAvailableDrivers,
    getAvailableTrucks,
    getGPSTaggedTrucks,
    getNonTaggedTrucks,
    getNonGPSTrucks,
    tagTruckWithGPS,
    untagTruckGPS,
    updateGPSData
  };
};
