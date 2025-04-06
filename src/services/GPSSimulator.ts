
class GPSSimulator {
  private trackedTrucks: Map<string, {
    latitude: number;
    longitude: number;
    speed: number;
    distance: number;
    intervalId?: number;
  }>;
  
  public onUpdate?: (truckId: string, latitude: number, longitude: number, speed: number, distance: number) => void;

  constructor() {
    this.trackedTrucks = new Map();
  }

  public startTracking(truckId: string, initialLatitude: number, initialLongitude: number): void {
    // If already tracking, stop first
    if (this.trackedTrucks.has(truckId)) {
      this.stopTracking(truckId);
    }

    // Initialize truck tracking data
    this.trackedTrucks.set(truckId, {
      latitude: initialLatitude,
      longitude: initialLongitude,
      speed: 0,
      distance: 0
    });

    // Start the simulation interval
    const intervalId = window.setInterval(() => {
      this.simulateMovement(truckId);
    }, 10000); // Update every 10 seconds

    // Update the tracking data with the interval ID
    const trackingData = this.trackedTrucks.get(truckId)!;
    this.trackedTrucks.set(truckId, {
      ...trackingData,
      intervalId
    });
  }

  public stopTracking(truckId: string): void {
    const trackingData = this.trackedTrucks.get(truckId);
    if (trackingData && trackingData.intervalId) {
      clearInterval(trackingData.intervalId);
    }
    this.trackedTrucks.delete(truckId);
  }

  public isTracking(): boolean {
    return this.trackedTrucks.size > 0;
  }

  public getAllTrackedTrucks(): string[] {
    return Array.from(this.trackedTrucks.keys());
  }

  private simulateMovement(truckId: string): void {
    const trackingData = this.trackedTrucks.get(truckId);
    if (!trackingData) return;

    // Generate random changes in position
    const latChange = (Math.random() - 0.5) * 0.01; // Small random change in latitude
    const lngChange = (Math.random() - 0.5) * 0.01; // Small random change in longitude
    const newSpeed = Math.max(0, Math.min(120, 50 + (Math.random() - 0.5) * 20)); // Random speed between 40-60 km/h

    // Calculate distance traveled (very simplified)
    const distanceDelta = newSpeed * (10 / 3600); // km traveled in 10 seconds

    // Update position
    const newLatitude = trackingData.latitude + latChange;
    const newLongitude = trackingData.longitude + lngChange;
    const newDistance = trackingData.distance + distanceDelta;

    // Update tracking data
    this.trackedTrucks.set(truckId, {
      ...trackingData,
      latitude: newLatitude,
      longitude: newLongitude,
      speed: newSpeed,
      distance: newDistance
    });

    // Trigger the update callback if defined
    if (this.onUpdate) {
      this.onUpdate(truckId, newLatitude, newLongitude, newSpeed, newDistance);
    }
  }
}

export default GPSSimulator;
