// Product types
export type Product = 'PMS' | 'AGO' | 'DPK' | 'LPG' | 'KERO';
export type ProductType = Product | string; // Allow string comparison for Product types

// AIInsights
export interface AIInsights {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedEntityIds: string[];
  generatedAt: Date;
  isRead: boolean;
  truckId?: string;
  timestamp?: Date;
  anomalyType?: string;
}

// Use AIInsight as an alias for AIInsights for backward compatibility
export type AIInsight = AIInsights;

// Price Record
export interface Price {
  id: string;
  productType: ProductType;
  price: number;
  effectiveDate: Date;
  endDate?: Date;
  isActive?: boolean;
  purchasePrice?: number;
  sellingPrice?: number;
}

export type PriceRecord = Price;

// Company
export interface Company {
  id?: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  contact?: string;
  website?: string;
  logo?: string;
  taxId?: string;
  registrationNumber?: string;
}

// Order Status
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'active' | 'fulfilled';
export type PaymentTerm = 'net_7' | 'net_15' | 'net_30' | 'net_60' | 'cod' | '50% Advance' | '100% Advance' | 'Credit';

export interface StatusHistoryEntry {
  id?: string;
  status: OrderStatus;
  timestamp: Date;
  user: string;
  note: string;
}

// Order Item
export interface OrderItem {
  id?: string;
  productId?: string;
  productName?: string;
  product?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrderItem extends OrderItem {
  totalAmount?: number;
}

// Delivery Details
export interface DeliveryDetails {
  id?: string;
  status: 'pending' | 'in_transit' | 'delivered';
  driverId?: string;
  truckId?: string;
  depotDepartureTime?: Date;
  expectedArrivalTime?: Date;
  actualArrivalTime?: Date;
  destinationArrivalTime?: Date;
  totalDistance?: number;
  distanceCovered?: number;
  driverName?: string;
  vehicleDetails?: string;
}

// Offloading Details
export interface OffloadingDetails {
  tankId: string;
  initialTankVolume: number;
  finalTankVolume: number;
  loadedVolume: number;
  deliveredVolume: number;
  measuredBy: string;
  measuredByRole: string;
  notes?: string;
  isDiscrepancyFlagged?: boolean;
  discrepancyPercentage?: number;
  productType?: string;
  timestamp?: Date;
}

// Purchase Order
export interface PurchaseOrder {
  id: string;
  supplierId?: string;
  items: PurchaseOrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  company?: Company;
  supplier?: { name: string; id: string; address?: string; contact?: string };
  poNumber?: string;
  grandTotal?: number;
  paymentTerm?: string;
  deliveryDate?: Date;
  statusHistory?: StatusHistoryEntry[];
  deliveryDetails?: DeliveryDetails;
  offloadingDetails?: OffloadingDetails;
  incidents?: Incident[];
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address: string;
  email?: string;
  contact?: string;
  createdAt?: Date;
  updatedAt?: Date;
  supplierType: 'Major' | 'Independent' | 'Government';
  depotName?: string;
  taxId?: string;
  accountNumber?: string;
  bankName?: string;
  products?: string[];
}

// Driver
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  drivingHistory?: any[];
  currentTruckId?: string;
  contact?: string;
  isAvailable?: boolean;
}

// Truck
export interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  createdAt?: Date;
  updatedAt?: Date;
  driverId?: string;
  driverName?: string;
  isAvailable?: boolean;
  hasGPS?: boolean;
  isGPSTagged?: boolean;
  gpsDeviceId?: string;
  lastSpeed?: number;
  lastLatitude?: number;
  lastLongitude?: number;
  year?: number;
}

// GPS Data
export interface GPSData {
  id: string;
  truckId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
  fuelLevel: number;
  location: string;
  heading?: number;
}

// Log Entry
export type LogAction = 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'other' | 'sale' | string;
export interface LogEntry {
  id?: string;
  timestamp: Date;
  action: LogAction;
  userId?: string;
  user?: string;
  entityId?: string;
  poId?: string;
  entityType: string;
  details?: string;
}

// Staff
export interface Staff {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'operator';
  email: string;
  phone?: string;
  address?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

// Dispenser
export interface Dispenser {
  id: string;
  name: string;
  number?: string;
  model?: string;
  serialNumber?: string;
  tankId?: string;
  connectedTankId?: string;
  productType?: ProductType;
  flow?: number;
  unitPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  status?: string;
  currentShiftSales?: number;
  currentShiftVolume?: number;
  totalSales?: number;
  totalVolume?: number;
  totalVolumeSold?: number;
  lastActivity?: Date;
  lastShiftReset?: Date;
}

// Shift
export interface Shift {
  id: string;
  name?: string;
  startTime: Date;
  endTime?: Date;
  staffMembers?: string[];
  staffId?: string;
  status?: 'active' | 'completed';
  salesVolume?: number;
  salesAmount?: number;
}

// Sale
export interface Sale {
  id: string;
  dispenserId: string;
  dispenserNumber?: string;
  shiftId?: string;
  staffId?: string;
  timestamp: Date;
  volume: number;
  amount: number;
  unitPrice?: number;
  totalAmount?: number;
  productType?: ProductType;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit';
  isManualEntry?: boolean;
}

// Tank
export interface Tank {
  id: string;
  name: string;
  capacity: number;
  productType: ProductType;
  currentLevel?: number;
  lastRefillDate?: Date;
  nextInspectionDate?: Date;
  currentVolume?: number;
  minVolume?: number;
  status?: 'operational' | 'maintenance' | 'offline';
  isActive?: boolean;
  connectedDispensers?: string[];
}

// Incident
export interface Incident {
  id: string;
  type: 'delay' | 'mechanical' | 'accident' | 'feedback' | 'other';
  description: string;
  timestamp?: Date;
  reportedBy?: string;
  severity?: 'low' | 'medium' | 'high';
  status: 'open' | 'closed' | 'in_progress';
  resolution?: string;
  location: string;
  staffInvolved: string[];
  deliveryId?: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

// Activity Log
export interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: LogAction;
  details: string;
  user: string;
  timestamp: Date;
  metadata?: any;
}

// TrackingInfo interface for GPS Simulator
export interface TrackingInfo {
  truckId: string;
  currentLatitude: number;
  currentLongitude: number;
  currentSpeed: number;
  distanceCovered: number;
  lastUpdated: Date;
  route?: Array<{lat: number, lng: number}>;
}
