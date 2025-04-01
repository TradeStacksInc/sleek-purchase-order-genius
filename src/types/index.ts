
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
}

export interface LogEntry {
  id: string;
  poId: string;
  action: string;
  user: string;
  timestamp: Date;
}
