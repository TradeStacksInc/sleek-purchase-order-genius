
import { saveToLocalStorage, getFromLocalStorage } from './core';
import { STORAGE_KEYS } from './constants';
import { PaginationParams, PaginatedResult } from './types';

export interface StoredAppData {
  purchaseOrders: any[];
  logs: any[];
  suppliers: any[];
  drivers: any[];
  trucks: any[];
  gpsData: any[];
  aiInsights: any[];
  staff: any[];
  dispensers: any[];
  shifts: any[];
  sales: any[];
  prices: any[];
  incidents: any[];
  activityLogs: any[];
  tanks: any[];
}

/**
 * Load all application data from localStorage
 */
export const loadAppState = (defaultState: Partial<StoredAppData>): StoredAppData => {
  return {
    purchaseOrders: getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, defaultState.purchaseOrders || []),
    logs: getFromLocalStorage(STORAGE_KEYS.LOGS, defaultState.logs || []),
    suppliers: getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, defaultState.suppliers || []),
    drivers: getFromLocalStorage(STORAGE_KEYS.DRIVERS, defaultState.drivers || []),
    trucks: getFromLocalStorage(STORAGE_KEYS.TRUCKS, defaultState.trucks || []),
    gpsData: getFromLocalStorage(STORAGE_KEYS.GPS_DATA, defaultState.gpsData || []),
    aiInsights: getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, defaultState.aiInsights || []),
    staff: getFromLocalStorage(STORAGE_KEYS.STAFF, defaultState.staff || []),
    dispensers: getFromLocalStorage(STORAGE_KEYS.DISPENSERS, defaultState.dispensers || []),
    shifts: getFromLocalStorage(STORAGE_KEYS.SHIFTS, defaultState.shifts || []),
    sales: getFromLocalStorage(STORAGE_KEYS.SALES, defaultState.sales || []),
    prices: getFromLocalStorage(STORAGE_KEYS.PRICES, defaultState.prices || []),
    incidents: getFromLocalStorage(STORAGE_KEYS.INCIDENTS, defaultState.incidents || []),
    activityLogs: getFromLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, defaultState.activityLogs || []),
    tanks: getFromLocalStorage(STORAGE_KEYS.TANKS, defaultState.tanks || [])
  };
};

/**
 * Save all application data to localStorage
 */
export const saveAppStateToLocalStorage = (state: StoredAppData): boolean => {
  try {
    saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, state.purchaseOrders);
    saveToLocalStorage(STORAGE_KEYS.LOGS, state.logs);
    saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, state.suppliers);
    saveToLocalStorage(STORAGE_KEYS.DRIVERS, state.drivers);
    saveToLocalStorage(STORAGE_KEYS.TRUCKS, state.trucks);
    saveToLocalStorage(STORAGE_KEYS.GPS_DATA, state.gpsData);
    saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, state.aiInsights);
    saveToLocalStorage(STORAGE_KEYS.STAFF, state.staff);
    saveToLocalStorage(STORAGE_KEYS.DISPENSERS, state.dispensers);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, state.shifts);
    saveToLocalStorage(STORAGE_KEYS.SALES, state.sales);
    saveToLocalStorage(STORAGE_KEYS.PRICES, state.prices);
    saveToLocalStorage(STORAGE_KEYS.INCIDENTS, state.incidents);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, state.activityLogs);
    saveToLocalStorage(STORAGE_KEYS.TANKS, state.tanks);
    
    return true;
  } catch (error) {
    console.error('Error saving app state:', error);
    return false;
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAppState = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.TRUCKS);
    localStorage.removeItem(STORAGE_KEYS.GPS_DATA);
    localStorage.removeItem(STORAGE_KEYS.AI_INSIGHTS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.DISPENSERS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.TANKS);
    
    return true;
  } catch (error) {
    console.error('Error clearing app state:', error);
    return false;
  }
};

/**
 * Get the application state from localStorage
 */
export const getAppStateFromLocalStorage = (): StoredAppData => {
  return loadAppState({});
};

/**
 * Pagination helper function
 */
export const getPaginatedData = <T>(data: T[], params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<T> => {
  const { page = 1, limit = 10 } = params;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / limit);
  
  return {
    data: paginatedData,
    page,
    pageSize: limit,
    totalItems: data.length,
    totalPages
  };
};
