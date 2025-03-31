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
import { CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderItem, PaymentTerm, Product } from '@/types';

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, addPurchaseOrder } = useApp();
  
  // Form state
  const [supplierId, setSupplierId] = useState('');
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId || !deliveryDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Find selected supplier
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;
    
    // Create new purchase order
    const newPO = {
      id: uuidv4(),
      poNumber: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      company: {
        name: 'EcoFuel Filling Station',
        address: '123 Petroleum Way, Lagos',
        contact: '+234 801 234 5678',
        taxId: 'RC-12345678',
      },
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
    addPurchaseOrder(newPO);
    
    // Navigate back to dashboard
    navigate('/');
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>
            Fill in the details to create a new purchase order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Company Details Section */}
            <div className="po-form-section">
              <h3 className="text-lg font-medium mb-4">Company Details</h3>
              <div className="po-form-group">
                <div>
                  <Label htmlFor="company-name">Filling Station Name</Label>
                  <Input
                    id="company-name"
                    value="EcoFuel Filling Station"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    value="123 Petroleum Way, Lagos"
                    disabled
                  />
                </div>
              </div>
              <div className="po-form-group">
                <div>
                  <Label htmlFor="company-contact">Contact Information</Label>
                  <Input
                    id="company-contact"
                    value="+234 801 234 5678"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="company-tax">Tax ID / RC Number</Label>
                  <Input
                    id="company-tax"
                    value="RC-12345678"
                    disabled
                  />
                </div>
              </div>
            </div>
            
            {/* Supplier Details Section */}
            <div className="po-form-section">
              <h3 className="text-lg font-medium mb-4">Supplier Details</h3>
              <div className="po-form-group">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
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
            <div className="po-form-section">
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
            <div className="po-form-section">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <div className="flex justify-between items-center py-2 border-b border-muted">
                <span>Grand Total:</span>
                <span className="text-xl font-semibold">₦{grandTotal.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="payment-term">Payment Terms</Label>
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
                  <Label htmlFor="delivery-date">Expected Delivery Date</Label>
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" type="button" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">Create Purchase Order</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePO;
