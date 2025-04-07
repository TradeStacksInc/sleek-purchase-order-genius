
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Shift } from '@/types';
import { STORAGE_KEYS } from '@/utils/localStorage/constants';
import { getPaginatedData } from '@/utils/localStorage';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { saveToLocalStorage } from '@/utils/localStorage';

export const useShiftActions = (
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>
) => {
  const addShift = useCallback((shift: Omit<Shift, 'id'>): Shift => {
    const newShift: Shift = {
      ...shift,
      id: uuidv4()
    };
    
    setShifts(prev => [...prev, newShift]);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, [...shifts, newShift]);
    return newShift;
  }, [shifts, setShifts]);
  
  const updateShift = useCallback((id: string, shiftUpdate: Partial<Shift>): Shift | null => {
    const shiftIndex = shifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return null;
    
    const updatedShift = {
      ...shifts[shiftIndex],
      ...shiftUpdate
    };
    
    const newShifts = [...shifts];
    newShifts[shiftIndex] = updatedShift;
    setShifts(newShifts);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, newShifts);
    return updatedShift;
  }, [shifts, setShifts]);
  
  const deleteShift = useCallback((id: string): boolean => {
    const shiftIndex = shifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return false;
    
    const newShifts = shifts.filter(s => s.id !== id);
    setShifts(newShifts);
    saveToLocalStorage(STORAGE_KEYS.SHIFTS, newShifts);
    return true;
  }, [shifts, setShifts]);
  
  const getShiftById = useCallback((id: string): Shift | undefined => {
    return shifts.find(s => s.id === id);
  }, [shifts]);
  
  const getAllShifts = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Shift> => {
    return getPaginatedData(shifts, params);
  }, [shifts]);
  
  const getCurrentShift = useCallback((): Shift | null => {
    return shifts.find(s => s.status === 'active') || null;
  }, [shifts]);
  
  return {
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getAllShifts,
    getCurrentShift
  };
};
