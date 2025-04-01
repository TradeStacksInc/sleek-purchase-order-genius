
import { LogEntry, PurchaseOrder, Supplier, Driver, Truck, DeliveryDetails, GPSData, OffloadingDetails, Incident, AIInsight } from '../types';

export interface AppContextType {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  aiInsights: AIInsight[];
  addPurchaseOrder: (order: PurchaseOrder) => void;
  addSupplier: (supplier: Supplier) => void;
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getOrderById: (id: string) => PurchaseOrder | undefined;
  getLogsByOrderId: (id: string) => LogEntry[];
  logAIInteraction: (query: string, response: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  addTruck: (truck: Omit<Truck, 'id'>) => Truck;
  assignDriverToOrder: (orderId: string, driverId: string, truckId: string) => void;
  updateDeliveryStatus: (
    orderId: string, 
    updates: Partial<DeliveryDetails>
  ) => void;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
  getDriverById: (id: string) => Driver | undefined;
  getTruckById: (id: string) => Truck | undefined;
  getAvailableDrivers: () => Driver[];
  getAvailableTrucks: () => Truck[];
  recordOffloadingDetails: (orderId: string, offloadingData: Omit<OffloadingDetails, 'id' | 'deliveryId' | 'timestamp' | 'discrepancyPercentage' | 'isDiscrepancyFlagged' | 'status'>) => void;
  addIncident: (orderId: string, incident: Omit<Incident, 'id' | 'deliveryId' | 'timestamp'>) => void;
  getOrdersWithDeliveryStatus: (status: 'pending' | 'in_transit' | 'delivered') => PurchaseOrder[];
  getOrdersWithDiscrepancies: () => PurchaseOrder[];
  generateDiscrepancyInsights: () => void;
  markInsightAsRead: (id: string) => void;
  tagTruckWithGPS: (truckId: string, gpsDeviceId: string, initialLatitude: number, initialLongitude: number) => void;
  startDelivery: (orderId: string) => void;
  completeDelivery: (orderId: string) => void;
}
