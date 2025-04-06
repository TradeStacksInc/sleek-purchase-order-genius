
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Incident } from '@/types';

interface IncidentDialogProps {
  children: React.ReactNode;
  orderDetails?: { id: string; poNumber: string } | null;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ children, orderDetails }) => {
  const { addIncident } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  
  const handleSubmit = () => {
    if (!title || !description || !category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all the required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newIncident: Omit<Incident, 'id'> = {
        type: category as 'delay' | 'mechanical' | 'accident' | 'feedback' | 'other',
        description,
        timestamp: new Date(),
        reportedBy: 'Admin',
        severity,
        status: 'open',
        location: 'On site',
        staffInvolved: []
      };
      
      addIncident(newIncident);
      
      setOpen(false);
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setCategory('');
      
      toast({
        title: 'Incident Reported',
        description: 'The incident has been recorded successfully.',
      });
    } catch (error) {
      console.error('Error adding incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to report the incident. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report Incident
          </DialogTitle>
          <DialogDescription>
            {orderDetails
              ? `Reporting an incident related to PO #${orderDetails.poNumber}`
              : 'Report a new incident or issue'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title describing the incident"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(value: 'low' | 'medium' | 'high') => setSeverity(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery Issue</SelectItem>
                  <SelectItem value="quality">Quality Issue</SelectItem>
                  <SelectItem value="quantity">Quantity Discrepancy</SelectItem>
                  <SelectItem value="documentation">Documentation Issue</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Detailed description of the incident, including what happened, when, and any immediate actions taken"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Report Incident</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;
