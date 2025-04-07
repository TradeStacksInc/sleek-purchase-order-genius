
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Tank } from '@/types';

// Flag to prevent multiple initialization attempts
let hasInitialized = false;

export const useEmptyTankInitializer = () => {
  const { getAllTanks, addTank, updateTank } = useApp();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // If initialization has already happened in this session, skip
    if (hasInitialized) {
      setInitialized(true);
      return;
    }

    const checkAndInitializeTanks = async () => {
      try {
        const tanksResult = getAllTanks();
        const existingTanks = tanksResult.data || [];
        
        // Only initialize if there are no tanks at all
        if (existingTanks.length === 0) {
          console.log('No tanks found, initializing default tanks');
          
          // Create 2 empty PMS tanks
          await addTank({
            name: "PMS Tank 1",
            capacity: 20000,
            currentVolume: 0,
            productType: 'PMS',
            minVolume: 2000, // 10% of capacity
            status: 'operational',
            connectedDispensers: []
          });
          
          await addTank({
            name: "PMS Tank 2",
            capacity: 25000,
            currentVolume: 0,
            productType: 'PMS',
            minVolume: 2500, // 10% of capacity
            status: 'operational',
            connectedDispensers: []
          });
          
          // Create 1 partially filled PMS tank
          await addTank({
            name: "PMS Tank 3",
            capacity: 30000,
            currentVolume: 15000,
            productType: 'PMS',
            minVolume: 3000, // 10% of capacity
            status: 'operational',
            connectedDispensers: []
          });
          
          // Create AGO and DPK tanks
          await addTank({
            name: "AGO Tank 1",
            capacity: 15000,
            currentVolume: 0,
            productType: 'AGO',
            minVolume: 1500, // 10% of capacity
            status: 'operational',
            connectedDispensers: []
          });
          
          await addTank({
            name: "DPK Tank 1",
            capacity: 10000,
            currentVolume: 0,
            productType: 'DPK',
            minVolume: 1000, // 10% of capacity
            status: 'operational',
            connectedDispensers: []
          });
        } else {
          console.log(`Found ${existingTanks.length} existing tanks, skipping initialization`);
        }
        
        // Mark as initialized globally to prevent future attempts
        hasInitialized = true;
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing tanks:', error);
        setInitialized(true); // Still mark as initialized to prevent infinite retries
      }
    };
    
    checkAndInitializeTanks();
  }, [getAllTanks, addTank, updateTank]);
  
  return { initialized };
};
