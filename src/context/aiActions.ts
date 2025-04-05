
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder, AIInsight, Truck, Driver } from '../types';

export const useAIActions = (
  purchaseOrders: PurchaseOrder[],
  aiInsights: AIInsight[],
  setAIInsights: React.Dispatch<React.SetStateAction<AIInsight[]>>,
  getDriverById: (id: string) => Driver | undefined,
  getTruckById: (id: string) => Truck | undefined
) => {
  // Function to generate AI insights based on delivery data
  const generateAIInsights = () => {
    console.log("Generating AI insights...");
    
    // Get delivery orders with potential insights
    const deliveryOrders = purchaseOrders.filter(order => 
      (order.deliveryDetails || order.offloadingDetails)
    );

    // No data to analyze
    if (deliveryOrders.length < 2) {
      console.log("Not enough data to generate insights");
      return;
    }
    
    const newInsights: AIInsight[] = [];
    
    // Look for delivery pattern insights
    const lateDeliveries = deliveryOrders.filter(order => {
      if (!order.deliveryDetails) return false;
      
      const expectedTime = order.deliveryDetails.expectedArrivalTime;
      const actualTime = order.deliveryDetails.destinationArrivalTime;
      
      if (expectedTime && actualTime) {
        return actualTime > expectedTime;
      }
      return false;
    });
    
    // Find drivers with multiple late deliveries
    const driversWithLateDeliveries: Record<string, number> = {};
    lateDeliveries.forEach(order => {
      if (order.deliveryDetails?.driverId) {
        const driverId = order.deliveryDetails.driverId;
        driversWithLateDeliveries[driverId] = (driversWithLateDeliveries[driverId] || 0) + 1;
      }
    });
    
    // Generate insight for drivers with multiple late deliveries
    Object.entries(driversWithLateDeliveries)
      .filter(([_, count]) => count >= 2)
      .forEach(([driverId, count]) => {
        const driver = getDriverById(driverId);
        if (driver) {
          const newInsight: AIInsight = {
            id: `insight-${uuidv4().substring(0, 8)}`,
            type: 'driver_analysis',
            description: `Driver ${driver.name} has had ${count} late deliveries. Consider reviewing their routes or providing additional training.`,
            severity: 'medium',
            relatedEntityIds: [driverId],
            generatedAt: new Date(),
            isRead: false,
            truckId: '',
            timestamp: new Date(),
            anomalyType: 'late_delivery'
          };
          newInsights.push(newInsight);
        }
      });
    
    // Analyze offloading discrepancies
    const offloadingOrders = purchaseOrders.filter(order => order.offloadingDetails);
    
    if (offloadingOrders.length > 0) {
      let totalDiscrepancyPercent = 0;
      let ordersWithSignificantDiscrepancy = 0;
      
      offloadingOrders.forEach(order => {
        if (order.offloadingDetails) {
          const { loadedVolume, deliveredVolume } = order.offloadingDetails;
          const discrepancy = Math.abs(loadedVolume - deliveredVolume);
          const discrepancyPercent = (discrepancy / loadedVolume) * 100;
          
          totalDiscrepancyPercent += discrepancyPercent;
          if (discrepancyPercent > 3) {
            ordersWithSignificantDiscrepancy++;
          }
        }
      });
      
      // Calculate average discrepancy
      const avgDiscrepancy = totalDiscrepancyPercent / offloadingOrders.length;
      
      // Generate insight if average discrepancy is significant
      if (avgDiscrepancy > 2) {
        const newInsight: AIInsight = {
          id: `insight-${uuidv4().substring(0, 8)}`,
          type: 'discrepancy_pattern',
          description: `Average volume discrepancy of ${avgDiscrepancy.toFixed(1)}% detected across ${offloadingOrders.length} deliveries. ${ordersWithSignificantDiscrepancy} orders had discrepancies > 3%. Consider calibrating measurement equipment or reviewing procedures.`,
          severity: 'high',
          relatedEntityIds: offloadingOrders.map(o => o.id),
          generatedAt: new Date(),
          isRead: false,
          truckId: '',
          timestamp: new Date(),
          anomalyType: 'volume_discrepancy'
        };
        newInsights.push(newInsight);
      }
      
      // Look for efficiency opportunities
      if (deliveryOrders.length > 5) {
        const newInsight: AIInsight = {
          id: `insight-${uuidv4().substring(0, 8)}`,
          type: 'efficiency_recommendation',
          description: `Based on ${deliveryOrders.length} recent deliveries, optimizing delivery schedules could reduce fuel costs by an estimated 12-15%. Consider reviewing route planning.`,
          severity: 'medium',
          relatedEntityIds: [],
          generatedAt: new Date(),
          isRead: false,
          truckId: '',
          timestamp: new Date(),
          anomalyType: 'efficiency'
        };
        newInsights.push(newInsight);
      }
    }
    
    // Update insights state if we have new insights
    if (newInsights.length > 0) {
      setAIInsights(prev => [...newInsights, ...prev]);
      console.log(`Generated ${newInsights.length} new AI insights`);
    } else {
      console.log("No new insights generated");
    }
  };

  // Function to mark an insight as read
  const markInsightAsRead = (insightId: string) => {
    setAIInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isRead: true } 
          : insight
      )
    );
    return true;
  };
  
  // Get all unread insights
  const getUnreadInsights = () => {
    return aiInsights.filter(insight => !insight.isRead);
  };
  
  // Get insights by type
  const getInsightsByType = (type: 'efficiency_recommendation' | 'discrepancy_pattern' | 'driver_analysis') => {
    return aiInsights.filter(insight => insight.type === type);
  };

  return {
    generateAIInsights,
    markInsightAsRead,
    getUnreadInsights,
    getInsightsByType
  };
};
