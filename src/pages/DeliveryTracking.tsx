
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Truck, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  LocateFixed
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PurchaseOrder, DeliveryDetails } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const DeliveryTracking: React.FC = () => {
  const { 
    purchaseOrders, 
    getOrdersWithDeliveryStatus,
    getDriverById,
    getTruckById,
    startDelivery,
    completeDelivery,
    updateGPSData
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isUpdateGPSDialogOpen, setIsUpdateGPSDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  
  // Get orders by delivery status
  const pendingOrders = getOrdersWithDeliveryStatus('pending');
  const inTransitOrders = getOrdersWithDeliveryStatus('in_transit');
  const deliveredOrders = getOrdersWithDeliveryStatus('delivered').slice(0, 5); // Show latest 5 only
  
  // Simulate real-time GPS updates for trucks in transit
  useEffect(() => {
    if (inTransitOrders.length === 0) return;
    
    const interval = setInterval(() => {
      inTransitOrders.forEach(order => {
        if (order.deliveryDetails?.truckId) {
          // Generate random movement for the truck
          const truck = getTruckById(order.deliveryDetails.truckId);
          
          if (truck && truck.isGPSTagged) {
            // Simulate random movement within Nigeria (approximately)
            const latVariation = (Math.random() - 0.5) * 0.01;
            const lngVariation = (Math.random() - 0.5) * 0.01;
            const randomSpeed = 50 + Math.random() * 30; // 50-80 km/h
            
            // Start from Lagos if no previous GPS data
            const baseLatitude = 6.5244;
            const baseLongitude = 3.3792;
            
            updateGPSData(
              truck.id,
              baseLatitude + latVariation,
              baseLongitude + lngVariation,
              randomSpeed
            );
          }
        }
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [inTransitOrders, getTruckById, updateGPSData]);
  
  const handleViewOrder = (order: PurchaseOrder) => {
    navigate(`/orders/${order.id}`);
  };
  
  const handleSelectOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
  };
  
  const handleStartDelivery = () => {
    if (selectedOrder) {
      startDelivery(selectedOrder.id);
      setIsStartDialogOpen(false);
      setActiveTab('in-transit');
    }
  };
  
  const handleCompleteDelivery = () => {
    if (selectedOrder) {
      completeDelivery(selectedOrder.id);
      setIsCompleteDialogOpen(false);
      setActiveTab('delivered');
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Delivery Tracking</h1>
          <p className="text-muted-foreground">Track and manage all active deliveries</p>
        </div>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingOrders.length > 0 && (
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">{pendingOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="relative">
            In Transit
            {inTransitOrders.length > 0 && (
              <Badge className="ml-2 bg-blue-500 hover:bg-blue-500">{inTransitOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Deliveries</CardTitle>
              <CardDescription>
                Deliveries awaiting transit activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <h3 className="text-lg font-medium">No Pending Deliveries</h3>
                  <p className="text-muted-foreground mt-1">
                    All assigned orders are either in transit or delivered
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.map(order => (
                    <PendingDeliveryCard 
                      key={order.id} 
                      order={order}
                      getDriverById={getDriverById}
                      getTruckById={getTruckById}
                      onStartDelivery={() => {
                        setSelectedOrder(order);
                        setIsStartDialogOpen(true);
                      }}
                      onViewOrder={() => handleViewOrder(order)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in-transit">
          <Card>
            <CardHeader>
              <CardTitle>Deliveries In Transit</CardTitle>
              <CardDescription>
                Active deliveries currently en route
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inTransitOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <h3 className="text-lg font-medium">No Active Deliveries</h3>
                  <p className="text-muted-foreground mt-1">
                    There are no deliveries currently in transit
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inTransitOrders.map(order => (
                    <InTransitDeliveryCard 
                      key={order.id} 
                      order={order}
                      getDriverById={getDriverById}
                      getTruckById={getTruckById}
                      onUpdateGPS={() => {
                        setSelectedOrder(order);
                        setIsUpdateGPSDialogOpen(true);
                      }}
                      onCompleteDelivery={() => {
                        setSelectedOrder(order);
                        setIsCompleteDialogOpen(true);
                      }}
                      onViewOrder={() => handleViewOrder(order)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
              <CardDescription>
                Most recent completed deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliveredOrders.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <h3 className="text-lg font-medium">No Completed Deliveries</h3>
                  <p className="text-muted-foreground mt-1">
                    There are no deliveries that have been completed yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map(order => (
                    <DeliveredOrderCard 
                      key={order.id} 
                      order={order}
                      getDriverById={getDriverById}
                      getTruckById={getTruckById}
                      onViewOrder={() => handleViewOrder(order)}
                    />
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/delivery-log')}
                  >
                    View All Delivery Logs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Start Delivery Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Delivery</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Confirm the departure of truck for Purchase Order #{selectedOrder.poNumber}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && selectedOrder.deliveryDetails && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Purchase Order</Label>
                    <p className="font-medium">#{selectedOrder.poNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer</Label>
                    <p className="font-medium">{selectedOrder.company.name}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Driver</Label>
                    <p className="font-medium">
                      {selectedOrder.deliveryDetails.driverId ? 
                        getDriverById(selectedOrder.deliveryDetails.driverId)?.name : 
                        'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Truck</Label>
                    <p className="font-medium">
                      {selectedOrder.deliveryDetails.truckId ? 
                        getTruckById(selectedOrder.deliveryDetails.truckId)?.plateNumber : 
                        'Not assigned'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-xs text-muted-foreground">Departure Date/Time</Label>
                  <p className="font-medium">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartDelivery}>
              Confirm Departure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Delivery Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Delivery</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Confirm the arrival of truck for Purchase Order #{selectedOrder.poNumber}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && selectedOrder.deliveryDetails && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Purchase Order</Label>
                    <p className="font-medium">#{selectedOrder.poNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer</Label>
                    <p className="font-medium">{selectedOrder.company.name}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Driver</Label>
                    <p className="font-medium">
                      {selectedOrder.deliveryDetails.driverId ? 
                        getDriverById(selectedOrder.deliveryDetails.driverId)?.name : 
                        'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Truck</Label>
                    <p className="font-medium">
                      {selectedOrder.deliveryDetails.truckId ? 
                        getTruckById(selectedOrder.deliveryDetails.truckId)?.plateNumber : 
                        'Not assigned'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Departure Time</Label>
                    <p className="font-medium">
                      {selectedOrder.deliveryDetails.depotDepartureTime ? 
                        format(selectedOrder.deliveryDetails.depotDepartureTime, 'MMM dd, HH:mm') : 
                        'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Arrival Time</Label>
                    <p className="font-medium">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-amber-50 rounded-md">
                <p className="text-sm text-amber-800 flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>After completing delivery, you'll need to record offloading details in the Delivery Log.</span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteDelivery}>
              Confirm Arrival & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update GPS Dialog */}
      <UpdateGPSDialog 
        isOpen={isUpdateGPSDialogOpen}
        setIsOpen={setIsUpdateGPSDialogOpen}
        order={selectedOrder}
        getTruckById={getTruckById}
        updateGPSData={updateGPSData}
      />
    </div>
  );
};

// GPS Update Form Schema
const gpsUpdateFormSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  speed: z.coerce.number().min(0).max(150, "Speed must be between 0 and 150 km/h"),
});

// Update GPS Dialog Component
const UpdateGPSDialog = ({ 
  isOpen, 
  setIsOpen, 
  order,
  getTruckById,
  updateGPSData
}: { 
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  order: PurchaseOrder | null;
  getTruckById: (id: string) => any;
  updateGPSData: (truckId: string, latitude: number, longitude: number, speed: number) => void;
}) => {
  const form = useForm<z.infer<typeof gpsUpdateFormSchema>>({
    resolver: zodResolver(gpsUpdateFormSchema),
    defaultValues: {
      latitude: 6.5244, // Default to Lagos, Nigeria
      longitude: 3.3792,
      speed: 60,
    },
  });
  
  const onSubmit = (values: z.infer<typeof gpsUpdateFormSchema>) => {
    if (order && order.deliveryDetails?.truckId) {
      updateGPSData(
        order.deliveryDetails.truckId,
        values.latitude,
        values.longitude,
        values.speed
      );
      
      toast({
        title: "GPS Location Updated",
        description: "The truck's GPS location has been successfully updated.",
      });
      
      setIsOpen(false);
    }
  };
  
  // Get truck details
  const truck = order?.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LocateFixed className="h-5 w-5 text-primary" />
            Update GPS Location
          </DialogTitle>
          <DialogDescription>
            {truck 
              ? `Update the GPS location data for truck ${truck.plateNumber}`
              : 'Update the GPS location data for this truck'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="speed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Speed (km/h)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the current speed of the truck
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                Update GPS Data
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p>In a production environment, GPS data would be automatically updated from the truck's GPS device.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Pending Delivery Card Component
const PendingDeliveryCard = ({ 
  order, 
  getDriverById, 
  getTruckById,
  onStartDelivery,
  onViewOrder
}: { 
  order: PurchaseOrder; 
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
  onStartDelivery: () => void;
  onViewOrder: () => void;
}) => {
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
  
  const hasGPSTag = truck?.hasGPS && truck?.isGPSTagged;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">PO #{order.poNumber}</CardTitle>
            <CardDescription className="line-clamp-1">{order.company.name}</CardDescription>
          </div>
          <Badge className="bg-amber-500 hover:bg-amber-500">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-0">
        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{truck ? truck.plateNumber : 'No truck assigned'}</p>
              {truck && (
                <p className="text-xs text-muted-foreground">
                  {truck.model} • {truck.capacity.toLocaleString()} L
                  {hasGPSTag ? ' • GPS Active' : truck.hasGPS ? ' • GPS Ready' : ' • No GPS'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{driver ? driver.name : 'No driver assigned'}</p>
              {driver && (
                <p className="text-xs text-muted-foreground">{driver.contact}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Expected Delivery:</p>
              <p className="font-medium">
                {format(order.deliveryDate, 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col">
        <div className="w-full flex justify-between items-center mb-2">
          <Button variant="link" className="p-0 h-auto" onClick={onViewOrder}>
            View Details
          </Button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={onStartDelivery}
                  disabled={!hasGPSTag && truck?.hasGPS}
                  size="sm"
                >
                  Start Delivery
                </Button>
              </div>
            </TooltipTrigger>
            {!hasGPSTag && truck?.hasGPS && (
              <TooltipContent>
                <p>GPS tagging required before starting delivery</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        
        {!hasGPSTag && truck?.hasGPS && (
          <div className="w-full text-xs p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <span>GPS tagging required before transit</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

// In Transit Delivery Card Component
const InTransitDeliveryCard = ({ 
  order, 
  getDriverById, 
  getTruckById,
  onUpdateGPS,
  onCompleteDelivery,
  onViewOrder
}: { 
  order: PurchaseOrder; 
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
  onUpdateGPS: () => void;
  onCompleteDelivery: () => void;
  onViewOrder: () => void;
}) => {
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
  
  // Calculate progress
  const distanceCovered = order.deliveryDetails?.distanceCovered || 0;
  const totalDistance = order.deliveryDetails?.totalDistance || 100;
  const progress = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
  
  return (
    <Card className={cn("overflow-hidden border-l-4 border-l-blue-500")}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">PO #{order.poNumber}</CardTitle>
            <CardDescription className="line-clamp-1">{order.company.name}</CardDescription>
          </div>
          <Badge className="bg-blue-500 hover:bg-blue-500">In Transit</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-0">
        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{truck ? truck.plateNumber : 'No truck assigned'}</p>
              {truck && (
                <p className="text-xs text-muted-foreground">
                  {truck.model} • {truck.capacity.toLocaleString()} L
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{driver ? driver.name : 'No driver assigned'}</p>
              {driver && (
                <p className="text-xs text-muted-foreground">{driver.contact}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Expected Arrival:</p>
              <p className="font-medium">
                {order.deliveryDetails?.expectedArrivalTime 
                  ? format(order.deliveryDetails.expectedArrivalTime, 'MMM dd, HH:mm')
                  : 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewOrder}>
            Details
          </Button>
          
          <Button variant="outline" size="sm" onClick={onUpdateGPS}>
            <LocateFixed className="h-4 w-4 mr-1" />
            Update GPS
          </Button>
        </div>
        
        <Button onClick={onCompleteDelivery} size="sm">
          Complete
        </Button>
      </CardFooter>
    </Card>
  );
};

// Delivered Order Card Component
const DeliveredOrderCard = ({ 
  order, 
  getDriverById, 
  getTruckById,
  onViewOrder
}: { 
  order: PurchaseOrder; 
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
  onViewOrder: () => void;
}) => {
  const driver = order.deliveryDetails?.driverId 
    ? getDriverById(order.deliveryDetails.driverId)
    : null;
    
  const truck = order.deliveryDetails?.truckId 
    ? getTruckById(order.deliveryDetails.truckId)
    : null;
  
  // Calculate delivery time
  const departureTime = order.deliveryDetails?.depotDepartureTime;
  const arrivalTime = order.deliveryDetails?.destinationArrivalTime;
  
  let deliveryTime = "Unknown";
  if (departureTime && arrivalTime) {
    const diffMs = arrivalTime.getTime() - departureTime.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    deliveryTime = `${diffHrs}h ${diffMins}m`;
  }
  
  // Check for discrepancy
  const hasDiscrepancy = order.offloadingDetails?.isDiscrepancyFlagged;
  
  return (
    <Card className={cn(
      "relative overflow-hidden", 
      hasDiscrepancy ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium">PO #{order.poNumber}</h3>
            <p className="text-sm text-muted-foreground">{order.company.name}</p>
          </div>
          <div className="flex items-center">
            <Badge className="bg-green-500 hover:bg-green-500 mr-2">Delivered</Badge>
            {hasDiscrepancy && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Flagged
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Driver</p>
            <p>{driver ? driver.name : 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Truck</p>
            <p>{truck ? truck.plateNumber : 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery Time</p>
            <p>{deliveryTime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivered On</p>
            <p>
              {order.deliveryDetails?.destinationArrivalTime 
                ? format(order.deliveryDetails.destinationArrivalTime, 'MMM dd, yyyy')
                : 'Unknown'
              }
            </p>
          </div>
        </div>
        
        {order.offloadingDetails && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Volume Delivered</span>
              <span className="font-medium">
                {order.offloadingDetails.deliveredVolume.toLocaleString()} / {order.offloadingDetails.loadedVolume.toLocaleString()} L
              </span>
            </div>
            
            {hasDiscrepancy && (
              <div className="mt-2 text-xs flex items-center text-red-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>
                  {order.offloadingDetails.discrepancyPercentage.toFixed(1)}% discrepancy detected
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="link" className="h-auto p-0" onClick={onViewOrder}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTracking;
