import { v4 as uuidv4 } from 'uuid';
import { Tank, ActivityLog, Dispenser } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTankActions = (
  tanks: Tank[],
  setTanks: React.Dispatch<React.SetStateAction<Tank[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>,
  dispensers?: Dispenser[],
  setDispensers?: React.Dispatch<React.SetStateAction<Dispenser[]>>
) => {
  const { toast } = useToast();

  const addTank = (tankData: Omit<Tank, 'id'>): Tank => {
    try {
      console.log("Adding tank:", tankData);
      
      const newTank: Tank = {
        ...tankData,
        id: `tank-${uuidv4().substring(0, 8)}`,
        connectedDispensers: [],
        isActive: false
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

  const deleteTank = (id: string): boolean => {
    try {
      const tankToDelete = tanks.find(tank => tank.id === id);
      
      if (!tankToDelete) {
        toast({
          title: "Error",
          description: "Tank not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if tank is active or connected to dispensers
      if (tankToDelete.isActive) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete an active tank. Deactivate it first.",
          variant: "destructive",
        });
        return false;
      }
      
      if (tankToDelete.connectedDispensers && tankToDelete.connectedDispensers.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete a tank connected to dispensers. Disconnect it first.",
          variant: "destructive",
        });
        return false;
      }
      
      setTanks(prev => prev.filter(tank => tank.id !== id));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: id,
        action: 'delete',
        details: `Deleted tank: ${tankToDelete.name}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Tank Deleted",
        description: `${tankToDelete.name} has been removed from the system.`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting tank:", error);
      toast({
        title: "Error",
        description: "Failed to delete tank. Please try again.",
        variant: "destructive",
      });
      return false;
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
      const tank = getTankById(tankId);
      if (!tank) {
        toast({
          title: "Error",
          description: "Tank not found.",
          variant: "destructive",
        });
        return undefined;
      }
      
      // Fix the comparison by converting both to strings
      if (String(tank.productType) !== String(productType)) {
        toast({
          title: "Error",
          description: `This tank is designated for ${String(tank.productType)} and cannot accept ${productType}.`,
          variant: "destructive",
        });
        return undefined;
      }
      
      // Check if tank capacity will be exceeded
      if ((tank.currentVolume || 0) + volume > tank.capacity) {
        const availableSpace = tank.capacity - (tank.currentVolume || 0);
        toast({
          title: "Capacity Warning",
          description: `This tank can only accept ${availableSpace.toLocaleString()} L more. The tank will be filled to capacity and the remaining ${(volume - availableSpace).toLocaleString()} L must be offloaded elsewhere.`,
          variant: "destructive",
        });
        
        // Return undefined to indicate failure
        return undefined;
      }
      
      // Update the tank with new volume
      const updatedTank = updateTank(tankId, {
        currentVolume: (tank.currentVolume || 0) + volume,
        lastRefillDate: new Date()
      });
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: tankId,
        action: 'update',
        details: `Offloaded ${volume.toLocaleString()} L of ${productType} into tank ${tank.name}. New volume: ${((tank.currentVolume || 0) + volume).toLocaleString()} L / ${tank.capacity.toLocaleString()} L (${(((tank.currentVolume || 0) + volume) / tank.capacity * 100).toFixed(1)}%)`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      return updatedTank;
      
    } catch (error) {
      console.error("Error recording offloading to tank:", error);
      toast({
        title: "Error",
        description: "There was an error recording the offloading. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const connectTankToDispenser = (tankId: string, dispenserId: string): boolean => {
    try {
      if (!dispensers || !setDispensers) {
        toast({
          title: "Error",
          description: "Dispenser functionality not available.",
          variant: "destructive",
        });
        return false;
      }

      const tank = tanks.find(t => t.id === tankId);
      const dispenser = dispensers.find(d => d.id === dispenserId);
      
      if (!tank || !dispenser) {
        toast({
          title: "Error",
          description: "Tank or Dispenser not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check product type match
      if (tank.productType !== dispenser.productType) {
        toast({
          title: "Product Type Mismatch",
          description: `Cannot connect ${tank.productType} tank to ${dispenser.productType} dispenser.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Update tank
      const updatedTank = updateTank(tankId, {
        connectedDispensers: [...tank.connectedDispensers, dispenserId]
      });
      
      // Update dispenser
      setDispensers(prev => prev.map(d => {
        if (d.id === dispenserId) {
          return {
            ...d,
            connectedTankId: tankId
          };
        }
        return d;
      }));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: tankId,
        action: 'update',
        details: `Connected tank ${tank.name} to dispenser #${dispenser.number}`,
        user: 'Current User',
        timestamp: new Date(),
        metadata: {
          tankId,
          dispenserId,
          productType: tank.productType,
          operation: 'connect'
        }
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Connection Successful",
        description: `Tank ${tank.name} has been connected to dispenser #${dispenser.number}.`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("Error connecting tank to dispenser:", error);
      toast({
        title: "Error",
        description: "Failed to connect tank to dispenser. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const disconnectTankFromDispenser = (tankId: string, dispenserId: string): boolean => {
    try {
      if (!dispensers || !setDispensers) {
        toast({
          title: "Error",
          description: "Dispenser functionality not available.",
          variant: "destructive",
        });
        return false;
      }

      const tank = tanks.find(t => t.id === tankId);
      const dispenser = dispensers.find(d => d.id === dispenserId);
      
      if (!tank || !dispenser) {
        toast({
          title: "Error",
          description: "Tank or Dispenser not found.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update tank
      const updatedTank = updateTank(tankId, {
        connectedDispensers: tank.connectedDispensers.filter(id => id !== dispenserId)
      });
      
      // Update dispenser
      setDispensers(prev => prev.map(d => {
        if (d.id === dispenserId) {
          return {
            ...d,
            connectedTankId: undefined
          };
        }
        return d;
      }));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: tankId,
        action: 'update',
        details: `Disconnected tank ${tank.name} from dispenser #${dispenser.number}`,
        user: 'Current User',
        timestamp: new Date(),
        metadata: {
          tankId,
          dispenserId,
          operation: 'disconnect'
        }
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Disconnection Successful",
        description: `Tank ${tank.name} has been disconnected from dispenser #${dispenser.number}.`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("Error disconnecting tank from dispenser:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect tank from dispenser. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const setTankActive = (tankId: string, isActive: boolean): Tank | undefined => {
    try {
      const tank = tanks.find(t => t.id === tankId);
      
      if (!tank) {
        toast({
          title: "Error",
          description: "Tank not found.",
          variant: "destructive",
        });
        return undefined;
      }
      
      return updateTank(tankId, { isActive });
    } catch (error) {
      console.error("Error setting tank active state:", error);
      toast({
        title: "Error",
        description: "Failed to update tank state. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const createEmptyTank = (name: string, capacity: number, productType: 'PMS' | 'AGO' | 'DPK'): Tank => {
    try {
      // Create an empty tank with all required properties
      const newTank: Tank = {
        id: `tank-${uuidv4().substring(0, 8)}`,
        name,
        capacity,
        currentLevel: 0,
        productType: productType as unknown as ProductType, // Type cast for compatibility
        lastRefillDate: new Date(),
        nextInspectionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        currentVolume: 0,
        minVolume: Math.floor(capacity * 0.15), // Default min volume is 15% of capacity
        status: 'operational',
        isActive: true,
        connectedDispensers: []
      };
      
      setTanks(prev => [...prev, newTank]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: newTank.id,
        action: 'create',
        details: `Created new ${productType} tank "${name}" with ${capacity.toLocaleString()} L capacity`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Tank Created",
        description: `${name} has been added to your tanks.`,
      });
      
      return newTank;
      
    } catch (error) {
      console.error("Error creating empty tank:", error);
      toast({
        title: "Error",
        description: "Failed to create tank. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const clearAllTanks = (): void => {
    setTanks([]);
    
    // Log the action
    const newActivityLog: ActivityLog = {
      id: `log-${uuidv4()}`,
      entityType: 'tank',
      entityId: 'all',
      action: 'delete',
      details: `Cleared all tanks from the system`,
      user: 'Current User',
      timestamp: new Date()
    };
    
    setActivityLogs(prev => [newActivityLog, ...prev]);
    
    toast({
      title: "Tanks Cleared",
      description: "All tanks have been removed from the system.",
    });
  };

  return {
    addTank,
    updateTank,
    deleteTank,
    getTankById,
    getAllTanks,
    recordOffloadingToTank,
    createEmptyTank,
    clearAllTanks,
    connectTankToDispenser,
    disconnectTankFromDispenser,
    setTankActive
  };
};
