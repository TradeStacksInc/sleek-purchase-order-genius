
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation
  const isFormValid = name.trim() !== '' && contact.trim() !== '' && address.trim() !== '';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all supplier fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new supplier object
      const newSupplier = {
        id: uuidv4(),
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
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
          <Label htmlFor="name" className="required">Supplier Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter supplier name"
            required
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
