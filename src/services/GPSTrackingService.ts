
import { v4 as uuidv4 } from 'uuid';
import GPSSimulator from './GPSSimulator';
import type { TrackingInfo } from './GPSSimulator';

export default class GPSTrackingService {
  private static instance: GPSTrackingService;
  private simulator: GPSSimulator;
  
  private constructor() {
    this.simulator = GPSSimulator.getInstance();
    
    // Register for updates
    this.simulator.registerUpdateCallback(this.handleGPSUpdate.bind(this));
  }
  
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }
  
  public startTracking(truckId: string, latitude: number, longitude: number): void {
    this.simulator.startTracking(truckId, latitude, longitude);
    console.log(`Started tracking truck ${truckId} at (${latitude}, ${longitude})`);
  }
  
  public stopTracking(truckId: string): void {
    this.simulator.stopTracking(truckId);
    console.log(`Stopped tracking truck ${truckId}`);
  }
  
  public isTracking(): boolean {
    return this.simulator.isTracking();
  }
  
  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.simulator.getTrackingInfo(truckId);
  }
  
  public getAllTrackedTrucks(): Array<{ truckId: string, info: TrackingInfo }> {
    return this.simulator.getAllTrackedTrucks();
  }
  
  public getPathHistory(truckId: string): Array<{ lat: number, lng: number }> {
    return this.simulator.getPathHistory(truckId);
  }
  
  private handleGPSUpdate(truckId: string, info: TrackingInfo): void {
    // Handle updates from simulator
    // This is where you might want to trigger React state updates or dispatch to a store
    // Since this is singleton and outside React, you might need to use a pub/sub pattern
    // For now, just log
    console.log(`GPS update for truck ${truckId}: ${info.currentLatitude}, ${info.currentLongitude}, ${info.currentSpeed} km/h`);
  }
}
