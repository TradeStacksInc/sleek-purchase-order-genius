
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { SupplierFormData } from './types';

export const useSupplierFormSubmit = (onClose: () => void) => {
  const { addSupplier } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (formData: SupplierFormData, isValid: boolean) => {
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting supplier form:", formData);
      
      // Get selected products
      const selectedProducts = Object.keys(formData.products).filter(key => formData.products[key]);
      
      // Ensure supplierType is one of the allowed values
      const validatedSupplierType = (formData.supplierType === 'Major' || formData.supplierType === 'Independent' || formData.supplierType === 'Government') 
        ? formData.supplierType as 'Major' | 'Independent' | 'Government'
        : 'Independent'; // Default value
        
      // Create new supplier object with only essential fields
      const newSupplier = {
        id: uuidv4(),
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        supplierType: validatedSupplierType,
        depotName: formData.depotName.trim(),
        taxId: formData.regNumber.trim(),
        accountNumber: '',
        bankName: '',
        products: selectedProducts
      };
      
      console.log("Created new supplier object:", newSupplier);
      
      // Add supplier to the context and check the result
      const result = addSupplier(newSupplier);
      
      console.log("addSupplier result:", result);
      
      if (result !== null) {
        toast({
          title: "Supplier Added",
          description: `${formData.name} has been added to your suppliers.`,
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
  
  return {
    handleSubmit,
    isSubmitting
  };
};
