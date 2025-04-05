class GPSSimulator {
  private static instance: GPSSimulator;
  private pathHistory: { [truckId: string]: { lat: number; lng: number }[] } = {};

  private constructor() {}

  public static getInstance(): GPSSimulator {
    if (!GPSSimulator.instance) {
      GPSSimulator.instance = new GPSSimulator();
    }
    return GPSSimulator.instance;
  }

  startSimulation(truckId: string, updateInterval: number = 3000) {
    if (!this.pathHistory[truckId]) {
      this.pathHistory[truckId] = [];
    }

    setInterval(() => {
      this.simulateGPSData(truckId);
    }, updateInterval);
  }

  getPathHistory(truckId: string): { lat: number; lng: number }[] {
    return this.pathHistory[truckId] || [];
  }

  getTrackingInfo(truckId: string): { currentLatitude: number; currentLongitude: number; currentSpeed: number; distanceCovered: number } | null {
    const history = this.pathHistory[truckId];
    if (!history || history.length === 0) return null;

    const lastPosition = history[history.length - 1];
    const currentSpeed = Math.floor(Math.random() * 80) + 10; // 10-90 km/h

    let distanceCovered = 0;
    if (history.length > 1) {
      for (let i = 1; i < history.length; i++) {
        distanceCovered += this.calculateDistance(history[i - 1].lat, history[i - 1].lng, history[i].lat, history[i].lng);
      }
    }

    return {
      currentLatitude: lastPosition.lat,
      currentLongitude: lastPosition.lng,
      currentSpeed: currentSpeed,
      distanceCovered: distanceCovered
    };
  }

  private simulateGPSData(truckId: string) {
    // Simulate a GPS data point
    const lastPosition = this.pathHistory[truckId] ? this.pathHistory[truckId][this.pathHistory[truckId].length - 1] : { lat: 6.5244, lng: 3.3792 }; // Lagos coordinates
    const newLatitude = lastPosition.lat + (Math.random() - 0.5) * 0.01;
    const newLongitude = lastPosition.lng + (Math.random() - 0.5) * 0.01;
    const speed = Math.floor(Math.random() * 80) + 10; // 10-90 km/h
    const heading = Math.floor(Math.random() * 360);

    const gpsData = this.createGpsDataPoint(truckId, newLatitude, newLongitude, speed, heading);
    this.pathHistory[truckId].push({ lat: newLatitude, lng: newLongitude });
  }

  createGpsDataPoint(truckId: string, latitude: number, longitude: number, speed: number, heading: number) {
    return {
      id: `gps-${Math.random().toString(36).substring(2, 10)}`,
      truckId,
      latitude,
      longitude,
      speed,
      heading, // Added as an optional property in the GPSData interface
      timestamp: new Date(),
      fuelLevel: Math.floor(Math.random() * 40) + 60, // 60-100% fuel level
      location: this.getLocationName(latitude, longitude)
    };
  }
  
  getLocationName(lat: number, lng: number): string {
    // Simple location determination based on coordinates
    // In a real implementation, this would use reverse geocoding
    if (lat > 6.5 && lng < 3.35) return "Ikeja";
    if (lat < 6.48 && lng > 3.38) return "Victoria Island";
    if (lat > 6.6) return "Ikorodu";
    if (lng < 3.3) return "Agege";
    return "Lagos Mainland";
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default GPSSimulator;
