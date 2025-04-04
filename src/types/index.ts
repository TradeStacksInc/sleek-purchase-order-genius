export type Product = 'PMS' | 'AGO' | 'DPK';

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'active' | 'fulfilled';

export type PaymentTerm = '50% Advance' | 'Full Payment' | 'Credit';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Company {
  name: string;
  address: string;
  contact: string;
  taxId: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  contact: string;
  email?: string;
  supplierType?: 'Major' | 'Independent' | 'Government';
  depotName?: string;
  taxId?: string;
  accountNumber?: string;
  bankName?: string;
  products?: string[];
}

export interface Driver {
  id: string;
  name: string;
  contact: string;
  licenseNumber: string;
  isAvailable: boolean;
  address?: string;
  email?: string;
  emergencyContact?: string;
  licenseCategoryType?: string;
  licenseExpiryDate?: Date;
}

export interface Truck {
  id: string;
  plateNumber: string;
  capacity: number;
  model: string;
  hasGPS: boolean;
  isAvailable: boolean;
  isGPSTagged?: boolean;
  gpsDeviceId?: string;
  year?: number;
  lastLatitude?: number;
  lastLongitude?: number;
  lastSpeed?: number;
  lastUpdate?: Date;
  manufacturer?: string;
  tankCapacity?: number;
  tankCompartments?: number;
  registration?: {
    expiryDate: Date;
    certificateNumber: string;
  };
  maintenance?: {
    lastServiceDate: Date;
    nextServiceDate: Date;
    serviceRecords: string[];
  };
}

export interface GPSData {
  id: string;
  truckId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
  heading?: number;
}

export interface DeliveryDetails {
  id: string;
  poId: string;
  driverId?: string;
  truckId?: string;
  depotDepartureTime?: Date;
  destinationArrivalTime?: Date;
  expectedArrivalTime?: Date;
  status: 'pending' | 'in_transit' | 'delivered';
  distanceCovered?: number;
  totalDistance?: number;
  isGPSTagged?: boolean;
  gpsDeviceId?: string;
  driverName?: string;
  vehicleDetails?: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  user: string;
  note?: string;
}

export interface OffloadingDetails {
  id: string;
  deliveryId: string;
  initialTankVolume: number;
  finalTankVolume: number;
  loadedVolume: number;
  deliveredVolume: number;
  measuredBy: string;
  measuredByRole: string;
  discrepancyPercentage: number;
  isDiscrepancyFlagged: boolean;
  status: 'pending' | 'approved' | 'under_investigation';
  notes?: string;
  timestamp: Date;
  tankId?: string;
  productType?: Product;
}

export interface Incident {
  id: string;
  deliveryId: string;
  type: 'delay' | 'mechanical' | 'accident' | 'feedback' | 'other';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  reportedBy: string;
  timestamp: Date;
  attachments?: string[];
  status?: 'open' | 'in_progress' | 'resolved';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
  resolutionDate?: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  company: Company;
  supplier: Supplier;
  items: OrderItem[];
  grandTotal: number;
  paymentTerm: PaymentTerm;
  deliveryDate: Date;
  status: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  rejectionReason?: string;
  deliveryDetails?: DeliveryDetails;
  offloadingDetails?: OffloadingDetails;
  incidents?: Incident[];
}

export interface LogEntry {
  id: string;
  poId: string;
  action: string;
  user: string;
  timestamp: Date;
}

export interface AIInsight {
  id: string;
  type: 'discrepancy_pattern' | 'driver_analysis' | 'efficiency_recommendation';
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedEntityIds: string[];
  generatedAt: Date;
  isRead: boolean;
}

// New types for expanded database structure

export interface Staff {
  id: string;
  name: string;
  role: 'Manager' | 'Attendant' | 'Cashier' | 'Supervisor' | 'Security' | 'Admin';
  contact: string;
  email?: string;
  address?: string;
  employeeId: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  shifts?: Shift[];
  sales?: Sale[];
}

export interface Dispenser {
  id: string;
  number: number;
  productType: Product;
  status: 'operational' | 'maintenance' | 'offline';
  lastCalibrationDate?: Date;
  nextCalibrationDate?: Date;
  totalVolumeSold: number;
  connectedTankId?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'completed';
  notes?: string;
  salesVolume?: number;
  salesAmount?: number;
}

export interface Sale {
  id: string;
  dispenserId: string;
  staffId: string;
  productType: Product;
  volume: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: Date;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  receiptNumber?: string;
  customerId?: string;
  shiftId?: string;
}

export interface PriceRecord {
  id: string;
  productType: Product;
  purchasePrice: number;
  sellingPrice: number;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
  setBy: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'supplier' | 'truck' | 'driver' | 'purchase_order' | 'staff' | 'dispenser' | 'shift' | 'sale' | 'price' | 'incident' | 'tank';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'other';
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
  currentVolume: number;
  productType: Product;
  lastRefillDate?: Date;
  minVolume: number;
  status: 'operational' | 'maintenance' | 'offline';
  connectedDispensers: string[];
}
