
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
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  licenseNumber: z.string().min(3, { message: "License number is required." }),
  contact: z.string().min(5, { message: "Contact phone is required." }),
  address: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, { message: "Experience cannot be negative." }),
  isAvailable: z.boolean().default(true),
});

type DriverFormValues = z.infer<typeof formSchema>;

interface DriverFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DriverForm({ onSuccess, onCancel }: DriverFormProps) {
  const { toast } = useToast();
  const { addDriver } = useApp();
  
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      contact: "",
      address: "",
      yearsOfExperience: 0,
      isAvailable: true,
    },
  });

  const onSubmit = (values: DriverFormValues) => {
    try {
      const newDriver = addDriver({
        name: values.name,
        licenseNumber: values.licenseNumber,
        contact: values.contact,
        address: values.address || "",
        yearsOfExperience: values.yearsOfExperience,
        isAvailable: values.isAvailable
      });
      
      toast({
        title: "Driver created",
        description: `Successfully created driver ${values.name}.`,
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error creating driver",
        description: "Failed to create driver. Please try again.",
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter driver name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter license number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter driver address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  Driver is available for immediate assignment
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Create Driver</Button>
        </div>
      </form>
    </Form>
  );
}
