
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PurchaseOrder, Driver, Truck } from '@/types';
import { Clock, MapPin, Navigation, PhoneCall, Truck as TruckIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTruckTracking } from '@/hooks/useTruckTracking';

interface DriverSituationCardProps {
  order: PurchaseOrder;
  driver: Driver;
  truck: Truck;
  isTracked?: boolean;
}

const DriverSituationCard: React.FC<DriverSituationCardProps> = ({ 
  order, 
  driver, 
  truck,
  isTracked = false
}) => {
  const { getTrackingInfo } = useTruckTracking();
  const trackingInfo = getTrackingInfo(truck.id);
  
  // Get delivery details
  const { deliveryDetails } = order;
  if (!deliveryDetails) return null;
  
  // Calculate progress
  const totalDistance = deliveryDetails.totalDistance || 100;
  const distanceCovered = trackingInfo?.distanceCovered || deliveryDetails.distanceCovered || 0;
  const progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
  
  // Calculate ETA
  const eta = deliveryDetails.expectedArrivalTime 
    ? format(new Date(deliveryDetails.expectedArrivalTime), 'h:mm a')
    : 'Calculating...';
  
  // Get current speed
  const currentSpeed = trackingInfo?.currentSpeed || truck.lastSpeed || 0;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium">PO #{order.poNumber}</h3>
            <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
          </div>
          <Badge 
            className={
              isTracked 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-800"
            }
          >
            {isTracked ? "GPS Active" : "GPS Inactive"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
          <div className="flex items-center text-sm">
            <TruckIcon className="h-3 w-3 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">{truck.plateNumber}</span>
          </div>
          <div className="flex items-center text-sm">
            <PhoneCall className="h-3 w-3 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">{driver.contact}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">{distanceCovered.toFixed(1)} of {totalDistance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">ETA: {eta}</span>
          </div>
        </div>
        
        {isTracked && currentSpeed > 0 && (
          <div className="mb-3 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-sm flex items-center">
            <Navigation className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-blue-700">
              Current Speed: <span className="font-medium">{currentSpeed.toFixed(1)} km/h</span>
            </span>
          </div>
        )}
        
        <div className="mb-1 flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs" 
            asChild
          >
            <a href={`/delivery-log/map?id=${order.id}`}>
              View on Map
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverSituationCard;
