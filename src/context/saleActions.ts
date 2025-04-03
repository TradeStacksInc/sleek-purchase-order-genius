
import { v4 as uuidv4 } from 'uuid';
import { Sale, Shift, Dispenser, ActivityLog } from '../types';
import { PaginationParams, PaginatedResult } from '../utils/localStorage/types';
import { getPaginatedData } from '../utils/localStorage/appState';
import { useToast } from '@/hooks/use-toast';

export const useSaleActions = (
  sales: Sale[],
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>,
  shifts: Shift[],
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>,
  dispensers: Dispenser[],
  setDispensers: React.Dispatch<React.SetStateAction<Dispenser[]>>,
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>
) => {
  const { toast } = useToast();

  const recordSale = (saleData: Omit<Sale, 'id' | 'timestamp'>): Sale => {
    try {
      console.log("Recording sale:", saleData);
      
      // Validate that staff has an active shift
      const activeShift = shifts.find(
        shift => shift.staffId === saleData.staffId && shift.status === 'active'
      );
      
      if (!activeShift) {
        throw new Error("Staff does not have an active shift");
      }
      
      // Validate dispenser exists
      const dispenser = dispensers.find(d => d.id === saleData.dispenserId);
      if (!dispenser) {
        throw new Error("Dispenser not found");
      }
      
      const newSale: Sale = {
        ...saleData,
        id: `sale-${uuidv4().substring(0, 8)}`,
        timestamp: new Date(),
        shiftId: activeShift.id
      };
      
      setSales(prev => [newSale, ...prev]);
      
      // Update dispenser total volume sold
      setDispensers(prev => prev.map(d => {
        if (d.id === saleData.dispenserId) {
          return {
            ...d,
            totalVolumeSold: (d.totalVolumeSold || 0) + saleData.volume
          };
        }
        return d;
      }));
      
      // Update shift sales data
      setShifts(prev => prev.map(shift => {
        if (shift.id === activeShift.id) {
          return {
            ...shift,
            salesVolume: (shift.salesVolume || 0) + saleData.volume,
            salesAmount: (shift.salesAmount || 0) + saleData.totalAmount
          };
        }
        return shift;
      }));
      
      // Log the action
      const newActivityLog: ActivityLog = {
        id: `log-${uuidv4()}`,
        entityType: 'sale',
        entityId: newSale.id,
        action: 'create',
        details: `Recorded sale of ${newSale.volume} liters of ${newSale.productType} for ₦${newSale.totalAmount}`,
        user: 'Current User',
        timestamp: new Date()
      };
      
      setActivityLogs(prev => [newActivityLog, ...prev]);
      
      toast({
        title: "Sale Recorded",
        description: `Sale of ${newSale.volume} liters has been recorded successfully.`,
      });
      
      return newSale;
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record sale. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };

  const getSalesByStaffId = (staffId: string, params?: PaginationParams): PaginatedResult<Sale> => {
    const staffSales = sales.filter(sale => sale.staffId === staffId);
    return getPaginatedData(staffSales, params || { page: 1, limit: 10 });
  };

  const getSalesByProductType = (productType: string, params?: PaginationParams): PaginatedResult<Sale> => {
    const filteredSales = sales.filter(sale => sale.productType === productType);
    return getPaginatedData(filteredSales, params || { page: 1, limit: 10 });
  };

  return {
    recordSale,
    getSaleById,
    getSalesByStaffId,
    getSalesByProductType
  };
};
