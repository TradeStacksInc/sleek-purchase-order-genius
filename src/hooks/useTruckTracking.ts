
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import GPSTrackingService, { TrackingInfo } from '@/services/GPSTrackingService';
import { Truck } from '@/types';

export const useTruckTracking = () => {
  const { trucks } = useApp();
  const [isTracking, setIsTracking] = useState(false);
  const [trackedTrucks, setTrackedTrucks] = useState<string[]>([]);
  const [trackingInfo, setTrackingInfo] = useState<Record<string, TrackingInfo>>({});
  const [activeTrackedTruck, setActiveTrackedTruck] = useState<string | null>(null);
  
  useEffect(() => {
    const gpsService = GPSTrackingService.getInstance();
    
    // Register for updates from the GPS service
    const callbackId = gpsService.registerUpdateCallback((truckId, info) => {
      setTrackingInfo(prev => ({ ...prev, [truckId]: info }));
    });
    
    // Get initial tracking data
    const allTracked = gpsService.getAllTrackedTrucks();
    const trackedIds = allTracked.map(item => item.truckId);
    setTrackedTrucks(trackedIds);
    
    // Initialize tracking info state
    const initialInfo: Record<string, TrackingInfo> = {};
    allTracked.forEach(({ truckId, info }) => {
      initialInfo[truckId] = info;
    });
    setTrackingInfo(initialInfo);
    
    // Set tracking status
    setIsTracking(gpsService.isTracking());
    
    // If we have tracked trucks but no active one is selected, select the first one
    if (trackedIds.length > 0 && !activeTrackedTruck) {
      setActiveTrackedTruck(trackedIds[0]);
    }
    
    return () => {
      // Clean up the callback registration
      gpsService.unregisterUpdateCallback(callbackId);
    };
  }, []);
  
  const startTracking = useCallback((truck: Truck) => {
    if (!truck) return;
    
    const gpsService = GPSTrackingService.getInstance();
    
    // Default starting position
    const startingLatitude = 6.5244 + (Math.random() - 0.5) * 0.1;
    const startingLongitude = 3.3792 + (Math.random() - 0.5) * 0.1;
    
    gpsService.startTracking(truck.id, startingLatitude, startingLongitude);
    
    // Update states
    setTrackedTrucks(prev => [...prev, truck.id]);
    setIsTracking(true);
    
    // Make this the active truck if none is selected
    if (!activeTrackedTruck) {
      setActiveTrackedTruck(truck.id);
    }
    
    // Update tracked trucks list
    const allTracked = gpsService.getAllTrackedTrucks();
    const trackedIds = allTracked.map(item => item.truckId);
    setTrackedTrucks(trackedIds);
  }, [activeTrackedTruck]);
  
  const stopTracking = useCallback((truckId: string) => {
    const gpsService = GPSTrackingService.getInstance();
    gpsService.stopTracking(truckId);
    
    // Update states
    setTrackedTrucks(prev => prev.filter(id => id !== truckId));
    setTrackingInfo(prev => {
      const newInfo = { ...prev };
      delete newInfo[truckId];
      return newInfo;
    });
    
    // If this was the active truck, select a new one
    if (activeTrackedTruck === truckId) {
      const allTracked = gpsService.getAllTrackedTrucks();
      const trackedIds = allTracked.map(item => item.truckId);
      setActiveTrackedTruck(trackedIds.length > 0 ? trackedIds[0] : null);
    }
    
    setIsTracking(gpsService.isTracking());
    
    // Update tracked trucks list
    const allTracked = gpsService.getAllTrackedTrucks();
    const trackedIds = allTracked.map(item => item.truckId);
    setTrackedTrucks(trackedIds);
  }, [activeTrackedTruck]);
  
  const selectTruck = useCallback((truckId: string) => {
    setActiveTrackedTruck(truckId);
  }, []);
  
  return {
    isTracking,
    trackedTrucks,
    trackingInfo,
    activeTrackedTruck,
    startTracking,
    stopTracking,
    selectTruck
  };
};
