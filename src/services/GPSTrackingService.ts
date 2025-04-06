
import { v4 as uuidv4 } from 'uuid';
import GPSSimulator from './GPSSimulator';

// Define TrackingInfo interface as it's missing from GPSSimulator
export interface TrackingInfo {
  currentLatitude: number;
  currentLongitude: number;
  currentSpeed: number;
  currentBearing: number;
  distanceCovered: number;
  lastUpdated: Date;
  status: string;
}

export default class GPSTrackingService {
  private static instance: GPSTrackingService;
  private simulator: GPSSimulator;
  private updateCallbacks: Map<string, (truckId: string, info: TrackingInfo) => void> = new Map();
  private trackingData: Map<string, TrackingInfo> = new Map();
  private pathHistory: Map<string, Array<{ lat: number; lng: number }>> = new Map();
  
  private constructor() {
    this.simulator = GPSSimulator.getInstance();
    
    // Since the GPSSimulator doesn't have these methods,
    // we'll implement our own simple simulation
    setInterval(() => this.simulateMovement(), 3000);
  }
  
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }
  
  // Register for updates
  public registerUpdateCallback(callback: (truckId: string, info: TrackingInfo) => void): string {
    const id = uuidv4();
    this.updateCallbacks.set(id, callback);
    return id;
  }
  
  public unregisterUpdateCallback(id: string): void {
    this.updateCallbacks.delete(id);
  }
  
  public startTracking(truckId: string, latitude: number, longitude: number): void {
    // Create initial tracking data
    const trackingInfo: TrackingInfo = {
      currentLatitude: latitude,
      currentLongitude: longitude,
      currentSpeed: 0,
      currentBearing: 0,
      distanceCovered: 0,
      lastUpdated: new Date(),
      status: 'active'
    };
    
    this.trackingData.set(truckId, trackingInfo);
    this.pathHistory.set(truckId, [{ lat: latitude, lng: longitude }]);
    
    console.log(`Started tracking truck ${truckId} at (${latitude}, ${longitude})`);
  }
  
  public stopTracking(truckId: string): void {
    this.trackingData.delete(truckId);
    console.log(`Stopped tracking truck ${truckId}`);
  }
  
  public isTracking(): boolean {
    return this.trackingData.size > 0;
  }
  
  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.trackingData.get(truckId);
  }
  
  public getAllTrackedTrucks(): Array<{ truckId: string, info: TrackingInfo }> {
    const result: Array<{ truckId: string, info: TrackingInfo }> = [];
    this.trackingData.forEach((info, truckId) => {
      result.push({ truckId, info });
    });
    return result;
  }
  
  public getPathHistory(truckId: string): Array<{ lat: number, lng: number }> {
    return this.pathHistory.get(truckId) || [];
  }
  
  private simulateMovement(): void {
    this.trackingData.forEach((info, truckId) => {
      // Simulate movement
      const newLat = info.currentLatitude + (Math.random() - 0.5) * 0.001;
      const newLng = info.currentLongitude + (Math.random() - 0.5) * 0.001;
      const newSpeed = Math.max(0, Math.min(120, info.currentSpeed + (Math.random() - 0.5) * 10));
      const distanceIncrement = (newSpeed / 3600) * 3; // km per 3 seconds
      
      const newInfo: TrackingInfo = {
        currentLatitude: newLat,
        currentLongitude: newLng,
        currentSpeed: newSpeed,
        currentBearing: Math.random() * 360,
        distanceCovered: info.distanceCovered + distanceIncrement,
        lastUpdated: new Date(),
        status: 'active'
      };
      
      // Update tracking data
      this.trackingData.set(truckId, newInfo);
      
      // Update path history
      const path = this.pathHistory.get(truckId) || [];
      path.push({ lat: newLat, lng: newLng });
      if (path.length > 100) path.shift(); // Keep only last 100 points
      this.pathHistory.set(truckId, path);
      
      // Notify callbacks
      this.updateCallbacks.forEach(callback => {
        callback(truckId, newInfo);
      });
    });
  }
}
