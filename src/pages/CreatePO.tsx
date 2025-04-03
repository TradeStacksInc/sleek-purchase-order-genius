
import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Trash2, Plus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderItem, PaymentTerm, Product, Company } from '@/types';
import AddSupplierForm from '@/components/AddSupplierForm';
import { useToast } from '@/hooks/use-toast';
import StatusTracker from '@/components/PurchaseOrder/StatusTracker';

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, addPurchaseOrder } = useApp();
  const { toast } = useToast();
  
  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [company, setCompany] = useState<Company>({
    name: '',
    address: '',
    contact: '',
    taxId: '',
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
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
  );
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Add new item
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
  
  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  
  // Update item
  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total price if quantity or unit price changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };
  
  // Update company information
  const updateCompany = (field: keyof Company, value: string) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!supplierId || !deliveryDate || !company.name || !company.address || !company.contact || !company.taxId) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate items
      const invalidItems = items.filter(item => item.quantity <= 0 || item.unitPrice <= 0);
      if (invalidItems.length > 0) {
        toast({
          title: "Invalid Items",
          description: "Please ensure all items have a quantity and unit price greater than zero",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Find selected supplier
      const supplier = suppliers.find((s) => s.id === supplierId);
      if (!supplier) {
        toast({
          title: "Supplier Not Found",
          description: "Please select a valid supplier",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create new purchase order
      const newPO = {
        id: uuidv4(),
        poNumber: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        company,
        supplier,
        items,
        grandTotal,
        paymentTerm,
        deliveryDate,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add purchase order to context
      const savedPO = addPurchaseOrder(newPO);
      
      toast({
        title: "Purchase Order Created",
        description: `PO #${savedPO.poNumber} has been created successfully.`,
        variant: "default"
      });
      
      // Navigate to the order detail page
      navigate(`/orders/${savedPO.id}`);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your purchase order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Create Purchase Order</CardTitle>
              <CardDescription>
                Fill in the details to create a new purchase order
              </CardDescription>
            </div>
            <div className="w-full md:w-auto">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Tracker Preview */}
          <div className="mb-6 border rounded-md p-4 bg-muted/30">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Order Status Preview</h3>
            <StatusTracker 
              currentStatus="pending" 
              statusHistory={[
                {
                  id: 'preview',
                  status: 'pending',
                  timestamp: new Date(),
                  user: 'Current User',
                  note: 'Creating new purchase order'
                }
              ]}
            />
          </div>
          
          <form id="create-po-form" onSubmit={handleSubmit}>
            {/* Company Details Section */}
            <div className="po-form-section mb-8">
              <h3 className="text-lg font-medium mb-4">Company Details</h3>
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
                </div>
              </div>
            </div>
            
            {/* Supplier Details Section */}
            <div className="po-form-section mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Supplier Details</h3>
                <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Supplier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <AddSupplierForm onClose={() => setIsAddSupplierOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="supplier" className="required">Supplier</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.length > 0 ? (
                        suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-suppliers" disabled>
                          No suppliers found. Add a supplier first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {supplierId && (
                <div className="mt-4">
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-sm">
                      <p className="font-medium">{suppliers.find((s) => s.id === supplierId)?.name}</p>
                      <p className="text-muted-foreground mt-1">{suppliers.find((s) => s.id === supplierId)?.address}</p>
                      <p className="text-muted-foreground mt-1">{suppliers.find((s) => s.id === supplierId)?.contact}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Items Section */}
            <div className="po-form-section mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Order Items</h3>
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
            </div>
            
            {/* Order Summary Section */}
            <div className="po-form-section mb-8">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
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
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="create-po-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePO;
