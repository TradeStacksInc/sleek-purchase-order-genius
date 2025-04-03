
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { OrderStatus } from '@/types';
import StatusTracker from '@/components/PurchaseOrder/StatusTracker';

const PODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, getLogsByOrderId, updateOrderStatus } = useApp();
  
  const order = getOrderById(id!);
  const logs = getLogsByOrderId(id!);
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The purchase order you're looking for doesn't exist</p>
        <Button variant="default" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-status-pending" />;
      case 'active':
        return <Clock className="h-5 w-5 text-status-active" />;
      case 'fulfilled':
        return <FileCheck className="h-5 w-5 text-status-fulfilled" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-status-pending/20 text-status-pending border-status-pending/50';
      case 'active':
        return 'bg-status-active/20 text-status-active border-status-active/50';
      case 'fulfilled':
        return 'bg-status-fulfilled/20 text-status-fulfilled border-status-fulfilled/50';
      default:
        return '';
    }
  };
  
  const getNextAction = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button 
            className="mt-4" 
            onClick={() => updateOrderStatus(order.id, 'active')}
          >
            Mark as Paid
          </Button>
        );
      case 'active':
        return (
          <Button 
            className="mt-4" 
            onClick={() => updateOrderStatus(order.id, 'fulfilled')}
          >
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Purchase Order Details</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    <span className="text-muted-foreground text-sm font-normal mr-2">Order #</span>
                    {order.poNumber}
                  </CardTitle>
                  <CardDescription>
                    Created on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge className="ml-auto text-sm py-1 px-3">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Tracker */}
              <div className="mb-6">
                <StatusTracker 
                  currentStatus={order.status} 
                  statusHistory={order.statusHistory}
                />
              </div>

              <Alert className={cn("border mb-6", getStatusColor(order.status))}>
                <div className="flex items-start">
                  {getStatusIcon(order.status)}
                  <div className="ml-3">
                    <AlertTitle>
                      {order.status === 'pending' ? 'Payment Pending' : 
                       order.status === 'active' ? 'Order Active' : 
                       'Order Fulfilled'}
                    </AlertTitle>
                    <AlertDescription>
                      {order.status === 'pending' ? 
                        'This order is awaiting payment before processing.' : 
                        order.status === 'active' ? 
                        'This order has been paid and is awaiting delivery.' : 
                        'This order has been delivered and completed.'}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Company Information</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{order.company.name}</p>
                    <p>{order.company.address}</p>
                    <p>{order.company.contact}</p>
                    <p>Tax ID: {order.company.taxId}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Supplier Information</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{order.supplier.name}</p>
                    <p>{order.supplier.address}</p>
                    <p>{order.supplier.contact}</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="rounded-md border mb-6">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Product</th>
                        <th className="px-4 py-3 text-right font-medium">Quantity (Liters)</th>
                        <th className="px-4 py-3 text-right font-medium">Unit Price (₦)</th>
                        <th className="px-4 py-3 text-right font-medium">Total (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3">{item.product}</td>
                          <td className="px-4 py-3 text-right">{item.quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-medium">{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Grand Total:</td>
                        <td className="px-4 py-3 text-right font-bold">₦{order.grandTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Payment Terms</h3>
                  <p className="text-sm text-muted-foreground">{order.paymentTerm}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Expected Delivery Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.deliveryDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
              {getNextAction()}
            </CardFooter>
          </Card>
        </div>
        
        {/* Activity Log Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent activity for this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {logs.map((log) => (
                  <div key={log.id}>
                    <div className="flex gap-3">
                      <div className="flex-none mt-0.5">
                        <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium">
                          {log.user.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <span>{log.user}</span>
                          <span className="mx-1">•</span>
                          <span>{format(new Date(log.timestamp), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default PODetail;
