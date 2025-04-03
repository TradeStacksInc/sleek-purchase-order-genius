
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (
    status: OrderStatus, 
    notes?: string,
    approvedBy?: string,
    rejectionReason?: string
  ) => void;
  currentStatus: OrderStatus;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onClose,
  onStatusUpdate,
  currentStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusUpdate(
      selectedStatus, 
      notes, 
      selectedStatus === 'approved' ? approvedBy : undefined,
      selectedStatus === 'rejected' ? rejectionReason : undefined
    );
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Purchase Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this purchase order
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <RadioGroup value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved">Approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected">Rejected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Active (Paid)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivered" id="delivered" />
                <Label htmlFor="delivered">Delivered</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fulfilled" id="fulfilled" />
                <Label htmlFor="fulfilled">Fulfilled</Label>
              </div>
            </RadioGroup>
            
            {selectedStatus === 'approved' && (
              <div className="space-y-2">
                <Label htmlFor="approvedBy">Approved By</Label>
                <Input
                  id="approvedBy"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  placeholder="Name of approver"
                />
              </div>
            )}
            
            {selectedStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  rows={3}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add additional information"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
