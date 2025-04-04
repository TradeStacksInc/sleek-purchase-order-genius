import React, { useState, useEffect } from 'react';
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
  CalendarIcon, 
  Trash2, 
  Plus, 
  ClipboardList, 
  Building2, 
  Truck, 
  Receipt, 
  CreditCard,
  XCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Fuel,
  Hash as HashIcon,
  Warehouse as WarehouseIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderItem, PaymentTerm, Product, Company, Supplier } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ValidationErrors {
  company: {
    [key: string]: string | undefined;
  };
  supplier: {
    [key: string]: string | undefined;
  };
  items: {
    [key: string]: string | undefined;
  };
}

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const { addPurchaseOrder, addSupplier } = useApp();
  const { toast } = useToast();
  
  const [company, setCompany] = useState<Company>({
    name: '',
    address: '',
    contact: '',
    taxId: '',
  });
  
  const [supplierData, setSupplierData] = useState({
    name: '',
    contact: '',
    address: '',
    regNumber: '',
    depotLocation: '',
    supplierType: 'Independent',
    depotName: '',
    contactPerson: '',
    email: '',
    products: {
      PMS: false,
      AGO: false,
      DPK: false
    },
    paymentTerms: '50% Advance'
  });
  
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: uuidv4(),
      product: 'PMS',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    },
  ]);
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>('50% Advance');
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    company: {},
    supplier: {},
    items: {}
  });
  
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const addItem = () => {
    setItems([
      ...items,
      {
        id: uuidv4(),
        product: 'PMS',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  
  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  const updateCompany = (field: keyof Company, value: string) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateSupplier = (field: string, value: any) => {
    if (field === 'products') {
      setSupplierData(prev => ({
        ...prev,
        products: {
          ...prev.products,
          [value.product]: value.checked
        }
      }));
    } else {
      setSupplierData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (validationErrors.supplier[field]) {
      setValidationErrors(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [field]: undefined
        }
      }));
    }
  };
  
  const validateForm = () => {
    let errors: ValidationErrors = {
      company: {},
      supplier: {},
      items: {}
    };
    let isValid = true;
    
    if (!company.name) {
      errors.company.name = "Company name is required";
      isValid = false;
    }
    if (!company.address) {
      errors.company.address = "Company address is required";
      isValid = false;
    }
    if (!company.contact) {
      errors.company.contact = "Company contact is required";
      isValid = false;
    }
    if (!company.taxId) {
      errors.company.taxId = "Company tax ID is required";
      isValid = false;
    }
    
    if (!supplierData.name) {
      errors.supplier.name = "Supplier name is required";
      isValid = false;
    }
    if (!supplierData.contact) {
      errors.supplier.contact = "Contact information is required";
      isValid = false;
    }
    if (!supplierData.address) {
      errors.supplier.address = "Address is required";
      isValid = false;
    }
    
    if (supplierData.email && !/^\S+@\S+\.\S+$/.test(supplierData.email)) {
      errors.supplier.email = "Please enter a valid email address";
      isValid = false;
    }
    
    const invalidItems = items.some(item => !item.product || item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidItems) {
      errors.items.general = "All items must have a product, quantity and price";
      isValid = false;
    }
    
    if (!deliveryDate) {
      errors.items.deliveryDate = "Expected delivery date is required";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating supplier:", supplierData);
      
      const selectedProducts = Object.keys(supplierData.products).filter(key => supplierData.products[key]);
      
      const validatedSupplierType = (supplierData.supplierType === 'Major' || supplierData.supplierType === 'Independent' || supplierData.supplierType === 'Government') 
        ? supplierData.supplierType as 'Major' | 'Independent' | 'Government'
        : 'Independent';
      
      const newSupplier: Supplier = {
        id: uuidv4(),
        name: supplierData.name.trim(),
        contact: supplierData.contact.trim(),
        address: supplierData.address.trim(),
        email: supplierData.email.trim(),
        supplierType: validatedSupplierType,
        depotName: supplierData.depotName.trim(),
        taxId: supplierData.regNumber.trim(),
        accountNumber: '',
        bankName: '',
        products: selectedProducts
      };
      
      const savedSupplier: Supplier | null = addSupplier(newSupplier);
      
      if (savedSupplier === null) {
        console.error("Failed to create supplier");
        toast({
          title: "Error",
          description: "Failed to create supplier. Please check the form data.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Supplier created successfully:", savedSupplier);
      
      const poNumber = `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      console.log("Generated PO number:", poNumber);
      
      const newPO = {
        id: uuidv4(),
        poNumber,
        company,
        supplier: savedSupplier,
        items,
        grandTotal,
        paymentTerm,
        deliveryDate,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log("Creating purchase order:", newPO);
      
      const savedPO = addPurchaseOrder(newPO);
      
      if (savedPO !== null) {
        console.log("Purchase order created successfully:", savedPO);
        toast({
          title: "Purchase Order Created",
          description: `PO #${poNumber} has been created successfully.`,
          variant: "default"
        });
        
        setTimeout(() => {
          navigate(`/orders/${savedPO.id}`);
        }, 500);
      } else {
        console.error("Failed to create purchase order - addPurchaseOrder returned null");
        toast({
          title: "Error",
          description: "Failed to create purchase order. Please check console for details.",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your purchase order: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  const getFieldError = (section: keyof ValidationErrors, field: string) => {
    const sectionErrors = validationErrors[section];
    return sectionErrors && sectionErrors[field] ? (
      <p className="text-sm text-red-500 mt-1">{sectionErrors[field]}</p>
    ) : null;
  };
  
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Create Purchase Order</CardTitle>
                <CardDescription>
                  Fill in the details to create a new purchase order
                </CardDescription>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="create-po-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-emerald-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium">Company Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name" className="required">Filling Station Name</Label>
                  <Input
                    id="company-name"
                    value={company.name}
                    onChange={(e) => updateCompany('name', e.target.value)}
                    placeholder="Enter filling station name"
                    required
                  />
                  {getFieldError('company', 'name')}
                </div>
                <div>
                  <Label htmlFor="company-address" className="required">Address</Label>
                  <Input
                    id="company-address"
                    value={company.address}
                    onChange={(e) => updateCompany('address', e.target.value)}
                    placeholder="Enter address"
                    required
                  />
                  {getFieldError('company', 'address')}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="company-contact" className="required">Contact Information</Label>
                  <Input
                    id="company-contact"
                    value={company.contact}
                    onChange={(e) => updateCompany('contact', e.target.value)}
                    placeholder="Phone number, email, etc."
                    required
                  />
                  {getFieldError('company', 'contact')}
                </div>
                <div>
                  <Label htmlFor="company-tax" className="required">Tax ID / RC Number</Label>
                  <Input
                    id="company-tax"
                    value={company.taxId}
                    onChange={(e) => updateCompany('taxId', e.target.value)}
                    placeholder="Enter Tax ID or RC Number"
                    required
                  />
                  {getFieldError('company', 'taxId')}
                </div>
              </div>
            </div>
            
            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-purple-100 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium">Supplier Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier-name" className="flex items-center gap-2 required">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Company Name
                  </Label>
                  <Input
                    id="supplier-name"
                    value={supplierData.name}
                    onChange={(e) => updateSupplier('name', e.target.value)}
                    placeholder="NNPC Depot, Mobil, etc."
                    required
                  />
                  {getFieldError('supplier', 'name')}
                </div>
                <div>
                  <Label htmlFor="supplier-type" className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    Supplier Type
                  </Label>
                  <Select
                    value={supplierData.supplierType}
                    onValueChange={(value) => updateSupplier('supplierType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Major">Major Marketer</SelectItem>
                      <SelectItem value="Independent">Independent Marketer</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="supplier-contact" className="flex items-center gap-2 required">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Contact Information
                  </Label>
                  <Input
                    id="supplier-contact"
                    value={supplierData.contact}
                    onChange={(e) => updateSupplier('contact', e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                  {getFieldError('supplier', 'contact')}
                </div>
                <div>
                  <Label htmlFor="supplier-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => updateSupplier('email', e.target.value)}
                    placeholder="contact@supplier.com"
                  />
                  {getFieldError('supplier', 'email')}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="supplier-address" className="flex items-center gap-2 required">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address
                  </Label>
                  <Input
                    id="supplier-address"
                    value={supplierData.address}
                    onChange={(e) => updateSupplier('address', e.target.value)}
                    placeholder="Enter full address"
                    required
                  />
                  {getFieldError('supplier', 'address')}
                </div>
                <div>
                  <Label htmlFor="supplier-contact-person" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Contact Person
                  </Label>
                  <Input
                    id="supplier-contact-person"
                    value={supplierData.contactPerson}
                    onChange={(e) => updateSupplier('contactPerson', e.target.value)}
                    placeholder="Name of primary contact"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="supplier-reg-number" className="flex items-center gap-2">
                    <HashIcon className="h-4 w-4 text-muted-foreground" />
                    Company Registration Number
                  </Label>
                  <Input
                    id="supplier-reg-number"
                    value={supplierData.regNumber}
                    onChange={(e) => updateSupplier('regNumber', e.target.value)}
                    placeholder="RC12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-depot-name" className="flex items-center gap-2">
                    <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                    Depot Name
                  </Label>
                  <Input
                    id="supplier-depot-name"
                    value={supplierData.depotName}
                    onChange={(e) => updateSupplier('depotName', e.target.value)}
                    placeholder="Main Terminal"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="supplier-depot-location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Depot Location
                  </Label>
                  <Input
                    id="supplier-depot-location"
                    value={supplierData.depotLocation}
                    onChange={(e) => updateSupplier('depotLocation', e.target.value)}
                    placeholder="Apapa, Lagos"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-payment-terms" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Payment Terms
                  </Label>
                  <Select
                    value={supplierData.paymentTerms}
                    onValueChange={(value) => updateSupplier('paymentTerms', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Payment">Full Payment</SelectItem>
                      <SelectItem value="50% Advance">50% Advance</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  Products Supplied
                </Label>
                <div className="flex flex-col gap-2 border rounded-md p-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pms" 
                      checked={supplierData.products.PMS}
                      onCheckedChange={(checked) => updateSupplier('products', { product: 'PMS', checked: checked === true })}
                    />
                    <Label htmlFor="pms" className="cursor-pointer">PMS (Petrol)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ago" 
                      checked={supplierData.products.AGO}
                      onCheckedChange={(checked) => updateSupplier('products', { product: 'AGO', checked: checked === true })}
                    />
                    <Label htmlFor="ago" className="cursor-pointer">AGO (Diesel)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dpk" 
                      checked={supplierData.products.DPK}
                      onCheckedChange={(checked) => updateSupplier('products', { product: 'DPK', checked: checked === true })}
                    />
                    <Label htmlFor="dpk" className="cursor-pointer">DPK (Kerosene)</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="po-form-section mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="mr-3 bg-amber-100 p-2 rounded-full">
                    <Receipt className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-medium">Order Items</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Product</th>
                        <th className="px-4 py-3 text-left font-medium">Quantity (Liters)</th>
                        <th className="px-4 py-3 text-left font-medium">Unit Price (₦)</th>
                        <th className="px-4 py-3 text-left font-medium">Total Price (₦)</th>
                        <th className="px-4 py-3 text-center font-medium w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3">
                            <Select
                              value={item.product}
                              onValueChange={(value) => updateItem(item.id, 'product', value)}
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
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity || ''}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.unitPrice || ''}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {item.totalPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove item</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {getFieldError('items', 'general')}
            </div>
            
            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-cyan-100 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="text-lg font-medium">Order Summary</h3>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-muted">
                <span>Grand Total:</span>
                <span className="text-xl font-semibold">₦{grandTotal.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="payment-term" className="required">Payment Terms</Label>
                  <Select value={paymentTerm} onValueChange={(value) => setPaymentTerm(value as PaymentTerm)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% Advance">50% Advance</SelectItem>
                      <SelectItem value="Full Payment">Full Payment</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="delivery-date" className="required">Expected Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {getFieldError('items', 'deliveryDate')}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="create-po-form"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePO;
