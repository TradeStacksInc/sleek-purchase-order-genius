import { v4 as uuidv4 } from 'uuid';
import { 
  Driver, Truck, PurchaseOrder, GPSData
} from '@/types';

export const useDriverTruckActions = (
  drivers: Driver[],
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>,
  trucks: Truck[],
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>,
  purchaseOrders: PurchaseOrder[],
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>,
  setLogs: React.Dispatch<React.SetStateAction<any[]>>,
  gpsData: GPSData[],
  setGPSData: React.Dispatch<React.SetStateAction<GPSData[]>>
) => {
  const addDriver = (driver: Omit<Driver, 'id'>): Driver => {
    const newDriver = {
      ...driver,
      id: `driver-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>): boolean => {
    let updated = false;
    setDrivers(prev => {
      const updatedDrivers = prev.map(driver => {
        if (driver.id === id) {
          updated = true;
          return { ...driver, ...updates, updatedAt: new Date() };
        }
        return driver;
      });
      return updatedDrivers;
    });
    return updated;
  };

  const deleteDriver = (id: string): boolean => {
    let deleted = false;
    setDrivers(prev => {
      const filteredDrivers = prev.filter(driver => driver.id !== id);
      deleted = filteredDrivers.length < prev.length;
      return filteredDrivers;
    });
    return deleted;
  };

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(driver => driver.id === id);
  };

  const getAllDrivers = (params?: { page: number; limit: number }): any => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const sortedDrivers = [...drivers].sort((a, b) => a.name.localeCompare(b.name));
    const data = sortedDrivers.slice(startIndex, endIndex);

    return {
      data,
      total: drivers.length,
      page,
      limit,
      totalPages: Math.ceil(drivers.length / limit)
    };
  };

  const addTruck = (truck: Omit<Truck, 'id'>): Truck => {
    const newTruck = {
      ...truck,
      id: `truck-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTrucks(prev => [...prev, newTruck]);
    return newTruck;
  };

  const updateTruck = (id: string, updates: Partial<Truck>): boolean => {
    let updated = false;
    setTrucks(prev => {
      const updatedTrucks = prev.map(truck => {
        if (truck.id === id) {
          updated = true;
          return { ...truck, ...updates, updatedAt: new Date() };
        }
        return truck;
      });
      return updatedTrucks;
    });
    return updated;
  };

  const deleteTruck = (id: string): boolean => {
    let deleted = false;
    setTrucks(prev => {
      const filteredTrucks = prev.filter(truck => truck.id !== id);
      deleted = filteredTrucks.length < prev.length;
      return filteredTrucks;
    });
    return deleted;
  };

  const getTruckById = (id: string): Truck | undefined => {
    return trucks.find(truck => truck.id === id);
  };

  const getAllTrucks = (params?: { page: number; limit: number }): any => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const sortedTrucks = [...trucks].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber));
    const data = sortedTrucks.slice(startIndex, endIndex);

    return {
      data,
      total: trucks.length,
      page,
      limit,
      totalPages: Math.ceil(trucks.length / limit)
    };
  };

  const tagTruckWithGPS = (
    truckId: string, 
    gpsDeviceId: string,
    initialLatitude: number,
    initialLongitude: number
  ) => {
    let success = false;
    
    setTrucks(prev => {
      const index = prev.findIndex(t => t.id === truckId);
      if (index === -1) return prev;
      
      const updatedTrucks = [...prev];
      updatedTrucks[index] = {
        ...updatedTrucks[index],
        isGPSTagged: true,
        gpsDeviceId,
        lastLatitude: initialLatitude,
        lastLongitude: initialLongitude,
        lastSpeed: 0,
        updatedAt: new Date()
      };
      
      success = true;
      return updatedTrucks;
    });
    
    if (success) {
      // Record initial GPS data
      const newGpsData = {
        id: `gps-${uuidv4().substring(0, 8)}`,
        truckId,
        latitude: initialLatitude,
        longitude: initialLongitude,
        speed: 0,
        timestamp: new Date(),
        fuelLevel: 100,
        location: 'Initial tagging location'
      };
      
      setGPSData(prev => [...prev, newGpsData]);
      
      // Log the tagging
      const logEntry = {
        id: `log-${uuidv4().substring(0, 8)}`,
        action: 'tag_gps',
        user: 'Admin',
        entityId: truckId,
        entityType: 'truck',
        details: `GPS device ${gpsDeviceId} tagged to truck`,
        timestamp: new Date()
      };
      
      setLogs(prev => [...prev, logEntry]);
    }
    
    return success;
  };

  const untagTruckGPS = (truckId: string) => {
    let success = false;
    
    setTrucks(prev => {
      const index = prev.findIndex(t => t.id === truckId);
      if (index === -1) return prev;
      
      const updatedTrucks = [...prev];
      updatedTrucks[index] = {
        ...updatedTrucks[index],
        isGPSTagged: false,
        gpsDeviceId: undefined,
        updatedAt: new Date()
      };
      
      success = true;
      return updatedTrucks;
    });
    
    if (success) {
      // Log the untagging
      const logEntry = {
        id: `log-${uuidv4().substring(0, 8)}`,
        action: 'untag_gps',
        user: 'Admin',
        entityId: truckId,
        entityType: 'truck',
        details: `GPS device untagged from truck`,
        timestamp: new Date()
      };
      
      setLogs(prev => [...prev, logEntry]);
    }
    
    return success;
  };

  return {
    addDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    getAllDrivers,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruckById,
    getAllTrucks,
    tagTruckWithGPS,
    untagTruckGPS
  };
};
