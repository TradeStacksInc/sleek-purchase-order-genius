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
  paymentTerms?: PaymentTerm;
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

  const getFieldError = (section: keyof ValidationErrors, field: string) => {
    const error = validationErrors[section][field];
    return error ? <div className="text-sm text-red-500 mt-1">{error}</div> : null;
  };

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

      // Create supplier object conforming to Supplier type
      const newSupplier: Supplier = {
        id: uuidv4(),
        name: supplierData.name,
        contact: supplierData.contact,
        address: supplierData.address,
        email: supplierData.email,
        supplierType: supplierData.supplierType,
        depotName: supplierData.depotName,
        products: selectedProducts
      };

      // Add the supplier and get the result
      const savedSupplier = addSupplier(newSupplier);
      
      if (!savedSupplier) {
        throw new Error("Failed to create supplier");
      }

      // Create PO object
      const newPO: PurchaseOrder = {
        id: uuidv4(),
        poNumber: `PO-${Date.now().toString().substring(6)}`,
        company: { ...company },
        supplier: savedSupplier,
        items: [...items],
        grandTotal: grandTotal,
        paymentTerm: paymentTerm,
        deliveryDate: deliveryDate as Date,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [
          {
            id: uuidv4(),
            status: 'pending',
            timestamp: new Date(),
            user: 'Current User',
            note: 'PO created'
          }
        ]
      };

      // Add the PO
      const success = addPurchaseOrder(newPO);
      
      if (success) {
        toast({
          title: "Success",
          description: `Purchase order ${newPO.poNumber} has been created`,
        });
        
        setIsSubmitting(false);
        setShowSuccessDialog(true);
      } else {
        throw new Error("Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating PO:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create purchase order",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {showSuccessDialog && (
        <Card className="w-full max-w-5xl mx-auto mb-4 bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              Purchase Order Created Successfully
            </CardTitle>
            <CardDescription>
              Your purchase order has been created and saved
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2 flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSuccessDialog(false);
                setCompany({ name: '', address: '', contact: '', taxId: '' });
                setSupplierData({
                  name: '', contact: '', address: '', regNumber: '', depotLocation: '',
                  supplierType: 'Independent', depotName: '', contactPerson: '', email: '',
                  products: { PMS: false, AGO: false, DPK: false },
                  paymentTerms: '50% Advance'
                });
                setItems([{ id: uuidv4(), product: 'PMS', quantity: 0, unitPrice: 0, totalPrice: 0 }]);
                setPaymentTerm('50% Advance');
                setDeliveryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
              }}
            >
              Create Another
            </Button>
            <Button onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Create Purchase Order
          </CardTitle>
          <CardDescription>
            Fill in the details below to create a new purchase order
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form id="create-po-form" onSubmit={handleSubmit}>
            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-blue-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium">Company Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name" className="required">Company Name</Label>
                  <Input
                    id="company-name"
                    value={company.name}
                    onChange={(e) => updateCompany('name', e.target.value)}
                    placeholder="Your company name"
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'name')}
                </div>
                <div>
                  <Label htmlFor="company-address" className="required">Address</Label>
                  <Input
                    id="company-address"
                    value={company.address}
                    onChange={(e) => updateCompany('address', e.target.value)}
                    placeholder="Company address"
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'address')}
                </div>
                <div>
                  <Label htmlFor="company-contact" className="required">Phone Number</Label>
                  <Input
                    id="company-contact"
                    value={company.contact}
                    onChange={(e) => updateCompany('contact', e.target.value)}
                    placeholder="+234..."
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'contact')}
                </div>
                <div>
                  <Label htmlFor="company-taxid" className="required">Tax Identification Number</Label>
                  <Input
                    id="company-taxid"
                    value={company.taxId}
                    onChange={(e) => updateCompany('taxId', e.target.value)}
                    placeholder="Enter TIN"
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'taxId')}
                </div>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-yellow-100 p-2 rounded-full">
                  <WarehouseIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium">Supplier Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={supplierData.name}
                    onChange={(e) => updateSupplier('name', e.target.value)}
                    placeholder="e.g. Total Nigeria PLC"
                  />
                  {getFieldError('supplier', 'name')}
                </div>
                <div>
                  <Label>Depot Name</Label>
                  <Input
                    value={supplierData.depotName}
                    onChange={(e) => updateSupplier('depotName', e.target.value)}
                    placeholder="e.g. Apapa"
                  />
                </div>
                <div>
                  <Label>Depot Location</Label>
                  <Input
                    value={supplierData.depotLocation}
                    onChange={(e) => updateSupplier('depotLocation', e.target.value)}
                  />
                </div>
                <div>
                  <Label>RC Number</Label>
                  <Input
                    value={supplierData.regNumber}
                    onChange={(e) => updateSupplier('regNumber', e.target.value)}
                    placeholder="CAC Reg. No."
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={supplierData.contactPerson}
                    onChange={(e) => updateSupplier('contactPerson', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => updateSupplier('email', e.target.value)}
                    placeholder="example@email.com"
                  />
                  {getFieldError('supplier', 'email')}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={supplierData.contact}
                    onChange={(e) => updateSupplier('contact', e.target.value)}
                    placeholder="+234..."
                  />
                  {getFieldError('supplier', 'contact')}
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={supplierData.address}
                    onChange={(e) => updateSupplier('address', e.target.value)}
                    placeholder="Supplier address"
                  />
                  {getFieldError('supplier', 'address')}
                </div>
                <div>
                  <Label>Supplier Type</Label>
                  <Select
                    value={supplierData.supplierType}
                    onValueChange={(value) =>
                      updateSupplier('supplierType', value as SupplierData['supplierType'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Independent">Independent</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="block mb-2">Products Offered</Label>
                <div className="flex gap-4">
                  {(['PMS', 'AGO', 'DPK'] as const).map((product) => (
                    <label key={product} className="flex items-center gap-2">
                      <Checkbox
                        checked={supplierData.products[product]}
                        onCheckedChange={(checked) =>
                          updateSupplier('products', { product, checked: Boolean(checked) })
                        }
                      />
                      <span>{product}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-purple-100 p-2 rounded-full">
                  <Fuel className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium">Order Items</h3>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative">
                    <div>
                      <Label>Product</Label>
                      <Select
                        value={item.product}
                        onValueChange={(val) => debouncedUpdateItem(item.id, 'product', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PMS">PMS</SelectItem>
                          <SelectItem value="AGO">AGO</SelectItem>
                          <SelectItem value="DPK">DPK</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('items', `product_${index}`)}
                    </div>
                    <div>
                      <Label>Quantity (Liters)</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => debouncedUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                      />
                      {getFieldError('items', `quantity_${index}`)}
                    </div>
                    <div>
                      <Label>Unit Price (₦)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => debouncedUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                      />
                      {getFieldError('items', `unitPrice_${index}`)}
                    </div>
                    <div>
                      <Label>Total (₦)</Label>
                      <Input value={item.totalPrice.toFixed(2)} disabled />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute top-2 right-2 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-indigo-100 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium">Delivery & Payment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Select
                    value={paymentTerm}
                    onValueChange={(val) => setPaymentTerm(val as PaymentTerm)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% Advance">50% Advance</SelectItem>
                      <SelectItem value="100% Advance">100% Advance</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {getFieldError('items', 'deliveryDate')}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div className="text-lg font-semibold">Grand Total: ₦{grandTotal.toLocaleString()}</div>
          <Button type="submit" form="create-po-form" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Create Purchase Order'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePO;
