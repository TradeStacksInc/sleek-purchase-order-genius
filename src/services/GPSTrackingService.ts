
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
  // Add pathHistory to store the truck's path
  pathHistory: Array<{lat: number, lng: number, timestamp: Date}>;
};

// Create a localStorage key for persisting tracking state
const TRACKING_STORAGE_KEY = 'gps_tracking_state';

class GPSTrackingService {
  private static instance: GPSTrackingService;
  private trucks: Map<string, TrackedTruck> = new Map();
  private updateCallback: GPSUpdateCallback | null = null;
  
  // Singleton pattern
  public static getInstance(): GPSTrackingService {
    if (!GPSTrackingService.instance) {
      GPSTrackingService.instance = new GPSTrackingService();
      // Load persisted tracking state on initialization
      GPSTrackingService.instance.loadTrackingState();
    }
    return GPSTrackingService.instance;
  }
  
  // Constructor that loads stored tracking data
  private constructor() {
    console.log('GPS Tracking Service initialized');
    // Automatically restore active tracking sessions
    this.loadTrackingState();
  }
  
  // Save current tracking state to localStorage
  private saveTrackingState(): void {
    try {
      const trackingData = Array.from(this.trucks.entries())
        .filter(([_, truck]) => truck.isActive)
        .map(([id, truck]) => ({
          truckId: id,
          startTime: truck.startTime,
          totalDistance: truck.totalDistance,
          distanceCovered: truck.distanceCovered,
          currentLatitude: truck.currentLatitude,
          currentLongitude: truck.currentLongitude,
          currentSpeed: truck.currentSpeed,
          destination: truck.destination,
          pathHistory: truck.pathHistory
        }));
      
      localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(trackingData));
      console.log('Saved tracking state for', trackingData.length, 'trucks');
    } catch (error) {
      console.error('Failed to save tracking state:', error);
    }
  }
  
  // Load tracking state from localStorage
  private loadTrackingState(): void {
    try {
      const storedData = localStorage.getItem(TRACKING_STORAGE_KEY);
      if (!storedData) return;
      
      const trackingData = JSON.parse(storedData);
      
      // Clear any existing tracking
      for (const [truckId, truck] of this.trucks.entries()) {
        if (truck.updateInterval) {
          clearInterval(truck.updateInterval);
        }
      }
      
      this.trucks.clear();
      
      // Restore tracked trucks
      trackingData.forEach((data: any) => {
        this.trucks.set(data.truckId, {
          truckId: data.truckId,
          startTime: new Date(data.startTime),
          totalDistance: data.totalDistance,
          distanceCovered: data.distanceCovered,
          currentLatitude: data.currentLatitude,
          currentLongitude: data.currentLongitude,
          currentSpeed: data.currentSpeed,
          isActive: true,
          updateInterval: null,
          destination: data.destination,
          pathHistory: data.pathHistory || []
        });
        
        // Restart tracking for active trucks
        this.resumeTracking(data.truckId);
      });
      
      console.log('Restored tracking state for', this.trucks.size, 'trucks');
    } catch (error) {
      console.error('Failed to load tracking state:', error);
    }
  }
  
  // Resume tracking for a previously tracked truck
  private resumeTracking(truckId: string): void {
    const truck = this.trucks.get(truckId);
    if (!truck) return;
    
    // Start the continuous tracking with interval
    const interval = window.setInterval(() => {
      this.updateTruckPosition(truckId);
    }, UPDATE_INTERVAL);
    
    // Store the interval ID for later cleanup
    truck.updateInterval = interval;
    
    console.log(`Resumed tracking for truck ${truckId}`);
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
      },
      pathHistory: [{
        lat: initialLatitude,
        lng: initialLongitude,
        timestamp: new Date()
      }]
    };
    
    this.trucks.set(truckId, trucking);
    
    // Start the continuous tracking with interval
    const interval = window.setInterval(() => {
      this.updateTruckPosition(truckId);
    }, UPDATE_INTERVAL);
    
    // Store the interval ID for later cleanup
    trucking.updateInterval = interval;
    
    // Save the initial state
    this.saveTrackingState();
    
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
      
      // Add final position to path history
      truck.pathHistory.push({
        lat: truck.destination.latitude,
        lng: truck.destination.longitude,
        timestamp: new Date()
      });
      
      this.stopTracking(truckId);
      return;
    }
    
    // Generate realistic movement towards destination
    const remainingDistancePercent = 1 - progress;
    
    // More realistic path generation with slight deviation
    // This creates a more natural path with small variations
    const directLatStep = (truck.destination.latitude - truck.currentLatitude) * 
      (0.05 + (0.1 * progress)); // Accelerate towards destination
      
    const directLngStep = (truck.destination.longitude - truck.currentLongitude) * 
      (0.05 + (0.1 * progress));
    
    // Add a small random deviation to make the path look more natural
    const deviation = 0.0001 * (1 - progress * 0.7); // Smaller deviations as we get closer
    const latDeviation = (Math.random() - 0.5) * 2 * deviation;
    const lngDeviation = (Math.random() - 0.5) * 2 * deviation;
    
    const latStep = directLatStep + latDeviation;
    const lngStep = directLngStep + lngDeviation;
    
    const newLat = truck.currentLatitude + latStep;
    const newLng = truck.currentLongitude + lngStep;
    
    // Random speed between 40-70 km/h, slowing as we approach destination
    // More realistic speed changes with small fluctuations
    const baseSpeed = Math.floor(Math.random() * 30) + 40 - (progress * 20);
    const prevSpeed = truck.currentSpeed;
    const maxSpeedChange = 5; // Maximum speed change per update for realism
    
    // Gradually change speed instead of jumping
    let newSpeed = baseSpeed;
    if (prevSpeed > 0) {
      const speedDiff = baseSpeed - prevSpeed;
      newSpeed = prevSpeed + Math.min(Math.max(speedDiff, -maxSpeedChange), maxSpeedChange);
    }
    
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
    this.updateGPS(truckId, newLat, newLng, newSpeed, newDistanceCovered);
    
    // Add position to path history for drawing the route
    truck.pathHistory.push({
      lat: newLat,
      lng: newLng,
      timestamp: new Date()
    });
    
    // Update stored truck data
    truck.currentLatitude = newLat;
    truck.currentLongitude = newLng;
    truck.currentSpeed = newSpeed;
    truck.distanceCovered = newDistanceCovered;
    
    // Save the updated state
    this.saveTrackingState();
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
    
    // Update saved state
    this.saveTrackingState();
  }
  
  // Get current tracking data for a truck
  public getTrackingInfo(truckId: string): TrackedTruck | null {
    return this.trucks.get(truckId) || null;
  }
  
  // Get path history for a truck
  public getPathHistory(truckId: string): Array<{lat: number, lng: number, timestamp: Date}> {
    const truck = this.trucks.get(truckId);
    return truck ? truck.pathHistory : [];
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
