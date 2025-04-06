
import { v4 as uuidv4 } from 'uuid';
import { TrackingInfo } from '@/types';

export default class GPSSimulator {
  private static instance: GPSSimulator;
  private trackedTrucks: Map<string, TrackingInfo> = new Map();
  private updateCallbacks: Array<(truckId: string, info: TrackingInfo) => void> = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): GPSSimulator {
    if (!GPSSimulator.instance) {
      GPSSimulator.instance = new GPSSimulator();
    }
    return GPSSimulator.instance;
  }

  public registerUpdateCallback(callback: (truckId: string, info: TrackingInfo) => void): void {
    this.updateCallbacks.push(callback);
  }

  public startTracking(truckId: string, initialLatitude: number, initialLongitude: number): void {
    // Don't track the same truck twice
    if (this.trackedTrucks.has(truckId)) {
      return;
    }

    const newTrackingInfo: TrackingInfo = {
      truckId,
      currentLatitude: initialLatitude,
      currentLongitude: initialLongitude,
      currentSpeed: Math.random() * 60 + 20, // 20-80 km/h
      distanceCovered: 0,
      lastUpdated: new Date(),
      route: [{ lat: initialLatitude, lng: initialLongitude }]
    };

    this.trackedTrucks.set(truckId, newTrackingInfo);
    
    // Start interval for this truck
    const interval = setInterval(() => this.updateTruckPosition(truckId), 3000);
    this.intervals.set(truckId, interval);
    
    this.isRunning = true;
  }

  public stopTracking(truckId: string): void {
    // Clear interval
    const interval = this.intervals.get(truckId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(truckId);
    }
    
    // Remove from tracked trucks
    this.trackedTrucks.delete(truckId);
    
    // Update running state
    if (this.intervals.size === 0) {
      this.isRunning = false;
    }
  }

  public isTracking(): boolean {
    return this.isRunning;
  }

  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.trackedTrucks.get(truckId);
  }

  public getAllTrackedTrucks(): Array<{ truckId: string, info: TrackingInfo }> {
    const result: Array<{ truckId: string, info: TrackingInfo }> = [];
    this.trackedTrucks.forEach((info, truckId) => {
      result.push({ truckId, info });
    });
    return result;
  }

  public getPathHistory(truckId: string): Array<{ lat: number, lng: number }> {
    const info = this.trackedTrucks.get(truckId);
    return info?.route || [];
  }

  private updateTruckPosition(truckId: string): void {
    const info = this.trackedTrucks.get(truckId);
    if (!info) return;

    // Calculate new position
    const direction = Math.random() * Math.PI * 2; // Random direction
    const distance = (info.currentSpeed / 3600) * 3; // Distance in 3 seconds (km)
    const latChange = distance * Math.cos(direction) / 111; // Approx conversion to degrees
    const lngChange = distance * Math.sin(direction) / (111 * Math.cos(info.currentLatitude * (Math.PI / 180)));

    const newLat = info.currentLatitude + latChange;
    const newLng = info.currentLongitude + lngChange;

    // Update tracking info
    info.currentLatitude = newLat;
    info.currentLongitude = newLng;
    info.currentSpeed = Math.min(120, Math.max(20, info.currentSpeed + (Math.random() - 0.5) * 10)); // Vary speed slightly
    info.distanceCovered += distance;
    info.lastUpdated = new Date();
    
    // Add to route history
    if (info.route) {
      info.route.push({ lat: newLat, lng: newLng });
      // Limit history length
      if (info.route.length > 100) {
        info.route = info.route.slice(-100);
      }
    }

    // Notify callbacks
    this.updateCallbacks.forEach(callback => callback(truckId, info));
  }
}

// Export the TrackingInfo type
export type { TrackingInfo };
