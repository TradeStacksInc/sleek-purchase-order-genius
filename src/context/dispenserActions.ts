
import { v4 as uuidv4 } from 'uuid';
import { Dispenser, ActivityLog, Sale } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useDispenserActions = (
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>,
  setSales?: React.Dispatch<React.SetStateAction<Sale[]>>
) => {
  const { toast } = useToast();

  const updateDispenser = (id: string, data: Partial<Dispenser>): Dispenser | undefined => {
    let updatedDispenser: Dispenser | undefined;
    
    setDispensers(prev => {
      const updated = prev.map(dispenser => {
        if (dispenser.id === id) {
          updatedDispenser = {
            ...dispenser,
            ...data
          };
          return updatedDispenser;
        }
        return dispenser;
      });
      
      return updated;
    });
    
    return updatedDispenser;
  };

  const resetDispenserShiftStats = (id: string): Dispenser | undefined => {
    try {
      let updatedDispenser: Dispenser | undefined;
      
      setDispensers(prev => {
        const updatedDispenserList = prev.map(dispenser => {
          if (dispenser.id === id) {
            updatedDispenser = {
              ...dispenser,
              currentShiftSales: 0,
              currentShiftVolume: 0,
              lastShiftReset: new Date()
            };
            return updatedDispenser;
          }
          return dispenser;
        });
        
        // If dispenser not found, return unmodified list
        if (!updatedDispenser) return prev;
        
        return updatedDispenserList;
      });
      
      if (updatedDispenser) {
        // Log the action
        const newActivityLog: ActivityLog = {
          id: `log-${uuidv4()}`,
          entityType: 'dispenser',
          entityId: updatedDispenser.id,
          action: 'update',
          details: `Reset shift stats for dispenser #${updatedDispenser.number}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Shift Reset",
          description: `Dispenser #${updatedDispenser.number}'s shift stats have been reset.`,
          variant: "default", // Changed from "success" to "default"
        });
      }
      
      return updatedDispenser;
    } catch (error) {
      console.error("Error resetting dispenser shift stats:", error);
      toast({
        title: "Error",
        description: "Failed to reset dispenser shift. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };
  

  const recordManualSale = (
    dispenserId: string,
    volume: number,
    amount: number,
    staffId: string,
    shiftId: string,
    paymentMethod: string = 'cash'
  ): boolean => {
    try {
      if (!setSales) {
        toast({
          title: "Error",
          description: "Sales functionality not available.",
          variant: "destructive",
        });
        return false;
      }
      
      const dispenser = dispensers.find(d => d.id === dispenserId);
      
      if (!dispenser) {
        toast({
          title: "Error",
          description: "Dispenser not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update the dispenser with new sales data
      const updatedDispenser = updateDispenser(dispenserId, {
        totalSales: (dispenser.totalSales || 0) + amount,
        totalVolume: (dispenser.totalVolume || 0) + volume,
        currentShiftSales: (dispenser.currentShiftSales || 0) + amount,
        currentShiftVolume: (dispenser.currentShiftVolume || 0) + volume,
        lastActivity: new Date()
      });
      
      // Create a new sale record
      const newSale: Sale = {
        id: `sale-${uuidv4().substring(0, 8)}`,
        dispenserId,
        dispenserNumber: dispenser.number,
        staffId,
        shiftId,
        volume,
        amount,
        productType: dispenser.productType,
        timestamp: new Date(),
        paymentMethod,
        isManualEntry: true
      };
      
      // Add the sale record
      setSales(prev => [newSale, ...prev]);
      
      // Log the activity
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'dispenser',
        entityId: dispenserId,
        action: 'sale',
        details: `Manual sale recorded: ${volume.toFixed(2)} L of ${dispenser.productType} for ₦${amount.toFixed(2)} on dispenser #${dispenser.number}`,
        user: staffId,
        timestamp: new Date(),
        metadata: {
          dispenserId,
          dispenserNumber: dispenser.number,
          staffId,
          shiftId,
          volume,
          amount,
          productType: dispenser.productType,
          paymentMethod,
          isManualEntry: true
        }
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Sale Recorded",
        description: `Manual sale of ${volume.toFixed(2)} L for ₦${amount.toFixed(2)} has been recorded.`,
        variant: "default", // Changed from "success" to "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error recording manual sale:", error);
      toast({
        title: "Error",
        description: "Failed to record manual sale. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    resetDispenserShiftStats,
    recordManualSale,
    updateDispenser
  };
};
