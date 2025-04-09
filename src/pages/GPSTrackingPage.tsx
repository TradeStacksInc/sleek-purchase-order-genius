
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { useTruckTracking } from '@/hooks/useTruckTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, MapPin, Truck, BarChart, Clock, Map, ArrowLeft, Fuel } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GPSTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPurchaseOrderById, getTruckById, getDriverById, recordDeliveryDistance } = useApp();
  const { isTracking, trackedTrucks, trackingInfo, startTracking, stopTracking, updateTimestamp } = useTruckTracking();
  
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  const purchaseOrder = id ? getPurchaseOrderById(id) : undefined;
  const truck = purchaseOrder?.deliveryDetails?.truckId ? getTruckById(purchaseOrder.deliveryDetails.truckId) : null;
  const driver = purchaseOrder?.deliveryDetails?.driverId ? getDriverById(purchaseOrder.deliveryDetails.driverId) : null;
  
  const isCurrentlyTracked = truck ? trackedTrucks.includes(truck.id) : false;
  const currentTrackingInfo = truck ? trackingInfo[truck.id] : null;
  
  // Progress calculation
  const estimatedDistance = 100; // Placeholder - should come from route calculation
  const currentProgress = currentTrackingInfo && estimatedDistance > 0 
    ? Math.min(Math.round((currentTrackingInfo.distanceCovered / estimatedDistance) * 100), 100) 
    : 0;
  
  useEffect(() => {
    if (!purchaseOrder && id) {
      toast({
        title: "Error",
        description: `Purchase Order with ID ${id} not found.`,
        variant: "destructive",
      });
      navigate('/orders');
      return;
    }
    
    // If we have a truck but it's not being tracked, start tracking
    if (truck && !isCurrentlyTracked) {
      startTracking(truck);
    }
    
    // Set up auto refresh
    const interval = window.setInterval(() => {
      if (truck && currentTrackingInfo) {
        // Update delivery distance in the purchase order
        recordDeliveryDistance(id!, currentTrackingInfo.distanceCovered);
      }
    }, 30000); // Every 30 seconds
    setRefreshInterval(interval);
    
    return () => {
      // Clean up
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [id, purchaseOrder, truck, isCurrentlyTracked, currentTrackingInfo]);
  
  const handleBack = () => {
    navigate(`/orders/${id}`);
  };
  
  const handleStopTracking = () => {
    if (truck) {
      stopTracking(truck.id);
      toast({
        title: "Tracking Stopped",
        description: "GPS tracking has been stopped for this delivery."
      });
    }
  };
  
  const handleStartTracking = () => {
    if (truck) {
      startTracking(truck);
      toast({
        title: "Tracking Started",
        description: "GPS tracking has been started for this delivery."
      });
    }
  };

  if (!purchaseOrder) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Purchase Order Not Found</h1>
        <p>The purchase order you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  if (!truck || !driver) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tracking Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-amber-500 mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>No driver or truck assigned to this purchase order.</p>
            </div>
            <Button onClick={handleBack}>Back to Order</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                <Map className="h-5 w-5 inline-block mr-2" />
                Live Tracking Map
              </CardTitle>
              <CardDescription>
                Real-time location of truck {truck.plateNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative h-[400px]">
              {isCurrentlyTracked ? (
                <div className="h-full bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto text-primary animate-pulse" />
                    <p className="mt-4">
                      GPS Location: {currentTrackingInfo?.latitude.toFixed(6)}, {currentTrackingInfo?.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last updated: {updateTimestamp ? formatDistanceToNow(updateTimestamp, { addSuffix: true }) : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-4 text-gray-500">GPS tracking not active</p>
                    <Button onClick={handleStartTracking} className="mt-4">
                      Start Tracking
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Delivery Progress</span>
                    <span className="text-sm font-medium">{currentProgress}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-2" />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {isCurrentlyTracked ? 'In Transit' : 'Tracking Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Distance Covered:</span>
                    <span className="text-sm font-medium">
                      {currentTrackingInfo?.distanceCovered.toFixed(2) || '0'} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Speed:</span>
                    <span className="text-sm font-medium">
                      {currentTrackingInfo?.currentSpeed.toFixed(1) || '0'} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Time:</span>
                    <span className="text-sm font-medium">
                      {currentTrackingInfo?.currentSpeed > 0 
                        ? Math.round((estimatedDistance - (currentTrackingInfo?.distanceCovered || 0)) / currentTrackingInfo?.currentSpeed) 
                        : '?'} hrs
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    <Truck className="inline-block mr-1 h-4 w-4" /> Truck Details
                  </h3>
                  <p className="text-sm">{truck.plateNumber}</p>
                  <p className="text-sm">{truck.model}</p>
                  <p className="text-sm">Capacity: {truck.capacity} liters</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    <Fuel className="inline-block mr-1 h-4 w-4" /> Fuel Level
                  </h3>
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${currentTrackingInfo?.fuelLevel || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1">{currentTrackingInfo?.fuelLevel || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="text-sm font-medium">{driver.name}</h3>
                <p className="text-sm">{driver.licenseNumber}</p>
                <p className="text-sm">{driver.contact || 'No contact information'}</p>
                
                {isCurrentlyTracked && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={handleStopTracking}
                  >
                    Stop Tracking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GPSTrackingPage;
