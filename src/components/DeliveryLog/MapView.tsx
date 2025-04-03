
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, MapPin, Truck, Navigation, Clock, User, AlertTriangle, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Driver, GPSData, PurchaseOrder, Truck as TruckType } from '@/types';
import { format } from 'date-fns';
import GPSTrackingService from '@/services/GPSTrackingService';

interface MapViewProps {
  onBack: () => void;
}

const MapView: React.FC<MapViewProps> = ({ onBack }) => {
  const { purchaseOrders, gpsData, getDriverById, getTruckById } = useApp();
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());
  
  // Set up interval for UI updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateTimestamp(Date.now());
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter only active or delivered orders with delivery details
  const activeDeliveries = useMemo(() => {
    return purchaseOrders.filter(order => 
      order.deliveryDetails && 
      (order.deliveryDetails.status === 'in_transit' || order.deliveryDetails.status === 'delivered')
    );
  }, [purchaseOrders]);

  // Get selected delivery details
  const selectedDeliveryDetails = useMemo(() => {
    if (!selectedDelivery) return null;
    return activeDeliveries.find(order => order.id === selectedDelivery);
  }, [selectedDelivery, activeDeliveries]);

  // Get GPS data for the selected delivery
  const deliveryGpsData = useMemo(() => {
    if (!selectedDeliveryDetails?.deliveryDetails?.truckId) return [];
    
    return gpsData
      .filter(gps => gps.truckId === selectedDeliveryDetails.deliveryDetails?.truckId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedDeliveryDetails, gpsData]);

  // Get the latest GPS position
  const latestPosition = useMemo(() => {
    return deliveryGpsData[0] || null;
  }, [deliveryGpsData]);

  // Get path history from GPS tracking service
  const pathHistory = useMemo(() => {
    if (!selectedDeliveryDetails?.deliveryDetails?.truckId) return [];
    
    const gpsService = GPSTrackingService.getInstance();
    return gpsService.getPathHistory(selectedDeliveryDetails.deliveryDetails.truckId);
  }, [selectedDeliveryDetails, updateTimestamp]);

  // If no delivery is selected, select the first one
  useEffect(() => {
    if (activeDeliveries.length > 0 && !selectedDelivery) {
      setSelectedDelivery(activeDeliveries[0].id);
    }
  }, [activeDeliveries, selectedDelivery]);

  // Prepare driver and truck information
  const driverInfo = useMemo(() => {
    if (!selectedDeliveryDetails?.deliveryDetails?.driverId) return null;
    return getDriverById(selectedDeliveryDetails.deliveryDetails.driverId);
  }, [selectedDeliveryDetails, getDriverById]);

  const truckInfo = useMemo(() => {
    if (!selectedDeliveryDetails?.deliveryDetails?.truckId) return null;
    return getTruckById(selectedDeliveryDetails.deliveryDetails.truckId);
  }, [selectedDeliveryDetails, getTruckById]);

  // Helper function to calculate the progress percentage
  const calculateProgress = (order: PurchaseOrder) => {
    if (!order.deliveryDetails) return 0;
    
    if (order.deliveryDetails.status === 'delivered') return 100;
    
    // Get most up-to-date distance from GPS tracking service if possible
    const gpsService = GPSTrackingService.getInstance();
    const trackingInfo = gpsService.getTrackingInfo(order.deliveryDetails.truckId || '');
    
    const distanceCovered = trackingInfo?.distanceCovered || order.deliveryDetails.distanceCovered || 0;
    const totalDistance = order.deliveryDetails.totalDistance || 100;
    
    return Math.min(Math.round((distanceCovered / totalDistance) * 100), 99);
  };

  // This would be replaced with an actual map implementation
  const MapSimulation = () => {
    if (!selectedDeliveryDetails) return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No delivery selected</p>
      </div>
    );
    
    // For demonstration, just show a basic visualization
    const progress = calculateProgress(selectedDeliveryDetails);
    
    // Get GPS tracking service for this truck
    const gpsService = GPSTrackingService.getInstance();
    const trackingInfo = gpsService.getTrackingInfo(selectedDeliveryDetails.deliveryDetails?.truckId || '');
    
    // Current location
    const currentLat = latestPosition?.latitude || trackingInfo?.currentLatitude || 0;
    const currentLng = latestPosition?.longitude || trackingInfo?.currentLongitude || 0;
    
    return (
      <div className="relative w-full h-full bg-blue-50 rounded-lg overflow-hidden">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-blue-100/50"></div>
          ))}
        </div>
        
        {/* Origin Point */}
        <div className="absolute top-3/4 left-1/4 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg z-10"></div>
          <p className="text-xs font-medium mt-1 px-2 py-1 bg-white rounded shadow">Origin</p>
        </div>
        
        {/* Destination Point */}
        <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg z-10"></div>
          <p className="text-xs font-medium mt-1 px-2 py-1 bg-white rounded shadow">Destination</p>
        </div>
        
        {/* Path History - Draw all points from history */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Render path history as a polyline */}
          {pathHistory.length > 1 && (
            <polyline 
              points={pathHistory.map(point => {
                // Convert GPS coordinates to screen coordinates (simplified)
                const x = 25 + (point.lng - pathHistory[0].lng) * 3000;
                const y = 75 - (point.lat - pathHistory[0].lat) * 3000;
                return `${x}% ${y}%`;
              }).join(' ')}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
            />
          )}
        </svg>
        
        {/* Vehicle Position */}
        {selectedDeliveryDetails.deliveryDetails?.status === 'in_transit' && (
          <div className="absolute flex flex-col items-center"
               style={{ 
                 top: `${75 - progress * 0.5}%`, 
                 left: `${25 + progress * 0.5}%` 
               }}>
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-blue-500 shadow-lg z-20 flex items-center justify-center">
                <Truck className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-blue-300 animate-ping"></div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs font-medium mt-1 px-2 py-1 bg-white rounded shadow">
                {truckInfo?.plateNumber}
              </p>
              {trackingInfo?.currentSpeed && (
                <p className="text-xs mt-1 px-2 py-1 bg-blue-100 rounded shadow">
                  {trackingInfo.currentSpeed.toFixed(1)} km/h
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white p-2 rounded-md shadow space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Origin</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Current Position</span>
          </div>
        </div>
        
        {/* Map Data */}
        <div className="absolute top-3 right-3 bg-white p-2 rounded-md shadow text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="text-gray-500">Latitude:</div>
            <div className="font-medium">{currentLat.toFixed(4)}°</div>
            <div className="text-gray-500">Longitude:</div>
            <div className="font-medium">{currentLng.toFixed(4)}°</div>
            <div className="text-gray-500">Speed:</div>
            <div className="font-medium">{trackingInfo?.currentSpeed?.toFixed(1) || 0} km/h</div>
            <div className="text-gray-500">Progress:</div>
            <div className="font-medium">{progress}%</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Delivery Log
          </Button>
          <h1 className="text-2xl font-bold">Delivery Map View</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deliveries List */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-lg flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary" />
                Active Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeDeliveries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active deliveries found
                </div>
              ) : (
                <div className="divide-y">
                  {activeDeliveries.map(delivery => {
                    // Get driver and truck info
                    const driver = delivery.deliveryDetails?.driverId ? 
                      getDriverById(delivery.deliveryDetails.driverId) : null;
                    const truck = delivery.deliveryDetails?.truckId ? 
                      getTruckById(delivery.deliveryDetails.truckId) : null;
                    
                    // Add driverName and vehicleDetails for UI display
                    if (delivery.deliveryDetails && driver) {
                      delivery.deliveryDetails.driverName = driver.name;
                    }
                    
                    if (delivery.deliveryDetails && truck) {
                      delivery.deliveryDetails.vehicleDetails = truck.plateNumber;
                    }
                    
                    const progress = calculateProgress(delivery);
                    
                    // Get tracking info
                    const gpsService = GPSTrackingService.getInstance();
                    const trackingInfo = gpsService.getTrackingInfo(delivery.deliveryDetails?.truckId || '');
                    
                    return (
                      <div 
                        key={delivery.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedDelivery === delivery.id ? 'border-l-4 border-primary bg-primary/5' : ''}`}
                        onClick={() => setSelectedDelivery(delivery.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{delivery.poNumber}</h3>
                          <Badge 
                            variant={delivery.deliveryDetails?.status === 'delivered' ? 'default' : 'outline'}
                            className={
                              delivery.deliveryDetails?.status === 'delivered' 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'text-amber-500 border-amber-200 bg-amber-50'
                            }
                          >
                            {delivery.deliveryDetails?.status === 'delivered' ? 'Delivered' : 'In Transit'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-2" />
                            <span>{delivery.deliveryDetails?.driverName || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center">
                            <Truck className="h-3 w-3 mr-2" />
                            <span>{delivery.deliveryDetails?.vehicleDetails || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            <span>
                              {delivery.deliveryDetails?.depotDepartureTime 
                                ? format(new Date(delivery.deliveryDetails.depotDepartureTime), 'MMM dd, HH:mm') 
                                : 'Not departed'}
                            </span>
                          </div>
                          {trackingInfo?.currentSpeed && delivery.deliveryDetails?.status === 'in_transit' && (
                            <div className="flex items-center text-blue-600">
                              <Navigation className="h-3 w-3 mr-2" />
                              <span>{trackingInfo.currentSpeed.toFixed(1)} km/h</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>{progress}% Complete</span>
                            {delivery.deliveryDetails?.status === 'in_transit' && (
                              <span className="text-blue-600">Active</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Map View */}
          <Card className="md:col-span-2">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Live Route Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <MapSimulation />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Delivery Details */}
        {selectedDeliveryDetails && (
          <Card>
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-lg flex items-center">
                <Route className="h-5 w-5 mr-2 text-primary" />
                Delivery Details: {selectedDeliveryDetails.poNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-500">Delivery Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium">
                        {selectedDeliveryDetails.deliveryDetails?.status === 'delivered' 
                          ? 'Delivered' 
                          : 'In Transit'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Progress</p>
                      <p className="font-medium">{calculateProgress(selectedDeliveryDetails)}%</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Departure</p>
                      <p className="font-medium">
                        {selectedDeliveryDetails.deliveryDetails?.depotDepartureTime 
                          ? format(new Date(selectedDeliveryDetails.deliveryDetails.depotDepartureTime), 'MMM dd, HH:mm') 
                          : 'Not departed'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Expected Arrival</p>
                      <p className="font-medium">
                        {selectedDeliveryDetails.deliveryDetails?.expectedArrivalTime 
                          ? format(new Date(selectedDeliveryDetails.deliveryDetails.expectedArrivalTime), 'MMM dd, HH:mm') 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-500">Driver & Vehicle</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{driverInfo?.name || 'Unassigned'}</p>
                        <p className="text-sm text-gray-500">{driverInfo?.contact || 'No contact'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{truckInfo?.plateNumber || 'Unassigned'}</p>
                        <p className="text-sm text-gray-500">{truckInfo?.model || 'No model'} ({truckInfo?.capacity.toLocaleString()} L)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-gray-500">Tracking Information</h3>
                  {latestPosition ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <p className="text-gray-500">Last Update</p>
                          <p className="font-medium">{format(new Date(latestPosition.timestamp), 'MMM dd, HH:mm')}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500">Speed</p>
                          <p className="font-medium">{latestPosition.speed} km/h</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500">Latitude</p>
                          <p className="font-medium">{latestPosition.latitude.toFixed(4)}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500">Longitude</p>
                          <p className="font-medium">{latestPosition.longitude.toFixed(4)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                        <h4 className="text-xs font-medium text-blue-700 mb-1">Path History</h4>
                        <p className="text-xs text-blue-600">
                          {pathHistory.length} GPS coordinates recorded for this journey
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-amber-500">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span className="text-sm">No GPS data available</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapView;
