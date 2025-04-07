
// Only fixing the log entry sections that have errors
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, OrderStatus } from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { getPaginatedData } from '@/utils/localStorage';

export const useLogActions = (
  logs: any[],
  setLogs: React.Dispatch<React.SetStateAction<any[]>>,
  activityLogs: any[],
  setActivityLogs: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const addLog = (log: any) => {
    if (!log.id) {
      log.id = `log-${uuidv4().substring(0, 8)}`;
    }
    if (!log.timestamp) {
      log.timestamp = new Date();
    }
    setLogs([...logs, log]);
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const getLogById = (id: string) => {
    return logs.find(log => log.id === id);
  };

  const getAllLogs = (params?: PaginationParams): PaginatedResult<any> => {
    // This will ensure the return type matches PaginatedResult exactly
    return getPaginatedData(logs, params || { page: 1, limit: 10 });
  };

  const getLogsByOrderId = (orderId: string) => {
    return logs.filter(log => log.poId === orderId);
  };

  return {
    addLog,
    deleteLog,
    getLogById,
    getAllLogs,
    getLogsByOrderId
  };
};
