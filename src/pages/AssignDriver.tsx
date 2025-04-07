import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { Driver, PurchaseOrder, Truck } from '@/types';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  ArrowRight, 
  Truck as TruckIcon, 
  User, 
  Plus, 
  MapPin, 
  Info, 
  Check
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gpsFormSchema } from "@/schemas/gpsFormSchema";

const AssignDriver: React.FC = () => {
  const { 
    purchaseOrders, 
    drivers, 
    trucks, 
    addDriver, 
    addTruck, 
    assignDriverToOrder,
    tagTruckWithGPS,
    getAllDrivers,
    getAllTrucks,
    getTruckById
  } = useApp();
  
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState('');
  
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverContact, setNewDriverContact] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  
  const [newTruckPlate, setNewTruckPlate] = useState('');
  const [newTruckCapacity, setNewTruckCapacity] = useState('');
  const [newTruckModel, setNewTruckModel] = useState('');
  const [newTruckHasGPS, setNewTruckHasGPS] = useState('true');
  
  const [isGPSDialogOpen, setIsGPSDialogOpen] = useState(false);
  
  const eligibleOrders = purchaseOrders.filter(
    order => order.status === 'active' && !order.deliveryDetails?.driverId
  );
  
  const availableDrivers = drivers.filter(driver => driver.isAvailable);
  const availableTrucks = trucks.filter(truck => truck.isAvailable);
  
  const handleAssign = () => {
    if (!selectedOrderId || !selectedDriverId || !selectedTruckId) {
      toast({
        title: "Missing Information",
        description: "Please select an order, driver, and truck.",
        variant: "destructive"
      });
      return;
    }
    
    const selectedTruck = trucks.find(truck => truck.id === selectedTruckId);
    
    if (selectedTruck && selectedTruck.hasGPS && !selectedTruck.isGPSTagged) {
      setIsGPSDialogOpen(true);
      return;
    }
    
    completeAssignment();
  };

  const completeAssignment = () => {
    assignDriverToOrder(selectedOrderId, selectedDriverId, selectedTruckId);
    
    setSelectedOrderId('');
    setSelectedDriverId('');
    setSelectedTruckId('');
    setIsGPSDialogOpen(false);
    
    toast({
      title: "Driver Assigned",
      description: "Driver and truck have been successfully assigned to the order.",
    });
  };
  
  const handleAddDriver = () => {
    if (!newDriverName || !newDriverContact || !newDriverLicense) {
      toast({
        title: "Missing Information",
        description: "Please fill all driver details.",
        variant: "destructive"
      });
      return;
    }
    
    addDriver({
      name: newDriverName,
      contact: newDriverContact,
      licenseNumber: newDriverLicense,
      isAvailable: true
    });
    
    setNewDriverName('');
    setNewDriverContact('');
    setNewDriverLicense('');
    
    toast({
      title: "Driver Added",
      description: "New driver has been added successfully.",
    });
  };
  
  const handleAddTruck = () => {
    if (!newTruckPlate || !newTruckCapacity || !newTruckModel) {
      toast({
        title: "Missing Information",
        description: "Please fill all truck details.",
        variant: "destructive"
      });
      return;
    }
    
    addTruck({
      plateNumber: newTruckPlate,
      capacity: parseInt(newTruckCapacity),
      model: newTruckModel,
      hasGPS: newTruckHasGPS === 'true',
      isAvailable: true,
      isGPSTagged: false
    });
    
    setNewTruckPlate('');
    setNewTruckCapacity('');
    setNewTruckModel('');
    setNewTruckHasGPS('true');
    
    toast({
      title: "Truck Added",
      description: "New truck has been added successfully.",
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold">Driver & Truck Management</h1>
      
      <Tabs defaultValue="assign" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assign">Assign Driver</TabsTrigger>
          <TabsTrigger value="drivers">Add Driver</TabsTrigger>
          <TabsTrigger value="trucks">Add Truck</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Assign Driver to Order</CardTitle>
              <CardDescription>
                Assign a driver and truck to a paid purchase order for delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleOrders.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No eligible orders available for assignment</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders must be paid (active) and not already assigned
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="order">Purchase Order</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Select a paid purchase order to assign a driver and truck for delivery.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={selectedOrderId}
                        onValueChange={setSelectedOrderId}
                      >
                        <SelectTrigger id="order">
                          <SelectValue placeholder="Select a purchase order" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibleOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              PO #{order.poNumber || 'N/A'} - {order.supplier?.name || 'Unknown'} (₦{order.grandTotal?.toLocaleString() || '0'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {availableDrivers.length === 0 ? (
                      <div className="rounded-md bg-amber-50 p-4 mt-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <User className="h-5 w-5 text-amber-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">No available drivers</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <p>Add a new driver using the "Add Driver" tab.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="driver">Driver</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-80">Select an available driver to handle this delivery.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={selectedDriverId}
                          onValueChange={setSelectedDriverId}
                        >
                          <SelectTrigger id="driver">
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDrivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name} - {driver.contact || driver.contactPhone || 'No contact'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {availableTrucks.length === 0 ? (
                      <div className="rounded-md bg-amber-50 p-4 mt-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <TruckIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">No available trucks</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <p>Add a new truck using the "Add Truck" tab.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="truck">Truck</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-80">Select an available truck for this delivery. Trucks with GPS capability will require GPS tagging before transport.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={selectedTruckId}
                          onValueChange={setSelectedTruckId}
                        >
                          <SelectTrigger id="truck">
                            <SelectValue placeholder="Select a truck" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTrucks.map((truck) => (
                              <SelectItem key={truck.id} value={truck.id}>
                                {truck.plateNumber} - {truck.model} ({truck.capacity.toLocaleString()} liters)
                                {truck.hasGPS && !truck.isGPSTagged && " - GPS Tagging Required"}
                                {truck.hasGPS && truck.isGPSTagged && " - GPS Active"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleAssign}
                    disabled={!selectedOrderId || !selectedDriverId || !selectedTruckId}
                  >
                    Assign for Delivery
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Add New Driver</CardTitle>
              <CardDescription>
                Register a new driver in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="driverName">Driver Name</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the full name of the driver</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="driverName" 
                      placeholder="Full Name"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the driver's phone number</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="contactNumber" 
                      placeholder="+234 800-000-0000"
                      value={newDriverContact}
                      onChange={(e) => setNewDriverContact(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the driver's license number</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="licenseNumber" 
                      placeholder="DL-12345-NG"
                      value={newDriverLicense}
                      onChange={(e) => setNewDriverLicense(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleAddDriver}
                  disabled={!newDriverName || !newDriverContact || !newDriverLicense}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Driver
                </Button>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-4">Current Drivers ({drivers.length})</h3>
                  <div className="space-y-4">
                    {drivers.map((driver) => (
                      <DriverCard key={driver.id} driver={driver} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trucks">
          <Card>
            <CardHeader>
              <CardTitle>Add New Truck</CardTitle>
              <CardDescription>
                Register a new truck in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="plateNumber">Plate Number</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the truck's license plate number</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="plateNumber" 
                      placeholder="LG-234-KJA"
                      value={newTruckPlate}
                      onChange={(e) => setNewTruckPlate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="truckModel">Truck Model</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the truck's make and model</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="truckModel" 
                      placeholder="MAN Diesel 2018"
                      value={newTruckModel}
                      onChange={(e) => setNewTruckModel(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="capacity">Capacity (liters)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the maximum fuel capacity of the truck in liters</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="capacity" 
                      type="number"
                      placeholder="33000"
                      value={newTruckCapacity}
                      onChange={(e) => setNewTruckCapacity(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="hasGPS">GPS Capability</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Indicate whether this truck has GPS tracking capability</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={newTruckHasGPS}
                      onValueChange={setNewTruckHasGPS}
                    >
                      <SelectTrigger id="hasGPS">
                        <SelectValue placeholder="Does the truck have GPS?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes, GPS Enabled</SelectItem>
                        <SelectItem value="false">No GPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleAddTruck}
                  disabled={!newTruckPlate || !newTruckCapacity || !newTruckModel}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Truck
                </Button>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-4">Current Trucks ({trucks.length})</h3>
                  <div className="space-y-4">
                    {trucks.map((truck) => (
                      <TruckCard key={truck.id} truck={truck} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GPSTaggingDialog 
        isOpen={isGPSDialogOpen} 
        setIsOpen={setIsGPSDialogOpen} 
        truckId={selectedTruckId}
        onComplete={completeAssignment}
      />
    </div>
  );
};

const GPSTaggingDialog = ({ 
  isOpen, 
  setIsOpen, 
  truckId,
  onComplete 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
  truckId: string;
  onComplete: () => void;
}) => {
  const { tagTruckWithGPS, getTruckById } = useApp();
  const truck = truckId ? getTruckById(truckId) : undefined;
  
  const form = useForm({
    resolver: zodResolver(gpsFormSchema),
    defaultValues: {
      gpsDeviceId: "",
      latitude: 6.5244, // Default to Lagos, Nigeria
      longitude: 3.3792,
    },
  });

  const onSubmit = (values) => {
    if (truckId) {
      tagTruckWithGPS(
        truckId, 
        values.gpsDeviceId,
        values.latitude,
        values.longitude
      );
      
      toast({
        title: "GPS Tagged",
        description: "GPS device has been successfully tagged to the truck.",
      });
      
      setIsOpen(false);
      form.reset();
      onComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            GPS Tagging Required
          </DialogTitle>
          <DialogDescription>
            {truck ? `Tag truck ${truck.plateNumber} with a GPS device before assigning it to this order.` : 'Tag truck with a GPS device before assigning it to this order.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gpsDeviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS Device ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GPS device ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the unique identifier of the GPS tracking device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                Confirm GPS Tagging
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
        <div className="text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="font-medium">Important:</span>
          </div>
          <p>A GPS-tagged truck can be tracked in real-time during delivery and is required for marking a delivery "In Transit".</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{driver.name}</h4>
          <p className="text-sm text-muted-foreground">{driver.contact || driver.contactPhone || 'No contact'}</p>
          <p className="text-xs text-muted-foreground mt-1">License: {driver.licenseNumber}</p>
        </div>
        <div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            driver.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {driver.isAvailable ? 'Available' : 'On Delivery'}
          </span>
        </div>
      </div>
    </div>
  );
};

const TruckCard: React.FC<{ truck: Truck }> = ({ truck }) => {
  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{truck.plateNumber}</h4>
          <p className="text-sm text-muted-foreground">{truck.model}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Capacity: {truck.capacity.toLocaleString()} liters
            {truck.hasGPS && !truck.isGPSTagged && ' • GPS Ready'}
            {truck.hasGPS && truck.isGPSTagged && ' • GPS Active'}
            {!truck.hasGPS && ' • No GPS'}
          </p>
        </div>
        <div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            truck.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {truck.isAvailable ? 'Available' : 'On Delivery'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssignDriver;
