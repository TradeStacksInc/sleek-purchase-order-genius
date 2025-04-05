
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Database, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PurchaseOrder, Product, Tank } from '@/types';
import IconWithBackground from '../IconWithBackground';
import { cn } from '@/lib/utils';

interface OffloadingDialogProps {
  orderId: string;
  children: React.ReactNode;
}

const OffloadingDialog: React.FC<OffloadingDialogProps> = ({ orderId, children }) => {
  const { toast } = useToast();
  const { recordOffloadingDetails, getOrderById, getAllTanks, recordOffloadingToTank } = useApp();
  const [open, setOpen] = useState(false);
  
  // Form state
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
  
  // Available tanks
  const [availableTanks, setAvailableTanks] = useState<Tank[]>([]);
  
  // Order details
  const order = getOrderById(orderId);
  const productType = order?.items?.[0]?.product || 'PMS';
  
  useEffect(() => {
    if (open) {
      const allTanks = getAllTanks();
      // Filter tanks by product type and operational status
      const filteredTanks = allTanks.filter(tank => 
        tank.productType === productType && 
        tank.status === 'operational'
      );
      setAvailableTanks(filteredTanks);
      
      // If we have order details, pre-fill the loaded volume
      if (order && order.items && order.items.length > 0) {
        const totalVolume = order.items.reduce((sum, item) => sum + item.quantity, 0);
        setLoadedVolume(totalVolume);
        setDeliveredVolume(totalVolume); // Default to same as loaded
      }
    }
  }, [open, productType, order, getAllTanks]);
  
  // Calculate discrepancy whenever volumes change
  useEffect(() => {
    if (loadedVolume > 0 && deliveredVolume > 0) {
      const diff = Math.abs(deliveredVolume - loadedVolume);
      const percent = (diff / loadedVolume) * 100;
      setDiscrepancyPercent(percent);
      setDiscrepancyWarning(percent > 2);
    } else {
      setDiscrepancyWarning(false);
    }
  }, [loadedVolume, deliveredVolume]);
  
  // Update final volume when tank and delivered volume change
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
      // First, record the offloading details
      recordOffloadingDetails(orderId, {
        initialTankVolume,
        finalTankVolume,
        loadedVolume,
        deliveredVolume,
        measuredBy,
        measuredByRole,
        notes,
        tankId,
        productType,
      });
      
      // Then, update the tank with the offloaded volume
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
      
      // Reset form
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
        description: "The offloading details have been recorded successfully.",
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
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Load Information</h3>
            
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
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Tank Information</h3>
            
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
            <Button onClick={handleSubmit}>
              Record Offloading
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OffloadingDialog;
