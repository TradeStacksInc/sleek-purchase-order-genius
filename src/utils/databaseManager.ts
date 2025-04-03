import { v4 as uuidv4 } from 'uuid';
import { clearAppState, initializeDatabase, getDatabaseMetadata } from './localStorage/appState';
import { STORAGE_KEYS } from './localStorage/constants';
import { saveToLocalStorage } from './localStorage/core';
import { StoredAppData } from './localStorage/types';
import { Staff, Dispenser, Tank, PriceRecord, Product } from '../types';

// This function will reset the database and optionally initialize with seed data
export const resetDatabase = (includeSeedData = false): void => {
  // Clear all existing data
  clearAppState();
  
  // If seed data is requested, initialize with default values
  if (includeSeedData) {
    const seedData = generateSeedData();
    initializeDatabase(seedData);
    return;
  }
  
  // Otherwise, initialize with empty collections
  initializeDatabase({
    purchaseOrders: [],
    logs: [],
    suppliers: [],
    drivers: [],
    trucks: [],
    gpsData: [],
    aiInsights: [],
    staff: [],
    dispensers: [],
    shifts: [],
    sales: [],
    prices: [],
    incidents: [],
    activityLogs: []
  });
};

// Generate minimal seed data for testing
export const generateSeedData = (): Partial<StoredAppData> => {
  // Create a few starter records for essential collections
  
  // Create default staff
  const defaultStaff: Staff[] = [{
    id: `staff-${uuidv4().substring(0, 8)}`,
    name: 'Admin User',
    role: 'Admin',
    contact: '+1234567890',
    email: 'admin@fuelstation.com',
    employeeId: 'EMP001',
    hireDate: new Date(),
    status: 'active'
  }];
  
  // Create default dispensers
  const defaultDispensers: Dispenser[] = [
    {
      id: `dispenser-${uuidv4().substring(0, 8)}`,
      number: 1,
      productType: 'PMS',
      status: 'operational',
      lastCalibrationDate: new Date(),
      nextCalibrationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      totalVolumeSold: 0,
      connectedTankId: `tank-pms-${uuidv4().substring(0, 8)}`
    },
    {
      id: `dispenser-${uuidv4().substring(0, 8)}`,
      number: 2,
      productType: 'AGO',
      status: 'operational',
      lastCalibrationDate: new Date(),
      nextCalibrationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      totalVolumeSold: 0,
      connectedTankId: `tank-ago-${uuidv4().substring(0, 8)}`
    }
  ];
  
  // Create default tanks
  const defaultTanks: Tank[] = [
    {
      id: defaultDispensers[0].connectedTankId!,
      name: 'PMS Tank 1',
      capacity: 33000,
      currentVolume: 15000,
      productType: 'PMS',
      lastRefillDate: new Date(),
      minVolume: 5000,
      status: 'operational',
      connectedDispensers: [defaultDispensers[0].id]
    },
    {
      id: defaultDispensers[1].connectedTankId!,
      name: 'AGO Tank 1',
      capacity: 33000,
      currentVolume: 20000,
      productType: 'AGO',
      lastRefillDate: new Date(),
      minVolume: 5000,
      status: 'operational',
      connectedDispensers: [defaultDispensers[1].id]
    }
  ];
  
  // Create default prices
  const defaultPrices: PriceRecord[] = [
    {
      id: `price-${uuidv4().substring(0, 8)}`,
      productType: 'PMS',
      purchasePrice: 550,
      sellingPrice: 617,
      effectiveDate: new Date(),
      isActive: true,
      setBy: defaultStaff[0].id
    },
    {
      id: `price-${uuidv4().substring(0, 8)}`,
      productType: 'AGO',
      purchasePrice: 625,
      sellingPrice: 700,
      effectiveDate: new Date(),
      isActive: true,
      setBy: defaultStaff[0].id
    }
  ];
  
  // Save tanks separately since they're not part of the main state
  saveToLocalStorage('tanks', defaultTanks);
  
  return {
    staff: defaultStaff,
    dispensers: defaultDispensers,
    prices: defaultPrices
  };
};

// Get database info for display
export const getDatabaseInfo = (): {
  version: string;
  lastReset: Date | null;
  recordCounts: Record<string, number>;
} => {
  const metadata = getDatabaseMetadata();
  
  // Count records in each collection
  const recordCounts: Record<string, number> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const data = localStorage.getItem(storageKey);
    recordCounts[key] = data ? JSON.parse(data).length : 0;
  });
  
  return {
    version: metadata.version,
    lastReset: metadata.lastReset,
    recordCounts
  };
};

// Check if database is initialized
export const isDatabaseInitialized = (): boolean => {
  return !!localStorage.getItem('db_metadata');
};

// Export database to JSON file
export const exportDatabase = (): string => {
  const exportData: Record<string, any> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const data = localStorage.getItem(storageKey);
    exportData[key] = data ? JSON.parse(data) : [];
  });
  
  return JSON.stringify(exportData, null, 2);
};

// Import database from JSON
export const importDatabase = (jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData);
    
    // Validate import data structure
    const requiredKeys = ['PURCHASE_ORDERS', 'SUPPLIERS', 'DRIVERS', 'TRUCKS'];
    const hasRequiredKeys = requiredKeys.every(key => key in importData);
    
    if (!hasRequiredKeys) {
      throw new Error('Import data is missing required collections');
    }
    
    // Clear existing data
    clearAppState();
    
    // Import each collection
    Object.entries(importData).forEach(([key, value]) => {
      const storageKey = (STORAGE_KEYS as any)[key];
      if (storageKey && Array.isArray(value)) {
        saveToLocalStorage(storageKey, value);
      }
    });
    
    // Update metadata
    setDatabaseMetadata({ version: DB_VERSION, lastReset: new Date() });
    
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    return false;
  }
};

// Create a migration function for future database structure updates
export const migrateDatabase = (fromVersion: string, toVersion: string): boolean => {
  try {
    // This will be implemented as the database schema evolves
    console.log(`Migrating database from ${fromVersion} to ${toVersion}`);
    
    // Example migration logic:
    // if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
    //   // Convert data structure from 1.0.0 to 1.1.0
    // }
    
    return true;
  } catch (error) {
    console.error('Error migrating database:', error);
    return false;
  }
};

// Set database metadata
const setDatabaseMetadata = (metadata: { version: string, lastReset: Date | null }): void => {
  localStorage.setItem('db_metadata', JSON.stringify(metadata));
};
