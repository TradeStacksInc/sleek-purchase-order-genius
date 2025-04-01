
import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Truck, ArrowRight } from 'lucide-react';
import { PurchaseOrder } from '@/types';

interface DriverSituationCardProps {
  order: PurchaseOrder;
  driver: any;
  truck: any;
}

const DriverSituationCard: React.FC<DriverSituationCardProps> = ({ order, driver, truck }) => {
  if (!order.deliveryDetails) return null;
  
  // Calculate progress
  const totalDistance = order.deliveryDetails.totalDistance || 100;
  const distanceCovered = order.deliveryDetails.distanceCovered || 0;
  const progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
  
  // Format expected arrival time
  const eta = order.deliveryDetails.expectedArrivalTime 
    ? format(new Date(order.deliveryDetails.expectedArrivalTime), 'h:mm a, MMM d')
    : 'Calculating...';
  
  return (
    <Card key={order.id} className="overflow-hidden border border-muted">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium">{driver.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Truck className="h-3 w-3" />
          <span>{truck.plateNumber} • PO #{order.poNumber}</span>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs">Progress</span>
            <span className="text-xs font-semibold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{distanceCovered.toFixed(1)} km</span>
            <span>{totalDistance.toFixed(1)} km</span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <div className="text-xs text-muted-foreground">ETA</div>
            <div className="text-sm font-medium">{eta}</div>
          </div>
          <Button size="sm" variant="ghost" className="text-xs" asChild>
            <Link to="/gps-tracking">
              Track
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-muted h-3 w-full relative overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-400 to-primary animate-pulse"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </Card>
  );
};

export default DriverSituationCard;
