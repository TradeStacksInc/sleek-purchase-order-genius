
import { StoredAppData, loadAppState, clearAppState } from './localStorage';

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
