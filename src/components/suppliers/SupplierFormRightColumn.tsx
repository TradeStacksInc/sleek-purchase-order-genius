
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Phone,
  Mail,
  MapPin,
  User,
  Fuel,
  CreditCard
} from 'lucide-react';
import { FormValidationErrors, SupplierFormData } from './types';

interface SupplierFormRightColumnProps {
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
  validationErrors: FormValidationErrors;
  clearFieldError: (field: string) => void;
}

const SupplierFormRightColumn: React.FC<SupplierFormRightColumnProps> = ({
  formData,
  setFormData,
  validationErrors,
  clearFieldError
}) => {
  const handleProductChange = (product: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: checked
      }
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact" className="flex items-center gap-2 required">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Contact Information
        </Label>
        <Input
          id="contact"
          value={formData.contact}
          onChange={(e) => {
            setFormData({...formData, contact: e.target.value});
            if (validationErrors.contact) {
              clearFieldError('contact');
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
          value={formData.email}
          onChange={(e) => {
            setFormData({...formData, email: e.target.value});
            if (validationErrors.email) {
              clearFieldError('email');
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
          value={formData.contactPerson}
          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
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
          value={formData.address}
          onChange={(e) => {
            setFormData({...formData, address: e.target.value});
            if (validationErrors.address) {
              clearFieldError('address');
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
          <Fuel className="h-4 w-4 text-muted-foreground" />
          Products Supplied
        </Label>
        <div className="flex flex-col gap-2 border rounded-md p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pms" 
              checked={formData.products.PMS}
              onCheckedChange={(checked) => handleProductChange('PMS', checked === true)}
            />
            <Label htmlFor="pms" className="cursor-pointer">PMS (Petrol)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ago" 
              checked={formData.products.AGO}
              onCheckedChange={(checked) => handleProductChange('AGO', checked === true)}
            />
            <Label htmlFor="ago" className="cursor-pointer">AGO (Diesel)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dpk" 
              checked={formData.products.DPK}
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
          value={formData.paymentTerms}
          onValueChange={(value) => setFormData({...formData, paymentTerms: value})}
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
  );
};

export default SupplierFormRightColumn;
