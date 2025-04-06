import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, Driver, Truck } from '@/types';

interface DriverPerformanceInsight {
  driverId: string;
  averageSpeed: number;
  incidents: number;
}

interface TruckUtilizationInsight {
  truckId: string;
  utilizationRate: number;
  maintenanceNeeded: boolean;
}

export const useAIActions = (
  purchaseOrders: any[],
  aiInsights: any[],
  setAIInsights: any,
  getDriverById: any,
  getTruckById: any
) => {
  const generateDriverPerformanceInsights = (): DriverPerformanceInsight[] => {
    const insights: DriverPerformanceInsight[] = [];

    // Mock data for demonstration
    const driverIds = ['driver-001', 'driver-002', 'driver-003']; // Replace with actual driver IDs
    driverIds.forEach(driverId => {
      insights.push({
        driverId: driverId,
        averageSpeed: Math.random() * 80 + 40, // Random speed between 40-120
        incidents: Math.floor(Math.random() * 3) // Random number of incidents
      });
    });

    return insights;
  };

  const generateTruckUtilizationInsights = (): TruckUtilizationInsight[] => {
    const insights: TruckUtilizationInsight[] = [];

    // Mock data for demonstration
    const truckIds = ['truck-001', 'truck-002', 'truck-003']; // Replace with actual truck IDs
    truckIds.forEach(truckId => {
      insights.push({
        truckId: truckId,
        utilizationRate: Math.random() * 100, // Random utilization rate
        maintenanceNeeded: Math.random() > 0.5 // Random boolean for maintenance
      });
    });

    return insights;
  };

  const generateAIInsights = () => {
    const newInsights = [
      ...generateDriverPerformanceInsights().map(insight => ({
        id: `ai-insight-${uuidv4()}`,
        type: 'driver_performance',
        data: insight,
        createdAt: new Date(),
        isRead: false
      })),
      ...generateTruckUtilizationInsights().map(insight => ({
        id: `ai-insight-${uuidv4()}`,
        type: 'truck_utilization',
        data: insight,
        createdAt: new Date(),
        isRead: false
      }))
    ];
    
    // Add new insights to the state
    setAIInsights((prev: any[]) => {
      return [...newInsights, ...prev];
    });
  };

  const getInsightsByType = (type: string) => {
    return aiInsights.filter((insight: any) => insight.type === type);
  };

  return {
    generateAIInsights,
    getInsightsByType
  };
};
