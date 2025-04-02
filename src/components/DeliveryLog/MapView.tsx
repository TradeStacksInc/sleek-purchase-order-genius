
import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PurchaseOrder } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, ArrowLeft, RefreshCw, AlertTriangle, Navigation, CloudRain, Sun, Cloud } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { format } from 'date-fns';

// Mock weather data - in a real app, this would come from an API
const WEATHER_DATA = {
  'Lagos': { icon: Sun, temp: '32°C', condition: 'Sunny' },
  'One': { icon: Cloud, temp: '28°C', condition: 'Partly Cloudy' },
  'Beim': { icon: CloudRain, temp: '24°C', condition: 'Light Rain' },
  'Abakaliki': { icon: Sun, temp: '30°C', condition: 'Clear' }
};

// Mock traffic data - in a real app, this would come from an API
const TRAFFIC_DATA = {
  'Lagos': { status: 'heavy', color: 'bg-red-500' },
  'One': { status: 'moderate', color: 'bg-yellow-500' },
  'Beim': { status: 'light', color: 'bg-green-500' },
  'Abakaliki': { status: 'moderate', color: 'bg-yellow-500' }
};

// Route waypoints for demonstration
const ROUTE_WAYPOINTS = ['Lagos', 'One', 'Beim', 'Abakaliki'];

interface MapViewProps {
  onBack: () => void;
}

