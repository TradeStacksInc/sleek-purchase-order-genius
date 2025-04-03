
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface AddSupplierFormProps {
  onClose: () => void;
}

const AddSupplierForm: React.FC<AddSupplierFormProps> = ({ onClose }) => {
  const { addSupplier } = useApp();
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [depotLocation, setDepotLocation] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [products, setProducts] = useState<Record<string, boolean>>({
    PMS: false,
    AGO: false,
    DPK: false
  });
  const [paymentTerms, setPaymentTerms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation
  const isFormValid = name.trim() !== '' && contact.trim() !== '' && address.trim() !== '';
  
  const handleProductChange = (product: string, checked: boolean) => {
    setProducts(prev => ({ ...prev, [product]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required supplier fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected products
      const selectedProducts = Object.keys(products).filter(key => products[key]);
      
      // Create new supplier object with enhanced fields
      const newSupplier = {
        id: uuidv4(),
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
        regNumber: regNumber.trim(),
        depotLocation: depotLocation.trim(),
        creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
        products: selectedProducts,
        paymentTerms: paymentTerms.trim(),
        createdAt: new Date(),
      };
      
      // Add supplier to the context
      addSupplier(newSupplier);
      
      toast({
        title: "Supplier Added",
        description: `${name} has been added to your suppliers.`,
      });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="required">Company Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NNPC Depot, Mobil, etc."
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="regNumber">Company Registration Number</Label>
          <Input
            id="regNumber"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            placeholder="RC12345678"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="depotLocation">Depot Location</Label>
          <Input
            id="depotLocation"
            value={depotLocation}
            onChange={(e) => setDepotLocation(e.target.value)}
            placeholder="Apapa, Lagos"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="contact" className="required">Contact Information</Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone number, email, etc."
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="address" className="required">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter full address"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Products Supplied</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pms" 
                checked={products.PMS}
                onCheckedChange={(checked) => handleProductChange('PMS', checked === true)}
              />
              <Label htmlFor="pms" className="cursor-pointer">PMS (Petrol)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ago" 
                checked={products.AGO}
                onCheckedChange={(checked) => handleProductChange('AGO', checked === true)}
              />
              <Label htmlFor="ago" className="cursor-pointer">AGO (Diesel)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dpk" 
                checked={products.DPK}
                onCheckedChange={(checked) => handleProductChange('DPK', checked === true)}
              />
              <Label htmlFor="dpk" className="cursor-pointer">DPK (Kerosene)</Label>
            </div>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select
            value={paymentTerms}
            onValueChange={setPaymentTerms}
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
        
        <div className="grid gap-2">
          <Label htmlFor="creditLimit">Credit Limit (₦)</Label>
          <Input
            id="creditLimit"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Supplier"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddSupplierForm;
