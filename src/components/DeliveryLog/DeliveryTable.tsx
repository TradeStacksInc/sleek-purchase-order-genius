
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PurchaseOrder } from '@/types';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DiscrepancyBadge from './DiscrepancyBadge';
import DetailsDialog from './DetailsDialog';
import OffloadingDialog from './OffloadingDialog';
import IncidentDialog from './IncidentDialog';
import InsightDialog from './InsightDialog';
import { useApp } from '@/context/AppContext';
import { Truck, MapPin, Clock, Info, FileText, Droplet, AlertTriangle, ChevronRight, Clipboard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DeliveryTableProps {
  deliveries: PurchaseOrder[];
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  const { getDriverById, getTruckById } = useApp();

  const calculateDeliveryTime = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // Format distance for display
  const formatDistance = (distance?: number) => {
    if (!distance) return "N/A";
    return distance > 1000 
      ? `${(distance / 1000).toFixed(1)} km` 
      : `${Math.round(distance)} m`;
  };
  
  if (deliveries.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No deliveries found</p>
          <p className="text-muted-foreground/70 text-sm mt-1">Try adjusting your filters or check back later</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {deliveries.map((order) => {
        const delivery = order.deliveryDetails;
        const offloading = order.offloadingDetails;
        
        if (!delivery) return null;
        
        const driver = delivery.driverId ? getDriverById(delivery.driverId) : undefined;
        const truck = delivery.truckId ? getTruckById(delivery.truckId) : undefined;
        
        let discrepancyPercent = 0;
        let cardColorClass = '';
        
        if (offloading) {
          discrepancyPercent = offloading.discrepancyPercentage;
          
          if (discrepancyPercent > 5) {
            cardColorClass = 'border-l-4 border-l-red-500';
          } else if (discrepancyPercent > 0) {
            cardColorClass = 'border-l-4 border-l-yellow-500';
          } else if (delivery.status === 'delivered') {
            cardColorClass = 'border-l-4 border-l-green-500';
          }
        } else if (delivery.status === 'in_transit') {
          cardColorClass = 'border-l-4 border-l-blue-500';
        } else if (delivery.status === 'pending') {
          cardColorClass = 'border-l-4 border-l-gray-400';
        }
        
        // Calculate progress percentage for in-transit deliveries
        let progressPercentage = 0;
        let eta = "";
        
        if (delivery.status === 'in_transit') {
          const totalDistance = delivery.totalDistance || 100;
          const distanceCovered = delivery.distanceCovered || 0;
          progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
          
          if (delivery.expectedArrivalTime) {
            eta = format(new Date(delivery.expectedArrivalTime), 'h:mm a, MMM d');
          }
        } else if (delivery.status === 'delivered') {
          progressPercentage = 100;
        }
        
        // Get product type from the order items (first item for simplicity)
        const productType = order.items && order.items.length > 0 
          ? order.items[0].product 
          : "Unknown Product";
          
        // Calculate total volume from order items
        const totalVolume = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        // Store waypoints for the journey based on vehicle location
        const waypoints = [
          { name: "Depot", passed: true, distance: "0 km" },
          { name: "Checkpoint 1", passed: progressPercentage > 20, distance: "45 km" },
          { name: "Midpoint", passed: progressPercentage > 50, distance: "120 km" },
          { name: "Checkpoint 2", passed: progressPercentage > 75, distance: "85 km" },
          { name: "Destination", passed: progressPercentage >= 100, distance: "30 km" }
        ];

        return (
          <Card key={order.id} className={`overflow-hidden transition-all duration-200 hover:shadow-md ${cardColorClass}`}>
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{order.poNumber}</h3>
                      <DeliveryStatusBadge status={delivery.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 md:mt-0 md:ml-auto">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Product Type</span>
                    <span className="text-sm font-medium">{productType}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Volume</span>
                    <span className="text-sm font-medium">{totalVolume.toLocaleString()} L</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Driver</span>
                    <span className="text-sm font-medium">{driver?.name || "Unassigned"}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap gap-2 mt-2 md:mt-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DetailsDialog order={order}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Info className="h-4 w-4" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                        </DetailsDialog>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>View detailed information about this delivery</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {delivery.status === 'delivered' && !offloading && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <OffloadingDialog orderId={order.id}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Clipboard className="h-4 w-4" />
                              <span className="hidden sm:inline">Offload</span>
                            </Button>
                          </OffloadingDialog>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Record offloading details for this delivery</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IncidentDialog orderId={order.id}>
                          <Button variant="destructive" size="sm" className="gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="hidden sm:inline">Report Incident</span>
                          </Button>
                        </IncidentDialog>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Report an incident for this delivery</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InsightDialog orderId={order.id}>
                          <Button variant="default" size="sm" className="gap-1">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Generate Insight</span>
                          </Button>
                        </InsightDialog>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Generate delivery insights and analysis</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Volume and Offloading Section */}
              <div className="p-5 md:p-6 border-b">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Vehicle Information */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Vehicle Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{truck?.model || "Unknown model"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {truck?.plateNumber || "No plate"}
                        </Badge>
                        {truck?.isGPSTagged && (
                          <Badge variant="secondary" className="text-xs">GPS Enabled</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Load Information */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Load Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          {offloading 
                            ? `${offloading.deliveredVolume.toLocaleString()} / ${offloading.loadedVolume.toLocaleString()} L`
                            : `${totalVolume.toLocaleString()} L planned`
                          }
                        </span>
                      </div>
                      {offloading && (
                        <div className="flex items-center gap-2">
                          <DiscrepancyBadge discrepancyPercent={discrepancyPercent} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Timing Information */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Timing Information</h4>
                    <div className="space-y-2">
                      {delivery.depotDepartureTime && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50">
                            Departed: {format(new Date(delivery.depotDepartureTime), 'h:mm a, MMM d')}
                          </Badge>
                        </div>
                      )}
                      {delivery.status === 'in_transit' && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-yellow-50">
                            ETA: {eta || "Calculating..."}
                          </Badge>
                        </div>
                      )}
                      {delivery.destinationArrivalTime && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50">
                            Arrived: {format(new Date(delivery.destinationArrivalTime), 'h:mm a, MMM d')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Incidents */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Incidents</h4>
                    {order.incidents && order.incidents.length > 0 ? (
                      <div className="space-y-2">
                        {order.incidents.map((incident, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge 
                              variant={incident.impact === 'negative' ? "destructive" : 
                                      incident.impact === 'positive' ? "outline" : "secondary"}
                              className={incident.impact === 'positive' ? "bg-green-50" : ""}
                            >
                              {incident.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No incidents reported</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Route Tracking Section */}
              <div className="p-5 md:p-6">
                <h4 className="text-sm font-semibold mb-4">Delivery Route</h4>
                
                <div className="relative pt-1 mb-8">
                  {/* Route Progress Bar */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Depot</span>
                    <span className="text-xs font-medium">Destination</span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={progressPercentage} 
                      className="h-3 rounded-full"
                      style={{ 
                        background: delivery.status === 'delivered' ? 'linear-gradient(to right, #10B981, #10B981)' : 'linear-gradient(to right, #3B82F6, #E5E7EB)' 
                      }}
                    />
                    
                    {/* Truck position indicator */}
                    <div 
                      className="absolute top-0 transform -translate-y-1/2"
                      style={{ left: `${Math.min(progressPercentage, 100)}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="relative">
                        <Truck className={`h-6 w-6 text-blue-600 ${delivery.status === 'in_transit' ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Waypoints indicators */}
                  <div className="flex justify-between mt-2">
                    {waypoints.map((waypoint, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${waypoint.passed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-xs mt-1 font-medium">{waypoint.name}</span>
                        <span className="text-xs text-muted-foreground">{waypoint.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Journey stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-medium text-muted-foreground">Total Distance</div>
                    <div className="text-lg font-bold mt-1">{formatDistance(delivery.totalDistance)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-medium text-muted-foreground">Distance Covered</div>
                    <div className="text-lg font-bold mt-1">{formatDistance(delivery.distanceCovered)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-medium text-muted-foreground">Est. Total Time</div>
                    <div className="text-lg font-bold mt-1">
                      {delivery.destinationArrivalTime && delivery.depotDepartureTime
                        ? calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)
                        : "Calculating..."}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-medium text-muted-foreground">Time Remaining</div>
                    <div className="text-lg font-bold mt-1">
                      {delivery.status === 'in_transit' 
                        ? delivery.expectedArrivalTime 
                          ? calculateDeliveryTime(new Date(), new Date(delivery.expectedArrivalTime))
                          : "Calculating..."
                        : delivery.status === 'delivered'
                        ? "Completed"
                        : "Not started"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DeliveryTable;
