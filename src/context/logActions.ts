
import { LogEntry, ActivityLog } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';

export const useLogActions = (
  logs: LogEntry[],
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  activityLogs: ActivityLog[],
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const getLogsByOrderId = (id: string) => {
    return logs.filter((log) => log.poId === id).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const logAIInteraction = (query: string, response: string) => {
    const newLog: LogEntry = {
      id: `log-${uuidv4()}`,
      poId: "system",
      action: `AI Interaction - User asked: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}" and received a response`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveToLocalStorage(STORAGE_KEYS.LOGS, updatedLogs);
    
    // Also record as an activity log
    const newActivityLog: ActivityLog = {
      id: `activity-${uuidv4()}`,
      entityType: 'staff',
      entityId: 'current-user',
      action: 'other',
      details: `AI Interaction: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`,
      user: 'Current User',
      timestamp: new Date()
    };
    
    const updatedActivityLogs = [newActivityLog, ...activityLogs];
    setActivityLogs(updatedActivityLogs);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, updatedActivityLogs);
  };
  
  const getActivityLogs = (params?: PaginationParams): PaginatedResult<ActivityLog> => {
    return getPaginatedData(activityLogs, params || { page: 1, limit: 10 });
  };

  const recordSystemActivity = (
    entityType: string,
    entityId: string,
    action: string,
    details: string,
    metadata?: Record<string, any>
  ): ActivityLog => {
    const newActivityLog: ActivityLog = {
      id: `activity-${uuidv4()}`,
      entityType: entityType as any,
      entityId,
      action: action as any,
      details,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
      ...(metadata ? { metadata } : {})
    };
    
    const updatedActivityLogs = [newActivityLog, ...activityLogs];
    setActivityLogs(updatedActivityLogs);
    saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, updatedActivityLogs);
    
    return newActivityLog;
  };

  const recordUserAction = (action: string, details: string): ActivityLog => {
    return recordSystemActivity('staff', 'current-user', action, details);
  };

  return {
    getLogsByOrderId,
    logAIInteraction,
    getActivityLogs,
    recordSystemActivity,
    recordUserAction
  };
};
