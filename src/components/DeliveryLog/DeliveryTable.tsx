import React, { useState } from 'react';
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
import { useApp } from '@/context/AppContext';
import { Truck, MapPin, Clock, Info, AlertTriangle, ChevronRight, Clipboard, Thermometer, Cloud, Wind, Star, Route, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DeliveryTableProps {
  deliveries: PurchaseOrder[];
}

interface RouteLocation {
  name: string;
  passed: boolean;
  distance: string;
  weather?: string;
  temperature?: string;
  traffic?: string;
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  const { getDriverById, getTruckById, completeDelivery } = useApp();
  const { toast } = useToast();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const calculateDeliveryTime = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "N/A";
    return distance > 1000 
      ? `${(distance / 1000).toFixed(1)} km` 
      : `${Math.round(distance)} m`;
  };
  
  const getRouteLocations = (start: string, end: string, progress: number): RouteLocation[] => {
    if (start === "Lagos" && end === "Abakaliki") {
      return [
        { 
          name: "Lagos (Depot)", 
          passed: true, 
          distance: "0 km",
          weather: "Partly Cloudy",
          temperature: "31°C",
          traffic: "Heavy"
        },
        { 
          name: "Ore", 
          passed: progress > 15, 
          distance: "180 km",
          weather: "Sunny",
          temperature: "33°C",
          traffic: "Moderate"
        },
        { 
          name: "Benin", 
          passed: progress > 30, 
          distance: "120 km",
          weather: "Clear",
          temperature: "32°C",
          traffic: "Light"
        },
        { 
          name: "Asaba", 
          passed: progress > 45, 
          distance: "85 km",
          weather: "Partly Cloudy",
          temperature: "30°C",
          traffic: "Light"
        },
        { 
          name: "Onitsha", 
          passed: progress > 60, 
          distance: "20 km",
          weather: "Light Rain",
          temperature: "28°C",
          traffic: "Moderate"
        },
        { 
          name: "Enugu", 
          passed: progress > 75, 
          distance: "100 km",
          weather: "Sunny",
          temperature: "29°C",
          traffic: "Light"
        },
        { 
          name: "Abakaliki", 
          passed: progress >= 100, 
          distance: "60 km",
          weather: "Clear",
          temperature: "30°C",
          traffic: "Light"
        }
      ];
    }
    
    return [
      { name: "Depot", passed: true, distance: "0 km", weather: "Clear", temperature: "29°C", traffic: "Moderate" },
      { name: "Checkpoint 1", passed: progress > 20, distance: "45 km", weather: "Sunny", temperature: "30°C", traffic: "Light" },
      { name: "Midpoint", passed: progress > 50, distance: "120 km", weather: "Partly Cloudy", temperature: "28°C", traffic: "Moderate" },
      { name: "Checkpoint 2", passed: progress > 75, distance: "85 km", weather: "Cloudy", temperature: "27°C", traffic: "Heavy" },
      { name: "Destination", passed: progress >= 100, distance: "30 km", weather: "Clear", temperature: "29°C", traffic: "Light" }
    ];
  };
  
  const getTrafficIcon = (traffic: string) => {
    switch(traffic) {
      case "Heavy":
        return <Badge variant="destructive" className="text-xs">Heavy Traffic</Badge>;
      case "Moderate":
        return <Badge variant="secondary" className="text-xs">Moderate Traffic</Badge>;
      default:
        return <Badge variant="outline" className="text-xs bg-green-50">Clear Roads</Badge>;
    }
  };
  
  const getWeatherIcon = (weather: string) => {
    switch(weather) {
      case "Rain":
      case "Light Rain":
        return <Cloud className="h-4 w-4 text-blue-500" />;
      case "Storm":
        return <Wind className="h-4 w-4 text-purple-500" />;
      case "Cloudy":
      case "Partly Cloudy":
        return <Cloud className="h-4 w-4 text-gray-500" />;
      default:
        return <Thermometer className="h-4 w-4 text-amber-500" />;
    }
  };

  const getSafetyRating = (order: PurchaseOrder): number => {
    let rating = 4.5; // Default good rating
    
    if (order.incidents && order.incidents.length > 0) {
      rating -= order.incidents.length * 0.5;
    }
    
    if (order.offloadingDetails?.discrepancyPercentage) {
      rating -= order.offloadingDetails.discrepancyPercentage > 3 ? 1 : 0.5;
    }
    
    return Math.max(1, Math.min(5, rating));
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star className="h-4 w-4 text-gray-300" />
                <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} className="h-4 w-4 text-gray-300" />;
          }
        })}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleTruckManagement = () => {
    toast({
      title: "Truck Management",
      description: "Redirecting to truck management dashboard...",
    });
  };

  const handleViewDetails = (order: PurchaseOrder) => {
    setExpandedCardId(expandedCardId === order.id ? null : order.id);
  };

  const handleCompleteDelivery = (orderId: string) => {
    completeDelivery(orderId);
    toast({
      title: "Delivery Completed",
      description: "The delivery has been marked as complete. You can now offload the product to tanks.",
    });
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
    <div className="space-y-6">
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
        
        const productType = order.items && order.items.length > 0 
          ? order.items[0].product 
          : "Unknown Product";
          
        const totalVolume = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        const routeStart = "Lagos";
        const routeEnd = "Abakaliki";
        const waypoints = getRouteLocations(routeStart, routeEnd, progressPercentage);
        
        const safetyRating = getSafetyRating(order);
        const isExpanded = expandedCardId === order.id;

        return (
          <Card 
            key={order.id} 
            className={`overflow-hidden transition-all duration-200 hover:shadow-md ${cardColorClass}`}
          >
            <CardHeader className="p-5 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{order.poNumber}</h3>
                      <DeliveryStatusBadge status={delivery.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{order.supplier.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 md:mt-0 md:ml-auto">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Product</span>
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
                
                <div className="flex gap-2 mt-2 md:mt-0 ml-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {isExpanded ? "Hide Details" : "View Details"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{isExpanded ? "Hide details" : "Show more details"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <DetailsDialog order={order}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Info className="h-4 w-4" />
                            <span className="hidden sm:inline">Full Details</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>View detailed information about this delivery</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DetailsDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-white">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-blue-500" />
                      Vehicle & Load Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs text-muted-foreground uppercase">Vehicle Info</h4>
                        <div className="space-y-1 mt-1">
                          <div className="text-sm font-medium">{truck?.model || "Unknown"}</div>
                          <Badge variant="outline" className="mt-1">
                            {truck?.plateNumber || "No plate"}
                          </Badge>
                          {truck?.isGPSTagged && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              GPS Tracked
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs text-muted-foreground uppercase">Load Info</h4>
                        <div className="space-y-2 mt-1">
                          <div className="text-sm">
                            {offloading 
                              ? `${offloading.deliveredVolume.toLocaleString()} / ${offloading.loadedVolume.toLocaleString()} L`
                              : `${totalVolume.toLocaleString()} L planned`
                            }
                          </div>
                          
                          {offloading ? (
                            <>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{width: `${(offloading.deliveredVolume / offloading.loadedVolume) * 100}%`}}
                                ></div>
                              </div>
                              <DiscrepancyBadge discrepancyPercent={discrepancyPercent} />
                            </>
                          ) : (
                            <div className="h-2 w-full bg-gray-200 rounded-full">
                              <div className="h-full bg-blue-500 rounded-full" style={{width: '100%'}}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-xs text-muted-foreground uppercase">Safety Rating</h4>
                      <div className="flex items-center mt-1">
                        {renderStarRating(safetyRating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-amber-500" />
                      Timing & Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Progress:</div>
                        <div className="text-sm font-medium">{progressPercentage}%</div>
                      </div>
                      
                      <Progress 
                        value={progressPercentage} 
                        className="h-2"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Departure:</div>
                          <div className="text-sm">
                            {delivery.depotDepartureTime 
                              ? format(new Date(delivery.depotDepartureTime), 'h:mm a, MMM d')
                              : "Not departed"
                            }
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {delivery.status === 'delivered' ? 'Arrival:' : 'ETA:'}
                          </div>
                          <div className="text-sm">
                            {delivery.status === 'delivered' && delivery.destinationArrivalTime
                              ? format(new Date(delivery.destinationArrivalTime), 'h:mm a, MMM d')
                              : delivery.status === 'in_transit' && delivery.expectedArrivalTime
                                ? eta
                                : "Pending"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Distance:</div>
                          <div className="text-sm">{formatDistance(delivery.totalDistance)}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Covered:</div>
                          <div className="text-sm">{formatDistance(delivery.distanceCovered)}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Est. Total Time:</div>
                          <div className="text-sm">
                            {delivery.destinationArrivalTime && delivery.depotDepartureTime
                              ? calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)
                              : "Calculating..."
                            }
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Remaining:</div>
                          <div className="text-sm">
                            {delivery.status === 'in_transit' 
                              ? delivery.expectedArrivalTime 
                                ? calculateDeliveryTime(new Date(), new Date(delivery.expectedArrivalTime))
                                : "Calculating..."
                              : delivery.status === 'delivered'
                              ? "Completed"
                              : "Not started"
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      Actions & Incidents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {delivery.status === 'in_transit' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-1 border-green-200 hover:bg-green-50 text-green-600"
                            onClick={() => handleCompleteDelivery(order.id)}
                          >
                            <Truck className="h-4 w-4" />
                            <span>Complete Delivery</span>
                          </Button>
                        )}
                        
                        {delivery.status === 'delivered' && !offloading && (
                          <OffloadingDialog orderId={order.id}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-1"
                            >
                              <Clipboard className="h-4 w-4" />
                              <span>Record Offload</span>
                            </Button>
                          </OffloadingDialog>
                        )}
                        
                        <IncidentDialog orderDetails={{ id: order.id, poNumber: order.poNumber || '' }}>
                          <Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-50 hover:text-amber-600 mr-2 h-8 w-8">
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </IncidentDialog>
                        
                        {truck && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-1"
                            onClick={handleTruckManagement}
                          >
                            <Truck className="h-4 w-4" />
                            <span>Manage Truck</span>
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-xs text-muted-foreground uppercase mb-2">Incidents</h4>
                        {order.incidents && order.incidents.length > 0 ? (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {order.incidents.map((incident, idx) => (
                              <div 
                                key={idx} 
                                className={cn(
                                  "p-2 rounded-md border text-sm",
                                  incident.impact === 'positive' ? "bg-green-50 border-green-200" :
                                  incident.impact === 'negative' ? "bg-red-50 border-red-200" :
                                  "bg-gray-50 border-gray-200"
                                )}
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{incident.type}</span>
                                  <span className="text-xs">{format(new Date(incident.timestamp), 'MMM dd, HH:mm')}</span>
                                </div>
                                <p className="text-xs mt-1">{incident.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md">
                            <AlertTriangle className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm text-muted-foreground">No incidents reported</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {isExpanded && (
                <div className="p-5 bg-gray-50 border-t">
                  <div className="mb-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium flex items-center">
                      <Route className="h-4 w-4 mr-2 text-blue-500" />
                      Route Tracking: {routeStart} to {routeEnd}
                    </h3>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <div className="relative mb-8">
                      <div className="relative pt-1 mb-8">
                        <Progress 
                          value={progressPercentage} 
                          className="h-3 rounded-full"
                        />
                        
                        <div 
                          className="absolute top-0 transform -translate-y-1/2"
                          style={{ left: `${Math.min(progressPercentage, 100)}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="relative">
                            <Truck className={`h-6 w-6 text-blue-600 ${delivery.status === 'in_transit' ? 'animate-pulse' : ''}`} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-8">
                        {waypoints.map((waypoint, index) => (
                          <div key={index} className="flex flex-col items-center max-w-[100px]">
                            <div className={`w-3 h-3 rounded-full ${waypoint.passed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-xs mt-1 font-medium text-center">{waypoint.name}</span>
                            <div className="flex items-center mt-1">
                              {getWeatherIcon(waypoint.weather || '')}
                              <span className="text-xs ml-1">{waypoint.temperature}</span>
                            </div>
                            <div className="mt-1">
                              {getTrafficIcon(waypoint.traffic || '')}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">{waypoint.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-8">
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
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DeliveryTable;
