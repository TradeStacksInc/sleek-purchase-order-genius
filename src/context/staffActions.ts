import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Staff } from '@/types';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage, PaginationParams, PaginatedResult } from '@/utils/localStorage';
import { getPaginatedData } from '@/utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const useStaffActions = (
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const addStaff = (staffData: Omit<Staff, 'id'>): Staff => {
    try {
      console.log("Adding staff:", staffData);
      
      const newStaff: Staff = {
        ...staffData,
        id: `staff-${uuidv4().substring(0, 8)}`
      };
      
      setStaff(prev => [newStaff, ...prev]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'staff',
        entityId: newStaff.id,
        action: 'create',
        details: `Added new staff member: ${newStaff.name}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Staff Added",
        description: `${newStaff.name} has been added successfully.`,
      });
      
      return newStaff;
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStaff = (id: string, data: Partial<Staff>): boolean => {
    try {
      let updated = false;
      
      setStaff(prev => {
        const updatedStaffList = prev.map(s => {
          if (s.id === id) {
            updated = true;
            return { ...s, ...data };
          }
          return s;
        });
        
        // If staff not found, return unmodified list
        if (!updated) return prev;
        
        return updatedStaffList;
      });
      
      if (updated) {
        // Log the action
        const staffMember = staff.find(s => s.id === id);
        const newActivityLog: ActivityLog = {
          id: `log-${uuidv4()}`,
          entityType: 'staff',
          entityId: id,
          action: 'update',
          details: `Updated staff member: ${staffMember?.name || id}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Staff Updated",
          description: `Staff member has been updated successfully.`,
        });
      }
      
      return updated;
    } catch (error) {
      console.error("Error updating staff:", error);
      toast({
        title: "Error",
        description: "Failed to update staff. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeStaff = (id: string): boolean => {
    try {
      const staffToRemove = staff.find(s => s.id === id);
      if (!staffToRemove) return false;
      
      setStaff(prev => prev.filter(s => s.id !== id));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'staff',
        entityId: id,
        action: 'delete',
        details: `Removed staff member: ${staffToRemove.name}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Staff Removed",
        description: `${staffToRemove.name} has been removed successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error removing staff:", error);
      toast({
        title: "Error",
        description: "Failed to remove staff. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getStaffById = (id: string): Staff | undefined => {
    return staff.find(s => s.id === id);
  };

  const getAllStaff = (params?: PaginationParams): PaginatedResult<Staff> => {
    return getPaginatedData(staff, params || { page: 1, limit: 10 });
  };

  return {
    addStaff,
    updateStaff,
    removeStaff,
    getStaffById,
    getAllStaff
  };
};
