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
    // Find the staff member
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) {
      throw new Error(`No staff member found with ID: ${staffId}`);
    }
    
    // Check if there's already an active shift for this staff
    const existingActiveShift = shifts.find(shift => 
      shift.staffId === staffId && 
      shift.status === 'active'
    );
    
    if (existingActiveShift) {
      toast({
        title: "Shift Already Active",
        description: `${staffMember.name} already has an active shift.`,
        variant: "destructive",
      });
      return existingActiveShift;
    }
    
    // Create a new shift with all required fields
    const newShift: Shift = {
      id: `shift-${uuidv4().substring(0, 8)}`,
      name: `${staffMember.name}'s Shift`,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + (8 * 60 * 60 * 1000)), // Default 8-hour shift
      staffMembers: [staffId],
      staffId: staffId,
      status: 'active',
      salesVolume: 0,
      salesAmount: 0
    };
    
    setShifts(prev => [newShift, ...prev]);
    
    // Log the action
    const newActivityLog: ActivityLog = {
      id: `log-${uuidv4()}`,
      entityType: 'shift',
      entityId: newShift.id,
      action: 'create',
      details: `Shift started by ${staffMember.name}`,
      user: staffMember.name,
      timestamp: new Date()
    };
    
    setActivityLogs(prev => [newActivityLog, ...prev]);
    
    toast({
      title: "Shift Started",
      description: `${staffMember.name} has started a new shift.`,
    });
    
    return newShift;
  };

  const endShift = (shiftId: string): Shift | undefined => {
    try {
      const shiftToEnd = shifts.find(shift => shift.id === shiftId);
      if (!shiftToEnd) {
        toast({
          title: "Error",
          description: "Shift not found.",
          variant: "destructive",
        });
        return undefined;
      }
      
      // Find the staff member
      const staffMember = staff.find(s => s.id === shiftToEnd.staffId);
      if (!staffMember) {
        throw new Error(`No staff member found with ID: ${shiftToEnd.staffId}`);
      }
      
      // Update the shift
      let updatedShift: Shift | undefined;
      setShifts(prev =>
        prev.map(shift => {
          if (shift.id === shiftId) {
            updatedShift = {
              ...shift,
              endTime: new Date(),
              status: 'completed'
            };
            return updatedShift;
          }
          return shift;
        })
      );
      
      if (!updatedShift) {
        toast({
          title: "Error",
          description: "Failed to end shift. Please try again.",
          variant: "destructive",
        });
        return undefined;
      }
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'shift',
        entityId: shiftId,
        action: 'update',
        details: `Shift ended by ${staffMember.name}`,
        user: staffMember.name,
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Shift Ended",
        description: `Shift for ${staffMember.name} has been ended.`,
      });
      
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
    const filteredShifts = shifts
      .filter(shift => shift.staffId === staffId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      
    return getPaginatedData(filteredShifts, params || { page: 1, limit: 10 });
  };
  
  return {
    startShift,
    endShift,
    getShiftById,
    getShiftsByStaffId
  };
};
