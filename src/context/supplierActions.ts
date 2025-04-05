
import { Supplier, LogEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, STORAGE_KEYS } from '@/utils/localStorage';

export const useSupplierActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const addSupplier = (supplier: Supplier): Supplier | null => {
    try {
      // Check if supplier with same name already exists
      const existingSupplier = suppliers.find(
        (s) => s.name.toLowerCase() === supplier.name.toLowerCase()
      );

      if (existingSupplier) {
        console.log("Using existing supplier:", existingSupplier);
        return existingSupplier;
      }

      // Ensure required fields
      if (!supplier.name || !supplier.contact || !supplier.address) {
        console.error("Missing required supplier fields", supplier);
        return null;
      }

      // Add creation timestamp and ensure ID
      const newSupplier = {
        ...supplier,
        id: supplier.id || uuidv4(),
        createdAt: new Date(),
      };

      // Create new array
      const newSuppliers = [...suppliers, newSupplier];
      
      // Save to localStorage before updating state
      const saveSuccess = saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, newSuppliers);
      
      if (!saveSuccess) {
        console.error("Failed to save suppliers to localStorage");
        return null;
      }
      
      // Update state
      setSuppliers(newSuppliers);

      // Add activity log
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        poId: "system",
        action: `New supplier "${newSupplier.name}" added`,
        user: 'Current User', // In a real app, get from auth
        timestamp: new Date(),
      };

      setLogs((prevLogs) => {
        const updatedLogs = [newLog, ...prevLogs];
        saveToLocalStorage(STORAGE_KEYS.LOGS, updatedLogs);
        return updatedLogs;
      });

      return newSupplier;
    } catch (error) {
      console.error("Error adding supplier:", error);
      return null;
    }
  };

  return {
    addSupplier,
  };
};
