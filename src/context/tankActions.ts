
import { v4 as uuidv4 } from 'uuid';
import { Tank, ActivityLog } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTankActions = (
  tanks: Tank[],
  setTanks: React.Dispatch<React.SetStateAction<Tank[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const addTank = (tankData: Omit<Tank, 'id'>): Tank => {
    try {
      console.log("Adding tank:", tankData);
      
      const newTank: Tank = {
        ...tankData,
        id: `tank-${uuidv4().substring(0, 8)}`
      };
      
      setTanks(prev => [newTank, ...prev]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank' as 'tank',
        entityId: newTank.id,
        action: 'create',
        details: `Added new tank: ${newTank.name} for ${newTank.productType}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Tank Added",
        description: `${newTank.name} has been added successfully.`,
      });
      
      return newTank;
    } catch (error) {
      console.error("Error adding tank:", error);
      toast({
        title: "Error",
        description: "Failed to add tank. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTank = (id: string, data: Partial<Tank>): Tank | undefined => {
    try {
      let updatedTank: Tank | undefined;
      
      setTanks(prev => {
        const updatedTankList = prev.map(tank => {
          if (tank.id === id) {
            updatedTank = { ...tank, ...data };
            return updatedTank;
          }
          return tank;
        });
        
        // If tank not found, return unmodified list
        if (!updatedTank) return prev;
        
        return updatedTankList;
      });
      
      if (updatedTank) {
        // Log the action
        const newActivityLog: ActivityLog = {
          id: `log-${uuidv4()}`,
          entityType: 'tank' as 'tank',
          entityId: updatedTank.id,
          action: 'update',
          details: `Updated tank: ${updatedTank.name}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Tank Updated",
          description: `${updatedTank.name} has been updated successfully.`,
        });
      }
      
      return updatedTank;
    } catch (error) {
      console.error("Error updating tank:", error);
      toast({
        title: "Error",
        description: "Failed to update tank. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const getTankById = (id: string): Tank | undefined => {
    return tanks.find(tank => tank.id === id);
  };

  const getAllTanks = (): Tank[] => {
    return tanks;
  };

  const recordOffloadingToTank = (tankId: string, volume: number, productType: string): Tank | undefined => {
    try {
      let updatedTank: Tank | undefined;
      
      setTanks(prev => {
        const updatedTankList = prev.map(tank => {
          if (tank.id === tankId) {
            if (tank.productType !== productType) {
              throw new Error(`Product type mismatch: Tank is for ${tank.productType} but trying to offload ${productType}`);
            }
            
            if (tank.currentVolume + volume > tank.capacity) {
              throw new Error(`Tank overflow: Cannot add ${volume} liters to tank with ${tank.capacity - tank.currentVolume} liters remaining capacity`);
            }
            
            updatedTank = {
              ...tank,
              currentVolume: tank.currentVolume + volume,
              lastRefillDate: new Date()
            };
            return updatedTank;
          }
          return tank;
        });
        
        // If tank not found, return unmodified list
        if (!updatedTank) return prev;
        
        return updatedTankList;
      });
      
      if (updatedTank) {
        // Log the action
        const newActivityLog: ActivityLog = {
          id: `log-${uuidv4()}`,
          entityType: 'tank' as 'tank',
          entityId: updatedTank.id,
          action: 'update',
          details: `Offloaded ${volume} liters of ${productType} to tank: ${updatedTank.name}`,
          user: 'Current User',
          timestamp: new Date()
        };
        
        setActivityLogs(prev => [newActivityLog, ...prev]);
        
        toast({
          title: "Tank Refilled",
          description: `${updatedTank.name} has been refilled with ${volume} liters of ${productType}.`,
        });
      }
      
      return updatedTank;
    } catch (error) {
      console.error("Error offloading to tank:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to offload to tank. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  return {
    addTank,
    updateTank,
    getTankById,
    getAllTanks,
    recordOffloadingToTank
  };
};
