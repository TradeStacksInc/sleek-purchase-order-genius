
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import GPSTrackingService from '@/services/GPSTrackingService';
import { useToast } from './use-toast';

export function useTruckTracking() {
  const { updateGPSData, updateDeliveryStatus, getTruckById } = useApp();
  const [trackedTrucks, setTrackedTrucks] = useState<string[]>([]);
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());
  const { toast } = useToast();
  
  // Register the callback once
  useEffect(() => {
    const gpsService = GPSTrackingService.getInstance();
    
    // Register the callback with the service
    gpsService.registerUpdateCallback(updateGPSData);
    
    // Set up interval to update UI
    const intervalId = setInterval(() => {
      // Update tracked trucks list
      const activeTrucks = gpsService.getAllTrackedTrucks();
      setTrackedTrucks(activeTrucks);
      
      // Update timestamp to force re-render
      setUpdateTimestamp(Date.now());
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [updateGPSData]);
  
  // Start tracking a truck
  const startTracking = (
    truckId: string, 
    initialLatitude?: number, 
    initialLongitude?: number,
    totalDistance?: number
  ) => {
    const gpsService = GPSTrackingService.getInstance();
    const truck = getTruckById(truckId);
    
    if (!truck) {
      toast({
        title: "Error",
        description: "Could not find truck with the provided ID.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!truck.isGPSTagged) {
      toast({
        title: "GPS Required",
        description: "This truck is not GPS-tagged. Please tag it first.",
        variant: "destructive"
      });
      return false;
    }
    
    // Use provided coordinates or truck's last known position or default
    const startLatitude = initialLatitude ?? truck.lastLatitude ?? 6.5244;
    const startLongitude = initialLongitude ?? truck.lastLongitude ?? 3.3792;
    const distance = totalDistance ?? 100;
    
    // Start tracking
    gpsService.startTracking(
      truckId,
      startLatitude,
      startLongitude,
      distance
    );
    
    // Update UI
    setTrackedTrucks(gpsService.getAllTrackedTrucks());
    
    toast({
      title: "Tracking Started",
      description: `Now tracking truck ${truck.plateNumber} in real-time.`,
    });
    
    return true;
  };
  
  // Stop tracking a truck
  const stopTracking = (truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    const truck = getTruckById(truckId);
    
    if (!truck) {
      toast({
        title: "Error",
        description: "Could not find truck with the provided ID.",
        variant: "destructive"
      });
      return;
    }
    
    // Stop tracking
    gpsService.stopTracking(truckId);
    
    // Update UI
    setTrackedTrucks(gpsService.getAllTrackedTrucks());
    
    toast({
      title: "Tracking Stopped",
      description: `Stopped tracking truck ${truck.plateNumber}.`,
    });
  };
  
  // Mark a delivery as delivered
  const markAsDelivered = (orderId: string, truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    
    // Stop tracking first
    gpsService.stopTracking(truckId);
    
    // Update delivery status
    updateDeliveryStatus(orderId, {
      status: 'delivered',
      destinationArrivalTime: new Date()
    });
    
    // Update UI
    setTrackedTrucks(gpsService.getAllTrackedTrucks());
    
    toast({
      title: "Delivery Completed",
      description: `Delivery has been marked as completed.`,
    });
  };
  
  // Get tracking info for a truck
  const getTrackingInfo = (truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    return gpsService.getTrackingInfo(truckId);
  };
  
  // Check if a truck is being tracked
  const isTracking = (truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    return gpsService.isTracking(truckId);
  };
  
  // Get path history for a truck
  const getPathHistory = (truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    return gpsService.getPathHistory(truckId);
  };
  
  return {
    trackedTrucks,
    updateTimestamp,
    startTracking,
    stopTracking,
    markAsDelivered,
    getTrackingInfo,
    isTracking,
    getPathHistory
  };
}
