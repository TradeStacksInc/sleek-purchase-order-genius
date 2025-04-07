
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Price, ProductType, ActivityLog } from '@/types';
import { STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage, PaginationParams, PaginatedResult } from '@/utils/localStorage';
import { getPaginatedData } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

export const usePriceActions = (
  prices: Price[],
  setPrices: React.Dispatch<React.SetStateAction<Price[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const setPriceRecord = (priceData: Omit<Price, 'id' | 'effectiveDate'>): Price => {
    try {
      console.log("Setting price record:", priceData);
      
      // Deactivate existing active price records for this product
      const updatedPrices = prices.map(price => {
        // Compare product types as strings to avoid type issues
        if (String(price.productType) === String(priceData.productType) && price.isActive) {
          return {
            ...price,
            isActive: false,
            endDate: new Date()
          };
        }
        return price;
      });
      
      // Create the new price record
      const newPrice: Price = {
        ...priceData,
        id: `price-${uuidv4().substring(0, 8)}`,
        effectiveDate: new Date(),
        isActive: true
      };
      
      // Save both the updated old prices and the new price
      setPrices([newPrice, ...updatedPrices]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'price',
        entityId: newPrice.id,
        action: 'create',
        details: `Set new price for ${String(newPrice.productType)}: ${newPrice.price.toFixed(2)}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Price Updated",
        description: `${String(newPrice.productType)} price has been updated successfully.`,
      });
      
      return newPrice;
    } catch (error) {
      console.error("Error setting price:", error);
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getCurrentPrice = (productType: string): Price | undefined => {
    return prices.find(price => 
      String(price.productType) === String(productType) && price.isActive
    );
  };

  const getPriceHistory = (productType: string, params?: PaginationParams): PaginatedResult<Price> => {
    const filteredPrices = prices
      .filter(price => String(price.productType) === String(productType))
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
      
    return getPaginatedData(filteredPrices, params || { page: 1, limit: 10 });
  };

  return {
    setPriceRecord,
    getCurrentPrice,
    getPriceHistory
  };
};
