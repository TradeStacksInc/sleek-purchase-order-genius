import { v4 as uuidv4 } from 'uuid';
import { Supplier } from '@/types';
import { PaginationParams, PaginatedResult } from '@/utils/localStorage/types';
import { getPaginatedData } from '@/utils/localStorage';

export const useSupplierActions = (
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  setLogs: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const addSupplier = (supplier: Omit<Supplier, 'id'>): Supplier => {
    const newSupplier = {
      ...supplier,
      id: `supplier-${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSuppliers(prev => [...prev, newSupplier]);
    
    // Log the supplier addition
    const actionLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action: `create_supplier`,
      user: 'Admin',
      entityType: 'supplier',
      entityId: newSupplier.id,
      details: `New supplier "${newSupplier.name}" added`
    };
    
    setLogs(prev => [...prev, actionLog]);
    
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>): boolean => {
    const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);
    if (supplierIndex === -1) return false;

    const updatedSupplier = { ...suppliers[supplierIndex], ...updates, updatedAt: new Date() };

    setSuppliers(prev => {
      const updated = [...prev];
      updated[supplierIndex] = updatedSupplier;
      return updated;
    });

    // Log the supplier update
    const actionLog = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date(),
      action: `update_supplier`,
      user: 'Admin',
      entityType: 'supplier',
      entityId: id,
      details: `Supplier "${updatedSupplier.name}" updated`
    };
    
    setLogs(prev => [...prev, actionLog]);

    return true;
  };

  const deleteSupplier = (id: string): boolean => {
    const initialLength = suppliers.length;
    
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    
    const deletionSuccessful = suppliers.length < initialLength;

    if (deletionSuccessful) {
      // Log the supplier deletion
      const actionLog = {
        id: `log-${uuidv4().substring(0, 8)}`,
        timestamp: new Date(),
        action: `delete_supplier`,
        user: 'Admin',
        entityType: 'supplier',
        entityId: id,
        details: `Supplier with id "${id}" deleted`
      };
      
      setLogs(prev => [...prev, actionLog]);
    }

    return deletionSuccessful;
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const getAllSuppliers = (params?: PaginationParams): PaginatedResult<Supplier> => {
    return getPaginatedData(suppliers, params || { page: 1, limit: 10 });
  };

  return {
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getAllSuppliers
  };
};
