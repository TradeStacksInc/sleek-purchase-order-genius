export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
  supplierId: string;
  supplierName: string;
  category: 'fuel' | 'lubricant' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export type ProductType = 'PMS' | 'AGO' | 'DPK' | string;

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  email?: string; 
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
  // Extra properties used in the app
  supplierType?: 'Major' | 'Independent' | 'Government';
  depotName?: string;
  taxId?: string;
  accountNumber?: string;
  bankName?: string;
  products?: string[];
}

export interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  driverId: string;
  driverName: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties used in the app
  hasGPS?: boolean;
  isGPSTagged?: boolean;
  isAvailable?: boolean;
  gpsDeviceId?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSpeed?: number;
  lastUpdate?: Date;
  year?: number;
}

export interface Driver {
  id: string;
  name: string;
  contactPhone: string;
  licenseNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties used in the app
  contact?: string;
  isAvailable?: boolean;
}

export interface GPSData {
  id: string;
  truckId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  location: string;
  heading?: number;
}

export interface AIInsights {
  id: string;
  truckId: string;
  timestamp: Date;
  anomalyType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  // Additional properties
  type?: 'discrepancy_pattern' | 'driver_analysis' | 'efficiency_recommendation' | string;
  relatedEntityIds?: string[];
  generatedAt?: Date;
  isRead?: boolean;
}

export type AIInsight = AIInsights; // Alias for compatibility

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  deliveryDate: Date;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional properties used in the app
  poNumber?: string;
  supplier?: {
    name: string;
    id?: string;
    contact?: string;
    email?: string;
    address?: string;
  };
  grandTotal?: number;
  company?: {
    name: string;
    address: string;
    contact: string;
    email: string;
    taxId?: string;
  };
  deliveryDetails?: DeliveryDetails;
  offloadingDetails?: OffloadingDetails;
  incidents?: Incident[];
  statusHistory?: StatusHistoryEntry[];
  paymentTerm?: string | PaymentTerm;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  // Additional properties used in the app
  id?: string;
  product?: string;
  totalPrice?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'operator';
  contactPhone: string;
  address: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispenser {
  id: string;
  number: number;
  productType: ProductType;
  status: 'operational' | 'maintenance' | 'offline';
  lastCalibrationDate?: Date;
  nextCalibrationDate?: Date;
  totalVolumeSold: number;
  connectedTankId?: string;
  isActive?: boolean;
  currentShiftVolume?: number;
  currentShiftSales?: number;
  totalSales?: number;
  totalVolume?: number;
  salesAmount?: number;
  shift?: 'morning' | 'afternoon';
  lastActivity?: Date;
  lastShiftReset?: Date;
  unitPrice?: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  staffMembers: string[];
  // Additional properties used in the app
  staffId?: string;
  status?: 'active' | 'completed';
  salesVolume?: number;
  salesAmount?: number;
}

export interface Sale {
  id: string;
  dispenserId: string;
  dispenserNumber?: number;
  staffId: string;
  productType: ProductType;
  volume: number;
  unitPrice: number;
  totalAmount: number;
  amount?: number;
  timestamp: Date;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  receiptNumber?: string;
  customerId?: string;
  shiftId?: string;
  shift?: 'morning' | 'afternoon';
  isManualEntry?: boolean;
}

export interface Price {
  id: string;
  productType: ProductType;
  price: number;
  effectiveDate: Date;
  isActive?: boolean;
  endDate?: Date;
  purchasePrice?: number;
  sellingPrice?: number;
}

export type PriceRecord = Price; // Alias for compatibility

export interface Incident {
  id: string;
  type: 'theft' | 'spillage' | 'equipment_failure' | 'other' | 'delay' | 'mechanical' | 'accident' | 'feedback';
  description: string;
  location: string;
  timestamp: Date;
  staffInvolved: string[];
  truckInvolved?: string;
  amountLost?: number;
  status: 'open' | 'closed';
  // Additional properties used in the app
  severity?: 'low' | 'medium' | 'high';
  impact?: 'positive' | 'negative' | 'neutral';
  reportedBy?: string;
  deliveryId?: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'supplier' | 'truck' | 'driver' | 'purchase_order' | 'staff' | 'dispenser' | 'shift' | 'sale' | 'price' | 'incident' | 'tank';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'other' | 'sale';
  details: string;
  user: string;
  timestamp: Date;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface Tank {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  productType: ProductType;
  lastRefillDate: Date;
  nextInspectionDate: Date;
  // Additional properties used in the app
  currentVolume?: number;
  minVolume?: number;
  status?: 'operational' | 'maintenance' | 'offline';
  isActive?: boolean;
  connectedDispensers?: string[];
}

// Additional interfaces used in the application
export interface DeliveryDetails {
  id: string;
  poId: string;
  driverId?: string;
  driverName?: string; // Added for MapView component
  truckId?: string;
  vehicleDetails?: string; // Added for MapView component
  status: 'pending' | 'in_transit' | 'delivered' | 'completed';
  depotDepartureTime?: Date;
  destinationArrivalTime?: Date;
  distanceCovered?: number;
  totalDistance?: number;
  expectedArrivalTime?: Date;
  isGPSTagged?: boolean;
  gpsDeviceId?: string;
}

export interface OffloadingDetails {
  id: string;
  deliveryId: string;
  timestamp: Date;
  loadedVolume: number;
  deliveredVolume: number;
  initialTankVolume: number;
  finalTankVolume: number;
  discrepancyPercentage: number;
  isDiscrepancyFlagged: boolean;
  tankId: string;
  productType: string;
  measuredBy: string;
  measuredByRole: string;
  notes?: string;
  status?: 'approved' | 'under_investigation';
}

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'active' | 'fulfilled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  user: string;
  note?: string;
  id?: string; // Added to fix purchase order history errors
}

export interface LogEntry {
  id: string;
  poId: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  contact?: string; // Added for compatibility
  website?: string;
  logo?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentTerm {
  id: string;
  name: string;
  days: number;
  description?: string;
}
