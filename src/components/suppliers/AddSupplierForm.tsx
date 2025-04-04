
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { SupplierFormData, AddSupplierFormProps } from './types';
import { useSupplierFormValidation } from './useSupplierFormValidation';
import { useSupplierFormSubmit } from './useSupplierFormSubmit';
import SupplierFormLeftColumn from './SupplierFormLeftColumn';
import SupplierFormRightColumn from './SupplierFormRightColumn';

const AddSupplierForm: React.FC<AddSupplierFormProps> = ({ onClose }) => {
  // Initialize form state
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact: '',
    address: '',
    regNumber: '',
    depotLocation: '',
    creditLimit: '',
    supplierType: '',
    depotName: '',
    contactPerson: '',
    email: '',
    products: {
      PMS: false,
      AGO: false,
      DPK: false
    },
    paymentTerms: ''
  });
  
  // Form validation and submission hooks
  const { validationErrors, validateForm, clearFieldError } = useSupplierFormValidation();
  const { handleSubmit, isSubmitting } = useSupplierFormSubmit(onClose);
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validateForm(formData);
    handleSubmit(formData, validationResult.isValid);
  };
  
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Left column */}
      <SupplierFormLeftColumn
        formData={formData}
        setFormData={setFormData}
        validationErrors={validationErrors}
        clearFieldError={clearFieldError}
      />
      
      {/* Right column */}
      <SupplierFormRightColumn
        formData={formData}
        setFormData={setFormData}
        validationErrors={validationErrors}
        clearFieldError={clearFieldError}
      />
      
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
