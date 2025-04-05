import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarIcon, Trash2, Plus, ClipboardList, Building2, Truck, Receipt, CreditCard,
  XCircle, Phone, Mail, MapPin, User, Fuel, Hash as HashIcon, Warehouse as WarehouseIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderItem, PaymentTerm, Product, Company, Supplier, PurchaseOrder } from '@/types';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash/debounce';

interface SupplierData {
  name: string;
  contact: string;
  address: string;
  regNumber: string;
  depotLocation: string;
  supplierType: 'Major' | 'Independent' | 'Government';
  depotName: string;
  contactPerson: string;
  email: string;
  products: {
    PMS: boolean;
    AGO: boolean;
    DPK: boolean;
  };
  paymentTerms: PaymentTerm;
}

interface ValidationErrors {
  company: { [key: string]: string | undefined };
  supplier: { [key: string]: string | undefined };
  items: { [key: string]: string | undefined };
}

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const { addPurchaseOrder, addSupplier } = useApp();
  const { toast } = useToast();

  const [company, setCompany] = useState<Company>({
    name: '', address: '', contact: '', taxId: '',
  });
  
  const [supplierData, setSupplierData] = useState<SupplierData>({
    name: '', contact: '', address: '', regNumber: '', depotLocation: '',
    supplierType: 'Independent', depotName: '', contactPerson: '', email: '',
    products: { PMS: false, AGO: false, DPK: false },
    paymentTerms: '50% Advance'
  });

  const [items, setItems] = useState<OrderItem[]>([
    { id: uuidv4(), product: 'PMS', quantity: 0, unitPrice: 0, totalPrice: 0 },
  ]);
  
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>('50% Advance');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    company: {}, supplier: {}, items: {}
  });

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [items]);

  const addItem = () => {
    setItems(prev => [...prev, {
      id: uuidv4(), product: 'PMS', quantity: 0, unitPrice: 0, totalPrice: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const debouncedUpdateItem = useCallback(
    debounce((id: string, field: keyof OrderItem, value: any) => {
      setItems(prev => prev.map(item => {
        if (item.id !== id) return item;
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }));
    }, 300),
    []
  );

  const updateCompany = (field: keyof Company, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({
      ...prev,
      company: { ...prev.company, [field]: undefined }
    }));
  };

  const updateSupplier = (field: keyof SupplierData, value: any) => {
    if (field === 'products') {
      setSupplierData(prev => ({
        ...prev,
        products: { ...prev.products, [value.product]: value.checked }
      }));
    } else {
      setSupplierData(prev => ({ ...prev, [field]: value }));
    }
    setValidationErrors(prev => ({
      ...prev,
      supplier: { ...prev.supplier, [field]: undefined }
    }));
  };

  const validateForm = () => {
    const errors: ValidationErrors = { company: {}, supplier: {}, items: {} };
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const emailRegex = /^\S+@\S+\.\S+$/;

    // Company validation
    if (!company.name) errors.company.name = "Company name is required";
    if (!company.address) errors.company.address = "Company address is required";
    if (!company.contact || !phoneRegex.test(company.contact)) {
      errors.company.contact = "Valid phone number is required";
    }
    if (!company.taxId) errors.company.taxId = "Company tax ID is required";

    // Supplier validation
    if (!supplierData.name) errors.supplier.name = "Supplier name is required";
    if (!supplierData.contact || !phoneRegex.test(supplierData.contact)) {
      errors.supplier.contact = "Valid phone number is required";
    }
    if (!supplierData.address) errors.supplier.address = "Address is required";
    if (supplierData.email && !emailRegex.test(supplierData.email)) {
      errors.supplier.email = "Valid email address is required";
    }

    // Items validation
    items.forEach((item, index) => {
      if (!item.product) errors.items[`product_${index}`] = "Product is required";
      if (item.quantity < 1000) {
        errors.items[`quantity_${index}`] = "Minimum order is 1000 liters";
      }
      if (item.unitPrice <= 0) {
        errors.items[`unitPrice_${index}`] = "Price must be greater than 0";
      }
    });

    if (!deliveryDate) errors.items.deliveryDate = "Delivery date is required";

    return {
      errors,
      isValid: Object.values(errors).every(section => 
        Object.keys(section).length === 0
      )
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors, isValid } = validateForm();
    setValidationErrors(errors);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedProducts = Object.entries(supplierData.products)
        .filter(([_, value]) => value)
        .map(([key]) => key as Product);

      const newSupplier