
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate: (
    id: string, 
    status: OrderStatus, 
    notes?: string,
    approvedBy?: string,
    rejectionReason?: string
  ) => void;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(
    currentStatus === 'pending' ? 'approved' : 
    currentStatus === 'approved' ? 'active' : 
    currentStatus === 'active' ? 'delivered' : 'fulfilled'
  );
  const [notes, setNotes] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const statusOptions = getAvailableStatusOptions(currentStatus);
  
  const handleSubmit = () => {
    if (status === 'rejected' && !rejectionReason) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this order.",
        variant: "destructive"
      });
      return;
    }
    
    if (status === 'approved' && !approvedBy) {
      toast({
        title: "Approval Information Required",
        description: "Please provide the name of the person who approved this order.",
        variant: "destructive"
      });
      return;
    }
    
    onStatusUpdate(orderId, status, notes, approvedBy, rejectionReason);
    setOpen(false);
    
    // Reset form
    setNotes('');
    setApprovedBy('');
    setRejectionReason('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the current status of this purchase order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <RadioGroup 
            value={status} 
            onValueChange={(value) => setStatus(value as OrderStatus)}
            className="grid grid-cols-1 gap-2"
          >
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {option.label}
                </Label>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            ))}
          </RadioGroup>
          
          {status === 'approved' && (
            <div className="grid gap-2">
              <Label htmlFor="approvedBy" className="required">Approved By</Label>
              <Input
                id="approvedBy"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Enter name of approving officer"
                required
              />
            </div>
          )}
          
          {status === 'rejected' && (
            <div className="grid gap-2">
              <Label htmlFor="rejectionReason" className="required">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejecting this order"
                required
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments about this status change"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getAvailableStatusOptions(currentStatus: OrderStatus) {
  switch (currentStatus) {
    case 'pending':
      return [
        { value: 'approved', label: 'Approve Order', description: 'Mark as approved' },
        { value: 'rejected', label: 'Reject Order', description: 'Decline this order' }
      ];
    case 'approved':
      return [
        { value: 'active', label: 'Mark as Paid', description: 'Order has been paid for' },
        { value: 'rejected', label: 'Reject Order', description: 'Decline this order' }
      ];
    case 'active':
      return [
        { value: 'delivered', label: 'Mark as Delivered', description: 'Product has been delivered' }
      ];
    case 'delivered':
      return [
        { value: 'fulfilled', label: 'Mark as Fulfilled', description: 'Order has been completed' }
      ];
    default:
      return [];
  }
}

export default StatusUpdateDialog;
