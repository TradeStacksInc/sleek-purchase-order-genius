
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import RecentOrdersTable from './RecentOrdersTable';
import { PurchaseOrder } from '@/types';

interface OrdersTabProps {
  purchaseOrders: PurchaseOrder[];
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getDriverById: (id: string) => any;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ 
  purchaseOrders, 
  updateOrderStatus,
  getDriverById 
}) => {
  return (
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
        <RecentOrdersTable 
          purchaseOrders={purchaseOrders}
          updateOrderStatus={updateOrderStatus}
          getDriverById={getDriverById}
        />
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
