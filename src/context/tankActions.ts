import { v4 as uuidv4 } from 'uuid';
import { Tank, ActivityLog, Dispenser, Product, ProductType } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTankActions = (
  tanks: Tank[],
  setTanks: React.Dispatch<React.SetStateAction<Tank[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>,
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>
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

  const recordOffloadingToTank = (tankId: string, volume: number, productType: ProductType): Tank | null => {
    try {
      // Find the tank
      const tank = tanks.find(t => t.id === tankId);
      if (!tank) {
        console.error(`Tank with ID ${tankId} not found`);
        return null;
      }
      
      // Make sure the product type matches
      if (String(tank.productType) !== String(productType)) {
        console.error(`Product type mismatch: Tank is for ${tank.productType}, trying to offload ${productType}`);
        return null;
      }
      
      // Check if tank has capacity
      if (tank.currentVolume !== undefined && (tank.currentVolume + volume) > tank.capacity) {
        console.error(`Tank ${tank.name} does not have enough capacity. Current: ${tank.currentVolume}, Adding: ${volume}, Capacity: ${tank.capacity}`);
        return null;
      }
      
      // Update the tank
      const updatedTank = {
        ...tank,
        currentVolume: (tank.currentVolume || 0) + volume,
        lastRefillDate: new Date()
      };
      
      setTanks(tanks.map(t => t.id === tankId ? updatedTank : t));
      
      // Log the activity
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: tankId,
        action: 'update',
        details: `${volume.toLocaleString()} liters of ${String(productType)} offloaded to tank ${tank.name}. New volume: ${updatedTank.currentVolume?.toLocaleString()} / ${tank.capacity.toLocaleString()} liters.`,
        user: 'System',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      return updatedTank;
    } catch (error) {
      console.error("Error recording offloading to tank:", error);
      return null;
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

  const updateTankProductType = (tankId: string, productType: ProductType): boolean => {
    try {
      // Convert string product type to Product enum if needed
      const validProductType = productType as Product;
      
      setTanks(prev => prev.map(tank => {
        if (tank.id === tankId) {
          return {
            ...tank,
            productType: validProductType,
            // Reset volume when changing product type
            currentVolume: 0
          };
        }
        return tank;
      }));
      
      return true;
    } catch (error) {
      console.error("Error updating tank product type:", error);
      return false;
    }
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
    setTankActive,
    updateTankProductType
  };
};
