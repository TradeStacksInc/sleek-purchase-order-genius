
import { useState, useEffect, useCallback } from 'react';
import GPSTrackingService, { TrackingInfo } from '@/services/GPSTrackingService';
import { Truck } from '@/types';

export const useTruckTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackedTrucks, setTrackedTrucks] = useState<string[]>([]);
  const [trackingInfo, setTrackingInfo] = useState<Record<string, TrackingInfo>>({});
  const [updateTimestamp, setUpdateTimestamp] = useState<Date | null>(null);

  const trackingService = GPSTrackingService.getInstance();

  // Update handler
  const handleTrackingUpdate = useCallback((truckId: string, info: TrackingInfo) => {
    setTrackingInfo(prev => ({
      ...prev,
      [truckId]: {
        ...info,
        fuelLevel: Math.floor(Math.random() * 100) // Simulate fuel level for demo
      }
    }));
    setUpdateTimestamp(new Date());
  }, []);

  // Start tracking
  const startTracking = useCallback((truck: Truck) => {
    const initialLatitude = truck.lastLatitude || 9.0820;  // Default to Lagos coordinates
    const initialLongitude = truck.lastLongitude || 8.6753;

    trackingService.startTracking(truck.id, initialLatitude, initialLongitude);

    setIsTracking(true);
    setTrackedTrucks(prev => [...prev, truck.id]);
    
    // Initialize tracking info
    setTrackingInfo(prev => ({
      ...prev,
      [truck.id]: {
        latitude: initialLatitude,
        longitude: initialLongitude,
        speed: 0,
        distance: 0,
        distanceCovered: 0,
        currentSpeed: 0,
        lastUpdate: new Date(),
        path: [],
        fuelLevel: 85 // Initial fuel level
      }
    }));
  }, [trackingService]);

  // Stop tracking
  const stopTracking = useCallback((truckId: string) => {
    trackingService.stopTracking(truckId);
    setTrackedTrucks(prev => prev.filter(id => id !== truckId));
    if (trackedTrucks.length <= 1) {
      setIsTracking(false);
    }
  }, [trackingService, trackedTrucks]);

  // Register update callback
  useEffect(() => {
    const callbackId = trackingService.registerUpdateCallback(handleTrackingUpdate);
    
    return () => {
      trackingService.unregisterUpdateCallback(callbackId);
      trackedTrucks.forEach(truckId => trackingService.stopTracking(truckId));
    };
  }, [trackingService, handleTrackingUpdate, trackedTrucks]);

  return {
    isTracking,
    trackedTrucks,
    trackingInfo,
    updateTimestamp,
    startTracking,
    stopTracking
  };
};
