
import { Supplier } from '@/types';

export interface FormValidationErrors {
  [key: string]: string;
}

export interface SupplierFormData {
  name: string;
  contact: string;
  address: string;
  regNumber: string;
  depotLocation: string;
  creditLimit: string;
  supplierType: string;
  depotName: string;
  contactPerson: string;
  email: string;
  products: Record<string, boolean>;
  paymentTerms: string;
}

export interface AddSupplierFormProps {
  onClose: () => void;
}

export type SupplierValidationResult = {
  isValid: boolean;
  errors: FormValidationErrors;
};
