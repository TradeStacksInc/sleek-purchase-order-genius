
import { Driver, Truck } from '../types';

export const initialDrivers: Driver[] = [
  {
    id: "driver-1",
    name: "John Doe",
    contact: "+234 801-234-5678",
    licenseNumber: "DL-12345-NG",
    isAvailable: true
  },
  {
    id: "driver-2",
    name: "Sarah Johnson",
    contact: "+234 802-345-6789",
    licenseNumber: "DL-67890-NG",
    isAvailable: true
  }
];

export const initialTrucks: Truck[] = [
  {
    id: "truck-1",
    plateNumber: "LG-234-KJA",
    capacity: 33000,
    model: "MAN Diesel 2018",
    hasGPS: true,
    isAvailable: true,
    isGPSTagged: false
  },
  {
    id: "truck-2",
    plateNumber: "AJ-567-LGS",
    capacity: 45000,
    model: "Scania P410 2020",
    hasGPS: true,
    isAvailable: true,
    isGPSTagged: false
  }
];
