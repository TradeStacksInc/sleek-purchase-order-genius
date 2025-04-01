
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CircleDollarSign, 
  FileCheck, 
  Hourglass,
  Truck,
  Navigation,
  User
} from 'lucide-react';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          <Card className="bg-card shadow-md border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Purchase Orders</CardTitle>
                <div className="flex gap-2">
                  <Link to="/create">
                    <Button variant="outline" size="sm">
                      <span>New Order</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <CardDescription>
                Manage and track your purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">PO Number</th>
                        <th className="px-4 py-3 text-left font-medium">Supplier</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Amount</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Driver</th>
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.slice(0, 7).map((order) => {
                        const driver = order.deliveryDetails?.driverId 
                          ? getDriverById(order.deliveryDetails.driverId)
                          : null;
                          
                        return (
                          <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 align-middle font-medium">{order.poNumber}</td>
                            <td className="px-4 py-3 align-middle">{order.supplier.name}</td>
                            <td className="px-4 py-3 align-middle">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                            <td className="px-4 py-3 align-middle">₦{order.grandTotal.toLocaleString()}</td>
                            <td className="px-4 py-3 align-middle">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {driver ? (
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-xs">
                                    {driver.name.charAt(0)}
                                  </div>
                                  <span className="text-xs">{driver.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex gap-2">
                                <Link to={`/orders/${order.id}`}>
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                                {order.status === 'pending' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateOrderStatus(order.id, 'active')}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                {order.status === 'active' && !order.deliveryDetails?.driverId && (
                                  <Link to="/assign-driver">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                    >
                                      Assign Driver
                                    </Button>
                                  </Link>
                                )}
                                {order.deliveryDetails?.status === 'in_transit' && (
                                  <Link to="/gps-tracking">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                    >
                                      Track
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    View all orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking" className="animate-fade-in">
          <Card className="bg-card shadow-md border-muted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Driver Situational Reports</CardTitle>
                <Link to="/gps-tracking">
                  <Button variant="outline" size="sm">
                    <span>GPS Update</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Real-time monitoring of trucks en route to their destinations
              </CardDescription>
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
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-md">
                      <Truck className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Active Deliveries</p>
                      <p className="text-lg font-semibold">{activeDeliveries.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-100 to-amber-50 h-1.5" />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-md">
                      <FileCheck className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Completed Today</p>
                      <p className="text-lg font-semibold">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-green-50 h-1.5" />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Navigation className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Average Trip</p>
                      <p className="text-lg font-semibold">85 km</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 h-1.5" />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-md">
                      <User className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Available Drivers</p>
                      <p className="text-lg font-semibold">2</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 h-1.5" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconColor = "bg-primary/20 text-primary" 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={cn("p-2 rounded-full", iconColor)}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-status-pending hover:bg-status-pending text-white">
          Pending
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-status-active hover:bg-status-active text-white">
          Active
        </Badge>
      );
    case 'fulfilled':
      return (
        <Badge className="bg-status-fulfilled hover:bg-status-fulfilled text-white">
          Fulfilled
        </Badge>
      );
    default:
      return null;
  }
};

export default Dashboard;
