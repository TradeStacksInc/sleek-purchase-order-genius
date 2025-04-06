import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PhoneCall, Truck, MapPin, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PurchaseOrder, DeliveryDetails } from '@/types';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const GPSTracking: React.FC = () => {
  const { 
    purchaseOrders, 
    getDriverById, 
    getTruckById, 
    updateDeliveryStatus,
    updateGPSData
  } = useApp();
  
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateTimestamp(Date.now());
    }, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const inTransitOrders = purchaseOrders.filter(
    order => order.deliveryDetails?.status === 'in_transit'
  );
  
  const pendingDeliveryOrders = purchaseOrders.filter(
    order => 
      order.deliveryDetails?.status === 'pending' && 
      order.deliveryDetails?.driverId
  );
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">GPS Tracking & Monitoring</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(updateTimestamp), 'HH:mm:ss')}
        </div>
      </div>
      
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
                      updateTimestamp={updateTimestamp}
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
  updateTimestamp: number;
}

const DeliveryTrackingCard: React.FC<DeliveryTrackingCardProps> = ({ 
  order, 
  getDriverById, 
  getTruckById,
  updateDeliveryStatus,
  updateTimestamp
}) => {
  const { toast } = useToast();
  
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
    
  if (!driver || !truck || !order.deliveryDetails) {
    return <div>Missing delivery details</div>;
  }
  
  const totalDistance = order.deliveryDetails.totalDistance || 100;
  const distanceCovered = order.deliveryDetails.distanceCovered || 0;
  const progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
  
  const eta = order.deliveryDetails.expectedArrivalTime 
    ? format(new Date(order.deliveryDetails.expectedArrivalTime), 'h:mm a, MMM d')
    : 'Calculating...';
    
  const currentSpeed = truck.lastSpeed || 0;
  
  const handleMarkDelivered = () => {
    updateDeliveryStatus(order.id, {
      status: 'delivered',
      destinationArrivalTime: new Date(),
      distanceCovered: totalDistance
    });
    
    toast({
      title: "Delivery Completed",
      description: `Delivery for PO #${order.poNumber} has been marked as completed.`,
    });
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">PO #{order.poNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Departed: {order.deliveryDetails.depotDepartureTime 
              ? format(new Date(order.deliveryDetails.depotDepartureTime), 'h:mm a, MMM d')
              : 'Not recorded'}
          </p>
          
          <div className="mt-2 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100 rounded-md">
            <p className="text-xs font-medium text-blue-800 flex items-center">
              <Navigation className="h-3 w-3 mr-1" /> 
              Current Speed: {currentSpeed.toFixed(1)} km/h
            </p>
          </div>
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
          <Progress 
            value={progressPercentage} 
            className="h-2 rounded-full" 
            indicatorClassName={
              progressPercentage < 30 ? "bg-amber-500" : 
              progressPercentage < 70 ? "bg-blue-500" : 
              "bg-green-500"
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Covered: {distanceCovered.toFixed(1)} km</span>
            <span>Total: {totalDistance.toFixed(1)} km</span>
          </div>
          <Button 
            size="sm" 
            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={handleMarkDelivered}
          >
            Mark as Delivered
          </Button>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Route Details</h4>
          <Button variant="ghost" size="sm" asChild>
            <a href={`/delivery-log/map?id=${order.id}`} className="text-xs flex items-center">
              View Full Map <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
        <div className="mt-2 bg-gradient-to-r from-slate-50 to-slate-100 p-2 rounded-md h-16 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="h-3 w-3 rounded-full bg-green-500 z-10"></div>
            <div className="h-0.5 bg-slate-300 flex-grow mx-2 relative">
              <div 
                className="h-0.5 bg-green-500 absolute left-0 top-0" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div 
                className="h-3 w-3 rounded-full bg-blue-500 absolute top-1/2 -translate-y-1/2"
                style={{ left: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="h-3 w-3 rounded-full bg-red-500 z-10"></div>
          </div>
          <div className="absolute bottom-1 left-2 text-xs text-slate-500">Depot</div>
          <div className="absolute bottom-1 right-2 text-xs text-slate-500">Destination</div>
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
  const { toast } = useToast();
  
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
    
  if (!driver || !truck || !order.deliveryDetails) {
    return <div>Missing delivery details</div>;
  }
  
  const hasGPS = truck.hasGPS && truck.isGPSTagged;
  
  const handleStartDelivery = () => {
    if (!hasGPS) {
      toast({
        title: "GPS Required",
        description: "This truck doesn't have GPS capabilities or is not tagged. Please assign a GPS-enabled truck.",
        variant: "destructive"
      });
      return;
    }
    
    const totalDistance = Math.floor(Math.random() * 50) + 70;
    
    updateDeliveryStatus(order.id, {
      status: 'in_transit',
      depotDepartureTime: new Date(),
      distanceCovered: 0,
      totalDistance,
    });
    
    toast({
      title: "Delivery Started",
      description: `Truck ${truck.plateNumber} is now in transit for PO #${order.poNumber}.`,
    });
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
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
        
        <div className="flex flex-col justify-center">
          {!hasGPS && (
            <div className="mb-2 p-2 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-100 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This truck does not have GPS tracking capabilities or is not tagged.
                </p>
              </div>
            </div>
          )}
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={handleStartDelivery}
            variant={hasGPS ? "default" : "outline"}
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
