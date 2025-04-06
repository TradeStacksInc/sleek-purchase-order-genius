
// Implement or fix the GPSTrackingService
import { v4 as uuidv4 } from 'uuid';
import GPSSimulator from './GPSSimulator';

export interface TrackingInfo {
  truckId: string;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeed: number;
  distanceCovered: number;
  lastUpdated: Date;
  route?: Array<{lat: number, lng: number}>;
}

class GPSTrackingService {
  private static instance: GPSTrackingService;
  private simulator: GPSSimulator;
  private trackedTrucks: Map<string, TrackingInfo>;
  private callbacks: Map<string, (truckId: string, info: TrackingInfo) => void>;

  private constructor() {
    this.simulator = new GPSSimulator();
    this.trackedTrucks = new Map();
    this.callbacks = new Map();

    // Set up the simulator callbacks
    this.simulator.onUpdate = (truckId, latitude, longitude, speed, distance) => {
      const info: TrackingInfo = {
        truckId,
        currentLatitude: latitude,
        currentLongitude: longitude,
        currentSpeed: speed,
        distanceCovered: distance,
        lastUpdated: new Date()
      };
      
      this.trackedTrucks.set(truckId, info);
      
      // Trigger callbacks
      this.callbacks.forEach(callback => {
        callback(truckId, info);
      });
    };
  }

  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }

  public registerUpdateCallback(callback: (truckId: string, info: TrackingInfo) => void): string {
    const callbackId = uuidv4();
    this.callbacks.set(callbackId, callback);
    return callbackId;
  }

  public unregisterUpdateCallback(callbackId: string): boolean {
    return this.callbacks.delete(callbackId);
  }

  public startTracking(truckId: string, initialLatitude: number, initialLongitude: number): void {
    this.simulator.startTracking(truckId, initialLatitude, initialLongitude);
    
    // Initialize tracking info
    this.trackedTrucks.set(truckId, {
      truckId,
      currentLatitude: initialLatitude,
      currentLongitude: initialLongitude,
      currentSpeed: 0,
      distanceCovered: 0,
      lastUpdated: new Date(),
      route: [{lat: initialLatitude, lng: initialLongitude}]
    });
  }

  public stopTracking(truckId: string): void {
    this.simulator.stopTracking(truckId);
    this.trackedTrucks.delete(truckId);
  }

  public isTracking(): boolean {
    return this.trackedTrucks.size > 0;
  }

  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.trackedTrucks.get(truckId);
  }

  public updateTrackingInfo(truckId: string, info: Partial<TrackingInfo>): boolean {
    if (!this.trackedTrucks.has(truckId)) return false;
    
    const currentInfo = this.trackedTrucks.get(truckId)!;
    const updatedInfo = {
      ...currentInfo,
      ...info,
      lastUpdated: new Date()
    };
    
    this.trackedTrucks.set(truckId, updatedInfo);
    
    // Trigger callbacks
    this.callbacks.forEach(callback => {
      callback(truckId, updatedInfo);
    });
    
    return true;
  }

  public getAllTrackedTrucks(): {truckId: string, info: TrackingInfo}[] {
    const result: {truckId: string, info: TrackingInfo}[] = [];
    this.trackedTrucks.forEach((info, truckId) => {
      result.push({ truckId, info });
    });
    return result;
  }
}

export default GPSTrackingService;
