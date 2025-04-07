
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Staff } from '@/types';
import { STORAGE_KEYS } from '@/utils/localStorage/constants';
import { getPaginatedData } from '@/utils/localStorage';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { saveToLocalStorage } from '@/utils/localStorage';

export const useStaffActions = (
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const addStaff = useCallback((staffMember: Omit<Staff, 'id'>): Staff => {
    const now = new Date();
    const newStaff: Staff = {
      ...staffMember,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    setStaff(prev => [...prev, newStaff]);
    saveToLocalStorage(STORAGE_KEYS.STAFF, [...staff, newStaff]);
    return newStaff;
  }, [staff, setStaff]);
  
  const updateStaff = useCallback((id: string, staffUpdate: Partial<Staff>): Staff | null => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return null;
    
    const updatedStaff = {
      ...staff[staffIndex],
      ...staffUpdate,
      updatedAt: new Date()
    };
    
    const newStaffList = [...staff];
    newStaffList[staffIndex] = updatedStaff;
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    return updatedStaff;
  }, [staff, setStaff]);
  
  const deleteStaff = useCallback((id: string): boolean => {
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) return false;
    
    const newStaffList = staff.filter(s => s.id !== id);
    setStaff(newStaffList);
    saveToLocalStorage(STORAGE_KEYS.STAFF, newStaffList);
    return true;
  }, [staff, setStaff]);
  
  const getStaffById = useCallback((id: string): Staff | undefined => {
    return staff.find(s => s.id === id);
  }, [staff]);
  
  const getAllStaff = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Staff> => {
    return getPaginatedData(staff, params);
  }, [staff]);
  
  const getActiveStaff = useCallback((): Staff[] => {
    return staff.filter(s => s.isActive);
  }, [staff]);
  
  return {
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    getAllStaff,
    getActiveStaff
  };
};
