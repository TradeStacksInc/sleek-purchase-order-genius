import { GPSData, Truck } from '@/types';

// Define a type for the tracking information
export interface TrackingInfo {
  truckId: string;
  currentLatitude: number;
  currentLongitude: number;
  speed: number;
  heading: number;
  lastUpdate: Date;
  distanceRemaining: number;
  estimatedArrival: Date;
  path: { lat: number, lng: number }[];
  totalDistance: number;
  sourceLocation: { lat: number, lng: number, name: string };
  destinationLocation: { lat: number, lng: number, name: string };
  distanceCovered: number;
  currentSpeed: number;
}

// Singleton class for GPS simulation
class GPSSimulator {
  private static instance: GPSSimulator;
  private trackedTrucks: Map<string, TrackingInfo>;
  private updateCallbacks: Array<(data: GPSData) => void>;
  private simulationIntervals: Map<string, number>;
  
  // Private constructor to enforce singleton pattern
  private constructor() {
    this.trackedTrucks = new Map();
    this.updateCallbacks = [];
    this.simulationIntervals = new Map();
  }
  
  // Get the singleton instance
  public static getInstance(): GPSSimulator {
    if (!GPSSimulator.instance) {
      GPSSimulator.instance = new GPSSimulator();
    }
    return GPSSimulator.instance;
  }
  
  // Register a callback to be called when GPS data updates
  public registerUpdateCallback(callback: (data: GPSData) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  // Start tracking a truck with simulated GPS data
  public startTracking(
    truckId: string,
    startLatitude: number,
    startLongitude: number,
    totalDistance: number,
    sourceLocation?: { lat: number, lng: number, name: string },
    destinationLocation?: { lat: number, lng: number, name: string }
  ): void {
    // Stop tracking if already tracking
    if (this.isTracking(truckId)) {
      this.stopTracking(truckId);
    }
    
    // Generate a random path
    const path = this.generateRandomPath(
      startLatitude, 
      startLongitude,
      destinationLocation?.lat || startLatitude + (Math.random() * 0.5),
      destinationLocation?.lng || startLongitude + (Math.random() * 0.5),
      10
    );
    
    // Calculate estimated arrival time based on distance and average speed
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + totalDistance / 50); // Assuming 50 km/h
    
    // Create tracking info
    const trackingInfo: TrackingInfo = {
      truckId,
      currentLatitude: startLatitude,
      currentLongitude: startLongitude,
      speed: 40 + Math.random() * 20, // 40-60 km/h
      heading: Math.random() * 360, // Random initial heading
      lastUpdate: new Date(),
      distanceRemaining: totalDistance,
      estimatedArrival,
      path,
      totalDistance,
      sourceLocation: sourceLocation || { lat: startLatitude, lng: startLongitude, name: 'Starting Point' },
      destinationLocation: destinationLocation || { 
        lat: path[path.length - 1].lat, 
        lng: path[path.length - 1].lng, 
        name: 'Destination' 
      },
      distanceCovered: 0,
      currentSpeed: 40 + Math.random() * 20
    };
    
    // Store tracking info
    this.trackedTrucks.set(truckId, trackingInfo);
    
    // Start simulation
    const intervalId = window.setInterval(() => {
      this.updateTruckPosition(truckId);
    }, 10000); // Update every 10 seconds
    
    this.simulationIntervals.set(truckId, intervalId);
    
    // Initial update
    this.updateTruckPosition(truckId);
  }
  
  // Stop tracking a truck
  public stopTracking(truckId: string): void {
    // Clear interval if exists
    const intervalId = this.simulationIntervals.get(truckId);
    if (intervalId) {
      clearInterval(intervalId);
      this.simulationIntervals.delete(truckId);
    }
    
    // Remove from tracked trucks
    this.trackedTrucks.delete(truckId);
  }
  
  // Check if a truck is being tracked
  public isTracking(truckId: string): boolean {
    return this.trackedTrucks.has(truckId);
  }
  
  // Get tracking info for a truck
  public getTrackingInfo(truckId: string): TrackingInfo | null {
    return this.trackedTrucks.get(truckId) || null;
  }
  
  // Get all tracked trucks
  public getAllTrackedTrucks(): string[] {
    return Array.from(this.trackedTrucks.keys());
  }
  
