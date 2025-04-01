
import { Supplier, LogEntry } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useSupplierActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const { toast } = useToast();

  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prevSuppliers) => [supplier, ...prevSuppliers]);
    
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      poId: "system",
      action: `New supplier "${supplier.name}" added to the system`,
      user: 'Current User', // In a real app, get from auth
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => [newLog, ...prevLogs]);
    
    toast({
      title: "Supplier Added",
      description: `${supplier.name} has been added to your suppliers list.`,
    });
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  return {
    addSupplier,
    getSupplierById
  };
};
