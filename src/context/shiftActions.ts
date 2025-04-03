
import { v4 as uuidv4 } from 'uuid';
import { Shift, Staff, ActivityLog } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const useShiftActions = (
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const startShift = (staffId: string): Shift => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) {
        throw new Error("Staff member not found");
      }
      
      // Check if staff already has an active shift
      const existingActiveShift = shifts.find(
        shift => shift.staffId === staffId && shift.status === 'active'
      );
      
      if (existingActiveShift) {
        toast({
          title: "Shift Already Active",
          description: `${staffMember.name} already has an active shift.`,
          variant: "destructive",
        });
        return existingActiveShift;
      }
      
      const newShift: Shift = {
        id: `shift-${uuidv4().substring(0, 8)}`,
        staffId,
        startTime: new Date(),
        status: 'active'
      };
      
      setShifts(prev => [newShift, ...prev]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'shift',
        entityId: newShift.id,
        action: 'create',
        details: `Started shift for ${staffMember.name}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Shift Started",
        description: `${staffMember.name}'s shift has been started.`,
      });
      
      return newShift;
    } catch (error) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error",
        description: "Failed to start shift. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const endShift = (shiftId: string): Shift | undefined => {
    try {
      let updatedShift: Shift | undefined;
      let staffMember: Staff | undefined;
      
      setShifts(prev => {
        const updatedShiftList = prev.map(shift => {
          if (shift.id === shiftId && shift.status === 'active') {
            updatedShift = {
              ...shift,
              endTime: new Date(),
              status: 'completed'
            };
            
            staffMember = staff.find(s => s.id === shift.staffId);
            return updatedShift;
          }
          return shift;
        });
        
        // If shift not found or not active, return unmodified list
        if (!updatedShift) return prev;
        
        return updatedShiftList;
      });
      
      if (updatedShift && staffMember) {
        // Log the action
        const newActivityLog: ActivityLog = {
          id: `log-${uuidv4()}`,
          entityType: 'shift',
          entityId: updatedShift.id,
          action: 'update',
          details: `Ended shift for ${staffMember.name}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Shift Ended",
          description: `${staffMember.name}'s shift has been ended.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Shift not found or already ended.",
          variant: "destructive",
        });
      }
      
      return updatedShift;
    } catch (error) {
      console.error("Error ending shift:", error);
      toast({
        title: "Error",
        description: "Failed to end shift. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const getShiftById = (id: string): Shift | undefined => {
    return shifts.find(shift => shift.id === id);
  };

  const getShiftsByStaffId = (staffId: string, params?: PaginationParams): PaginatedResult<Shift> => {
    const staffShifts = shifts.filter(shift => shift.staffId === staffId);
    return getPaginatedData(staffShifts, params || { page: 1, limit: 10 });
  };

  return {
    startShift,
    endShift,
    getShiftById,
    getShiftsByStaffId
  };
};
