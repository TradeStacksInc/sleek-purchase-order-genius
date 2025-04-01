
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
    // Add to state and save to localStorage immediately
    setSuppliers((prevSuppliers) => {
      const newSuppliers = [supplier, ...prevSuppliers];
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      
      if (!saveSuccess) {
        toast({
          title: "Save Error",
          description: "There was a problem saving your supplier. Please try again.",
          variant: "destructive"
        });
      }
      
      return newSuppliers;
    });
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `New supplier "${supplier.name}" added to the system`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => {
      const newLogs = [newLog, ...prevLogs];
      saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
      return newLogs;
    });
    
    toast({
      title: "Supplier Added",
      description: `${supplier.name} has been added to your suppliers list.`,
    });
    
    return supplier;
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  return {
    addSupplier,
    getSupplierById
  };
};
