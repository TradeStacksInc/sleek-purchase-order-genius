
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';

const formSchema = z.object({
  plateNumber: z.string().min(2, { message: "Plate number is required." }),
  model: z.string().min(2, { message: "Model is required." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  year: z.coerce.number().min(1990, { message: "Year must be at least 1990." }).max(new Date().getFullYear(), { message: "Year cannot be in the future." }),
  isAvailable: z.boolean().default(true),
  hasGPS: z.boolean().default(false),
});

type TruckFormValues = z.infer<typeof formSchema>;

interface TruckFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TruckForm({ onSuccess, onCancel }: TruckFormProps) {
  const { toast } = useToast();
  const { addTruck } = useApp();
  
  const form = useForm<TruckFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNumber: "",
      model: "",
      capacity: 33000, // Default tanker capacity in liters
      year: new Date().getFullYear(),
      isAvailable: true,
      hasGPS: false,
    },
  });

  const onSubmit = (values: TruckFormValues) => {
    try {
      const newTruck = addTruck({
        plateNumber: values.plateNumber,
        model: values.model,
        capacity: values.capacity,
        year: values.year,
        isAvailable: values.isAvailable,
        hasGPS: values.hasGPS,
      });
      
      toast({
        title: "Truck created",
        description: `Successfully created truck with plate number ${values.plateNumber}.`,
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error creating truck",
        description: "Failed to create truck. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plate Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter plate number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Enter truck model" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Liters)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Available for Assignment</FormLabel>
                  <FormDescription>
                    Truck is available for immediate assignment
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hasGPS"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Has GPS Device</FormLabel>
                  <FormDescription>
                    Truck has GPS tracking capability
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Create Truck</Button>
        </div>
      </form>
    </Form>
  );
}
