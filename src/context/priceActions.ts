
import { v4 as uuidv4 } from 'uuid';
import { PriceRecord, ActivityLog } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const usePriceActions = (
  prices: PriceRecord[],
  setPrices: React.Dispatch<React.SetStateAction<PriceRecord[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const setPriceRecord = (priceData: Omit<PriceRecord, 'id' | 'effectiveDate'>): PriceRecord => {
    try {
      console.log("Setting price record:", priceData);
      
      // Deactivate existing active price records for this product
      const updatedPrices = prices.map(price => {
        if (price.productType === priceData.productType && price.isActive) {
          return {
            ...price,
            isActive: false,
            endDate: new Date()
          };
        }
        return price;
      });
      
      // Create the new price record
      const newPrice: PriceRecord = {
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
        details: `Set new price for ${newPrice.productType}: Purchase ₦${newPrice.purchasePrice}, Selling ₦${newPrice.sellingPrice}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Price Updated",
        description: `${newPrice.productType} price has been updated successfully.`,
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

  const getCurrentPrice = (productType: string): PriceRecord | undefined => {
    return prices.find(price => price.productType === productType && price.isActive);
  };

  const getPriceHistory = (productType: string, params?: PaginationParams): PaginatedResult<PriceRecord> => {
    const filteredPrices = prices
      .filter(price => price.productType === productType)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
      
    return getPaginatedData(filteredPrices, params || { page: 1, limit: 10 });
  };

  return {
    setPriceRecord,
    getCurrentPrice,
    getPriceHistory
  };
};
