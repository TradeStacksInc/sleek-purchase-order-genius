
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Flag, AlertTriangle, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
    
    toast({
      title: "Incident reported",
      description: `The ${values.type} incident has been recorded successfully.`,
      variant: values.impact === 'negative' ? 'destructive' : 'default',
    });
  }
  
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <AlertCircle className="h-4 w-4 mr-2" />;
      case 'mechanical':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case 'accident':
        return <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      default:
        return <Flag className="h-4 w-4 mr-2" />;
    }
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="incident-button hover:bg-gray-100">
          <Flag className="h-4 w-4 mr-1" />
          Report Incident
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
                        <SelectItem value="delay" className="flex items-center">
                          <div className="flex items-center">
                            {getIncidentIcon('delay')}
                            <span>Delay</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mechanical" className="flex items-center">
                          <div className="flex items-center">
                            {getIncidentIcon('mechanical')}
                            <span>Mechanical Issue</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="accident" className="flex items-center">
                          <div className="flex items-center">
                            {getIncidentIcon('accident')}
                            <span>Accident</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feedback" className="flex items-center">
                          <div className="flex items-center">
                            {getIncidentIcon('feedback')}
                            <span>Customer Feedback</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="other" className="flex items-center">
                          <div className="flex items-center">
                            {getIncidentIcon('other')}
                            <span>Other</span>
                          </div>
                        </SelectItem>
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
                        <SelectItem value="positive" className="flex items-center">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                            <span>Positive (+)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="negative" className="flex items-center">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                            <span>Negative (-)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="neutral" className="flex items-center">
                          <div className="flex items-center">
                            <Flag className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Neutral</span>
                          </div>
                        </SelectItem>
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
                      className="min-h-[100px]"
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
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Record Incident</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;
