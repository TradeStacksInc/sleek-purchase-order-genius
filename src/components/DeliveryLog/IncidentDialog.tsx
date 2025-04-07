
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

// Make sure the schema matches the Incident type definition from src/types/index.ts
const incidentSchema = z.object({
  title: z.string().min(5, { message: 'Title is required and must be at least 5 characters' }),
  description: z.string().min(10, { message: 'Description is required and must be at least 10 characters' }),
  severity: z.enum(['low', 'medium', 'high']), // Remove 'critical' to match the Incident type
  location: z.string().min(3, { message: 'Location is required' }),
  type: z.enum(['delay', 'mechanical', 'accident', 'feedback', 'other']),
});

export interface IncidentDialogProps {
  children: React.ReactNode;
  orderId: string;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ children, orderId }) => {
  const { addIncident } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const form = useForm<z.infer<typeof incidentSchema>>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'medium',
      location: '',
      type: 'delay',
    },
  });

  const onSubmit = (data: z.infer<typeof incidentSchema>) => {
    const incident = {
      ...data,
      orderId,
      reportedAt: new Date(),
      status: 'open' as const, 
      reportedBy: 'Current User',
      staffInvolved: [], 
      description: data.description, // Explicitly include description to satisfy type requirements
      // Make sure all required fields from Incident type are included
      type: data.type,
    };
    
    addIncident(incident);
    
    toast({
      title: 'Incident Reported',
      description: 'The incident has been logged successfully.',
    });
    
    form.reset();
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report Incident
          </DialogTitle>
          <DialogDescription>
            Log delivery-related incidents, issues, or anomalies for this order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div>
            <Label htmlFor="title">Incident Title</Label>
            <Input 
              id="title"
              placeholder="Brief title for the incident"
              {...form.register('title')} 
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Controller
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      {/* Removed 'critical' option as it doesn't match the Incident type */}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.severity && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.severity.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                placeholder="Where did the incident occur?"
                {...form.register('location')} 
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="type">Incident Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delay">Delivery Delay</SelectItem>
                    <SelectItem value="mechanical">Mechanical Issue</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="feedback">Customer Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.type.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Detailed description of what happened"
              className="min-h-[100px]"
              {...form.register('description')} 
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Report Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;
