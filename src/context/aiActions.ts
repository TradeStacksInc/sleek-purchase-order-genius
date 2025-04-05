
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, AIInsights, Driver, Truck } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAIActions = (
  purchaseOrders: PurchaseOrder[],
  aiInsights: AIInsights[],
  setAIInsights: React.Dispatch<React.SetStateAction<AIInsights[]>>,
  getDriverById: (id: string) => Driver | undefined,
  getTruckById: (id: string) => Truck | undefined
) => {
  const { toast } = useToast();

  const generateDiscrepancyInsights = () => {
    const driversWithDiscrepancies = new Map<string, number>();
    const trucksWithDiscrepancies = new Map<string, number>();
    
    purchaseOrders.forEach(order => {
      if (order.offloadingDetails?.isDiscrepancyFlagged && order.deliveryDetails) {
        if (order.deliveryDetails.driverId) {
          const driverId = order.deliveryDetails.driverId;
          driversWithDiscrepancies.set(
            driverId, 
            (driversWithDiscrepancies.get(driverId) || 0) + 1
          );
        }
        
        if (order.deliveryDetails.truckId) {
          const truckId = order.deliveryDetails.truckId;
          trucksWithDiscrepancies.set(
            truckId, 
            (trucksWithDiscrepancies.get(truckId) || 0) + 1
          );
        }
      }
    });
    
    const newInsights: AIInsights[] = [];
    
    driversWithDiscrepancies.forEach((count, driverId) => {
      if (count >= 2) {
        const driver = getDriverById(driverId);
        if (driver) {
          const insightId = `insight-${uuidv4().substring(0, 8)}`;
          newInsights.push({
            id: insightId,
            truckId: driverId, // Using driverId as a reference
            timestamp: new Date(),
            anomalyType: 'driver_discrepancy',
            type: 'discrepancy_pattern',
            description: `Driver ${driver.name} has been involved in ${count} flagged deliveries with volume discrepancies. Consider additional monitoring or training.`,
            severity: count >= 3 ? 'high' : 'medium',
            relatedEntityIds: [driverId],
            generatedAt: new Date(),
            isRead: false
          });
        }
      }
    });
    
    trucksWithDiscrepancies.forEach((count, truckId) => {
      if (count >= 2) {
        const truck = getTruckById(truckId);
        if (truck) {
          const insightId = `insight-${uuidv4().substring(0, 8)}`;
          newInsights.push({
            id: insightId,
            truckId: truckId,
            timestamp: new Date(),
            anomalyType: 'truck_discrepancy',
            type: 'discrepancy_pattern',
            description: `Truck ${truck.plateNumber} has been involved in ${count} flagged deliveries with volume discrepancies. Consider mechanical inspection.`,
            severity: count >= 3 ? 'high' : 'medium',
            relatedEntityIds: [truckId],
            generatedAt: new Date(),
            isRead: false
          });
        }
      }
    });
    
    const totalDeliveries = purchaseOrders.filter(order => 
      order.deliveryDetails?.status === 'delivered'
    ).length;
    
    const discrepancyDeliveries = purchaseOrders.filter(order => 
      order.offloadingDetails?.isDiscrepancyFlagged
    ).length;
    
    if (totalDeliveries > 0) {
      const discrepancyRate = (discrepancyDeliveries / totalDeliveries) * 100;
      
      if (discrepancyRate > 15) {
        newInsights.push({
          id: `insight-${uuidv4().substring(0, 8)}`,
          truckId: 'system',
          timestamp: new Date(),
          anomalyType: 'high_discrepancy_rate',
          type: 'efficiency_recommendation',
          description: `High volume discrepancy rate (${discrepancyRate.toFixed(1)}%) detected across deliveries. Consider implementing stricter volume verification at loading points and driver training programs.`,
          severity: 'high',
          relatedEntityIds: [],
          generatedAt: new Date(),
          isRead: false
        });
      } else if (discrepancyRate > 5) {
        newInsights.push({
          id: `insight-${uuidv4().substring(0, 8)}`,
          truckId: 'system',
          timestamp: new Date(),
          anomalyType: 'moderate_discrepancy_rate',
          type: 'efficiency_recommendation',
          description: `Moderate volume discrepancy rate (${discrepancyRate.toFixed(1)}%) detected. Consider reviewing loading procedures and implementing spot checks.`,
          severity: 'medium',
          relatedEntityIds: [],
          generatedAt: new Date(),
          isRead: false
        });
      }
    }
    
    if (newInsights.length > 0) {
      setAIInsights(prev => [...newInsights, ...prev]);
      
      toast({
        title: "AI Insights Generated",
        description: `${newInsights.length} new insights have been generated based on delivery data.`,
      });
    } else {
      toast({
        title: "AI Analysis Complete",
        description: "No significant patterns found in the current delivery data.",
      });
    }
  };

  const markInsightAsRead = (id: string) => {
    setAIInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, isRead: true } : insight
      )
    );
  };

  return {
    generateDiscrepancyInsights,
    markInsightAsRead
  };
};
