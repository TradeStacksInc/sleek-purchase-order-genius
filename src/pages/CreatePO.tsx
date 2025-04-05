
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

      const newSupplier = addSupplier({
        id: uuidv4(),
        name: supplierData.name,
        contact: supplierData.contact,
        address: supplierData.address,
        regNumber: supplierData.regNumber,
        email: supplierData.email,
        supplierType: supplierData.supplierType,
        contactPerson: supplierData.contactPerson,
        depotName: supplierData.depotName,
        depotLocation: supplierData.depotLocation,
        products: selectedProducts,
        createdAt: new Date()
      });

      if (!newSupplier) {
        toast({
          title: "Error",
          description: "Failed to save supplier information",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create PO
      const newPurchaseOrder: PurchaseOrder = {
        id: uuidv4(),
        poNumber: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: items.map(item => ({
          ...item,
          id: uuidv4() // Generate new IDs for items
        })),
        supplier: {
          id: newSupplier.id,
          name: newSupplier.name,
          contact: newSupplier.contact
        },
        company: {
          ...company
        },
        status: 'pending',
        deliveryDate: deliveryDate as Date,
        grandTotal: grandTotal,
        paymentTerm: paymentTerm
      };

      const success = addPurchaseOrder(newPurchaseOrder);
      
      if (success) {
        toast({
          title: "Success",
          description: `Purchase Order ${newPurchaseOrder.poNumber} created successfully`,
        });
        navigate('/orders');
      } else {
        toast({
          title: "Error",
          description: "Failed to create purchase order",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Purchase Order</h1>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ClipboardList className="mr-2 h-4 w-4" />
          View Orders
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">Company Information</CardTitle>
            </div>
            <CardDescription>Enter your company details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                value={company.name}
                onChange={(e) => updateCompany('name', e.target.value)}
                placeholder="Enter company name"
              />
              {validationErrors.company.name && (
                <p className="text-sm text-red-500">{validationErrors.company.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyContact">Contact Number</Label>
              <Input 
                id="companyContact" 
                value={company.contact}
                onChange={(e) => updateCompany('contact', e.target.value)}
                placeholder="Enter contact number"
                type="tel"
              />
              {validationErrors.company.contact && (
                <p className="text-sm text-red-500">{validationErrors.company.contact}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyTaxId">Tax ID / VAT Number</Label>
              <Input 
                id="companyTaxId" 
                value={company.taxId}
                onChange={(e) => updateCompany('taxId', e.target.value)}
                placeholder="Enter tax identification number"
              />
              {validationErrors.company.taxId && (
                <p className="text-sm text-red-500">{validationErrors.company.taxId}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input 
                id="companyAddress" 
                value={company.address}
                onChange={(e) => updateCompany('address', e.target.value)}
                placeholder="Enter company address"
              />
              {validationErrors.company.address && (
                <p className="text-sm text-red-500">{validationErrors.company.address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center">
              <Truck className="mr-2 h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">Supplier Information</CardTitle>
            </div>
            <CardDescription>Enter the fuel supplier details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input 
                id="supplierName" 
                value={supplierData.name}
                onChange={(e) => updateSupplier('name', e.target.value)}
                placeholder="Enter supplier name"
              />
              {validationErrors.supplier.name && (
                <p className="text-sm text-red-500">{validationErrors.supplier.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierType">Supplier Type</Label>
              <Select 
                value={supplierData.supplierType}
                onValueChange={(value) => updateSupplier('supplierType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Major">Major Marketer</SelectItem>
                  <SelectItem value="Independent">Independent Marketer</SelectItem>
                  <SelectItem value="Government">Government Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierContact">Contact Number</Label>
              <Input 
                id="supplierContact" 
                value={supplierData.contact}
                onChange={(e) => updateSupplier('contact', e.target.value)}
                placeholder="Enter contact number"
                type="tel"
              />
              {validationErrors.supplier.contact && (
                <p className="text-sm text-red-500">{validationErrors.supplier.contact}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierEmail">Email Address (Optional)</Label>
              <Input 
                id="supplierEmail" 
                value={supplierData.email}
                onChange={(e) => updateSupplier('email', e.target.value)}
                placeholder="Enter email address"
                type="email"
              />
              {validationErrors.supplier.email && (
                <p className="text-sm text-red-500">{validationErrors.supplier.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person (Optional)</Label>
              <Input 
                id="contactPerson" 
                value={supplierData.contactPerson}
                onChange={(e) => updateSupplier('contactPerson', e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Registration Number (Optional)</Label>
              <Input 
                id="regNumber" 
                value={supplierData.regNumber}
                onChange={(e) => updateSupplier('regNumber', e.target.value)}
                placeholder="Enter registration number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depotName">Depot Name (Optional)</Label>
              <Input 
                id="depotName" 
                value={supplierData.depotName}
                onChange={(e) => updateSupplier('depotName', e.target.value)}
                placeholder="Enter depot name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depotLocation">Depot Location (Optional)</Label>
              <Input 
                id="depotLocation" 
                value={supplierData.depotLocation}
                onChange={(e) => updateSupplier('depotLocation', e.target.value)}
                placeholder="Enter depot location"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplierAddress">Address</Label>
              <Input 
                id="supplierAddress" 
                value={supplierData.address}
                onChange={(e) => updateSupplier('address', e.target.value)}
                placeholder="Enter supplier address"
              />
              {validationErrors.supplier.address && (
                <p className="text-sm text-red-500">{validationErrors.supplier.address}</p>
              )}
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label>Available Products</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pms" 
                    checked={supplierData.products.PMS}
                    onCheckedChange={(checked) => updateSupplier('products', { product: 'PMS', checked: !!checked })}
                  />
                  <Label htmlFor="pms" className="cursor-pointer">PMS (Petrol)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ago" 
                    checked={supplierData.products.AGO}
                    onCheckedChange={(checked) => updateSupplier('products', { product: 'AGO', checked: !!checked })}
                  />
                  <Label htmlFor="ago" className="cursor-pointer">AGO (Diesel)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dpk" 
                    checked={supplierData.products.DPK}
                    onCheckedChange={(checked) => updateSupplier('products', { product: 'DPK', checked: !!checked })}
                  />
                  <Label htmlFor="dpk" className="cursor-pointer">DPK (Kerosene)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center">
              <Receipt className="mr-2 h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">Order Details</CardTitle>
            </div>
            <CardDescription>Add products to your order</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {validationErrors.items.deliveryDate && (
                <p className="text-sm text-red-500">{validationErrors.items.deliveryDate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select 
                value={paymentTerm}
                onValueChange={setPaymentTerm}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50% Advance">50% Advance</SelectItem>
                  <SelectItem value="100% Advance">100% Advance</SelectItem>
                  <SelectItem value="Net 7">Net 7 days</SelectItem>
                  <SelectItem value="Net 15">Net 15 days</SelectItem>
                  <SelectItem value="Net 30">Net 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Order Items</Label>
                <Button 
                  type="button" 
                  onClick={addItem} 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Product
                </Button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 sm:col-span-3">
                      <Label htmlFor={`product-${index}`} className="text-xs">Product</Label>
                      <Select 
                        value={item.product} 
                        onValueChange={(value) => debouncedUpdateItem(item.id, 'product', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PMS">PMS (Petrol)</SelectItem>
                          <SelectItem value="AGO">AGO (Diesel)</SelectItem>
                          <SelectItem value="DPK">DPK (Kerosene)</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.items[`product_${index}`] && (
                        <p className="text-sm text-red-500">{validationErrors.items[`product_${index}`]}</p>
                      )}
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity (Liters)</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => debouncedUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      {validationErrors.items[`quantity_${index}`] && (
                        <p className="text-sm text-red-500">{validationErrors.items[`quantity_${index}`]}</p>
                      )}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <Label htmlFor={`unitPrice-${index}`} className="text-xs">Unit Price (₦)</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => debouncedUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                      {validationErrors.items[`unitPrice_${index}`] && (
                        <p className="text-sm text-red-500">{validationErrors.items[`unitPrice_${index}`]}</p>
                      )}
                    </div>
                    <div className="col-span-10 sm:col-span-3">
                      <Label htmlFor={`totalPrice-${index}`} className="text-xs">Total (₦)</Label>
                      <Input
                        id={`totalPrice-${index}`}
                        type="number"
                        value={(item.quantity * item.unitPrice).toFixed(2)}
                        disabled
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 pt-6">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4 flex justify-end">
              <div className="w-1/2 md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Grand Total:</span>
                  <span className="font-bold">₦{grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-slate-50">
            <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Order
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CreatePO;
