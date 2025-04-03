
import { v4 as uuidv4 } from 'uuid';
import { GPSData } from '../types';

// Time between GPS updates in milliseconds
const UPDATE_INTERVAL = 5000;

interface GPSUpdateCallback {
  (truckId: string, latitude: number, longitude: number, speed: number): void;
}

type TrackedTruck = {
  truckId: string;
  startTime: Date;
  totalDistance: number;
  distanceCovered: number;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeed: number;
  isActive: boolean;
  updateInterval: number | null;
  destination: {
    latitude: number;
    longitude: number;
  };
};

class GPSTrackingService {
  private static instance: GPSTrackingService;
  private trucks: Map<string, TrackedTruck> = new Map();
  private updateCallback: GPSUpdateCallback | null = null;
  
  // Singleton pattern
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
    }
    return GPSTrackingService.instance;
  }
  
  // Register callback for GPS updates
  public registerUpdateCallback(callback: GPSUpdateCallback): void {
    this.updateCallback = callback;
  }
  
  // Start tracking a truck
  public startTracking(
    truckId: string, 
    initialLatitude: number, 
    initialLongitude: number,
    totalDistance: number,
    destinationLatitude: number = 6.5244 + Math.random() * 0.1,
    destinationLongitude: number = 3.3792 + Math.random() * 0.1
  ): void {
    // If truck is already being tracked, stop previous tracking
    if (this.trucks.has(truckId)) {
      this.stopTracking(truckId);
    }
    
    const trucking: TrackedTruck = {
      truckId,
      startTime: new Date(),
      totalDistance,
      distanceCovered: 0,
      currentLatitude: initialLatitude,
      currentLongitude: initialLongitude,
      currentSpeed: 0,
      isActive: true,
      updateInterval: null,
      destination: {
        latitude: destinationLatitude,
        longitude: destinationLongitude
      }
    };
    
    this.trucks.set(truckId, trucking);
    
    // Start the continuous tracking with interval
    const interval = window.setInterval(() => {
      this.updateTruckPosition(truckId);
    }, UPDATE_INTERVAL);
    
    // Store the interval ID for later cleanup
    trucking.updateInterval = interval;
    
    console.log(`Started tracking truck ${truckId}`);
  }
  
  // Update truck position (called by interval)
  private updateTruckPosition(truckId: string): void {
    const truck = this.trucks.get(truckId);
    if (!truck || !truck.isActive) return;
    
    // Calculate progress based on distance covered vs total
    const progress = truck.distanceCovered / truck.totalDistance;
    
    // If journey is complete, finish tracking
    if (progress >= 1) {
      // Make one final update at the exact destination
      this.updateGPS(
        truckId,
        truck.destination.latitude,
        truck.destination.longitude,
        0,
        truck.totalDistance
      );
      this.stopTracking(truckId);
      return;
    }
    
    // Generate realistic movement towards destination
    const remainingDistancePercent = 1 - progress;
    
    // Move closer to destination with each update
    // More direct path as we get closer to destination
    const latStep = (truck.destination.latitude - truck.currentLatitude) * 
      (0.05 + (0.1 * progress)); // Accelerate towards destination
      
    const lngStep = (truck.destination.longitude - truck.currentLongitude) * 
      (0.05 + (0.1 * progress));
    
    const newLat = truck.currentLatitude + latStep;
    const newLng = truck.currentLongitude + lngStep;
    
    // Random speed between 40-70 km/h, slowing as we approach destination
    const speed = Math.floor(Math.random() * 30) + 40 - (progress * 20);
    
    // Calculate distance covered in this step (simplified approximation)
    const stepDistance = Math.sqrt(
      Math.pow(latStep * 111000, 2) + 
      Math.pow(lngStep * 111000 * Math.cos(newLat * Math.PI / 180), 2)
    ) / 1000; // Convert to km
    
    const newDistanceCovered = Math.min(
      truck.totalDistance,
      truck.distanceCovered + stepDistance
    );
    
    // Update GPS data through callback
    this.updateGPS(truckId, newLat, newLng, speed, newDistanceCovered);
    
    // Update stored truck data
    truck.currentLatitude = newLat;
    truck.currentLongitude = newLng;
    truck.currentSpeed = speed;
    truck.distanceCovered = newDistanceCovered;
  }
  
  // Update GPS through callback
  private updateGPS(
    truckId: string, 
    latitude: number, 
    longitude: number, 
    speed: number,
    distanceCovered: number
  ): void {
    // Call the registered callback if available
    if (this.updateCallback) {
      this.updateCallback(truckId, latitude, longitude, speed);
    }
    
    // Create GPS data record (the callback would normally save this)
    const gpsData: GPSData = {
      id: uuidv4(),
      truckId,
      latitude,
      longitude, 
      speed,
      timestamp: new Date(),
    };
    
    console.log(`GPS Update for ${truckId}: Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}, Speed: ${speed} km/h, Distance: ${distanceCovered.toFixed(2)}km`);
  }
  
  // Stop tracking a truck
  public stopTracking(truckId: string): void {
    const truck = this.trucks.get(truckId);
    if (!truck) return;
    
    // Clear the interval
    if (truck.updateInterval !== null) {
      clearInterval(truck.updateInterval);
    }
    
    truck.isActive = false;
    console.log(`Stopped tracking truck ${truckId}`);
  }
  
  // Get current tracking data for a truck
  public getTrackingInfo(truckId: string): TrackedTruck | null {
    return this.trucks.get(truckId) || null;
  }
  
  // Check if truck is being tracked
  public isTracking(truckId: string): boolean {
    const truck = this.trucks.get(truckId);
    return !!truck && truck.isActive;
  }
  
  // Get all actively tracked trucks
  public getAllTrackedTrucks(): string[] {
    return Array.from(this.trucks.entries())
      .filter(([_, truck]) => truck.isActive)
      .map(([truckId, _]) => truckId);
  }
}

export default GPSTrackingService;
