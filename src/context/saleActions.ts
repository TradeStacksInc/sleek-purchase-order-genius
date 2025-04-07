
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sale } from '@/types';
import { STORAGE_KEYS } from '@/utils/localStorage/constants';
import { getPaginatedData } from '@/utils/localStorage';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { saveToLocalStorage } from '@/utils/localStorage';

export const useSaleActions = (
  sales: Sale[],
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>
) => {
  const addSale = useCallback((sale: Omit<Sale, 'id'>): Sale => {
    const newSale: Sale = {
      ...sale,
      id: uuidv4()
    };
    
    setSales(prev => [...prev, newSale]);
    saveToLocalStorage(STORAGE_KEYS.SALES, [...sales, newSale]);
    return newSale;
  }, [sales, setSales]);
  
  const updateSale = useCallback((id: string, saleUpdate: Partial<Sale>): Sale | null => {
    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return null;
    
    const updatedSale = {
      ...sales[saleIndex],
      ...saleUpdate
    };
    
    const newSales = [...sales];
    newSales[saleIndex] = updatedSale;
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    return updatedSale;
  }, [sales, setSales]);
  
  const deleteSale = useCallback((id: string): boolean => {
    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) return false;
    
    const newSales = sales.filter(s => s.id !== id);
    setSales(newSales);
    saveToLocalStorage(STORAGE_KEYS.SALES, newSales);
    return true;
  }, [sales, setSales]);
  
  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales.find(s => s.id === id);
  }, [sales]);
  
  const getAllSales = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Sale> => {
    return getPaginatedData(sales, params);
  }, [sales]);
  
  const getSalesForShift = useCallback((shiftId: string): Sale[] => {
    return sales.filter(sale => sale.shiftId === shiftId);
  }, [sales]);
  
  return {
    addSale,
    updateSale,
    deleteSale,
    getSaleById,
    getAllSales,
    getSalesForShift
  };
};
