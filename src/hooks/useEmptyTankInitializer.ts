
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export const useEmptyTankInitializer = () => {
  const { getAllTanks, addTank, updateTank } = useApp();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const checkAndInitializeTanks = async () => {
      const existingTanks = getAllTanks();
      
      // Check if we already have empty PMS tanks
      const emptyPMSTanks = existingTanks.filter(
        tank => tank.productType === 'PMS' && tank.currentVolume === 0
      );
      
      if (emptyPMSTanks.length < 2) {
        // If we don't have enough empty PMS tanks, create new ones
        
        // Create 2 empty PMS tanks
        const tank1 = addTank({
          name: "PMS Tank 1",
          capacity: 20000,
          currentVolume: 0,
          productType: 'PMS',
          minVolume: 2000, // 10% of capacity
          status: 'operational',
          connectedDispensers: []
        });
        
        const tank2 = addTank({
          name: "PMS Tank 2",
          capacity: 25000,
          currentVolume: 0,
          productType: 'PMS',
          minVolume: 2500, // 10% of capacity
          status: 'operational',
          connectedDispensers: []
        });
        
        // Create 1 partially filled PMS tank
        const tank3 = addTank({
          name: "PMS Tank 3",
          capacity: 30000,
          currentVolume: 15000,
          productType: 'PMS',
          minVolume: 3000, // 10% of capacity
          status: 'operational',
          connectedDispensers: []
        });
        
        // Create AGO and DPK tanks
        addTank({
          name: "AGO Tank 1",
          capacity: 15000,
          currentVolume: 0,
          productType: 'AGO',
          minVolume: 1500, // 10% of capacity
          status: 'operational',
          connectedDispensers: []
        });
        
        addTank({
          name: "DPK Tank 1",
          capacity: 10000,
          currentVolume: 0,
          productType: 'DPK',
          minVolume: 1000, // 10% of capacity
          status: 'operational',
          connectedDispensers: []
        });
      }
      
      setInitialized(true);
    };
    
    checkAndInitializeTanks();
  }, [getAllTanks, addTank, updateTank]);
  
  return { initialized };
};
