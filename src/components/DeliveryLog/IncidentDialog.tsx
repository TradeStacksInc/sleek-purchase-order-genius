
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';

const incidentFormSchema = z.object({
  type: z.enum(['delay', 'mechanical', 'accident', 'feedback', 'other'], {
    required_error: "Please select an incident type",
  }),
  description: z.string().min(5, "Description must be at least 5 characters"),
  impact: z.enum(['positive', 'negative', 'neutral'], {
    required_error: "Please select an impact level",
  }),
  reportedBy: z.string().min(2, "Name must be at least 2 characters"),
});

interface IncidentDialogProps {
  orderId: string;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({ orderId }) => {
  const { addIncident } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof incidentFormSchema>>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      type: 'feedback' as const,
      description: "",
      impact: 'neutral' as const,
      reportedBy: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof incidentFormSchema>) {
    const incidentData = {
      type: values.type,
      description: values.description,
      impact: values.impact,
      reportedBy: values.reportedBy,
    };
    
    addIncident(orderId, incidentData);
    setIsOpen(false);
    form.reset();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>
            Record any incidents or feedback related to this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="delay">Delay</SelectItem>
                        <SelectItem value="mechanical">Mechanical Issue</SelectItem>
                        <SelectItem value="accident">Accident</SelectItem>
                        <SelectItem value="feedback">Customer Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive (+)</SelectItem>
                        <SelectItem value="negative">Negative (-)</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Describe the incident or feedback"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reportedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Record Incident</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;
