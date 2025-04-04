
import { Supplier, LogEntry } from '../types';
import { useToast } from '@/hooks/use-toast';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';

export const useSupplierActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addSupplier = (supplier: Supplier) => {
    try {
      // Create the new suppliers array directly
      const newSuppliers = [supplier, ...suppliers];
      
      // Save to localStorage first to prevent potential issues
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      
      if (!saveSuccess) {
        toast({
          title: "Save Error",
          description: "There was a problem saving your supplier. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      // Then update state only after successful save
      setSuppliers(newSuppliers);
      
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: "system",
        action: `New supplier "${supplier.name}" added to the system`,
        user: 'Current User', // In a real app, get from auth
        timestamp: new Date(),
      };
      
      // Create new logs array correctly
      setLogs(prevLogs => [newLog, ...prevLogs]);
      
      // Save the updated logs to localStorage
      // We need to get the current logs first since we can't access the state directly after the update
      const currentLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
      const updatedLogs = [newLog, ...currentLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, updatedLogs);
      
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