  // Get path history for a truck
  public getPathHistory(truckId: string): { lat: number, lng: number }[] {
    const info = this.trackedTrucks.get(truckId);
    return info ? info.path : [];
  }
  
  // Private method to update truck position
  private updateTruckPosition(truckId: string): void {
    const info = this.trackedTrucks.get(truckId);
    if (!info) return;
    
    // Get next point from path or generate random movement
    let newLatitude = info.currentLatitude;
    let newLongitude = info.currentLongitude;
    let distanceRemaining = info.distanceRemaining;
    let speed = info.speed;
    
    // Get path index
    const pathIndex = info.path.findIndex(
      point => point.lat === info.currentLatitude && point.lng === info.currentLongitude
    );
    
    if (pathIndex < info.path.length - 1) {
      // Move to next point in path
      const nextPoint = info.path[pathIndex + 1];
      newLatitude = nextPoint.lat;
      newLongitude = nextPoint.lng;
      
      // Calculate distance moved
      const distanceMoved = this.calculateDistance(
        info.currentLatitude, 
        info.currentLongitude,
        newLatitude,
        newLongitude
      );
      
      // Update distance remaining
      distanceRemaining = Math.max(0, distanceRemaining - distanceMoved);
      
      // Update speed (with some variation)
      speed = 40 + Math.random() * 20;
    } else {
      // Reached end of path
      distanceRemaining = 0;
      speed = 0;
    }
    
    // Calculate heading
    const heading = this.calculateHeading(
      info.currentLatitude,
      info.currentLongitude,
      newLatitude,
      newLongitude
    );
    
    // Update tracking info
    const updatedInfo: TrackingInfo = {
      ...info,
      currentLatitude: newLatitude,
      currentLongitude: newLongitude,
      speed,
      heading,
      lastUpdate: new Date(),
      distanceRemaining,
      distanceCovered: info.totalDistance - distanceRemaining,
      currentSpeed: speed
    };
    
    this.trackedTrucks.set(truckId, updatedInfo);
    
    // Create GPS data
    const gpsData: GPSData = {
      id: `gps-${Date.now()}`,
      truckId,
      latitude: newLatitude,
      longitude: newLongitude,
      speed,
      heading,
      timestamp: new Date(),
      fuelLevel: Math.floor(Math.random() * 20) + 80, // Random between 80-100%
      location: `Generated location at ${newLatitude.toFixed(4)}, ${newLongitude.toFixed(4)}`
    };
    
    // Notify callbacks
    this.updateCallbacks.forEach(callback => {
      callback(gpsData);
    });
  }
  
  // Generate a random path between two points
  private generateRandomPath(
    startLat: number, 
    startLng: number,
    endLat: number,
    endLng: number,
    numPoints: number
  ): { lat: number, lng: number }[] {
    const path: { lat: number, lng: number }[] = [];
    
    // Add starting point
    path.push({ lat: startLat, lng: startLng });
    
    // Generate intermediate points
    for (let i = 1; i < numPoints; i++) {
      const ratio = i / numPoints;
      
      // Add some randomness to make it look like a real path
      const randomLat = (Math.random() - 0.5) * 0.01;
      const randomLng = (Math.random() - 0.5) * 0.01;
      
      const lat = startLat + (endLat - startLat) * ratio + randomLat;
      const lng = startLng + (endLng - startLng) * ratio + randomLng;
      
      path.push({ lat, lng });
    }
    
    // Add ending point
    path.push({ lat: endLat, lng: endLng });
    
    return path;
  }
  
  // Calculate distance between two points (haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Calculate heading between two points
  private calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = this.toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(this.toRadians(lat2));
    const x = 
      Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
      Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLng);
    let brng = Math.atan2(y, x);
    brng = this.toDegrees(brng);
    return (brng + 360) % 360;
  }
  
  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  // Convert radians to degrees
  private toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }
}

export default GPSSimulator;

export const generateGPSData = (truckId: string, latitude: number, longitude: number, speed: number, heading: number = 0): GPSData => {
  return {
    id: `gps-${Date.now()}`,
    truckId,
    timestamp: new Date(),
    latitude,
    longitude,
    speed,
    heading,
    fuelLevel: Math.floor(Math.random() * 20) + 80, // Random between 80-100%
    location: `Generated location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  };
};
