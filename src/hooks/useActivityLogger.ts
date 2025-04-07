
import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useLocation } from 'react-router-dom';
import { LogEntry, ActivityLog } from '@/types';

interface LogActivityOptions {
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  user?: string;
  metadata?: Record<string, any>;
}

/**
 * A custom hook to provide consistent activity logging throughout the application
 */
export const useActivityLogger = () => {
  const { addActivityLog } = useApp();
  const location = useLocation();

  /**
   * Log a user activity
   */
  const logActivity = useCallback(
    ({ action, entityType, entityId, details, user = 'Current User', metadata }: LogActivityOptions): ActivityLog => {
      return addActivityLog({
        action,
        entityType,
        entityId,
        details,
        user,
        metadata
      });
    },
    [addActivityLog]
  );

  /**
   * Log a page visit
   */
  const logPageVisit = useCallback(
    (pageName: string): ActivityLog => {
      return logActivity({
        action: 'visit',
        entityType: 'page',
        entityId: location.pathname,
        details: `User visited ${pageName} page`
      });
    },
    [logActivity, location.pathname]
  );

  /**
   * Log a user action (create, update, delete, etc.)
   */
  const logUserAction = useCallback(
    (action: string, entityType: string, entityId: string, details: string): ActivityLog => {
      return logActivity({
        action,
        entityType,
        entityId,
        details
      });
    },
    [logActivity]
  );

  /**
   * Log a system event
   */
  const logSystemEvent = useCallback(
    (action: string, entityType: string, entityId: string, details: string): ActivityLog => {
      return logActivity({
        action,
        entityType,
        entityId,
        details,
        user: 'System'
      });
    },
    [logActivity]
  );

  return {
    logActivity,
    logPageVisit,
    logUserAction,
    logSystemEvent
  };
};

export default useActivityLogger;
