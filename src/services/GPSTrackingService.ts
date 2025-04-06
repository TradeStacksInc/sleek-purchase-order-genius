
import GPSSimulator from './GPSSimulator';
import { Truck } from '@/types';

export interface TrackingInfo {
  latitude: number;
  longitude: number;
  speed: number;
  distance: number;
  lastUpdate: Date;
  path: Array<{lat: number, lng: number, timestamp: Date}>;
}

class GPSTrackingService {
  private simulator: GPSSimulator;
  private trackingInfo: Record<string, TrackingInfo> = {};
  private updateCallbacks: Array<() => void> = [];
  private isActive: boolean = false;
  private activeTrackedTruck: string = '';
  
  constructor() {
    this.simulator = new GPSSimulator();
    this.simulator.onUpdate = this.handleGPSUpdate.bind(this);
  }
  
  private handleGPSUpdate(truckId: string, latitude: number, longitude: number, speed: number, distance: number) {
    // Create or update tracking info
    if (!this.trackingInfo[truckId]) {
      this.trackingInfo[truckId] = {
        latitude,
        longitude,
        speed,
        distance,
        lastUpdate: new Date(),
        path: [{lat: latitude, lng: longitude, timestamp: new Date()}]
      };
    } else {
      this.trackingInfo[truckId].latitude = latitude;
      this.trackingInfo[truckId].longitude = longitude;
      this.trackingInfo[truckId].speed = speed;
      this.trackingInfo[truckId].distance = distance;
      this.trackingInfo[truckId].lastUpdate = new Date();
      this.trackingInfo[truckId].path.push({lat: latitude, lng: longitude, timestamp: new Date()});
    }
    
    // Notify update callbacks
    this.updateCallbacks.forEach(callback => callback());
  }
  
  public registerUpdateCallback(callback: () => void) {
    this.updateCallbacks.push(callback);
  }
  
  public startTracking(truck: Truck) {
    // Only start tracking if truck has GPS
    if (!truck.hasGPS || !truck.isGPSTagged || !truck.lastLatitude || !truck.lastLongitude) {
      console.error('Cannot track truck without GPS');
      return;
    }
    
    this.simulator.startTracking(truck.id, truck.lastLatitude, truck.lastLongitude);
    this.isActive = true;
    this.activeTrackedTruck = truck.id;
  }
  
  public stopTracking(truckId: string) {
    this.simulator.stopTracking(truckId);
    if (this.activeTrackedTruck === truckId) {
      this.activeTrackedTruck = '';
    }
    if (this.simulator.getAllTrackedTrucks().length === 0) {
      this.isActive = false;
    }
  }
  
  public isTracking(): boolean {
    return this.isActive;
  }
  
  public getAllTrackedTrucks(): string[] {
    return this.simulator.getAllTrackedTrucks();
  }
  
  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.trackingInfo[truckId];
  }
  
  public getPathHistory(truckId: string): Array<{lat: number, lng: number, timestamp: Date}> {
    return this.trackingInfo[truckId]?.path || [];
  }
}

export default GPSTrackingService;
