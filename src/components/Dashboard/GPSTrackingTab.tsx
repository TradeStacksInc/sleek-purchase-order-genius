
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Navigation, Truck, FileCheck, User, MapPin } from 'lucide-react';
import DriverSituationCard from './DriverSituationCard';
import { PurchaseOrder } from '@/types';
import { useTruckTracking } from '@/hooks/useTruckTracking';
import { format } from 'date-fns';

interface GPSTrackingTabProps {
  activeDeliveries: PurchaseOrder[];
  getDriverById: (id: string) => any;
  getTruckById: (id: string) => any;
}

const GPSTrackingTab: React.FC<GPSTrackingTabProps> = ({ 
  activeDeliveries, 
  getDriverById, 
  getTruckById 
}) => {
  const { trackedTrucks, updateTimestamp } = useTruckTracking();
  
  return (
    <>
      <Card className="bg-card shadow-md border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Driver Situational Reports</CardTitle>
              <CardDescription>
                Real-time monitoring of trucks en route
                {trackedTrucks.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600">
                    Last updated: {format(new Date(updateTimestamp), 'HH:mm:ss')}
                  </span>
                )}
              </CardDescription>
            </div>
            <Link to="/gps-tracking">
              <Button variant="outline" size="sm">
                <span>GPS Tracking</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <Navigation className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No active deliveries at the moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Deliveries will appear here once they are in transit
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDeliveries.map((order) => {
                const driver = order.deliveryDetails?.driverId 
                  ? getDriverById(order.deliveryDetails.driverId)
                  : null;
                  
                const truck = order.deliveryDetails?.truckId 
                  ? getTruckById(order.deliveryDetails.truckId)
                  : null;
                  
                if (!driver || !truck || !order.deliveryDetails) {
                  return null;
                }
                
                const isBeingTracked = trackedTrucks.includes(truck.id);
                
                return (
                  <DriverSituationCard 
                    key={order.id}
                    order={order}
                    driver={driver}
                    truck={truck}
                    isTracked={isBeingTracked}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DeliveryStatCard
          title="Active Deliveries"
          value={activeDeliveries.length.toString()}
          icon={<Truck className="h-4 w-4 text-amber-700" />}
          color="amber"
        />
        
        <DeliveryStatCard
          title="GPS Tracked"
          value={trackedTrucks.length.toString()}
          icon={<MapPin className="h-4 w-4 text-blue-700" />}
          color="blue"
        />
        
        <DeliveryStatCard
          title="Completed Today"
          value="0"
          icon={<FileCheck className="h-4 w-4 text-green-700" />}
          color="green"
        />
        
        <DeliveryStatCard
          title="Available Drivers"
          value="2"
          icon={<User className="h-4 w-4 text-purple-700" />}
          color="purple"
        />
      </div>
    </>
  );
};

interface DeliveryStatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'amber' | 'green' | 'blue' | 'purple';
}

const DeliveryStatCard: React.FC<DeliveryStatCardProps> = ({ title, value, icon, color }) => {
  const getColorClass = () => {
    switch (color) {
      case 'amber': return 'bg-amber-100 text-amber-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'purple': return 'bg-purple-100 text-purple-700';
    }
  };
  
  const getGradientClass = () => {
    switch (color) {
      case 'amber': return 'bg-gradient-to-r from-amber-100 to-amber-50';
      case 'green': return 'bg-gradient-to-r from-green-100 to-green-50';
      case 'blue': return 'bg-gradient-to-r from-blue-100 to-blue-50';
      case 'purple': return 'bg-gradient-to-r from-purple-100 to-purple-50';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-md ${getColorClass()}`}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-medium">{title}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          </div>
        </div>
        <div className={`h-1.5 ${getGradientClass()}`} />
      </CardContent>
    </Card>
  );
};

export default GPSTrackingTab;
