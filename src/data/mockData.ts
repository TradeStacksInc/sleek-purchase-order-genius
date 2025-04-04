
import { Company } from '../types';

// Company data - this is needed as a default but no longer mock
export const defaultCompany: Company = {
  name: 'EcoFuel Filling Station',
  address: '123 Petroleum Way, Lagos',
  contact: '+234 801 234 5678',
  taxId: 'RC-12345678',
};

// No more mock data
export const appData = {
  purchaseOrders: [],
  logs: [],
  suppliers: [],
  company: defaultCompany,
};
