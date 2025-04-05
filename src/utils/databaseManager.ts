import { Company, Driver, ProductType, Staff, Tank } from '../types';

// Seed database with initial data
export const seedDatabase = () => {
  const staff: Staff[] = [
    {
      id: 'staff-1',
      name: 'Admin User',
      role: 'admin', // Fixed from "Admin" to "admin"
      contactPhone: '+1234567890',
      address: '123 Main St',
      email: 'admin@example.com',
      password: 'admin', // Note: In a real application, passwords would be hashed
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'staff-2',
      name: 'Manager User',
      role: 'manager',
      contactPhone: '+1987654321',
      address: '456 Elm St',
      email: 'manager@example.com',
      password: 'manager',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'staff-3',
      name: 'Operator User',
      role: 'operator',
      contactPhone: '+1122334455',
      address: '789 Oak St',
      email: 'operator@example.com',
      password: 'operator',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const companies: Company[] = [
    {
      id: 'company-1',
      name: 'FuelCo',
      address: '789 Oak St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      zipCode: '62704',
      phone: '+15551234567',
      email: 'info@fuelco.com',
      website: 'www.fuelco.com',
      logo: 'fuelco_logo.png',
      taxId: '12-3456789',
      registrationNumber: 'FC123456',
      contact: 'John Doe'
    }
  ];

  const tanks: Tank[] = [
    {
      id: 'tank-1',
      name: 'PMS Tank 1',
      capacity: 25000,
      currentLevel: 18000,
      productType: 'PMS' as unknown as ProductType, // Use the ProductType alias
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentVolume: 18000,
      minVolume: 5000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    },
    {
      id: 'tank-2',
      name: 'AGO Tank 1',
      capacity: 20000,
      currentLevel: 12000,
      productType: 'AGO' as unknown as ProductType,
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentVolume: 12000,
      minVolume: 3000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    },
    {
      id: 'tank-3',
      name: 'DPK Tank 1',
      capacity: 15000,
      currentLevel: 9000,
      productType: 'DPK' as unknown as ProductType,
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentVolume: 9000,
      minVolume: 2000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    },
    {
      id: 'tank-4',
      name: 'PMS Tank 2',
      capacity: 25000,
      currentLevel: 20000,
      productType: 'PMS' as unknown as ProductType,
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentVolume: 20000,
      minVolume: 5000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    },
    {
      id: 'tank-5',
      name: 'AGO Tank 2',
      capacity: 20000,
      currentLevel: 15000,
      productType: 'AGO' as unknown as ProductType,
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentVolume: 15000,
      minVolume: 3000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    },
    {
      id: 'tank-6',
      name: 'DPK Tank 2',
      capacity: 15000,
      currentLevel: 10000,
      productType: 'DPK' as unknown as ProductType,
      lastRefillDate: new Date(),
      nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentVolume: 10000,
      minVolume: 2000,
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    }
  ];

  localStorage.setItem('staff', JSON.stringify(staff));
  localStorage.setItem('companies', JSON.stringify(companies));
  localStorage.setItem('tanks', JSON.stringify(tanks));
};

export const resetDatabase = (includeSeedData: boolean = true) => {
  localStorage.clear();
   if (includeSeedData) {
    seedDatabase();
  }
};

export const exportDatabase = (): string => {
  const data: { [key: string]: any } = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch (e) {
        console.warn(`Could not parse value for key "${key}". Storing as string.`);
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify(data);
};

export const importDatabase = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
    return true;
  } catch (e) {
    console.error("Failed to import database:", e);
    return false;
  }
};
