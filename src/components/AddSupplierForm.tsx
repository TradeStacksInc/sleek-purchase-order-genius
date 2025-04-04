
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
import {
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  Hash,
  Warehouse,
  GasPump,
  CreditCard
} from 'lucide-react';

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
  const [supplierType, setSupplierType] = useState('');
  const [depotName, setDepotName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<Record<string, boolean>>({
    PMS: false,
    AGO: false,
    DPK: false
  });
  const [paymentTerms, setPaymentTerms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!name.trim()) errors.name = "Supplier name is required";
    if (!contact.trim()) errors.contact = "Contact information is required";
    if (!address.trim()) errors.address = "Address is required";
    
    // Email validation if provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProductChange = (product: string, checked: boolean) => {
    setProducts(prev => ({ ...prev, [product]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected products
      const selectedProducts = Object.keys(products).filter(key => products[key]);
      
      // Ensure supplierType is one of the allowed values
      const validatedSupplierType = (supplierType === 'Major' || supplierType === 'Independent' || supplierType === 'Government') 
        ? supplierType as 'Major' | 'Independent' | 'Government'
        : 'Independent'; // Default value
        
      // Create new supplier object with enhanced fields
      const newSupplier = {
        id: uuidv4(),
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
        email: email.trim(),
        supplierType: validatedSupplierType,
        depotName: depotName.trim(),
        taxId: regNumber.trim(),
        accountNumber: '',
        bankName: '',
        products: selectedProducts
      };
      
      // Add supplier to the context
      const result = addSupplier(newSupplier);
      
      if (result) {
        toast({
          title: "Supplier Added",
          description: `${name} has been added to your suppliers.`,
        });
        
        // Close the dialog
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to add supplier. Please try again.",
          variant: "destructive",
        });
      }
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Left column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 required">
            <Building className="h-4 w-4 text-muted-foreground" />
            Company Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationErrors.name) {
                setValidationErrors({...validationErrors, name: ''});
              }
            }}
            placeholder="NNPC Depot, Mobil, etc."
            className={validationErrors.name ? "border-red-500" : ""}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-500">{validationErrors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplierType" className="flex items-center gap-2">
            <GasPump className="h-4 w-4 text-muted-foreground" />
            Supplier Type
          </Label>
          <Select
            value={supplierType}
            onValueChange={setSupplierType}
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
        
        <div className="space-y-2">
          <Label htmlFor="regNumber" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Company Registration Number
          </Label>
          <Input
            id="regNumber"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            placeholder="RC12345678"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="depotLocation" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Depot Location
          </Label>
          <Input
            id="depotLocation"
            value={depotLocation}
            onChange={(e) => setDepotLocation(e.target.value)}
            placeholder="Apapa, Lagos"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="depotName" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-muted-foreground" />
            Depot Name
          </Label>
          <Input
            id="depotName"
            value={depotName}
            onChange={(e) => setDepotName(e.target.value)}
            placeholder="Main Terminal"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="creditLimit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Credit Limit (₦)
          </Label>
          <Input
            id="creditLimit"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            type="number"
            placeholder="0.00"
          />
        </div>
      </div>
      
      {/* Right column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact" className="flex items-center gap-2 required">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Contact Information
          </Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (validationErrors.contact) {
                setValidationErrors({...validationErrors, contact: ''});
              }
            }}
            placeholder="Phone number"
            className={validationErrors.contact ? "border-red-500" : ""}
          />
          {validationErrors.contact && (
            <p className="text-sm text-red-500">{validationErrors.contact}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors({...validationErrors, email: ''});
              }
            }}
            placeholder="contact@supplier.com"
            className={validationErrors.email ? "border-red-500" : ""}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Contact Person
          </Label>
          <Input
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Name of primary contact"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2 required">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Address
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (validationErrors.address) {
                setValidationErrors({...validationErrors, address: ''});
              }
            }}
            placeholder="Enter full address"
            className={validationErrors.address ? "border-red-500" : ""}
          />
          {validationErrors.address && (
            <p className="text-sm text-red-500">{validationErrors.address}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <GasPump className="h-4 w-4 text-muted-foreground" />
            Products Supplied
          </Label>
          <div className="flex flex-col gap-2 border rounded-md p-3">
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
        
        <div className="space-y-2">
          <Label htmlFor="paymentTerms" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Payment Terms
          </Label>
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
      </div>
      
      {/* Footer - spans both columns */}
      <DialogFooter className="col-span-1 md:col-span-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="mr-2">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          {isSubmitting ? "Adding..." : "Add Supplier"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddSupplierForm;
