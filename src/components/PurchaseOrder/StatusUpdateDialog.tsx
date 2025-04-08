
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { OrderStatus } from '@/types';
import { useActivityLogger } from '@/hooks/useActivityLogger';

export interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({ 
  orderId, 
  currentStatus,
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const { updateOrderStatus } = useApp();
  const { logUserAction } = useActivityLogger();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    try {
      await updateOrderStatus(orderId, status, note);
      
      // Log the action using useActivityLogger
      logUserAction(
        'update_status',
        'purchase_order',
        orderId,
        `Status updated to ${status}${note ? ` with note: ${note}` : ''}`
      );
      
      toast({
        title: 'Status updated',
        description: `Order status has been updated to ${status}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl transition-all duration-200">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Status</label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as OrderStatus)}
            >
              <SelectTrigger className="col-span-3 transition-all duration-200 rounded-lg">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Note</label>
            <Textarea 
              placeholder="Add a note about this status change" 
              className="col-span-3 transition-all duration-200 rounded-lg" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="transition-all duration-200 rounded-lg"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="transition-all duration-200 rounded-lg"
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
