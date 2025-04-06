
import GPSSimulator from './GPSSimulator';
import { Truck } from '@/types';

export interface TrackingInfo {
  latitude: number;
  longitude: number;
  speed: number;
  distance: number;
  distanceCovered: number;
  currentSpeed: number;
  lastUpdate: Date;
  path: Array<{lat: number, lng: number, timestamp: Date}>;
}

class GPSTrackingService {
  private simulator: GPSSimulator;
  private trackingInfo: Record<string, TrackingInfo> = {};
  private updateCallbacks: Array<(truckId: string, info: TrackingInfo) => void> = [];
  private isActive: boolean = false;
  private activeTrackedTruck: string = '';
  private static instance: GPSTrackingService;
  
  private constructor() {
    this.simulator = new GPSSimulator();
    this.simulator.onUpdate = this.handleGPSUpdate.bind(this);
  }
  
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }
  
  private handleGPSUpdate(truckId: string, latitude: number, longitude: number, speed: number, distance: number) {
    // Create or update tracking info
    if (!this.trackingInfo[truckId]) {
      this.trackingInfo[truckId] = {
        latitude,
        longitude,
        speed,
        distance,
        distanceCovered: distance,
        currentSpeed: speed,
        lastUpdate: new Date(),
        path: [{lat: latitude, lng: longitude, timestamp: new Date()}]
      };
    } else {
      this.trackingInfo[truckId].latitude = latitude;
      this.trackingInfo[truckId].longitude = longitude;
      this.trackingInfo[truckId].speed = speed;
      this.trackingInfo[truckId].distance = distance;
      this.trackingInfo[truckId].distanceCovered = distance;
      this.trackingInfo[truckId].currentSpeed = speed;
      this.trackingInfo[truckId].lastUpdate = new Date();
      this.trackingInfo[truckId].path.push({lat: latitude, lng: longitude, timestamp: new Date()});
    }
    
    // Notify update callbacks
    this.updateCallbacks.forEach(callback => callback(truckId, this.trackingInfo[truckId]));
  }
  
  public registerUpdateCallback(callback: (truckId: string, info: TrackingInfo) => void): number {
    this.updateCallbacks.push(callback);
    return this.updateCallbacks.length - 1;
  }
  
  public unregisterUpdateCallback(callbackId: number): void {
    if (callbackId >= 0 && callbackId < this.updateCallbacks.length) {
      this.updateCallbacks.splice(callbackId, 1);
    }
  }
  
  public startTracking(truck: Truck | string, initialLatitude?: number, initialLongitude?: number): void {
    const truckId = typeof truck === 'string' ? truck : truck.id;
    
    // Get initial coordinates if a Truck object is provided
    let startLat = initialLatitude;
    let startLng = initialLongitude;
    
    if (typeof truck !== 'string') {
      startLat = truck.lastLatitude || initialLatitude;
      startLng = truck.lastLongitude || initialLongitude;
    }
    
    // Only start tracking if coordinates are available
    if (!startLat || !startLng) {
      console.error('Cannot track truck without coordinates');
      return;
    }
    
    this.simulator.startTracking(truckId, startLat, startLng);
    this.isActive = true;
    this.activeTrackedTruck = truckId;
  }
  
  public stopTracking(truckId: string): void {
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
  
  public getAllTrackedTrucks(): Array<{truckId: string, info: TrackingInfo}> {
    return this.simulator.getAllTrackedTrucks().map(truckId => ({
      truckId,
      info: this.trackingInfo[truckId]
    }));
  }
  
  public getTrackingInfo(truckId: string): TrackingInfo | undefined {
    return this.trackingInfo[truckId];
  }
  
  public getPathHistory(truckId: string): Array<{lat: number, lng: number, timestamp: Date}> {
    return this.trackingInfo[truckId]?.path || [];
  }
}

export default GPSTrackingService;
