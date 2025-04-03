
import { v4 as uuidv4 } from 'uuid';
import { Dispenser, ActivityLog } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const useDispenserActions = (
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const addDispenser = (dispenserData: Omit<Dispenser, 'id'>): Dispenser => {
    try {
      console.log("Adding dispenser:", dispenserData);
      
      const newDispenser: Dispenser = {
        ...dispenserData,
        id: `dispenser-${uuidv4().substring(0, 8)}`
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

  const getDispenserById = (id: string): Dispenser | undefined => {
    return dispensers.find(d => d.id === id);
  };

  const getAllDispensers = (params?: PaginationParams): PaginatedResult<Dispenser> => {
    return getPaginatedData(dispensers, params || { page: 1, limit: 10 });
  };

  return {
    addDispenser,
    updateDispenser,
    getDispenserById,
    getAllDispensers
  };
};
