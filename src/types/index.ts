

export type Product = 'PMS' | 'AGO' | 'DPK';

export type OrderStatus = 'pending' | 'active' | 'fulfilled';

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
}

export interface Driver {
  id: string;
  name: string;
  contact: string;
  licenseNumber: string;
  isAvailable: boolean;
}

export interface Truck {
  id: string;
  plateNumber: string;
  capacity: number;
  model: string;
  hasGPS: boolean;
  isAvailable: boolean;
}

export interface GPSData {
  id: string;
  truckId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
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
}

export interface Incident {
  id: string;
  deliveryId: string;
  type: 'delay' | 'mechanical' | 'accident' | 'feedback' | 'other';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  reportedBy: string;
  timestamp: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  relatedEntityIds: string[]; // Can be driver IDs, truck IDs, etc.
  generatedAt: Date;
  isRead: boolean;
}
