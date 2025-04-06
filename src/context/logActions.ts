
import { v4 as uuidv4 } from 'uuid';
import { LogEntry, ActivityLog } from '@/types';

export const useLogActions = (
  logs: any[],
  setLogs: React.Dispatch<React.SetStateAction<any[]>>,
  activityLogs: ActivityLog[],
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const addLog = (log: any) => {
    const newLog = {
      id: log.id || `log-${uuidv4().substring(0, 8)}`,
      timestamp: log.timestamp || new Date(),
      action: log.action || 'create',
      user: log.user || 'Admin',
      details: log.details || '',
      entityType: log.entityType || 'general',
      entityId: log.entityId || '',
      poId: log.poId || ''
    };
    
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const addLogEntry = (action: string, details: string, poId?: string) => {
    const newLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action,
      user: 'Admin',
      entityType: 'purchase_order',
      entityId: poId || '',
      poId: poId || '',
      details
    };
    
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const deleteLog = (id: string) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
  };

  const getLogById = (id: string) => {
    return logs.find((log) => log.id === id);
  };

  const getLogsByOrderId = (orderId: string) => {
    return logs.filter(log => log.poId === orderId || log.entityId === orderId);
  };

  const getAllLogs = (params?: { page: number; limit: number }) => {
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
      total: logs.length,
      page,
      limit,
      totalPages: Math.ceil(logs.length / limit)
    };
  };

  return {
    addLog,
    addLogEntry,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId
  };
};
