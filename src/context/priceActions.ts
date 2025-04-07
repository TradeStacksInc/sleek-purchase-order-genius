
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Price, ProductType } from '@/types';
import { STORAGE_KEYS } from '@/utils/localStorage/constants';
import { getPaginatedData } from '@/utils/localStorage';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { saveToLocalStorage } from '@/utils/localStorage';

export const usePriceActions = (
  prices: Price[],
  setPrices: React.Dispatch<React.SetStateAction<Price[]>>
) => {
  const addPrice = useCallback((price: Omit<Price, 'id'>): Price => {
    const newPrice: Price = {
      ...price,
      id: uuidv4()
    };
    
    setPrices(prev => [...prev, newPrice]);
    saveToLocalStorage(STORAGE_KEYS.PRICES, [...prices, newPrice]);
    return newPrice;
  }, [prices, setPrices]);
  
  const updatePrice = useCallback((id: string, priceUpdate: Partial<Price>): Price | null => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) return null;
    
    const updatedPrice = {
      ...prices[priceIndex],
      ...priceUpdate
    };
    
    const newPrices = [...prices];
    newPrices[priceIndex] = updatedPrice;
    setPrices(newPrices);
    saveToLocalStorage(STORAGE_KEYS.PRICES, newPrices);
    return updatedPrice;
  }, [prices, setPrices]);
  
  const deletePrice = useCallback((id: string): boolean => {
    const priceIndex = prices.findIndex(p => p.id === id);
    if (priceIndex === -1) return false;
    
    const newPrices = prices.filter(p => p.id !== id);
    setPrices(newPrices);
    saveToLocalStorage(STORAGE_KEYS.PRICES, newPrices);
    return true;
  }, [prices, setPrices]);
  
  const getPriceById = useCallback((id: string): Price | undefined => {
    return prices.find(p => p.id === id);
  }, [prices]);
  
  const getAllPrices = useCallback((params: PaginationParams = { page: 1, limit: 10 }): PaginatedResult<Price> => {
    return getPaginatedData(prices, params);
  }, [prices]);
  
  const getCurrentPrices = useCallback((): Record<ProductType, number> => {
    const currentPrices: Partial<Record<ProductType, number>> = {};
    
    prices.forEach(price => {
      if (price.isActive) {
        currentPrices[price.productType as ProductType] = price.price;
      }
    });
    
    return currentPrices as Record<ProductType, number>;
  }, [prices]);
  
  return {
    addPrice,
    updatePrice,
    deletePrice,
    getPriceById,
    getAllPrices,
    getCurrentPrices
  };
};
