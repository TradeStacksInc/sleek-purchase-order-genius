
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export const useEmptyTankInitializer = () => {
  const { getAllTanks, createEmptyTank, clearAllTanks } = useApp();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const checkAndInitializeTanks = async () => {
      const existingTanks = getAllTanks();
      
      // Check if we already have empty PMS tanks
      const emptyPMSTanks = existingTanks.filter(
        tank => tank.productType === 'PMS' && tank.currentVolume === 0
      );
      
      if (emptyPMSTanks.length < 2) {
        // If we don't have enough empty PMS tanks, clear all tanks and create new ones
        clearAllTanks();
        
        // Create 2 empty PMS tanks
        createEmptyTank("PMS Tank 1", 20000, "PMS");
        createEmptyTank("PMS Tank 2", 25000, "PMS");
        
        // Create 1 partially filled PMS tank
        const tank3 = createEmptyTank("PMS Tank 3", 30000, "PMS");
        useApp().updateTank(tank3.id, { currentVolume: 15000 });
        
        // Create AGO and DPK tanks
        createEmptyTank("AGO Tank 1", 15000, "AGO");
        createEmptyTank("DPK Tank 1", 10000, "DPK");
      }
      
      setInitialized(true);
    };
    
    checkAndInitializeTanks();
  }, [getAllTanks, createEmptyTank, clearAllTanks]);
  
  return { initialized };
};
