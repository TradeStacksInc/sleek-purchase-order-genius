
import { Staff, Tank, ProductType, Product } from '@/types';
import { loadAppState, clearAppState, saveToLocalStorage } from './localStorage';
import { v4 as uuidv4 } from 'uuid';

// Database info utility
export const getDatabaseInfo = () => {
  return {
    size: "1.2 MB",
    lastBackup: new Date(),
    version: "1.0.0",
    lastReset: new Date(),
    recordCounts: {
      purchaseOrders: 12,
      suppliers: 5,
      drivers: 8,
      trucks: 6,
      staff: 10,
      dispensers: 8,
      tanks: 4,
      sales: 120
    },
    tables: {
      purchaseOrders: { count: 12 },
      suppliers: { count: 5 },
      drivers: { count: 8 },
      trucks: { count: 6 },
      staff: { count: 10 },
      dispensers: { count: 8 },
      tanks: { count: 4 },
      sales: { count: 120 }
    }
  };
};

// Database reset functionality
export const resetDatabase = (includeSeedData: boolean = true) => {
  // Clear all data from localStorage
  clearAppState();
  
  // If includeSeedData is true, initialize with sample data
  if (includeSeedData) {
    const staff = generateSampleStaff();
    const tanks = generateSampleTanks();
    
    saveToLocalStorage('staff', staff);
    saveToLocalStorage('tanks', tanks);
  }
  
  // Return success
  return true;
};

// Export database to JSON
export const exportDatabase = () => {
  // Get all data from localStorage
  const appState = loadAppState({
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
    activityLogs: [],
    tanks: []
  });
  
  // Convert to JSON string
  return JSON.stringify(appState, null, 2);
};

// Import database from JSON
export const importDatabase = (jsonData: string): boolean => {
  try {
    // Parse the JSON data
    const data = JSON.parse(jsonData);
    
    // Validate the data structure
    if (!data) return false;
    
    // Save each entity type to localStorage
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        saveToLocalStorage(key, data[key]);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    return false;
  }
};

// Sample data for dev/demo purposes
export const generateSampleStaff = () => {
  return [
    {
      id: "staff-001",
      name: "John Doe",
      role: "admin",
      email: "john@example.com",
      phone: "+234 800 1234567",
      address: "123 Main St, Lagos",
      contactPhone: "+234 800 1234567",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "staff-002",
      name: "Jane Smith",
      role: "manager",
      email: "jane@example.com",
      phone: "+234 800 7654321",
      address: "456 High St, Lagos",
      contactPhone: "+234 800 7654321",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "staff-003",
      name: "Mike Johnson",
      role: "operator",
      email: "mike@example.com",
      phone: "+234 800 1122334",
      address: "789 Low St, Lagos",
      contactPhone: "+234 800 1122334",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ] as Staff[];
};

export const generateSampleTanks = () => {
  return [
    {
      id: "tank-001",
      name: "PMS Storage Tank 1",
      capacity: 50000,
      productType: "PMS" as ProductType,
      currentVolume: 32000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-002",
      name: "AGO Storage Tank 1",
      capacity: 40000,
      productType: "AGO" as ProductType,
      currentVolume: 28000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-003",
      name: "PMS Storage Tank 2",
      capacity: 30000,
      productType: "PMS" as ProductType,
      currentVolume: 12000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-004",
      name: "DPK Storage Tank",
      capacity: 25000,
      productType: "DPK" as ProductType,
      currentVolume: 15000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-005",
      name: "AGO Storage Tank 2",
      capacity: 35000,
      productType: "AGO" as ProductType,
      currentVolume: 10000,
      status: "maintenance",
      isActive: false
    },
    {
      id: "tank-006",
      name: "PMS Reserve Tank",
      capacity: 20000,
      productType: "PMS" as ProductType,
      currentVolume: 5000,
      status: "operational",
      isActive: true
    }
  ] as Tank[];
};
