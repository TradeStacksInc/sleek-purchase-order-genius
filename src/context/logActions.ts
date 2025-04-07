
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, OrderStatus, ActivityLog, LogEntry } from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { getPaginatedData } from '@/utils/localStorage';

export const useLogActions = (
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  activityLogs: ActivityLog[],
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry => {
    const newLog: LogEntry = {
      ...log,
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date()
    };
    setLogs(prev => [...prev, newLog]);
    return newLog;
  };

  const deleteLog = (id: string): boolean => {
    let deleted = false;
    setLogs(prev => {
      const filteredLogs = prev.filter(log => log.id !== id);
      deleted = filteredLogs.length < prev.length;
      return filteredLogs;
    });
    return deleted;
  };

  const getLogById = (id: string): LogEntry | undefined => {
    return logs.find(log => log.id === id);
  };

  const getAllLogs = (params?: PaginationParams): PaginatedResult<LogEntry> => {
    // This will ensure the return type matches PaginatedResult exactly
    return getPaginatedData(logs, params || { page: 1, limit: 10 });
  };

  const getLogsByOrderId = (orderId: string): LogEntry[] => {
    return logs.filter(log => log.poId === orderId);
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog => {
    const newLog: ActivityLog = {
      ...log,
      id: `actlog-${uuidv4().substring(0, 8)}`,
      timestamp: new Date()
    };
    
    setActivityLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const getAllActivityLogs = (params?: PaginationParams): PaginatedResult<ActivityLog> => {
    return getPaginatedData(activityLogs, params || { page: 1, limit: 10 });
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

  return {
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId,
    addActivityLog,
    getAllActivityLogs,
    getActivityLogsByEntityType,
    getActivityLogsByAction,
    getRecentActivityLogs
  };
};
