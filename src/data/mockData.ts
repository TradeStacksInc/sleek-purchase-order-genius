
import { Company, LogEntry, OrderStatus, PaymentTerm, Product, PurchaseOrder, Supplier } from '../types';

// Mock company data
export const mockCompany: Company = {
  name: 'EcoFuel Filling Station',
  address: '123 Petroleum Way, Lagos',
  contact: '+234 801 234 5678',
  taxId: 'RC-12345678',
};

// Mock suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'NNPC Ltd',
    address: 'NNPC Towers, Central Business District, Abuja',
    contact: '+234 802 345 6789',
  },
  {
    id: 'sup-002',
    name: 'Oando Plc',
    address: '2 Ajose Adeogun Street, Victoria Island, Lagos',
    contact: '+234 803 456 7890',
  },
  {
    id: 'sup-003',
    name: 'Total Energies',
    address: '25 Kofo Abayomi Street, Victoria Island, Lagos',
    contact: '+234 804 567 8901',
  },
];

// Function to generate a PO number
const generatePoNumber = (): string => {
  return `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
};

// Helper to generate a random date within the last few months
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate mock purchase orders
export const generateMockPurchaseOrders = (count: number): PurchaseOrder[] => {
  const orders: PurchaseOrder[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  
  const products: Product[] = ['PMS', 'AGO', 'DPK'];
  const statuses: OrderStatus[] = ['pending', 'active', 'fulfilled'];
  const paymentTerms: PaymentTerm[] = ['50% Advance', 'Full Payment', 'Credit'];

  for (let i = 0; i < count; i++) {
    const supplier = mockSuppliers[Math.floor(Math.random() * mockSuppliers.length)];
    const createdAt = randomDate(threeMonthsAgo, now);
    const updatedAt = new Date(
      randomDate(createdAt, now).getTime()
    );
    
    const items = [];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5000) + 1000; // 1000 to 6000 liters
      const unitPrice = 
        product === 'PMS' ? 700 + Math.floor(Math.random() * 50) : // PMS price range
        product === 'AGO' ? 850 + Math.floor(Math.random() * 70) : // AGO price range
        780 + Math.floor(Math.random() * 60); // DPK price range
        
      const totalPrice = quantity * unitPrice;
      
      items.push({
        id: `item-${i}-${j}`,
        product,
        quantity,
        unitPrice,
        totalPrice,
      });
    }
    
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryDate = new Date(updatedAt);
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 14) + 1); // Delivery date 1-14 days after update
    
    orders.push({
      id: `po-${i}`,
      poNumber: generatePoNumber(),
      company: mockCompany,
      supplier,
      items,
      grandTotal,
      paymentTerm: paymentTerms[Math.floor(Math.random() * paymentTerms.length)],
      deliveryDate,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt,
      updatedAt,
    });
  }
  
  return orders;
};

// Generate mock purchase order logs
export const generateMockLogs = (orders: PurchaseOrder[]): LogEntry[] => {
  const logs: LogEntry[] = [];
  const users = ['John Admin', 'Sarah Manager', 'Michael Supervisor'];
  
  orders.forEach((order, index) => {
    // Creation log
    logs.push({
      id: `log-${index}-1`,
      poId: order.id,
      action: `Purchase Order ${order.poNumber} created`,
      user: users[Math.floor(Math.random() * users.length)],
      timestamp: new Date(order.createdAt),
    });
    
    // If not pending, add payment log
    if (order.status !== 'pending') {
      const paymentDate = new Date(order.createdAt);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 3) + 1);
      logs.push({
        id: `log-${index}-2`,
        poId: order.id,
        action: `Payment received for Purchase Order ${order.poNumber}`,
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: paymentDate,
      });
      
      logs.push({
        id: `log-${index}-3`,
        poId: order.id,
        action: `Status updated to Active for Purchase Order ${order.poNumber}`,
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: new Date(paymentDate.getTime() + 1000 * 60 * 5), // 5 minutes after payment
      });
    }
    
    // If fulfilled, add delivery log
    if (order.status === 'fulfilled') {
      const deliveryDate = new Date(order.updatedAt);
      logs.push({
        id: `log-${index}-4`,
        poId: order.id,
        action: `Products delivered for Purchase Order ${order.poNumber}`,
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: deliveryDate,
      });
      
      logs.push({
        id: `log-${index}-5`,
        poId: order.id,
        action: `Status updated to Fulfilled for Purchase Order ${order.poNumber}`,
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: new Date(deliveryDate.getTime() + 1000 * 60 * 10), // 10 minutes after delivery
      });
    }
  });
  
  // Sort logs by timestamp (newest first)
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate the mock data
export const mockPurchaseOrders = generateMockPurchaseOrders(15);
export const mockLogs = generateMockLogs(mockPurchaseOrders);

// Initialize app data
export const appData = {
  purchaseOrders: mockPurchaseOrders,
  logs: mockLogs,
  suppliers: mockSuppliers,
  company: mockCompany,
};
