import { v4 as uuidv4 } from 'uuid';
import { Tank, ActivityLog, Dispenser, Product, ProductType } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTankActions = (
  tanks: Tank[],
  setTanks: React.Dispatch<React.SetStateAction<Tank[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>,
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>
) => {
  const { toast } = useToast();

  const addTank = async (tankData: Omit<Tank, 'id'>): Promise<Tank> => {
    try {
      console.log("Adding tank:", tankData);
      
      const { data, error } = await supabase
        .from('tanks')
        .insert({
          name: tankData.name,
          capacity: tankData.capacity,
          product_type: tankData.productType,
          current_level: tankData.currentLevel || 0,
          last_refill_date: tankData.lastRefillDate?.toISOString(),
          next_inspection_date: tankData.nextInspectionDate?.toISOString(),
          current_volume: tankData.currentVolume || 0,
          min_volume: tankData.minVolume || 0,
          status: tankData.status || 'operational',
          is_active: tankData.isActive !== undefined ? tankData.isActive : false,
          connected_dispensers: tankData.connectedDispensers || []
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert database format to application format
      const newTank: Tank = {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        productType: data.product_type as ProductType,
        currentLevel: data.current_level,
        lastRefillDate: data.last_refill_date ? new Date(data.last_refill_date) : new Date(),
        nextInspectionDate: data.next_inspection_date ? new Date(data.next_inspection_date) : undefined,
        currentVolume: data.current_volume,
        minVolume: data.min_volume,
        status: data.status as 'operational' | 'maintenance' | 'offline',
        isActive: data.is_active,
        connectedDispensers: data.connected_dispensers || []
      };
      
      setTanks(prev => [newTank, ...prev]);
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: newTank.id,
        action: 'create',
        details: `Added new tank: ${newTank.name} for ${newTank.productType}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      await supabase.from('activity_logs').insert({
        entity_type: newActivityLog.entityType,
        entity_id: newActivityLog.entityId,
        action: newActivityLog.action,
        details: newActivityLog.details,
        user_name: newActivityLog.user,
        timestamp: newActivityLog.timestamp.toISOString()
      });
      
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

  const updateTank = async (id: string, data: Partial<Tank>): Promise<boolean> => {
    try {
      // First, convert the application format to database format
      const dbData: any = {};
      
      if (data.name !== undefined) dbData.name = data.name;
      if (data.capacity !== undefined) dbData.capacity = data.capacity;
      if (data.productType !== undefined) dbData.product_type = data.productType;
      if (data.currentLevel !== undefined) dbData.current_level = data.currentLevel;
      if (data.lastRefillDate !== undefined) dbData.last_refill_date = data.lastRefillDate.toISOString();
      if (data.nextInspectionDate !== undefined) dbData.next_inspection_date = data.nextInspectionDate.toISOString();
      if (data.currentVolume !== undefined) dbData.current_volume = data.currentVolume;
      if (data.minVolume !== undefined) dbData.min_volume = data.minVolume;
      if (data.status !== undefined) dbData.status = data.status;
      if (data.isActive !== undefined) dbData.is_active = data.isActive;
      if (data.connectedDispensers !== undefined) dbData.connected_dispensers = data.connectedDispensers;
      
      const { error } = await supabase
        .from('tanks')
        .update(dbData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setTanks(prev => {
        return prev.map(tank => {
          if (tank.id === id) {
            return { ...tank, ...data };
          }
          return tank;
        });
      });
      
      // Log the action
      const tank = tanks.find(t => t.id === id);
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'tank',
        entityId: id,
        action: 'update',
        details: `Updated tank: ${tank?.name || id}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      await supabase.from('activity_logs').insert({
        entity_type: newActivityLog.entityType,
        entity_id: newActivityLog.entityId,
        action: newActivityLog.action,
        details: newActivityLog.details,
        user_name: newActivityLog.user,
        timestamp: newActivityLog.timestamp.toISOString()
      });
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Tank Updated",
        description: `${tank?.name || 'Tank'} has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error updating tank:", error);
      toast({
        title: "Error",
        description: "Failed to update tank. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTank = async (id: string): Promise<boolean> => {
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
      
      const { error } = await supabase
        .from('tanks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      
      await supabase.from('activity_logs').insert({
        entity_type: newActivityLog.entityType,
        entity_id: newActivityLog.entityId,
        action: newActivityLog.action,
        details: newActivityLog.details,
        user_name: newActivityLog.user,
        timestamp: newActivityLog.timestamp.toISOString()
      });
      
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

  const recordOffloadingToTank = (tankId: string, volume: number, source: string, sourceId: string): boolean => {
    try {
      // Find the tank
      const tank = tanks.find(t => t.id === tankId);
      if (!tank) {
        console.error(`Tank with ID ${tankId} not found`);
        return false;
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
        details: `${volume.toLocaleString()} liters from ${source} (${sourceId}) offloaded to tank ${tank.name}. New volume: ${updatedTank.currentVolume?.toLocaleString()} / ${tank.capacity.toLocaleString()} liters.`,
        user: 'System',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      return true;
    } catch (error) {
      console.error("Error recording offloading to tank:", error);
      return false;
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
