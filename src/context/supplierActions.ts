
import { Supplier, LogEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';

export const useSupplierActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addSupplier = (supplier: Supplier): Supplier | null => {
    try {
      console.log("Adding supplier in useSupplierActions:", supplier);
      
      // Ensure the supplier has all required fields
      if (!supplier.name || !supplier.contact || !supplier.address) {
        console.error("Supplier missing required fields:", supplier);
        toast({
          title: "Invalid Supplier Data",
          description: "Supplier is missing required fields. Please check your form inputs.",
          variant: "destructive"
        });
        return null;
      }
      
      // Check if a supplier with the same name already exists
      const existingSupplier = suppliers.find(s => s.name.toLowerCase() === supplier.name.toLowerCase());
      if (existingSupplier) {
        console.log("Supplier with this name already exists, returning existing supplier:", existingSupplier);
        // We return the existing supplier to allow the order to be created
        return existingSupplier;
      }
      
      // Create the new suppliers array directly
      const newSuppliers = [supplier, ...suppliers];
      
      // Save to localStorage first to prevent potential issues
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      
      if (!saveSuccess) {
        console.error("Failed to save suppliers to localStorage");
        toast({
          title: "Save Error",
          description: "There was a problem saving your supplier. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Successfully saved suppliers to localStorage");
      
      // Then update state only after successful save
      setSuppliers(newSuppliers);
      
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: "system",
        action: `New supplier "${supplier.name}" added to the system`,
        user: 'Current User', // In a real app, get from auth
        timestamp: new Date(),
      };
      
      // Update logs state with the new log
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs];
        // Get current logs from localStorage and update with new log
        saveToLocalStorage(STORAGE_KEYS.LOGS, updatedLogs);
        return updatedLogs;
      });
      
      toast({
        title: "Supplier Added",
        description: `${supplier.name} has been added to your suppliers list.`,
      });
      
      return supplier;
    } catch (error) {
      console.error("Error in addSupplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const getAllSuppliers = () => {
    return suppliers;
  };

  const getSuppliersByProduct = (product: string): Supplier[] => {
    return suppliers.filter(supplier => 
      supplier.products && supplier.products.includes(product)
    );
  };

  return {
    addSupplier,
    getSupplierById,
    getAllSuppliers,
    getSuppliersByProduct
  };
};
