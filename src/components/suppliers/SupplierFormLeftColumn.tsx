
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Building,
  Hash,
  MapPin,
  Warehouse,
  Fuel,
  CreditCard
} from 'lucide-react';
import { FormValidationErrors, SupplierFormData } from './types';

interface SupplierFormLeftColumnProps {
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
  validationErrors: FormValidationErrors;
  clearFieldError: (field: string) => void;
}

const SupplierFormLeftColumn: React.FC<SupplierFormLeftColumnProps> = ({
  formData,
  setFormData,
  validationErrors,
  clearFieldError
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2 required">
          <Building className="h-4 w-4 text-muted-foreground" />
          Company Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({...formData, name: e.target.value});
            if (validationErrors.name) {
              clearFieldError('name');
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
          <Fuel className="h-4 w-4 text-muted-foreground" />
          Supplier Type
        </Label>
        <Select
          value={formData.supplierType}
          onValueChange={(value) => setFormData({...formData, supplierType: value})}
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
          value={formData.regNumber}
          onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
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
          value={formData.depotLocation}
          onChange={(e) => setFormData({...formData, depotLocation: e.target.value})}
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
          value={formData.depotName}
          onChange={(e) => setFormData({...formData, depotName: e.target.value})}
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
          value={formData.creditLimit}
          onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
          type="number"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default SupplierFormLeftColumn;
