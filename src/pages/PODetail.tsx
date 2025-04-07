import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import StatusTracker from '@/components/PurchaseOrder/StatusTracker';
import StatusUpdateDialog from '@/components/PurchaseOrder/StatusUpdateDialog';
import { CalendarIcon, TruckIcon, FileTextIcon, BarChart3Icon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const PODetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { getPurchaseOrderById, getSupplierById, getLogsByOrderId } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const purchaseOrder = id ? getPurchaseOrderById(id) : undefined;
  const supplier = purchaseOrder?.supplierId ? getSupplierById(purchaseOrder.supplierId) : undefined;
  const logs = id ? getLogsByOrderId(id) : [];

  useEffect(() => {
    if (!purchaseOrder && id) {
      toast({
        title: "Error",
        description: `Purchase Order with ID ${id} not found.`,
        variant: "destructive",
      });
    }
  }, [purchaseOrder, id, toast]);

  if (!purchaseOrder) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Purchase Order Not Found</h1>
        <p>The purchase order you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Purchase Order {purchaseOrder.poNumber || id}</h1>
          <p className="text-gray-500">Created on {purchaseOrder.createdAt?.toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            Update Status
          </Button>
          <Button asChild>
            <Link to={`/orders/edit/${id}`}>Edit Order</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${purchaseOrder.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              purchaseOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'}`}>
              {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
            </Badge>
            <div className="mt-4">
              <StatusTracker 
                currentStatus={purchaseOrder.status} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier ? (
              <>
                <h3 className="font-medium">{supplier.name}</h3>
                <p className="text-sm text-gray-500">{supplier.contact || supplier.contactName || 'No contact information'}</p>
                <p className="text-sm text-gray-500">{supplier.email || supplier.contactEmail}</p>
              </>
            ) : (
              <p>No supplier information available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>Total Amount:</span>
              <span className="font-semibold">{formatCurrency(purchaseOrder.grandTotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <Badge className={`${purchaseOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {purchaseOrder.paymentStatus || 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="details">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Order Details
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <TruckIcon className="mr-2 h-4 w-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="logs">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3Icon className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p className="text-sm"><span className="font-medium">PO Number:</span> {purchaseOrder.poNumber || 'Not assigned'}</p>
                  <p className="text-sm"><span className="font-medium">Date Created:</span> {purchaseOrder.createdAt?.toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-medium">Last Updated:</span> {purchaseOrder.updatedAt?.toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-medium">Payment Terms:</span> {purchaseOrder.paymentTerm || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {purchaseOrder.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{item.productName || item.product}</span>
                          <p>Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No items in this order</p>
                  )}
                </div>
              </div>
              
              {purchaseOrder.notes && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm">{purchaseOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrder.deliveryDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Status</h3>
                    <Badge className={`${
                      purchaseOrder.deliveryDetails.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      purchaseOrder.deliveryDetails.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {purchaseOrder.deliveryDetails.status?.charAt(0).toUpperCase() + purchaseOrder.deliveryDetails.status?.slice(1) || 'Pending'}
                    </Badge>
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-sm"><span className="font-medium">Expected Delivery:</span> {purchaseOrder.deliveryDate?.toLocaleDateString() || 'Not specified'}</p>
                      {purchaseOrder.deliveryDetails.depotDepartureTime && (
                        <p className="text-sm"><span className="font-medium">Departed Depot:</span> {new Date(purchaseOrder.deliveryDetails.depotDepartureTime).toLocaleString()}</p>
                      )}
                      {purchaseOrder.deliveryDetails.expectedArrivalTime && (
                        <p className="text-sm"><span className="font-medium">Expected Arrival:</span> {new Date(purchaseOrder.deliveryDetails.expectedArrivalTime).toLocaleString()}</p>
                      )}
                      {purchaseOrder.deliveryDetails.actualArrivalTime && (
                        <p className="text-sm"><span className="font-medium">Actual Arrival:</span> {new Date(purchaseOrder.deliveryDetails.actualArrivalTime).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Transport Details</h3>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Driver:</span> {purchaseOrder.deliveryDetails.driverName || 'Not assigned'}</p>
                      <p className="text-sm"><span className="font-medium">Vehicle:</span> {purchaseOrder.deliveryDetails.vehicleDetails || 'Not assigned'}</p>
                      {purchaseOrder.deliveryDetails.totalDistance && (
                        <p className="text-sm"><span className="font-medium">Total Distance:</span> {purchaseOrder.deliveryDetails.totalDistance} km</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No delivery information available</p>
                  <Button className="mt-4" asChild>
                    <Link to={`/assign-driver/${id}`}>Assign Driver & Truck</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {purchaseOrder.offloadingDetails && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Offloading Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Volume Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Initial Tank Volume:</span> {purchaseOrder.offloadingDetails.initialTankVolume} liters</p>
                      <p className="text-sm"><span className="font-medium">Final Tank Volume:</span> {purchaseOrder.offloadingDetails.finalTankVolume} liters</p>
                      <p className="text-sm"><span className="font-medium">Loaded Volume:</span> {purchaseOrder.offloadingDetails.loadedVolume} liters</p>
                      <p className="text-sm"><span className="font-medium">Delivered Volume:</span> {purchaseOrder.offloadingDetails.deliveredVolume} liters</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Discrepancy Information</h3>
                    <Badge className={purchaseOrder.offloadingDetails.isDiscrepancyFlagged ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {purchaseOrder.offloadingDetails.isDiscrepancyFlagged ? 'Discrepancy Detected' : 'No Discrepancy'}
                    </Badge>
                    
                    {purchaseOrder.offloadingDetails.isDiscrepancyFlagged && (
                      <p className="text-sm mt-2"><span className="font-medium">Discrepancy Percentage:</span> {purchaseOrder.offloadingDetails.discrepancyPercentage}%</p>
                    )}
                    
                    <div className="mt-4 space-y-1">
                      <p className="text-sm"><span className="font-medium">Measured By:</span> {purchaseOrder.offloadingDetails.measuredBy}</p>
                      <p className="text-sm"><span className="font-medium">Role:</span> {purchaseOrder.offloadingDetails.measuredByRole}</p>
                      <p className="text-sm"><span className="font-medium">Time:</span> {new Date(purchaseOrder.offloadingDetails.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {purchaseOrder.offloadingDetails.notes && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm">{purchaseOrder.offloadingDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {logs && logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b pb-3">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-500">{log.details}</p>
                      <p className="text-xs text-gray-400">
                        {log.timestamp instanceof Date 
                          ? log.timestamp.toLocaleString() 
                          : new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No activity logs for this order</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Order Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-4">Analytics for this order are not available yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isDialogOpen && (
        <StatusUpdateDialog 
          orderId={id!} 
          currentStatus={purchaseOrder.status} 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
};

export default PODetail;
