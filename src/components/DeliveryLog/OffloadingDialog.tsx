
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';

const offloadingFormSchema = z.object({
  loadedVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  deliveredVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  initialTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  finalTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  measuredBy: z.string().min(2, "Name must be at least 2 characters"),
  measuredByRole: z.string().min(2, "Role must be at least 2 characters"),
  notes: z.string().optional(),
});

interface OffloadingDialogProps {
  orderId: string;
}

const OffloadingDialog: React.FC<OffloadingDialogProps> = ({ orderId }) => {
  const { recordOffloadingDetails } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof offloadingFormSchema>>({
    resolver: zodResolver(offloadingFormSchema),
    defaultValues: {
      loadedVolume: 0,
      deliveredVolume: 0,
      initialTankVolume: 0,
      finalTankVolume: 0,
      measuredBy: "",
      measuredByRole: "",
      notes: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof offloadingFormSchema>) {
    const offloadingData = {
      loadedVolume: values.loadedVolume,
      deliveredVolume: values.deliveredVolume,
      initialTankVolume: values.initialTankVolume,
      finalTankVolume: values.finalTankVolume,
      measuredBy: values.measuredBy,
      measuredByRole: values.measuredByRole,
      notes: values.notes || '',
    };
    
    recordOffloadingDetails(orderId, offloadingData);
    setIsOpen(false);
    form.reset();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="h-4 w-4 mr-2" />
          Offload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Offloading Details</DialogTitle>
          <DialogDescription>
            Enter the offloading details to complete the delivery record.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loadedVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loaded Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Volume loaded at depot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveredVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivered Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Volume offloaded at destination
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialTankVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Tank Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tank volume before offloading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="finalTankVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Tank Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tank volume after offloading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="measuredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measured By</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of staff who measured
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="measuredByRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Position of the staff
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Add any relevant notes about the offloading process"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Offloading Details</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OffloadingDialog;
