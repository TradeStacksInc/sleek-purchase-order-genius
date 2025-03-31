
import React from 'react';
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
  Truck
} from 'lucide-react';
import { OrderStatus } from '@/types';

const Dashboard: React.FC = () => {
  const { purchaseOrders, updateOrderStatus } = useApp();
  
  // Calculate stats
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length;
  const activeOrders = purchaseOrders.filter(po => po.status === 'active').length;
  const fulfilledOrders = purchaseOrders.filter(po => po.status === 'fulfilled').length;
  
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const activeTotalValue = purchaseOrders
    .filter(po => po.status === 'active')
    .reduce((sum, po) => sum + po.grandTotal, 0);
  
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
      
      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Purchase Orders</CardTitle>
              <Link to="/create">
                <Button variant="outline" size="sm">
                  <span>New Order</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.slice(0, 7).map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 align-middle font-medium">{order.poNumber}</td>
                        <td className="px-4 py-3 align-middle">{order.supplier.name}</td>
                        <td className="px-4 py-3 align-middle">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="px-4 py-3 align-middle">₦{order.grandTotal.toLocaleString()}</td>
                        <td className="px-4 py-3 align-middle">
                          <StatusBadge status={order.status} />
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
                            {order.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
      </div>
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
