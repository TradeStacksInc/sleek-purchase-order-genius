
import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CircleDollarSign, 
  FileCheck, 
  Hourglass,
  Truck
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/Dashboard/StatCard';
import OrdersTab from '@/components/Dashboard/OrdersTab';
import GPSTrackingTab from '@/components/Dashboard/GPSTrackingTab';

const Dashboard: React.FC = () => {
  const { purchaseOrders, updateOrderStatus, getDriverById, getTruckById } = useApp();
  
  // Calculate stats
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length;
  const activeOrders = purchaseOrders.filter(po => po.status === 'active').length;
  const fulfilledOrders = purchaseOrders.filter(po => po.status === 'fulfilled').length;
  
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const activeTotalValue = purchaseOrders
    .filter(po => po.status === 'active')
    .reduce((sum, po) => sum + po.grandTotal, 0);
    
  // Get active deliveries
  const activeDeliveries = purchaseOrders.filter(po => 
    po.deliveryDetails?.status === 'in_transit'
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          description="All purchase orders"
          icon={<FileCheck className="h-4 w-4" />}
        />
        <StatCard 
          title="Pending Orders" 
          value={pendingOrders.toString()} 
          description="Awaiting payment"
          icon={<Hourglass className="h-4 w-4" />}
          iconColor="bg-status-pending/20 text-status-pending"
        />
        <StatCard 
          title="Active Orders" 
          value={activeOrders.toString()} 
          description="Paid, awaiting delivery"
          icon={<Truck className="h-4 w-4" />}
          iconColor="bg-status-active/20 text-status-active"
        />
        <StatCard 
          title="Total Value" 
          value={`₦${totalValue.toLocaleString()}`}
          description={`₦${activeTotalValue.toLocaleString()} in active orders`}
          icon={<CircleDollarSign className="h-4 w-4" />}
          iconColor="bg-green-500/20 text-green-500"
        />
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="tracking">GPS Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="animate-fade-in">
          <OrdersTab 
            purchaseOrders={purchaseOrders}
            updateOrderStatus={updateOrderStatus}
            getDriverById={getDriverById}
          />
        </TabsContent>
        
        <TabsContent value="tracking" className="animate-fade-in">
          <GPSTrackingTab 
            activeDeliveries={activeDeliveries}
            getDriverById={getDriverById}
            getTruckById={getTruckById}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
