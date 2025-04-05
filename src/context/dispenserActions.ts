
import { v4 as uuidv4 } from 'uuid';
import { Dispenser, ActivityLog, Tank, Sale, Shift } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const useDispenserActions = (
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>,
  tanks?: Tank[],
  setTanks?: React.Dispatch<React.SetStateAction<Tank[]>>,
  getCurrentPrice?: (productType: string) => { sellingPrice: number } | undefined,
  shifts?: Shift[],
  sales?: Sale[]
) => {
  const { toast } = useToast();

  const addDispenser = (dispenserData: Omit<Dispenser, 'id'>): Dispenser => {
    try {
      console.log("Adding dispenser:", dispenserData);
      
      const newDispenser: Dispenser = {
        ...dispenserData,
        id: `dispenser-${uuidv4().substring(0, 8)}`,
        totalVolumeSold: 0,
        isActive: false,
        currentShiftVolume: 0,
        salesAmount: 0,
        status: dispenserData.status || 'operational'
      };
      
      setDispensers(prev => [newDispenser, ...prev]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'dispenser',
        entityId: newDispenser.id,
        action: 'create',
        details: `Added new dispenser #${newDispenser.number} for ${newDispenser.productType}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Dispenser Added",
        description: `Dispenser #${newDispenser.number} has been added successfully.`,
      });
      
      return newDispenser;
    } catch (error) {
      console.error("Error adding dispenser:", error);
      toast({
        title: "Error",
        description: "Failed to add dispenser. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDispenser = (id: string, data: Partial<Dispenser>): Dispenser | undefined => {
    try {
      let updatedDispenser: Dispenser | undefined;
      
      setDispensers(prev => {
        const updatedDispenserList = prev.map(d => {
          if (d.id === id) {
            updatedDispenser = { ...d, ...data };
            return updatedDispenser;
          }
          return d;
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
          details: `Updated dispenser #${updatedDispenser.number}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Dispenser Updated",
          description: `Dispenser #${updatedDispenser.number} has been updated successfully.`,
        });
      }
      
      return updatedDispenser;
    } catch (error) {
      console.error("Error updating dispenser:", error);
      toast({
        title: "Error",
        description: "Failed to update dispenser. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const deleteDispenser = (id: string): boolean => {
    try {
      const dispenserToDelete = dispensers.find(d => d.id === id);
      
      if (!dispenserToDelete) {
        toast({
          title: "Error",
          description: "Dispenser not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if dispenser is active
      if (dispenserToDelete.isActive) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete an active dispenser. Deactivate it first.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if dispenser is connected to a tank
      if (dispenserToDelete.connectedTankId && tanks && setTanks) {
        // Update the tank to remove this dispenser
        setTanks(prev => prev.map(tank => {
          if (tank.id === dispenserToDelete.connectedTankId) {
            return {
              ...tank,
              connectedDispensers: tank.connectedDispensers.filter(dId => dId !== id)
            };
          }
          return tank;
        }));
      }
      
      setDispensers(prev => prev.filter(d => d.id !== id));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'dispenser',
        entityId: id,
        action: 'delete',
        details: `Deleted dispenser #${dispenserToDelete.number}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Dispenser Deleted",
        description: `Dispenser #${dispenserToDelete.number} has been removed from the system.`,
        variant: "success",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting dispenser:", error);
      toast({
        title: "Error",
        description: "Failed to delete dispenser. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getDispenserById = (id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  };

  const getAllDispensers = (params?: PaginationParams): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params || { page: 1, limit: 10 });
  };

  const setDispenserActive = (id: string, isActive: boolean): Dispenser | undefined => {
    try {
      const dispenser = dispensers.find(d => d.id === id);
      
      if (!dispenser) {
        toast({
          title: "Error",
          description: "Dispenser not found.",
          variant: "destructive",
        });
        return undefined;
      }
      
      // Check if dispenser is connected to a tank
      if (isActive && !dispenser.connectedTankId) {
        toast({
          title: "Cannot Activate",
          description: "Dispenser must be connected to a tank before activation.",
          variant: "destructive",
        });
        return undefined;
      }
      
      // If activating, also check the tank has fuel
      if (isActive && tanks && dispenser.connectedTankId) {
        const tank = tanks.find(t => t.id === dispenser.connectedTankId);
        if (!tank || tank.currentVolume <= 0) {
          toast({
            title: "Cannot Activate",
            description: "Connected tank is empty. Please refill the tank first.",
            variant: "destructive",
          });
          return undefined;
        }
        
        // Activate the tank as well
        if (tank && setTanks && !tank.isActive) {
          setTanks(prev => prev.map(t => {
            if (t.id === dispenser.connectedTankId) {
              return { ...t, isActive: true };
            }
            return t;
          }));
        }
      }
      
      return updateDispenser(id, { isActive });
    } catch (error) {
      console.error("Error setting dispenser active state:", error);
      toast({
        title: "Error",
        description: "Failed to update dispenser state. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const recordDispensing = (id: string, volume: number, staffId: string, shiftId: string): boolean => {
    try {
      const dispenser = dispensers.find(d => d.id === id);
      
      if (!dispenser) {
        toast({
          title: "Error",
          description: "Dispenser not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if dispenser is active
      if (!dispenser.isActive) {
        toast({
          title: "Cannot Dispense",
          description: "Dispenser is not active. Please activate it first.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if dispenser is connected to a tank
      if (!dispenser.connectedTankId || !tanks || !setTanks) {
        toast({
          title: "Cannot Dispense",
          description: "Dispenser is not connected to a tank.",
          variant: "destructive",
        });
        return false;
      }
      
      // Get the tank
      const tank = tanks.find(t => t.id === dispenser.connectedTankId);
      if (!tank) {
        toast({
          title: "Error",
          description: "Connected tank not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if tank has enough fuel
      if (tank.currentVolume < volume) {
        toast({
          title: "Insufficient Fuel",
          description: `Tank only has ${tank.currentVolume.toLocaleString()} liters remaining.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Get current price
      const currentPrice = getCurrentPrice?.(dispenser.productType);
      if (!currentPrice) {
        toast({
          title: "Error",
          description: "Product price not set. Please set a price for this product.",
          variant: "destructive",
        });
        return false;
      }
      
      const totalAmount = volume * currentPrice.sellingPrice;
      
      // Update tank volume
      setTanks(prev => prev.map(t => {
        if (t.id === dispenser.connectedTankId) {
          return {
            ...t,
            currentVolume: t.currentVolume - volume
          };
        }
        return t;
      }));
      
      // Update dispenser stats
      const updatedDispenser = updateDispenser(id, {
        totalVolumeSold: (dispenser.totalVolumeSold || 0) + volume,
        currentShiftVolume: (dispenser.currentShiftVolume || 0) + volume,
        salesAmount: (dispenser.salesAmount || 0) + totalAmount
      });
      
      // Create a sale record if possible
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'dispenser',
        entityId: id,
        action: 'update',
        details: `Dispensed ${volume.toLocaleString()} liters of ${dispenser.productType} for ₦${totalAmount.toLocaleString()}`,
        user: staffId,
        timestamp: new Date(),
        metadata: {
          volume,
          productType: dispenser.productType,
          unitPrice: currentPrice.sellingPrice,
          totalAmount,
          tankId: dispenser.connectedTankId,
          staffId,
          shiftId,
          operation: 'dispense'
        }
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Dispensing Recorded",
        description: `Successfully dispensed ${volume.toLocaleString()} liters for ₦${totalAmount.toLocaleString()}.`,
        variant: "success",
      });
      
      return true;
    } catch (error) {
      console.error("Error recording dispensing:", error);
      toast({
        title: "Error",
        description: "Failed to record dispensing. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetDispenserShiftStats = (id: string): Dispenser | undefined => {
    try {
      const dispenser = dispensers.find(d => d.id === id);
      
      if (!dispenser) {
        toast({
          title: "Error",
          description: "Dispenser not found.",
          variant: "destructive",
        });
        return undefined;
      }
      
      return updateDispenser(id, {
        currentShiftVolume: 0,
        salesAmount: 0
      });
    } catch (error) {
      console.error("Error resetting dispenser shift stats:", error);
      toast({
        title: "Error",
        description: "Failed to reset dispenser stats. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const getDispenserSalesStats = (id: string, dateRange?: { start: Date; end: Date }) => {
    if (!sales) return { volume: 0, amount: 0, transactions: 0 };
    
    const filteredSales = sales.filter(sale => {
      const matchesDispenser = sale.dispenserId === id;
      
      if (!dateRange) return matchesDispenser;
      
      const saleDate = new Date(sale.timestamp);
      return (
        matchesDispenser &&
        saleDate >= dateRange.start &&
        saleDate <= dateRange.end
      );
    });
    
    return {
      volume: filteredSales.reduce((sum, sale) => sum + sale.volume, 0),
      amount: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      transactions: filteredSales.length
    };
  };

  return {
    addDispenser,
    updateDispenser,
    deleteDispenser,
    getDispenserById,
    getAllDispensers,
    setDispenserActive,
    recordDispensing,
    resetDispenserShiftStats,
    getDispenserSalesStats
  };
};
