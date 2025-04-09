
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { PurchaseOrder } from '@/types';

interface RecentOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  updateOrderStatus: (id: string, status: 'pending' | 'active' | 'fulfilled') => void;
  getDriverById: (id: string) => any;
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ 
  purchaseOrders, 
  updateOrderStatus,
  getDriverById
}) => {
  return (
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
                  <td className="px-4 py-3 align-middle">{order.supplier?.name}</td>
                  <td className="px-4 py-3 align-middle">
                    {order.createdAt instanceof Date 
                      ? format(order.createdAt, 'MMM dd, yyyy')
                      : format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    ₦{order.grandTotal ? order.grandTotal.toLocaleString() : '0'}
                  </td>
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
                        <Link to={`/assign-driver/${order.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Assign Driver
                          </Button>
                        </Link>
                      )}
                      {order.deliveryDetails?.status === 'in_transit' && (
                        <Link to={`/gps-tracking/${order.id}`}>
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
      <div className="mt-4 flex justify-end">
        <Link to="/orders">
          <Button variant="ghost" size="sm">
            View all orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
