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

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface Driver {
  id: string;
  name: string;
  contactPhone: string;
  licenseNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface AIInsights {
  id: string;
  truckId: string;
  timestamp: Date;
  anomalyType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  deliveryDate: Date;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
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
  productType: Product;
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
}

export interface Shift {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  staffMembers: string[];
}

export interface Sale {
  id: string;
  dispenserId: string;
  dispenserNumber?: number;
  staffId: string;
  productType: Product;
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
  productType: Product;
  price: number;
  effectiveDate: Date;
}

export interface Incident {
  id: string;
  type: 'theft' | 'spillage' | 'equipment_failure' | 'other';
  description: string;
  location: string;
  timestamp: Date;
  staffInvolved: string[];
  truckInvolved?: string;
  amountLost?: number;
  status: 'open' | 'closed';
}

export interface ActivityLog {
  id: string;
  entityType: 'supplier' | 'truck' | 'driver' | 'purchase_order' | 'staff' | 'dispenser' | 'shift' | 'sale' | 'price' | 'incident' | 'tank';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'sale' | 'other';
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
  productType: Product;
  lastRefillDate: Date;
  nextInspectionDate: Date;
}
