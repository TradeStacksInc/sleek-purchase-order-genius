
import { GPSData } from '@/types';
import GPSSimulator, { TrackingInfo } from './GPSSimulator';

// Singleton class for GPS tracking
class GPSTrackingService {
  private static instance: GPSTrackingService;
  private simulator: GPSSimulator;
  
  // Private constructor to enforce singleton pattern
  private constructor() {
    this.simulator = GPSSimulator.getInstance();
  }
  
  // Get the singleton instance
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }
  
  // Register a callback to be called when GPS data updates
  public registerUpdateCallback(callback: (data: GPSData) => void): void {
    this.simulator.registerUpdateCallback(callback);
  }
  
  // Start tracking a truck
  public startTracking(
    truckId: string,
    startLatitude: number,
    startLongitude: number,
    totalDistance: number,
    sourceLocation?: { lat: number, lng: number, name: string },
    destinationLocation?: { lat: number, lng: number, name: string }
  ): void {
    this.simulator.startTracking(
      truckId, 
      startLatitude, 
      startLongitude, 
      totalDistance,
      sourceLocation,
      destinationLocation
    );
  }
  
  // Stop tracking a truck
  public stopTracking(truckId: string): void {
    this.simulator.stopTracking(truckId);
  }
  
  // Check if a truck is being tracked
  public isTracking(truckId: string): boolean {
    return this.simulator.isTracking(truckId);
  }
  
  // Get tracking info for a truck
  public getTrackingInfo(truckId: string): TrackingInfo | null {
    return this.simulator.getTrackingInfo(truckId);
  }
  
  // Get all tracked trucks
  public getAllTrackedTrucks(): string[] {
    return this.simulator.getAllTrackedTrucks();
  }
  
  // Get path history for a truck
  public getPathHistory(truckId: string): { lat: number, lng: number }[] {
    return this.simulator.getPathHistory(truckId);
  }
}

export default GPSTrackingService;
