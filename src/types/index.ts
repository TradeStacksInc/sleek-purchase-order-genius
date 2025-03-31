
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
}

export interface LogEntry {
  id: string;
  poId: string;
  action: string;
  user: string;
  timestamp: Date;
}
