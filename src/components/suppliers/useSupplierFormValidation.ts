
import { useState } from 'react';
import { FormValidationErrors, SupplierFormData, SupplierValidationResult } from './types';

export const useSupplierFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  
  const validateForm = (formData: SupplierFormData): SupplierValidationResult => {
    const errors: FormValidationErrors = {};
    
    // Only validate essential fields
    if (!formData.name.trim()) errors.name = "Supplier name is required";
    if (!formData.contact.trim()) errors.contact = "Contact information is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    
    // Email validation only if provided (not required)
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Log validation results for debugging
    console.log("Form validation results:", { 
      formData, 
      errors, 
      isValid: Object.keys(errors).length === 0 
    });
    
    setValidationErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  const clearFieldError = (field: string) => {
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };
  
  return {
    validationErrors,
    setValidationErrors,
    validateForm,
    clearFieldError
  };
};
