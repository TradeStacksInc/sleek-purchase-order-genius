import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertCircle, User, Truck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PurchaseOrder } from '@/types';
import IconWithBackground from '@/components/IconWithBackground';

interface OffloadingDialogProps {
  orderId?: string;
  children: React.ReactNode;
}

const OffloadingDialog: React.FC<OffloadingDialogProps> = ({ orderId: propOrderId, children }) => {
  const { toast } = useToast();
  const { 
    recordOffloadingDetails, 
    getOrderById, 
    getAllTanks, 
    recordOffloadingToTank, 
    getOrdersWithDeliveryStatus,
    getDriverById
  } = useApp();
  
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(propOrderId || "");
  
  const [loadedVolume, setLoadedVolume] = useState<number>(0);
  const [deliveredVolume, setDeliveredVolume] = useState<number>(0);
  const [initialTankVolume, setInitialTankVolume] = useState<number>(0);
  const [finalTankVolume, setFinalTankVolume] = useState<number>(0);
  const [measuredBy, setMeasuredBy] = useState<string>("");
  const [measuredByRole, setMeasuredByRole] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [tankId, setTankId] = useState<string>("");
  const [discrepancyWarning, setDiscrepancyWarning] = useState<boolean>(false);
  const [discrepancyPercent, setDiscrepancyPercent] = useState<number>(0);
  const [driverRating, setDriverRating] = useState<number>(5);
  
  const [availableTanks, setAvailableTanks] = useState<any[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<PurchaseOrder[]>([]);
  
  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null;
  const productType = selectedOrder?.items?.[0]?.product || 'PMS';
  const driverDetails = selectedOrder?.deliveryDetails?.driverId 
    ? getDriverById(selectedOrder.deliveryDetails.driverId)
    : null;
  
  useEffect(() => {
    if (open) {
      const orders = getOrdersWithDeliveryStatus('delivered');
      const pendingOffloadOrders = orders.filter(order => !order.offloadingDetails);
      setDeliveredOrders(pendingOffloadOrders);
      
      if (propOrderId) {
        setSelectedOrderId(propOrderId);
      } else if (pendingOffloadOrders.length === 1) {
        setSelectedOrderId(pendingOffloadOrders[0].id);
      }
    }
  }, [open, getOrdersWithDeliveryStatus, propOrderId]);

  useEffect(() => {
    if (selectedOrderId) {
      const order = getOrderById(selectedOrderId);
      if (order && order.items && order.items.length > 0) {
        const totalVolume = order.items.reduce((sum, item) => sum + item.quantity, 0);
        setLoadedVolume(totalVolume);
        setDeliveredVolume(totalVolume);
        
        const allTanks = getAllTanks();
        const productTypeValue = order.items[0].productId || order.items[0].product;
        const filteredTanks = allTanks.filter(tank => 
          String(tank.productType) === String(productTypeValue) && 
          tank.status === 'operational'
        );
        setAvailableTanks(filteredTanks);
        
        setTankId("");
        setInitialTankVolume(0);
        setFinalTankVolume(0);
        setNotes("");
      }
    } else {
      setLoadedVolume(0);
      setDeliveredVolume(0);
      setTankId("");
      setInitialTankVolume(0);
      setFinalTankVolume(0);
      setAvailableTanks([]);
    }
  }, [selectedOrderId, getOrderById, getAllTanks]);
  
  useEffect(() => {
    if (loadedVolume > 0 && deliveredVolume > 0) {
      const diff = Math.abs(deliveredVolume - loadedVolume);
      const percent = (diff / loadedVolume) * 100;
      setDiscrepancyPercent(percent);
      setDiscrepancyWarning(percent > 2);
      
      if (percent < 1) {
        setDriverRating(5);
      } else if (percent < 2) {
        setDriverRating(4);
      } else if (percent < 3) {
        setDriverRating(3);
      } else if (percent < 5) {
        setDriverRating(2);
      } else {
        setDriverRating(1);
      }
    } else {
      setDiscrepancyWarning(false);
      setDriverRating(5);
    }
  }, [loadedVolume, deliveredVolume]);
  
  useEffect(() => {
    if (tankId && deliveredVolume) {
      const selectedTank = availableTanks.find(tank => tank.id === tankId);
      if (selectedTank) {
        setInitialTankVolume(selectedTank.currentVolume);
        setFinalTankVolume(selectedTank.currentVolume + deliveredVolume);
      }
    }
  }, [tankId, deliveredVolume, availableTanks]);

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast({
        title: "Validation Error",
        description: "Please select a purchase order.",
        variant: "destructive"
      });
      return;
    }
    
    if (!measuredBy) {
      toast({
        title: "Validation Error",
        description: "Please enter the name of the person who measured the offload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!measuredByRole) {
      toast({
        title: "Validation Error",
        description: "Please enter the role of the person who measured the offload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!tankId) {
      toast({
        title: "Validation Error",
        description: "Please select a tank for offloading.",
        variant: "destructive"
      });
      return;
    }
    
    if (deliveredVolume <= 0) {
      toast({
        title: "Validation Error",
        description: "The delivered volume must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const ratingNote = `Driver Rating: ${driverRating}/5 stars`;
      const fullNotes = notes ? `${notes}\n\n${ratingNote}` : ratingNote;
      
      recordOffloadingDetails(selectedOrderId, {
        initialTankVolume,
        finalTankVolume,
        loadedVolume,
        deliveredVolume,
        measuredBy,
        measuredByRole,
        notes: fullNotes,
        tankId,
        productType,
      });
      
      const updatedTank = recordOffloadingToTank(tankId, deliveredVolume, productType);
      
      if (!updatedTank) {
        toast({
          title: "Error",
          description: "Failed to update the tank with the offloaded volume. Please check tank capacity.",
          variant: "destructive"
        });
        return;
      }
      
      setOpen(false);
      
      setSelectedOrderId("");
      setLoadedVolume(0);
      setDeliveredVolume(0);
      setInitialTankVolume(0);
      setFinalTankVolume(0);
      setMeasuredBy("");
      setMeasuredByRole("");
      setNotes("");
      setTankId("");
      
      toast({
        title: "Offloading Recorded",
        description: discrepancyWarning 
          ? "Offloading completed with volume discrepancy. The issue has been flagged."
          : "Offloading completed successfully with no significant discrepancies.",
      });
    } catch (error) {
      console.error("Error recording offloading:", error);
      toast({
        title: "Error",
        description: "Failed to record the offloading details. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl min-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconWithBackground icon={Database} bgClass="bg-orange-100" iconClass="text-orange-600" />
            Record Product Offloading
          </DialogTitle>
          <DialogDescription>
            Record the offloading details for this delivery. This information will be used to track inventory and reconcile discrepancies.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Purchase Order Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="orderId">Select Purchase Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a delivered order to offload" />
                </SelectTrigger>
                <SelectContent>
                  {deliveredOrders.length > 0 ? (
                    deliveredOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.poNumber} - {order.items[0]?.product || 'Unknown'} ({order.items[0]?.quantity.toLocaleString()} L)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No delivered orders pending offload</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedOrder && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loadedVolume">Volume Loaded (L)</Label>
                    <Input
                      id="loadedVolume"
                      type="number"
                      value={loadedVolume}
                      onChange={(e) => setLoadedVolume(Number(e.target.value))}
                      placeholder="Enter volume loaded at depot"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveredVolume">Volume Delivered (L)</Label>
                    <Input
                      id="deliveredVolume"
                      type="number"
                      value={deliveredVolume}
                      onChange={(e) => setDeliveredVolume(Number(e.target.value))}
                      placeholder="Enter volume measured on arrival"
                      className={cn(discrepancyWarning ? "border-orange-500" : "")}
                    />
                  </div>
                </div>

                {driverDetails && (
                  <div className="bg-slate-50 p-3 rounded-md border">
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <User className="h-4 w-4 mr-1" /> 
                      Driver Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{driverDetails.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">License:</span>
                        <span>{driverDetails.licenseNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Contact:</span>
                        <span>{driverDetails.contact}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Driver Rating:</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`h-4 w-4 ${i < driverRating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.deliveryDetails?.truckId && (
                  <div className="bg-slate-50 p-3 rounded-md border">
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <Truck className="h-4 w-4 mr-1" /> 
                      Truck Information
                    </h4>
                    <div className="text-sm">
                      <p>Order being offloaded from truck assigned to PO #{selectedOrder.poNumber}</p>
                    </div>
                  </div>
                )}

                {discrepancyWarning && (
                  <Alert variant="warning" className="bg-orange-50 text-orange-800 border-orange-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Volume Discrepancy Detected</AlertTitle>
                    <AlertDescription>
                      There is a {discrepancyPercent.toFixed(2)}% difference between loaded and delivered volumes. 
                      Please double-check your measurements, but you may proceed with the offload.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="measuredBy">Measured By</Label>
                  <Input
                    id="measuredBy"
                    value={measuredBy}
                    onChange={(e) => setMeasuredBy(e.target.value)}
                    placeholder="Name of person who measured"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="measuredByRole">Role</Label>
                  <Select value={measuredByRole} onValueChange={setMeasuredByRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Station Manager">Station Manager</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Attendant">Attendant</SelectItem>
                      <SelectItem value="Driver">Driver</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Tank Information</h3>
            
            {selectedOrder && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tankId">Select Tank</Label>
                  <Select value={tankId} onValueChange={setTankId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tank to offload to" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTanks.length > 0 ? (
                        availableTanks.map(tank => (
                          <SelectItem key={tank.id} value={tank.id}>
                            {tank.name} - {tank.currentVolume}/{tank.capacity}L ({((tank.currentVolume / tank.capacity) * 100).toFixed(1)}% full)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No compatible tanks available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialVolume">Initial Tank Volume (L)</Label>
                    <Input
                      id="initialVolume"
                      type="number"
                      value={initialTankVolume}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="finalVolume">Final Tank Volume (L)</Label>
                    <Input
                      id="finalVolume"
                      type="number"
                      value={finalTankVolume}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Input
                    id="productType"
                    value={productType}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this offloading (optional)"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
                  <h4 className="text-sm font-medium mb-2 text-blue-700">Offloading Summary</h4>
                  {tankId && (
                    <ul className="text-sm space-y-1 text-blue-600">
                      <li>• Purchase Order: {selectedOrder.poNumber}</li>
                      <li>• Product: {productType}</li>
                      <li>• Volume Expected: {loadedVolume.toLocaleString()} L</li>
                      <li>• Volume Delivered: {deliveredVolume.toLocaleString()} L</li>
                      <li>• Discrepancy: {discrepancyPercent.toFixed(2)}%</li>
                      <li>• Status: {discrepancyWarning ? 'Flagged' : 'Normal'}</li>
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            All offloading details will be logged and tracked for auditing purposes.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedOrderId}>
              Record Offloading
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OffloadingDialog;