const MapView: React.FC<MapViewProps> = ({ onBack }) => {
  const { purchaseOrders, getOrdersWithDeliveryStatus } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter deliveries based on active tab
  const filteredDeliveries = useMemo(() => {
    if (activeTab === 'all') {
      return purchaseOrders.filter(order => order.deliveryDetails);
    } else if (activeTab === 'in-transit') {
      return getOrdersWithDeliveryStatus('in_transit');
    } else if (activeTab === 'delivered') {
      return getOrdersWithDeliveryStatus('delivered');
    } else if (activeTab === 'pending') {
      return getOrdersWithDeliveryStatus('pending');
    }
    return [];
  }, [purchaseOrders, activeTab, getOrdersWithDeliveryStatus]);

  // Select the first delivery by default
  useEffect(() => {
    if (filteredDeliveries.length > 0 && !selectedOrder) {
      setSelectedOrder(filteredDeliveries[0]);
    } else if (filteredDeliveries.length === 0) {
      setSelectedOrder(null);
    }
  }, [filteredDeliveries, selectedOrder]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Calculate progress for selected order
  const calculateProgress = (order: PurchaseOrder | null) => {
    if (!order || !order.deliveryDetails) return 0;
    
    const { distanceCovered, totalDistance, status } = order.deliveryDetails;
    
    if (status === 'delivered') return 100;
    if (status === 'pending') return 0;
    
    return Math.round((distanceCovered || 0) / (totalDistance || 100) * 100);
  };

  // Get current location based on progress
  const getCurrentLocation = (progress: number) => {
    if (progress <= 0) return ROUTE_WAYPOINTS[0];
    if (progress >= 100) return ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
    
    const waypoint = Math.floor((progress / 100) * (ROUTE_WAYPOINTS.length - 1));
    return ROUTE_WAYPOINTS[waypoint];
  };

  const progress = calculateProgress(selectedOrder);
  const currentLocation = getCurrentLocation(progress);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Delivery Log</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left sidebar - Delivery list */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Deliveries</CardTitle>
              <CardDescription>Select a delivery to view its route</CardDescription>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[70vh]">
              {filteredDeliveries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Truck className="h-10 w-10 mb-2 opacity-20" />
                  <p>No deliveries found</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredDeliveries.map((order) => (
                    <li 
                      key={order.id} 
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{order.poNumber}</p>
                          <p className="text-sm opacity-80">{order.supplier.name}</p>
                        </div>
                        <DeliveryStatusBadge status={order.deliveryDetails?.status || 'pending'} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Map and details */}
        <div className="md:col-span-2">
          {selectedOrder ? (
            <>
              {/* Delivery Details Card */}
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedOrder.poNumber}</CardTitle>
                      <CardDescription>
                        {selectedOrder.supplier.name} - {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <DeliveryStatusBadge status={selectedOrder.deliveryDetails?.status || 'pending'} />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Driver</p>
                      <p className="font-medium">{selectedOrder.deliveryDetails?.driverName || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{selectedOrder.deliveryDetails?.vehicleDetails || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departure</p>
                      <p className="font-medium">
                        {selectedOrder.deliveryDetails?.depotDepartureTime 
                          ? format(new Date(selectedOrder.deliveryDetails.depotDepartureTime), 'MMM dd, HH:mm')
                          : 'Not departed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Arrival</p>
                      <p className="font-medium">
                        {selectedOrder.deliveryDetails?.expectedArrivalTime
                          ? format(new Date(selectedOrder.deliveryDetails.expectedArrivalTime), 'MMM dd, HH:mm')
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Route Map Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Route Tracking
                  </CardTitle>
                  <CardDescription>
                    {selectedOrder.deliveryDetails?.status === 'in_transit' 
                      ? `Currently near ${currentLocation}` 
                      : selectedOrder.deliveryDetails?.status === 'delivered'
                        ? 'Delivery completed'
                        : 'Waiting to depart'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full mb-6 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-0 h-5 w-5 bg-primary rounded-full -mt-1.5 border-2 border-white transition-all duration-500"
                      style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                    />
                  </div>
                  
                  {/* Route waypoints visualization */}
                  <div className="flex items-center justify-between mt-8 relative">
                    {/* Line connecting all points */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
                    
                    {/* Progress line */}
                    <div 
                      className="absolute top-4 left-4 h-0.5 bg-primary z-10 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                    
                    {/* Waypoints */}
                    {ROUTE_WAYPOINTS.map((waypoint, index) => {
                      const Weather = WEATHER_DATA[waypoint]?.icon || Sun;
                      const waypointProgress = (index / (ROUTE_WAYPOINTS.length - 1)) * 100;
                      const isPassed = progress >= waypointProgress;
                      const isCurrent = currentLocation === waypoint;
                      
                      return (
                        <div key={waypoint} className="flex flex-col items-center z-20 relative">
                          {/* Weather icon */}
                          <Weather className={`h-4 w-4 mb-1 ${isPassed ? 'text-primary' : 'text-gray-400'}`} />
                          
                          {/* Traffic indicator */}
                          <div className={`w-2 h-2 rounded-full mb-1 ${TRAFFIC_DATA[waypoint]?.color || 'bg-gray-300'}`} />
                          
                          {/* Location point */}
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                              ${isCurrent 
                                ? 'bg-primary text-primary-foreground border-primary animate-pulse' 
                                : isPassed 
                                  ? 'bg-primary/20 border-primary/40' 
                                  : 'bg-gray-100 border-gray-300'
                              }`}
                          >
                            <MapPin className="h-4 w-4" />
                          </div>
                          
                          {/* Waypoint name */}
                          <p className={`text-xs mt-1 font-medium ${isPassed ? 'text-primary' : 'text-gray-500'}`}>
                            {waypoint}
                          </p>
                          
                          {/* Weather details */}
                          <p className="text-xs text-muted-foreground">
                            {WEATHER_DATA[waypoint]?.temp}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Delivery progress details */}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-medium">{progress}% Complete</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance Covered</p>
                      <p className="font-medium">
                        {selectedOrder.deliveryDetails?.distanceCovered || 0} / {selectedOrder.deliveryDetails?.totalDistance || 100} km
                      </p>
                    </div>
                  </div>
                  
                  {/* Incidents section */}
                  {selectedOrder.incidents && selectedOrder.incidents.length > 0 ? (
                    <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
                      <h4 className="text-sm font-medium text-red-800 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Reported Incidents
                      </h4>
                      <ul className="mt-2 text-sm text-red-700">
                        {selectedOrder.incidents.map((incident, index) => (
                          <li key={index} className="flex items-baseline gap-2">
                            <span className="text-xs">•</span>
                            <span>{incident.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    selectedOrder.deliveryDetails?.status !== 'pending' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                        <p className="text-sm text-green-700 flex items-center gap-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Safe
                          </Badge>
                          No incidents reported for this delivery
                        </p>
                      </div>
                    )
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm:ss')}
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-10 text-center">
                <Truck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No Delivery Selected</h3>
                <p className="text-muted-foreground mt-1">
                  Please select a delivery from the list to view its route
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
