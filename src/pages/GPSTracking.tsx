
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PhoneCall, Truck, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PurchaseOrder, DeliveryDetails } from '@/types';
import GPSTrackingService from '@/services/GPSTrackingService';

const GPSTracking: React.FC = () => {
  const { 
    purchaseOrders, 
    getDriverById, 
    getTruckById, 
    updateDeliveryStatus, 
    updateGPSData
  } = useApp();
  
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Register the GPS update callback when component mounts
  useEffect(() => {
    const gpsService = GPSTrackingService.getInstance();
    gpsService.registerUpdateCallback(updateGPSData);
    
    // Force a re-render every 5 seconds to update the UI with latest GPS data
    const intervalId = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [updateGPSData]);
  
  // Get orders that are in transit with GPS-enabled trucks
  const inTransitOrders = purchaseOrders.filter(
    order => order.deliveryDetails?.status === 'in_transit'
  );
  
  // Get orders that are pending delivery (assigned but not yet in transit)
  const pendingDeliveryOrders = purchaseOrders.filter(
    order => 
      order.deliveryDetails?.status === 'pending' && 
      order.deliveryDetails?.driverId
  );
  
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold">GPS Tracking & Monitoring</h1>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="pending">Pending Deliveries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
              <CardDescription>
                Real-time monitoring of trucks en route to their destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inTransitOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No active deliveries at the moment</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deliveries will appear here once they are in transit
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {inTransitOrders.map((order) => (
                    <DeliveryTrackingCard 
                      key={order.id} 
                      order={order} 
                      getDriverById={getDriverById}
                      getTruckById={getTruckById}
                      updateDeliveryStatus={updateDeliveryStatus}
                      forceUpdate={forceUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deliveries</CardTitle>
              <CardDescription>
                Deliveries ready to depart
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeliveryOrders.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No pending deliveries at the moment</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deliveries will appear here once a driver and truck are assigned
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingDeliveryOrders.map((order) => (
                    <PendingDeliveryCard 
                      key={order.id} 
                      order={order} 
                      getDriverById={getDriverById}
                      getTruckById={getTruckById}
                      updateDeliveryStatus={updateDeliveryStatus}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DeliveryTrackingCardProps {
  order: PurchaseOrder;
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
  updateDeliveryStatus: (orderId: string, updates: Partial<DeliveryDetails>) => void;
  forceUpdate: number;
}

const DeliveryTrackingCard: React.FC<DeliveryTrackingCardProps> = ({ 
  order, 
  getDriverById, 
  getTruckById,
  updateDeliveryStatus,
  forceUpdate
}) => {
  // Get driver and truck details
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
    
  if (!driver || !truck || !order.deliveryDetails) {
    return <div>Missing delivery details</div>;
  }
  
  // Get GPS tracking service
  const gpsService = GPSTrackingService.getInstance();
  const truckId = order.deliveryDetails.truckId!;
  
  // Start tracking if not already tracking
  useEffect(() => {
    if (!gpsService.isTracking(truckId) && order.deliveryDetails?.status === 'in_transit') {
      const totalDistance = order.deliveryDetails.totalDistance || 100;
      const distanceCovered = order.deliveryDetails.distanceCovered || 0;
      
      // Don't restart tracking if we've covered the distance
      if (distanceCovered >= totalDistance) {
        return;
      }
      
      // Start tracking from current position
      gpsService.startTracking(
        truckId,
        truck.lastLatitude || 6.5244,
        truck.lastLongitude || 3.3792,
        totalDistance
      );
    }
    
    return () => {
      // Don't stop tracking when component unmounts
      // Tracking will continue in the background
    };
  }, [truckId, order.deliveryDetails, truck, gpsService]);
  
  // Calculate progress
  const totalDistance = order.deliveryDetails.totalDistance || 100;
  const distanceCovered = order.deliveryDetails.distanceCovered || 0;
  const progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
  
  // Format expected arrival time
  const eta = order.deliveryDetails.expectedArrivalTime 
    ? format(new Date(order.deliveryDetails.expectedArrivalTime), 'h:mm a, MMM d')
    : 'Calculating...';
    
  // Handle mark as delivered
  const handleMarkDelivered = () => {
    // Stop tracking
    gpsService.stopTracking(truckId);
    
    // Update delivery status
    updateDeliveryStatus(order.id, {
      status: 'delivered',
      destinationArrivalTime: new Date()
    });
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">PO #{order.poNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Departed: {order.deliveryDetails.depotDepartureTime 
              ? format(new Date(order.deliveryDetails.depotDepartureTime), 'h:mm a, MMM d')
              : 'Not recorded'}
          </p>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{driver.name}</p>
              <p className="text-xs text-muted-foreground">{truck.plateNumber} • {truck.model}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => window.location.href = `tel:${driver.contact}`}
          >
            <PhoneCall className="h-3 w-3 mr-1" /> 
            {driver.contact}
          </Button>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">ETA: {eta}</span>
            <span className="text-xs font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Covered: {distanceCovered.toFixed(1)} km</span>
            <span>Total: {totalDistance.toFixed(1)} km</span>
          </div>
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={handleMarkDelivered}
          >
            Mark as Delivered
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PendingDeliveryCardProps {
  order: PurchaseOrder;
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
  updateDeliveryStatus: (orderId: string, updates: Partial<DeliveryDetails>) => void;
}

const PendingDeliveryCard: React.FC<PendingDeliveryCardProps> = ({ 
  order, 
  getDriverById, 
  getTruckById,
  updateDeliveryStatus
}) => {
  // Get driver and truck details
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
    
  if (!driver || !truck || !order.deliveryDetails) {
    return <div>Missing delivery details</div>;
  }
  
  // Handle start delivery
  const handleStartDelivery = () => {
    const totalDistance = Math.floor(Math.random() * 50) + 70; // Random distance between 70-120km for demo
    
    updateDeliveryStatus(order.id, {
      status: 'in_transit',
      depotDepartureTime: new Date(),
      distanceCovered: 0,
      totalDistance,
    });
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">PO #{order.poNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Assigned: {format(new Date(order.updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{driver.name}</p>
              <p className="text-xs text-muted-foreground">{truck.plateNumber} • {truck.model}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => window.location.href = `tel:${driver.contact}`}
          >
            <PhoneCall className="h-3 w-3 mr-1" /> 
            {driver.contact}
          </Button>
        </div>
        
        <div className="flex items-center">
          <Button 
            className="w-full"
            onClick={handleStartDelivery}
          >
            Start Delivery
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GPSTracking;
