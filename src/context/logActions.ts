
import { v4 as uuidv4 } from 'uuid';
import { LogEntry, ActivityLog } from '@/types';
import { saveToLocalStorage, STORAGE_KEYS, PaginatedResult, PaginationParams } from '@/utils/localStorage';

// Configuration options
const CONFIG = {
  logPageVisits: false, // Set to false to disable automatic page visit logging
};

export const useLogActions = (
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  activityLogs: ActivityLog[],
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  // Log functions
  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    setLogs(prev => [newLog, ...prev]);
    saveToLocalStorage(STORAGE_KEYS.LOGS, [newLog, ...logs]);
    
    return newLog;
  };
  
  const deleteLog = (id: string): boolean => {
    let deleted = false;
    setLogs(prev => {
      const filtered = prev.filter(log => log.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });
    return deleted;
  };
  
  const getLogById = (id: string): LogEntry | undefined => {
    return logs.find(log => log.id === id);
  };
  
  const getAllLogs = (params?: PaginationParams): PaginatedResult<LogEntry> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const data = sortedLogs.slice(startIndex, endIndex);

    return {
      data,
      page,
      pageSize: limit,
      totalItems: logs.length,
      totalPages: Math.ceil(logs.length / limit)
    };
  };
  
  const getLogsByOrderId = (orderId: string): LogEntry[] => {
    return logs.filter(log => log.poId === orderId);
  };

  // Activity Logging Functions
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog => {
    // Skip page visit logs if disabled and this is a page visit
    if (!CONFIG.logPageVisits && log.action === 'visit' && log.entityType === 'page') {
      return {} as ActivityLog; // Return empty object but don't actually log
    }
    
    const newLog: ActivityLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, [newLog, ...activityLogs]);
    
    return newLog;
  };
  
  const clearAllActivityLogs = (): boolean => {
    setActivityLogs([]);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, []);
    return true;
  };
  
  const getAllActivityLogs = (params?: PaginationParams): PaginatedResult<ActivityLog> => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const sortedLogs = [...activityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const data = sortedLogs.slice(startIndex, endIndex);

    return {
      data,
      page,
      pageSize: limit,
      totalItems: activityLogs.length,
      totalPages: Math.ceil(activityLogs.length / limit)
    };
  };
  
  const getActivityLogsByEntityType = (entityType: string): ActivityLog[] => {
    return activityLogs.filter(log => log.entityType === entityType);
  };
  
  const getActivityLogsByAction = (action: string): ActivityLog[] => {
    return activityLogs.filter(log => log.action === action);
  };
  
  const getRecentActivityLogs = (limit: number = 10): ActivityLog[] => {
    return [...activityLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };
  
  const logFraudDetection = (description: string, severity: 'low' | 'medium' | 'high', entityId?: string): ActivityLog => {
    return addActivityLog({
      action: 'fraud_detection',
      entityType: 'security',
      entityId: entityId || 'system',
      details: `[${severity.toUpperCase()}] ${description}`,
      user: 'System',
      metadata: { severity }
    });
  };
  
  const logGpsActivity = (truckId: string, description: string): ActivityLog => {
    return addActivityLog({
      action: 'gps_activity',
      entityType: 'truck',
      entityId: truckId,
      details: description,
      user: 'System'
    });
  };
  
  const logAIInteraction = (prompt: string, response: string): LogEntry => {
    const interaction = prompt + " -> " + response.substring(0, 50) + "...";
    return addLog({
      action: 'ai_interaction',
      entityType: 'ai',
      entityId: 'system',
      details: interaction,
      user: 'Current User'
    });
  };

  // Toggle activity logging
  const setLogPageVisits = (enabled: boolean): void => {
    CONFIG.logPageVisits = enabled;
  };

  return {
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId,
    addActivityLog,
    clearAllActivityLogs,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs,
    logFraudDetection,
    logGpsActivity,
    logAIInteraction,
    setLogPageVisits
  };
};
