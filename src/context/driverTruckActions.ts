import { v4 as uuidv4 } from 'uuid';
import { Driver, Truck, PurchaseOrder, GPSData, LogEntry } from '../types';

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
  const logAction = (logEntry: Omit<LogEntry, 'timestamp'>) => {
    const newLogEntry: LogEntry = {
      ...logEntry,
      timestamp: new Date()
    };
    setLogs(prev => [newLogEntry, ...prev]);
  };

  const addDriver = (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Driver => {
    const newDriver: Driver = {
      ...driver,
      id: `driver-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDrivers(prev => [newDriver, ...prev]);
    
    logAction({
      action: 'create',
      entityId: newDriver.id,
      entityType: 'driver',
      details: `Driver ${newDriver.name} added`
    });
    
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>): Driver | undefined => {
    let updatedDriver: Driver | undefined;
    setDrivers(prev =>
      prev.map(driver => {
        if (driver.id === id) {
          updatedDriver = {
            ...driver,
            ...updates,
            updatedAt: new Date()
          };
          logAction({
            action: 'update',
            entityId: id,
            entityType: 'driver',
            details: `Driver ${updatedDriver.name} updated`
          });
          return updatedDriver;
        }
        return driver;
      })
    );
    return updatedDriver;
  };

  const deleteDriver = (id: string): boolean => {
    let deleted = false;
    setDrivers(prev => {
      const filtered = prev.filter(driver => driver.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    
    if (deleted) {
      logAction({
        action: 'delete',
        entityId: id,
        entityType: 'driver',
        details: `Driver ${id} deleted`
      });
    }
    
    return deleted;
  };

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
  };

  const addTruck = (truck: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Truck => {
    const newTruck: Truck = {
      ...truck,
      id: `truck-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTrucks(prev => [newTruck, ...prev]);
    
    logAction({
      action: 'create',
      entityId: newTruck.id,
      entityType: 'truck',
      details: `Truck ${newTruck.plateNumber} added`
    });
    
    return newTruck;
  };

  const updateTruck = (id: string, updates: Partial<Truck>): Truck | undefined => {
    let updatedTruck: Truck | undefined;
    setTrucks(prev =>
      prev.map(truck => {
        if (truck.id === id) {
          updatedTruck = {
            ...truck,
            ...updates,
            updatedAt: new Date()
          };
          logAction({
            action: 'update',
            entityId: id,
            entityType: 'truck',
            details: `Truck ${updatedTruck.plateNumber} updated`
          });
          return updatedTruck;
        }
        return truck;
      })
    );
    return updatedTruck;
  };

  const deleteTruck = (id: string): boolean => {
    let deleted = false;
    setTrucks(prev => {
      const filtered = prev.filter(truck => truck.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    
    if (deleted) {
      logAction({
        action: 'delete',
        entityId: id,
        entityType: 'truck',
        details: `Truck ${id} deleted`
      });
    }
    
    return deleted;
  };

  const getTruckById = (id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
  };

  const assignDriverToTruck = (driverId: string, truckId: string): boolean => {
    const driver = getDriverById(driverId);
    const truck = getTruckById(truckId);
    
    if (!driver || !truck) return false;
    
    // Update driver
    const updatedDriver = {
      ...driver,
      currentTruckId: truckId
    };
    
    setDrivers(prev => prev.map(d => d.id === driverId ? updatedDriver : d));
    
    // Update truck
    const updatedTruck = {
      ...truck,
      driverId: driverId,
      driverName: driver.name
    };
    
    setTrucks(prev => prev.map(t => t.id === truckId ? updatedTruck : t));
    
    logAction({
      action: 'update',
      entityId: truckId,
      entityType: 'truck',
      details: `Driver ${driver.name} assigned to truck ${truck.plateNumber}`
    });
    
    return true;
  };

  const removeDriverFromTruck = (truckId: string): boolean => {
    const truck = getTruckById(truckId);
    if (!truck || !truck.driverId) return false;
    
    const driverId = truck.driverId;
    const driver = getDriverById(driverId);
    
    if (driver) {
      // Update driver
      const updatedDriver = {
        ...driver,
        currentTruckId: undefined
      };
      setDrivers(prev => prev.map(d => d.id === driverId ? updatedDriver : d));
    }
    
    // Update truck
    const updatedTruck = {
      ...truck,
      driverId: undefined,
      driverName: undefined
    };
    setTrucks(prev => prev.map(t => t.id === truckId ? updatedTruck : t));
    
    logAction({
      action: 'update',
      entityId: truckId,
      entityType: 'truck',
      details: `Driver removed from truck ${truck.plateNumber}`
    });
    
    return true;
  };

  const simulateGPSDataForTruck = (truckId: string) => {
    const truck = getTruckById(truckId);
    if (!truck || !truck.hasGPS) return false;
    
    // Random location variation
    const latitude = 6.5244 + (Math.random() - 0.5) * 0.05;
    const longitude = 3.3792 + (Math.random() - 0.5) * 0.05;
    const speed = Math.floor(Math.random() * 80) + 10; // 10-90 km/h
    
    // Create a complete GPSData object with all required fields
    const newGPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId: truckId,
      latitude: latitude,
      longitude: longitude,
      speed: speed,
      timestamp: new Date(),
      fuelLevel: Math.floor(Math.random() * 40) + 60, // 60-100% fuel level
      location: 'In transit' // Default location
    };
    
    setGPSData(prev => [newGPSData, ...prev]);
    
    // Update truck with latest position
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          lastLatitude: latitude,
          lastLongitude: longitude,
          lastSpeed: speed
        };
      }
      return t;
    }));
    
    return true;
  };

  const tagTruckWithGPS = (truckId: string, deviceId: string) => {
    const truck = getTruckById(truckId);
    if (!truck) return false;
    
    // Update truck to show it has GPS
    const updatedTruck = {
      ...truck,
      hasGPS: true,
      isGPSTagged: true,
      gpsDeviceId: deviceId
    };
    
    setTrucks(prev => prev.map(t => t.id === truckId ? updatedTruck : t));
    
    // Create initial GPS record
    const initialGPSData = {
      id: `gps-${uuidv4().substring(0, 8)}`,
      truckId: truckId,
      latitude: 6.5244,
      longitude: 3.3792,
      speed: 0,
      timestamp: new Date(),
      fuelLevel: 100, // Full tank
      location: 'Depot' // Starting at depot
    };
    
    setGPSData(prev => [initialGPSData, ...prev]);
    
    // Log the action
    logAction({
      timestamp: new Date(),
      action: 'update',
      entityId: truckId,
      entityType: 'truck',
      details: `GPS Device ${deviceId} installed on truck ${truck.plateNumber}`
    });
    
    return true;
  };

  return {
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruckById,
    assignDriverToTruck,
    removeDriverFromTruck,
    simulateGPSDataForTruck,
    tagTruckWithGPS
  };
};
