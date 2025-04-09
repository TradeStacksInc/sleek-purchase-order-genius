
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Truck, AlertCircle, ClipboardCheck, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@/types';

interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: string;
  children?: React.ReactNode;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({ orderId, currentStatus, children }) => {
  const { toast } = useToast();
  const { updateOrderStatus } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');

  const handleUpdateStatus = async () => {
    try {
      // Convert string status to OrderStatus type
      const typedStatus = selectedStatus as OrderStatus;
      const success = await updateOrderStatus(orderId, typedStatus, notes);
      
      if (success) {
        toast({
          title: "Status Updated",
          description: `Order status updated to ${selectedStatus}`,
        });
        setIsOpen(false);
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating the status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'active':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'fulfilled':
        return <ClipboardCheck className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline" size="sm">Update Status</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this purchase order.
            Current status: <span className="font-semibold">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="status">New Status</label>
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="fulfilled">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-green-500" />
                    <span>Fulfilled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes">Notes</label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any notes about this status change"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
