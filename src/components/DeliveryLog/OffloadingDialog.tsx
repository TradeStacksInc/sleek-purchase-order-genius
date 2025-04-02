
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Truck, Droplet, Thermometer, ClipboardCheck, User, Save } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const offloadingFormSchema = z.object({
  loadedVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  deliveredVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  initialTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  finalTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  productTemperature: z.coerce.number().min(-50, "Temperature too low").max(150, "Temperature too high").optional(),
  productDensity: z.coerce.number().min(0.5, "Density too low").max(2, "Density too high").optional(),
  measuredBy: z.string().min(2, "Name must be at least 2 characters"),
  measuredByRole: z.string().min(2, "Role must be at least 2 characters"),
  measurementMethod: z.enum(['dipstick', 'flowmeter', 'weighbridge', 'other'], {
    required_error: "Please select a measurement method",
  }).default('dipstick'),
  weatherConditions: z.string().optional(),
  siteConditions: z.string().optional(),
  notes: z.string().optional(),
});

interface OffloadingDialogProps {
  orderId: string;
  children?: React.ReactNode;
}

const OffloadingDialog: React.FC<OffloadingDialogProps> = ({ orderId, children }) => {
  const { recordOffloadingDetails } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const form = useForm<z.infer<typeof offloadingFormSchema>>({
    resolver: zodResolver(offloadingFormSchema),
    defaultValues: {
      loadedVolume: 0,
      deliveredVolume: 0,
      initialTankVolume: 0,
      finalTankVolume: 0,
      productTemperature: 25,
      productDensity: 0.85,
      measuredBy: "",
      measuredByRole: "",
      measurementMethod: 'dipstick',
      weatherConditions: "Clear",
      siteConditions: "Accessible",
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
      // Additional fields
      productTemperature: values.productTemperature || 25,
      productDensity: values.productDensity || 0.85,
      measurementMethod: values.measurementMethod,
      weatherConditions: values.weatherConditions || 'Clear',
      siteConditions: values.siteConditions || 'Accessible',
    };
    
    recordOffloadingDetails(orderId, offloadingData);
    setIsOpen(false);
    form.reset();
  }

  // Styled icon with rounded background
  const IconWithBackground = ({ icon: Icon, color = 'bg-blue-100 text-blue-600' }: 
    { icon: React.ElementType, color?: string }) => (
    <div className={`rounded-full p-1.5 ${color} flex items-center justify-center mr-2`}>
      <Icon className="h-4 w-4" />
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center">
            <IconWithBackground icon={Truck} />
            Offload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconWithBackground icon={Truck} />
            Record Offloading Details
          </DialogTitle>
          <DialogDescription>
            Enter the offloading details to complete the delivery record.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center text-xs">
              <IconWithBackground icon={Droplet} color="bg-green-100 text-green-600" />
              <span>Primary Details</span>
            </TabsTrigger>
            <TabsTrigger value="measurements" className="flex items-center text-xs">
              <IconWithBackground icon={Thermometer} color="bg-amber-100 text-amber-600" />
              <span>Measurements</span>
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center text-xs">
              <IconWithBackground icon={ClipboardCheck} color="bg-purple-100 text-purple-600" />
              <span>Conditions</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="details" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={Droplet} color="bg-blue-100 text-blue-600" />
                      Volume Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={Truck} color="bg-slate-100 text-slate-600" />
                      Tank Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
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
                              Before offloading
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
                              After offloading
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="measurements" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={Thermometer} color="bg-amber-100 text-amber-600" />
                      Product Properties
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productTemperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="productDensity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Density (kg/L)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={ClipboardCheck} color="bg-green-100 text-green-600" />
                      Measurement Method
                    </h3>
                    <FormField
                      control={form.control}
                      name="measurementMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Method Used</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select measurement method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dipstick">Dipstick</SelectItem>
                              <SelectItem value="flowmeter">Flow Meter</SelectItem>
                              <SelectItem value="weighbridge">Weighbridge</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={User} color="bg-purple-100 text-purple-600" />
                      Measurement Personnel
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="measuredBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measured By</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="conditions" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={ClipboardCheck} color="bg-blue-100 text-blue-600" />
                      Site Conditions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weatherConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weather</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select weather" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Clear">Clear</SelectItem>
                                <SelectItem value="Cloudy">Cloudy</SelectItem>
                                <SelectItem value="Rain">Rain</SelectItem>
                                <SelectItem value="Storm">Storm</SelectItem>
                                <SelectItem value="Extreme Heat">Extreme Heat</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="siteConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Access</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select site condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Accessible">Easily Accessible</SelectItem>
                                <SelectItem value="Limited Access">Limited Access</SelectItem>
                                <SelectItem value="Difficult">Difficult Terrain</SelectItem>
                                <SelectItem value="Construction">Construction Ongoing</SelectItem>
                                <SelectItem value="Security Issues">Security Issues</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center">
                      <IconWithBackground icon={ClipboardCheck} color="bg-slate-100 text-slate-600" />
                      Additional Notes
                    </h3>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field}
                              placeholder="Add any relevant notes about the offloading process"
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Include any issues, exceptions or special circumstances
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </form>
            </Form>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="gap-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              Save Details
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OffloadingDialog;
