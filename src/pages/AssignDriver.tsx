
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
import { ArrowRight, Plus, Truck as TruckIcon, User } from 'lucide-react';

const AssignDriver: React.FC = () => {
  const { 
    purchaseOrders, 
    drivers, 
    trucks, 
    addDriver, 
    addTruck, 
    assignDriverToOrder, 
    getAvailableDrivers, 
    getAvailableTrucks 
  } = useApp();
  
  // State for the assign tab
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState('');
  
  // State for the add driver tab
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverContact, setNewDriverContact] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  
  // State for the add truck tab
  const [newTruckPlate, setNewTruckPlate] = useState('');
  const [newTruckCapacity, setNewTruckCapacity] = useState('');
  const [newTruckModel, setNewTruckModel] = useState('');
  const [newTruckHasGPS, setNewTruckHasGPS] = useState('true');
  
  // Get only active (paid) orders that don't have a driver assigned
  const eligibleOrders = purchaseOrders.filter(
    order => order.status === 'active' && !order.deliveryDetails?.driverId
  );
  
  // Get available drivers and trucks
  const availableDrivers = getAvailableDrivers();
  const availableTrucks = getAvailableTrucks();
  
  // Handle assignment
  const handleAssign = () => {
    if (!selectedOrderId || !selectedDriverId || !selectedTruckId) {
      toast({
        title: "Missing Information",
        description: "Please select an order, driver, and truck.",
        variant: "destructive"
      });
      return;
    }
    
    assignDriverToOrder(selectedOrderId, selectedDriverId, selectedTruckId);
    
    // Reset form
    setSelectedOrderId('');
    setSelectedDriverId('');
    setSelectedTruckId('');
  };
  
  // Handle add driver
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
    
    // Reset form
    setNewDriverName('');
    setNewDriverContact('');
    setNewDriverLicense('');
  };
  
  // Handle add truck
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
      isAvailable: true
    });
    
    // Reset form
    setNewTruckPlate('');
    setNewTruckCapacity('');
    setNewTruckModel('');
    setNewTruckHasGPS('true');
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
                      <Label htmlFor="order">Purchase Order</Label>
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
                              PO #{order.poNumber} - {order.supplier.name} (₦{order.grandTotal.toLocaleString()})
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
                        <Label htmlFor="driver">Driver</Label>
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
                                {driver.name} - {driver.contact}
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
                        <Label htmlFor="truck">Truck</Label>
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
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input 
                      id="driverName" 
                      placeholder="Full Name"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input 
                      id="contactNumber" 
                      placeholder="+234 800-000-0000"
                      value={newDriverContact}
                      onChange={(e) => setNewDriverContact(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
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
                    <Label htmlFor="plateNumber">Plate Number</Label>
                    <Input 
                      id="plateNumber" 
                      placeholder="LG-234-KJA"
                      value={newTruckPlate}
                      onChange={(e) => setNewTruckPlate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="truckModel">Truck Model</Label>
                    <Input 
                      id="truckModel" 
                      placeholder="MAN Diesel 2018"
                      value={newTruckModel}
                      onChange={(e) => setNewTruckModel(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (liters)</Label>
                    <Input 
                      id="capacity" 
                      type="number"
                      placeholder="33000"
                      value={newTruckCapacity}
                      onChange={(e) => setNewTruckCapacity(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hasGPS">GPS Tracking</Label>
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
    </div>
  );
};

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{driver.name}</h4>
          <p className="text-sm text-muted-foreground">{driver.contact}</p>
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
            {truck.hasGPS && ' • GPS Enabled'}
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
