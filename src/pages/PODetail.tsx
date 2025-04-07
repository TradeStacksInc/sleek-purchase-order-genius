import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  BarChart3,
  MapPin,
  Droplet
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PurchaseOrder, LogEntry, Supplier } from '@/types';
import { getStatusColor, formatCurrency } from '@/utils/formatters';
import DeliveryStatusBadge from '@/components/DeliveryStatusBadge';
import { toast } from '@/hooks/use-toast';

const PODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrderById, getLogsByOrderId, getSupplierById } = useApp();
  
  const [order, setOrder] = useState<any | null>(null);
  const [supplier, setSupplier] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    if (id) {
      const purchaseOrder = getPurchaseOrderById(id);
      setOrder(purchaseOrder || null);
      
      if (purchaseOrder?.supplierId) {
        const supplierData = getSupplierById(purchaseOrder.supplierId);
        setSupplier(supplierData || null);
      }
      
      // Get logs for this order
      const orderLogs = getLogsByOrderId(id);
      setLogs(orderLogs || []);
    }
  }, [id, getPurchaseOrderById, getSupplierById, getLogsByOrderId]);

  // Access logs directly without .data property
  console.log("Logs:", logs);
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The purchase order you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-200 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-amber-100 text-amber-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-amber-100 text-amber-800',
      paid: 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PPP');
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'p');
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PPp');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Purchase Orders
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(order.status)}
          
          <span className="text-sm text-muted-foreground ml-4">Payment:</span>
          {getPaymentStatusBadge(order.paymentStatus || 'unpaid')}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Purchase Order #{order.poNumber || 'Draft'}</span>
              {order.deliveryDetails && (
                <DeliveryStatusBadge status={order.deliveryDetails.status} />
              )}
            </CardTitle>
            <CardDescription>
              Created on {formatDateTime(order.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                <p className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(order.orderDate)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expected Delivery</h3>
                <p className="flex items-center mt-1">
                  <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(order.expectedDeliveryDate)}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
              <div className="mt-1 rounded-md border p-3">
                <p className="font-medium">{supplier?.name || order.supplierName || 'Unknown Supplier'}</p>
                {supplier && (
                  <>
                    <p className="text-sm text-muted-foreground">{supplier.contactName}</p>
                    <p className="text-sm text-muted-foreground">{supplier.email}</p>
                    <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Delivery Location</h3>
              <p className="flex items-start mt-1">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <span>{order.deliveryAddress || 'No delivery address specified'}</span>
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Terms</h3>
                <p className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  {order.paymentTerms || 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                <p className="mt-1">
                  {getPaymentStatusBadge(order.paymentStatus || 'unpaid')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Products, quantities, and pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[200px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items && order.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">{item.productType}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity.toLocaleString()} {item.unit || 'liters'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({order.taxRate || 0}%):</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Grand Total:</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
            
            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1 text-sm">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="delivery" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="delivery">Delivery Information</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                Track the current status of this delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.deliveryDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Driver</h3>
                      <p className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.driverName || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Vehicle</h3>
                      <p className="flex items-center mt-1">
                        <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.vehicleDetails || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Depot Departure</h3>
                      <p className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.depotDepartureTime 
                          ? formatDateTime(order.deliveryDetails.depotDepartureTime) 
                          : 'Not departed'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expected Arrival</h3>
                      <p className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.expectedArrivalTime 
                          ? formatDateTime(order.deliveryDetails.expectedArrivalTime) 
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Actual Arrival</h3>
                      <p className="flex items-center mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.actualArrivalTime 
                          ? formatDateTime(order.deliveryDetails.actualArrivalTime) 
                          : 'Not arrived'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Distance</h3>
                      <p className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {order.deliveryDetails.totalDistance 
                          ? `${order.deliveryDetails.totalDistance} km` 
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                  
                  {order.offloadingDetails && (
                    <>
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Offloading Details</h3>
                        <div className="mt-2 rounded-md border p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Loaded Volume</p>
                              <p className="font-medium">{order.offloadingDetails.loadedVolume.toLocaleString()} liters</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Delivered Volume</p>
                              <p className="font-medium">{order.offloadingDetails.deliveredVolume.toLocaleString()} liters</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground">Discrepancy</p>
                            <div className="flex items-center">
                              <p className={`font-medium ${order.offloadingDetails.isDiscrepancyFlagged ? 'text-red-600' : 'text-green-600'}`}>
                                {order.offloadingDetails.discrepancyPercentage.toFixed(2)}%
                              </p>
                              {order.offloadingDetails.isDiscrepancyFlagged && (
                                <AlertTriangle className="h-4 w-4 ml-2 text-red-600" />
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground">Tank Information</p>
                            <p className="font-medium">
                              <Droplet className="h-4 w-4 inline mr-1 text-blue-500" />
                              Initial: {order.offloadingDetails.initialTankVolume.toLocaleString()} liters
                              {' → '}
                              Final: {order.offloadingDetails.finalTankVolume.toLocaleString()} liters
                            </p>
                          </div>
                          
                          {order.offloadingDetails.notes && (
                            <div>
                              <p className="text-xs text-muted-foreground">Notes</p>
                              <p className="text-sm">{order.offloadingDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                  <h3 className="text-lg font-medium">No Delivery Assigned</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This purchase order doesn't have delivery information yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                History of all activities related to this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="h-full w-px bg-border" />
                        </div>
                        <div className="space-y-1 pt-1">
                          <p className="text-sm font-medium leading-none">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.details}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                  <h3 className="text-lg font-medium">No Activity Logs</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are no activity logs for this purchase order yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Related documents and attachments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                <h3 className="text-lg font-medium">No Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no documents attached to this purchase order.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PODetail;
