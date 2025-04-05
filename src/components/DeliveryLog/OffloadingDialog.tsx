
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Droplet, 
  Thermometer, 
  ClipboardCheck, 
  User, 
  Save, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowDown
} from 'lucide-react';
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
import { PurchaseOrder, OrderItem, Tank as TankType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

const offloadingFormSchema = z.object({
  tankId: z.string().min(1, "You must select a tank for offloading"),
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
  const { recordOffloadingDetails, getOrderById, getAllTanks, recordOffloadingToTank } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tank-selection');
  const [selectedTank, setSelectedTank] = useState<TankType | null>(null);
  const [waitingMode, setWaitingMode] = useState(false);
  const [waitStartTime, setWaitStartTime] = useState<Date | null>(null);
  const [waitDuration, setWaitDuration] = useState<number>(0);
  const [waitIntervalId, setWaitIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  // Get the purchase order details
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [productToOffload, setProductToOffload] = useState<string>('');
  const [volumeToOffload, setVolumeToOffload] = useState<number>(0);
  const [availableTanks, setAvailableTanks] = useState<TankType[]>([]);
  const [filteredTanks, setFilteredTanks] = useState<TankType[]>([]);
  
  // Load purchase order and tank data
  useEffect(() => {
    if (isOpen && orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setPurchaseOrder(order);
        
        // Find the product and volume to offload from the order items
        const totalVolumeByProduct: Record<string, number> = {};
        order.items.forEach((item: OrderItem) => {
          if (totalVolumeByProduct[item.product]) {
            totalVolumeByProduct[item.product] += item.quantity;
          } else {
            totalVolumeByProduct[item.product] = item.quantity;
          }
        });
        
        // For simplicity, we'll assume the first product in the order for now
        // In a real app, you'd want to handle multiple products
        if (order.items.length > 0) {
          setProductToOffload(order.items[0].product);
          setVolumeToOffload(order.items[0].quantity);
        }
      }
      
      // Load all tanks
      const tanks = getAllTanks();
      setAvailableTanks(tanks);
    }
    
    return () => {
      // Clean up wait timer if dialog closes
      if (waitIntervalId) {
        clearInterval(waitIntervalId);
      }
    };
  }, [isOpen, orderId, getOrderById, getAllTanks]);
  
  // Filter tanks by product type
  useEffect(() => {
    if (productToOffload) {
      const filtered = availableTanks.filter(tank => 
        tank.productType === productToOffload
      );
      setFilteredTanks(filtered);
    }
  }, [productToOffload, availableTanks]);
  
  const form = useForm<z.infer<typeof offloadingFormSchema>>({
    resolver: zodResolver(offloadingFormSchema),
    defaultValues: {
      tankId: '',
      loadedVolume: volumeToOffload,
      deliveredVolume: volumeToOffload,
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
  
  // Update form values when volume to offload changes
  useEffect(() => {
    form.setValue('loadedVolume', volumeToOffload);
    form.setValue('deliveredVolume', volumeToOffload);
  }, [volumeToOffload, form]);
  
  // Update form values when tank is selected
  useEffect(() => {
    if (selectedTank) {
      form.setValue('tankId', selectedTank.id);
      form.setValue('initialTankVolume', selectedTank.currentVolume);
      
      // Calculate final tank volume (initial + delivered)
      const deliveredVolume = form.getValues('deliveredVolume');
      const newFinalVolume = selectedTank.currentVolume + deliveredVolume;
      form.setValue('finalTankVolume', newFinalVolume);
    }
  }, [selectedTank, form]);
  
  // Handle tank selection
  const handleTankSelect = (tankId: string) => {
    const tank = availableTanks.find(t => t.id === tankId);
    if (tank) {
      setSelectedTank(tank);
      
      // Validate if tank has enough capacity
      const hasEnoughCapacity = tank.currentVolume + volumeToOffload <= tank.capacity;
      if (!hasEnoughCapacity) {
        toast({
          title: "Tank Capacity Warning",
          description: `This tank does not have enough capacity for the full volume. Available: ${tank.capacity - tank.currentVolume} liters, Required: ${volumeToOffload} liters.`,
          variant: "destructive"
        });
      }
      
      setActiveTab('details');
    }
  };
  
  // Start wait timer for tanks without sufficient capacity
  const startWaiting = () => {
    if (waitingMode) return;
    
    setWaitingMode(true);
    const startTime = new Date();
    setWaitStartTime(startTime);
    
    // Update wait duration every second
    const intervalId = setInterval(() => {
      const now = new Date();
      const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setWaitDuration(durationInSeconds);
    }, 1000);
    
    setWaitIntervalId(intervalId);
    
    toast({
      title: "Waiting for Tank Capacity",
      description: "The system will track waiting time until the tank has enough capacity.",
    });
  };
  
  // Stop wait timer
  const stopWaiting = () => {
    if (!waitingMode) return;
    
    if (waitIntervalId) {
      clearInterval(waitIntervalId);
      setWaitIntervalId(null);
    }
    
    setWaitingMode(false);
    
    // Add wait duration to notes
    const currentNotes = form.getValues('notes') || '';
    const waitTimeFormatted = formatDuration(waitDuration);
    const waitNote = `Truck waited for ${waitTimeFormatted} before offloading.`;
    form.setValue('notes', currentNotes ? `${currentNotes}\n${waitNote}` : waitNote);
    
    toast({
      title: "Waiting Complete",
      description: `Truck waited for ${waitTimeFormatted}. You can now proceed with offloading.`,
    });
  };
  
  // Format seconds to hours, minutes, seconds
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };
  
  // Check if tank is ready for offload
  const isTankReadyForOffload = (tank: TankType): boolean => {
    return tank.productType === productToOffload && 
           tank.currentVolume + volumeToOffload <= tank.capacity;
  };
  
  // Get tank capacity percentage
  const getTankCapacityPercentage = (tank: TankType): number => {
    return Math.round((tank.currentVolume / tank.capacity) * 100);
  };
  
  // Get tank available space
  const getTankAvailableSpace = (tank: TankType): number => {
    return tank.capacity - tank.currentVolume;
  };
  
  function onSubmit(values: z.infer<typeof offloadingFormSchema>) {
    if (!selectedTank) {
      toast({
        title: "Error",
        description: "Please select a tank before submitting",
        variant: "destructive"
      });
      return;
    }
    
    // Check if selected tank can accept the volume
    const canAcceptVolume = selectedTank.currentVolume + values.deliveredVolume <= selectedTank.capacity;
    if (!canAcceptVolume) {
      toast({
        title: "Tank Overflow Error",
        description: "The selected tank cannot accept this volume. Please reduce the volume or choose another tank.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First, record the offloading to the tank
      const updatedTank = recordOffloadingToTank(
        selectedTank.id,
        values.deliveredVolume,
        productToOffload
      );
      
      if (!updatedTank) {
        throw new Error("Failed to offload to tank");
      }
      
      // Then, record the offloading details for the purchase order
      const offloadingData = {
        loadedVolume: values.loadedVolume,
        deliveredVolume: values.deliveredVolume,
        initialTankVolume: values.initialTankVolume,
        finalTankVolume: updatedTank.currentVolume, // Use the actual updated volume
        measuredBy: values.measuredBy,
        measuredByRole: values.measuredByRole,
        notes: values.notes || '',
        // Additional fields
        productTemperature: values.productTemperature || 25,
        productDensity: values.productDensity || 0.85,
        measurementMethod: values.measurementMethod,
        weatherConditions: values.weatherConditions || 'Clear',
        siteConditions: values.siteConditions || 'Accessible',
        tankId: selectedTank.id
      };
      
      recordOffloadingDetails(orderId, offloadingData);
      
      toast({
        title: "Offloading Successful",
        description: `Successfully offloaded ${values.deliveredVolume} liters of ${productToOffload} into ${selectedTank.name}.`,
      });
      
      setIsOpen(false);
      form.reset();
      setSelectedTank(null);
      setWaitingMode(false);
      if (waitIntervalId) {
        clearInterval(waitIntervalId);
        setWaitIntervalId(null);
      }
    } catch (error) {
      toast({
        title: "Offloading Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
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
            Record Offload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconWithBackground icon={Truck} />
            Record Offloading Details
          </DialogTitle>
          <DialogDescription>
            {purchaseOrder ? (
              <div className="flex flex-col space-y-1">
                <span>PO: {purchaseOrder.poNumber} | Supplier: {purchaseOrder.supplier.name}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">{productToOffload}</Badge>
                  <span>{volumeToOffload.toLocaleString()} liters</span>
                </div>
              </div>
            ) : (
              "Loading purchase order details..."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tank-selection" className="flex items-center text-xs">
              <IconWithBackground icon={Database} color="bg-blue-100 text-blue-600" />
              <span>Tank Selection</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center text-xs" disabled={!selectedTank}>
              <IconWithBackground icon={Droplet} color="bg-green-100 text-green-600" />
              <span>Offload Details</span>
            </TabsTrigger>
            <TabsTrigger value="confirmation" className="flex items-center text-xs" disabled={!selectedTank}>
              <IconWithBackground icon={ClipboardCheck} color="bg-purple-100 text-purple-600" />
              <span>Confirmation</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[450px] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="tank-selection" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <IconWithBackground icon={Database} color="bg-blue-100 text-blue-600" />
                      Available Tanks for {productToOffload}
                    </h3>
                    
                    {filteredTanks.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredTanks.map((tank) => {
                          const isReady = isTankReadyForOffload(tank);
                          const capacityPercentage = getTankCapacityPercentage(tank);
                          const availableSpace = getTankAvailableSpace(tank);
                          
                          return (
                            <Card 
                              key={tank.id} 
                              className={`border-2 cursor-pointer hover:bg-muted/30 transition-colors ${
                                selectedTank?.id === tank.id 
                                  ? 'border-blue-500' 
                                  : isReady 
                                    ? 'border-green-200' 
                                    : 'border-amber-200'
                              }`}
                              onClick={() => handleTankSelect(tank.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`mr-3 p-2 rounded-full ${
                                      isReady ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                      {isReady ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{tank.name}</h4>
                                      <p className="text-sm text-muted-foreground">{tank.productType} Tank</p>
                                    </div>
                                  </div>
                                  
                                  <Badge variant={isReady ? "outline" : "secondary"}>
                                    {isReady ? "Ready for Offload" : "Not Ready"}
                                  </Badge>
                                </div>
                                
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Current Volume: {tank.currentVolume.toLocaleString()} L</span>
                                    <span>Capacity: {tank.capacity.toLocaleString()} L</span>
                                  </div>
                                  <Progress value={capacityPercentage} className="h-2" />
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-muted-foreground">{capacityPercentage}% Full</span>
                                    <span className="text-xs font-medium">
                                      Available: {availableSpace.toLocaleString()} L
                                    </span>
                                  </div>
                                  
                                  {!isReady && (
                                    <div className="mt-2 text-sm text-amber-600 flex items-center">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span>
                                        Not enough capacity for {volumeToOffload.toLocaleString()} L. 
                                        {availableSpace > 0 && ` Missing ${(volumeToOffload - availableSpace).toLocaleString()} L of space.`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : productToOffload ? (
                      <div className="text-center py-8 border rounded-md">
                        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-lg font-medium">No Compatible Tanks</h4>
                        <p className="text-muted-foreground">
                          There are no tanks available for {productToOffload}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <h4 className="text-lg font-medium">Loading Product Information</h4>
                        <p className="text-muted-foreground">
                          Please wait while we load product details from the purchase order
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTank && !isTankReadyForOffload(selectedTank) && (
                    <div className="border border-amber-200 bg-amber-50 p-4 rounded-md">
                      <h4 className="font-medium flex items-center mb-2">
                        <Clock className="h-5 w-5 text-amber-600 mr-2" />
                        Waiting Option
                      </h4>
                      <p className="text-sm mb-4">
                        This tank doesn't have enough capacity right now. You can wait until space becomes available 
                        (for example, as fuel is sold).
                      </p>
                      
                      {waitingMode ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Waiting since:</span>
                            <span>{waitStartTime ? format(waitStartTime, 'HH:mm:ss') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Wait duration:</span>
                            <span className="font-mono">{formatDuration(waitDuration)}</span>
                          </div>
                          <Button 
                            type="button" 
                            variant="default" 
                            onClick={stopWaiting} 
                            className="w-full"
                          >
                            Stop Waiting & Continue
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setActiveTab('tank-selection')} 
                            className="flex-1"
                          >
                            Choose Another Tank
                          </Button>
                          <Button 
                            type="button" 
                            variant="default" 
                            onClick={startWaiting} 
                            className="flex-1"
                          >
                            Start Waiting
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-0">
                  {selectedTank && (
                    <div className="mb-4 p-3 border rounded-md bg-muted/30">
                      <h4 className="font-medium mb-2">Selected Tank: {selectedTank.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Product:</span>
                          <Badge className="ml-2">{selectedTank.productType}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span>
                          <span className="ml-2 font-medium">{selectedTank.currentVolume.toLocaleString()} L</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="ml-2 font-medium">{selectedTank.capacity.toLocaleString()} L</span>
                        </div>
                      </div>
                      
                      {waitingMode && (
                        <div className="mt-2 pt-2 border-t flex items-center justify-between text-sm">
                          <span className="text-amber-600 flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> Waiting for capacity
                          </span>
                          <span className="font-mono">{formatDuration(waitDuration)}</span>
                        </div>
                      )}
                    </div>
                  )}
                
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
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Update final tank volume when delivered volume changes
                                  const newVolume = parseFloat(e.target.value);
                                  if (!isNaN(newVolume) && selectedTank) {
                                    form.setValue('finalTankVolume', selectedTank.currentVolume + newVolume);
                                  }
                                }}
                              />
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
                      <IconWithBackground icon={ArrowDown} color="bg-slate-100 text-slate-600" />
                      Tank Volumes
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="initialTankVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Tank Volume (L)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} disabled />
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
                              <Input type="number" {...field} disabled />
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
                
                <TabsContent value="confirmation" className="space-y-4 mt-0">
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
                            value={field.value}
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
                  
                  <div className="pt-4">
                    <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                      <h3 className="font-semibold">Offloading Summary</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Tank:</span>
                          <span>{selectedTank?.name || 'Not selected'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Product:</span>
                          <span>{productToOffload}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Delivered Volume:</span>
                          <span>{form.getValues('deliveredVolume')} L</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Final Tank Volume:</span>
                          <span>{form.getValues('finalTankVolume')} L</span>
                        </li>
                        {waitDuration > 0 && (
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Wait Duration:</span>
                            <span>{formatDuration(waitDuration)}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          <DialogFooter>
            <div className="flex w-full justify-between sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="gap-1"
              >
                Cancel
              </Button>

              <div className="flex gap-2">
                {activeTab !== 'tank-selection' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === 'details') {
                        setActiveTab('tank-selection');
                      } else if (activeTab === 'confirmation') {
                        setActiveTab('details');
                      }
                    }}
                  >
                    Back
                  </Button>
                )}

                {activeTab !== 'confirmation' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'tank-selection') {
                        if (!selectedTank) {
                          toast({
                            title: "Tank Required",
                            description: "Please select a tank before continuing",
                          });
                          return;
                        }
                        setActiveTab('details');
                      } else if (activeTab === 'details') {
                        setActiveTab('confirmation');
                      }
                    }}
                    disabled={(activeTab === 'tank-selection' && !selectedTank)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(onSubmit)}
                    className="gap-1"
                    disabled={!isTankReadyForOffload(selectedTank!) && !waitingMode}
                  >
                    <Save className="h-4 w-4" />
                    Complete Offload
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OffloadingDialog;
