
import { v4 as uuidv4 } from 'uuid';
import { AIInsight, PurchaseOrder } from '../types';

export const useAIActions = (
  purchaseOrders: PurchaseOrder[],
  aiInsights: AIInsight[],
  setAIInsights: React.Dispatch<React.SetStateAction<AIInsight[]>>,
  getDriverById: (id: string) => any,
  getTruckById: (id: string) => any
) => {
  const getInsightsByType = (type: string): AIInsight[] => {
    return aiInsights.filter(insight => insight.type === type);
  };

  const markInsightAsRead = (id: string): void => {
    setAIInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, isRead: true } : insight
    ));
  };

  const generateAIInsights = (): void => {
    // Generate efficiency recommendations
    const efficiencyInsight: AIInsight = {
      id: `insight-${uuidv4()}`,
      type: 'efficiency_recommendation',
      description: 'Based on recent delivery patterns, scheduling deliveries on Tuesdays and Thursdays could reduce fuel consumption by approximately 12% due to lower traffic volumes.',
      severity: 'medium',
      relatedEntityIds: [],
      generatedAt: new Date(),
      isRead: false
    };

    // Generate discrepancy patterns
    const discrepancyInsight: AIInsight = {
      id: `insight-${uuidv4()}`,
      type: 'discrepancy_pattern',
      description: 'Consistent volume discrepancies detected for deliveries from Supplier X. Average variance is 3.2% higher than other suppliers.',
      severity: 'high',
      relatedEntityIds: [],
      generatedAt: new Date(),
      isRead: false
    };

    // Generate driver analysis
    const driverInsight: AIInsight = {
      id: `insight-${uuidv4()}`,
      type: 'driver_analysis',
      description: 'Driver John Doe has maintained an excellent delivery record with no incidents and minimal discrepancies over the last 20 deliveries.',
      severity: 'low',
      relatedEntityIds: [],
      generatedAt: new Date(),
      isRead: false
    };

    setAIInsights(prev => [efficiencyInsight, discrepancyInsight, driverInsight, ...prev]);
  };

  const generateDiscrepancyInsights = (): void => {
    // Find orders with potential discrepancies
    const ordersWithIssues = purchaseOrders.filter(order => 
      order.offloadingDetails && 
      order.offloadingDetails.isDiscrepancyFlagged
    );

    if (ordersWithIssues.length === 0) {
      const noIssuesInsight: AIInsight = {
        id: `insight-${uuidv4()}`,
        type: 'discrepancy_pattern',
        description: 'No significant delivery discrepancies detected in recent orders. Operations are running within expected parameters.',
        severity: 'low',
        relatedEntityIds: [],
        generatedAt: new Date(),
        isRead: false
      };
      
      setAIInsights(prev => [noIssuesInsight, ...prev]);
      return;
    }

    // Create insights based on found issues
    const insights = ordersWithIssues.map(order => {
      const driver = order.deliveryDetails?.driverId 
        ? getDriverById(order.deliveryDetails.driverId) 
        : null;
        
      const truck = order.deliveryDetails?.truckId
        ? getTruckById(order.deliveryDetails.truckId)
        : null;
        
      const driverName = driver?.name || 'Unknown driver';
      const truckInfo = truck?.plateNumber || 'Unknown truck';
      
      return {
        id: `insight-${uuidv4()}`,
        type: 'discrepancy_pattern',
        description: `Volume discrepancy detected in order ${order.poNumber}. Delivered volume is ${order.offloadingDetails?.discrepancyPercentage?.toFixed(2)}% off from loaded volume. Driver: ${driverName}, Truck: ${truckInfo}.`,
        severity: 'medium',
        relatedEntityIds: [order.id],
        truckId: order.deliveryDetails?.truckId,
        timestamp: new Date(),
        anomalyType: 'volume_discrepancy',
        generatedAt: new Date(),
        isRead: false
      };
    });
    
    if (insights.length > 0) {
      setAIInsights(prev => [...insights, ...prev]);
    }
  };

  return {
    getInsightsByType,
    markInsightAsRead,
    generateAIInsights,
    generateDiscrepancyInsights
  };
};
