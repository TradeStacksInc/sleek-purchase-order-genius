
import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';

/**
 * A custom hook to log user authentication events
 */
export const useAuthLogger = () => {
  const { addActivityLog } = useApp();

  /**
   * Log a user login event
   */
  const logUserLogin = useCallback((userId: string, username: string): void => {
    addActivityLog({
      action: 'login',
      entityType: 'authentication',
      entityId: userId,
      details: `User ${username} logged in`,
      user: username
    });
  }, [addActivityLog]);

  /**
   * Log a user logout event
   */
  const logUserLogout = useCallback((userId: string, username: string): void => {
    addActivityLog({
      action: 'logout',
      entityType: 'authentication',
      entityId: userId,
      details: `User ${username} logged out`,
      user: username
    });
  }, [addActivityLog]);

  return {
    logUserLogin,
    logUserLogout
  };
};

export default useAuthLogger;
