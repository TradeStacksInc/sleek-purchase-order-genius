import { StoredAppData, loadAppState, clearAppState } from './localStorage';

// Data schemas for the different entities
const SCHEMAS = {
  PURCHASE_ORDERS: {
    tableName: 'purchase_orders',
    indexes: ['id', 'poNumber', 'status', 'supplierId']
  },
  SUPPLIERS: {
    tableName: 'suppliers',
    indexes: ['id', 'name']
  },
  DRIVERS: {
    tableName: 'drivers',
    indexes: ['id', 'isAvailable']
  },
  TRUCKS: {
    tableName: 'trucks',
    indexes: ['id', 'isAvailable', 'hasGPS', 'isGPSTagged']
  },
  GPS_DATA: {
    tableName: 'gps_data',
    indexes: ['id', 'truckId', 'timestamp']
  },
  LOGS: {
    tableName: 'logs',
    indexes: ['id', 'poId', 'timestamp']
  },
  AI_INSIGHTS: {
    tableName: 'ai_insights',
    indexes: ['id', 'type', 'isRead']
  }
};

/**
 * Prepares data for migration to a database
 * This will be expanded when the actual database is implemented
 */
export const prepareDataForMigration = (): StoredAppData => {
  // Load all current data from local storage
  const appState = loadAppState({
    purchaseOrders: [],
    logs: [],
    suppliers: [],
    drivers: [],
    trucks: [],
    gpsData: [],
    aiInsights: []
  });
  
  return appState;
};

/**
 * Migrates data from local storage to an external database
 * This is a placeholder function that will be implemented when the database is ready
 */
export const migrateToDatabase = async (): Promise<boolean> => {
  try {
    // Get all data from local storage
    const data = prepareDataForMigration();
    
    // Validate the data before migration
    const validation = validateDataForMigration(data);
    if (!validation.valid) {
      console.error('Data validation failed:', validation.issues);
      return false;
    }
    
    // TODO: Implement actual database connection and migration
    console.log('Data ready for migration:', data);
    
    // For now, this is a placeholder for future implementation
    const migrationSuccessful = true;
    
    // If migration is successful, optionally clear local storage
    if (migrationSuccessful) {
      // This would likely be a user choice in the real implementation
      // clearAppState();
    }
    
    return migrationSuccessful;
  } catch (error) {
    console.error('Error during database migration:', error);
    return false;
  }
};

/**
 * Validates data before migration
 * Checks for potential issues that might cause migration failures
 */
export const validateDataForMigration = (data: StoredAppData): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for data integrity
  if (data.purchaseOrders.some(po => !po.id || !po.poNumber)) {
    issues.push('Some purchase orders have missing required fields');
  }
  
  if (data.suppliers.some(supplier => !supplier.id || !supplier.name)) {
    issues.push('Some suppliers have missing required fields');
  }
  
  if (data.drivers.some(driver => !driver.id || !driver.name)) {
    issues.push('Some drivers have missing required fields');
  }
  
  if (data.trucks.some(truck => !truck.id || !truck.plateNumber)) {
    issues.push('Some trucks have missing required fields');
  }
  
  // Check for broken references
  data.purchaseOrders.forEach(po => {
    if (po.deliveryDetails?.driverId && !data.drivers.some(d => d.id === po.deliveryDetails?.driverId)) {
      issues.push(`Purchase order ${po.poNumber} references non-existent driver ID ${po.deliveryDetails?.driverId}`);
    }
    
    if (po.deliveryDetails?.truckId && !data.trucks.some(t => t.id === po.deliveryDetails?.truckId)) {
      issues.push(`Purchase order ${po.poNumber} references non-existent truck ID ${po.deliveryDetails?.truckId}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Creates a database schema for future migration
 * This would be used when setting up a real database
 */
export const getDatabaseSchema = () => {
  return SCHEMAS;
};

/**
 * Function to check database health and optimize if needed
 */
export const optimizeLocalStorage = (): boolean => {
  try {
    // Check available space in localStorage
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    const estimatedSizeInMB = totalSize / (1024 * 1024);
    
    // If we're nearing the local storage limit (typically 5-10MB)
    if (estimatedSizeInMB > 4) {
      console.warn('Local storage is nearing capacity limits. Consider data cleanup.');
      
      // Optionally clean up old GPS data that's not necessary to keep
      const gpsData = JSON.parse(localStorage.getItem('gps_data') || '[]');
      if (gpsData.length > 1000) {
        // Keep only the most recent 1000 GPS data points
        const newGPSData = gpsData.sort((a: any, b: any) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }).slice(0, 1000);
        
        localStorage.setItem('gps_data', JSON.stringify(newGPSData));
        console.log('Optimized GPS data storage by removing older entries');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error optimizing local storage:', error);
    return false;
  }
};
