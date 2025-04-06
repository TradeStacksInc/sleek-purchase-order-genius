
import { Staff, Tank, ProductType } from '@/types';

// Basic implementation of the missing database utilities
export const getDatabaseInfo = () => {
  return {
    size: "1.2 MB",
    lastBackup: new Date(),
    tables: {
      purchaseOrders: { count: 12 },
      suppliers: { count: 5 },
      drivers: { count: 8 },
      trucks: { count: 6 },
      staff: { count: 10 },
      dispensers: { count: 8 },
      tanks: { count: 4 },
      sales: { count: 120 }
    }
  };
};

// Sample data for dev/demo purposes
export const generateSampleStaff = () => {
  return [
    {
      id: "staff-001",
      name: "John Doe",
      role: "admin",
      email: "john@example.com",
      phone: "+234 800 1234567",
      address: "123 Main St, Lagos",
      contactPhone: "+234 800 1234567",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "staff-002",
      name: "Jane Smith",
      role: "manager",
      email: "jane@example.com",
      phone: "+234 800 7654321",
      address: "456 High St, Lagos",
      contactPhone: "+234 800 7654321",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "staff-003",
      name: "Mike Johnson",
      role: "operator",
      email: "mike@example.com",
      phone: "+234 800 1122334",
      address: "789 Low St, Lagos",
      contactPhone: "+234 800 1122334",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ] as Staff[];
};

export const generateSampleTanks = () => {
  return [
    {
      id: "tank-001",
      name: "PMS Storage Tank 1",
      capacity: 50000,
      productType: "PMS" as ProductType,
      currentVolume: 32000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-002",
      name: "AGO Storage Tank 1",
      capacity: 40000,
      productType: "AGO" as ProductType,
      currentVolume: 28000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-003",
      name: "PMS Storage Tank 2",
      capacity: 30000,
      productType: "PMS" as ProductType,
      currentVolume: 12000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-004",
      name: "DPK Storage Tank",
      capacity: 25000,
      productType: "DPK" as ProductType,
      currentVolume: 15000,
      status: "operational",
      isActive: true
    },
    {
      id: "tank-005",
      name: "AGO Storage Tank 2",
      capacity: 35000,
      productType: "AGO" as ProductType,
      currentVolume: 10000,
      status: "maintenance",
      isActive: false
    },
    {
      id: "tank-006",
      name: "PMS Reserve Tank",
      capacity: 20000,
      productType: "PMS" as ProductType,
      currentVolume: 5000,
      status: "operational",
      isActive: true
    }
  ] as Tank[];
};
