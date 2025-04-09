import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GPSData, Truck, Driver, PurchaseOrder } from '@/types';
import { format } from 'date-fns';
import { Circle, CheckCircle, AlertTriangle, MapPin, Map, Plus, UserPlus, TruckIcon, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gpsFormSchema } from '@/schemas/gpsFormSchema';
import { DriverForm } from '@/components/Forms/DriverForm';
import { TruckForm } from '@/components/Forms/TruckForm';
import { useActivityLogger } from '@/hooks/useActivityLogger';

const AssignDriver: React.FC = () => {
  const { 
    trucks, 
    drivers,
    purchaseOrders,
    getAvailableTrucks, 
    getAvailableDrivers, 
    updateTruck, 
    updateDriver,
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks,
    getGPSDataForTruck,
    updateGPSData,
    updateOrderStatus,
    assignDriverToDelivery,
    assignTruckToDelivery,
    updatePurchaseOrder
  } = useApp();
  
  const { logUserAction } = useActivityLogger();
  const navigate = useNavigate();
  
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [truckDetailsOpen, setTruckDetailsOpen] = useState(false);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [gpsModalOpen, setGPSModalOpen] = useState(false);
  const [assignToPOOpen, setAssignToPOOpen] = useState(false);
  const [gpsData, setGpsData] = useState<GPSData[]>([]);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of useEffect
  
  const availableTrucks = getAvailableTrucks();
  const availableDrivers = getAvailableDrivers();
  const nonGPSTrucks = getNonGPSTrucks();
  
  // Get pending POs that need driver/truck assignment
  const pendingPurchaseOrders = purchaseOrders.filter(po => 
    po.status === 'active' && 
    (!po.deliveryDetails?.driverId || !po.deliveryDetails?.truckId)
  );
  
  const refreshData = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  useEffect(() => {
    if (selectedTruck) {
      const gps = getGPSDataForTruck(selectedTruck, 5);
      setGpsData(gps);
    }
  }, [selectedTruck, getGPSDataForTruck, refreshKey]);

  const handleTruckSelection = (truckId: string) => {
    setSelectedTruck(truckId);
    setTruckDetailsOpen(true);
  };

  const handleDriverSelection = (driverId: string) => {
    setSelectedDriver(driverId);
    setDriverDetailsOpen(true);
  };

  const handlePOSelection = (poId: string) => {
    setSelectedPO(poId);
    setAssignToPOOpen(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedTruck || !selectedDriver) {
      toast({
        title: "Error",
        description: "Please select both a truck and a driver.",
        variant: "destructive",
      });
      return;
    }

    const truck = trucks.find(truck => truck.id === selectedTruck);
    const driver = drivers.find(driver => driver.id === selectedDriver);

    if (!truck || !driver) {
      toast({
        title: "Error",
        description: "Selected truck or driver not found.",
        variant: "destructive",
      });
      return;
    }

    // Update truck
    const truckUpdateSuccess = await updateTruck(selectedTruck, { isAvailable: false, driverId: selectedDriver });
    const driverUpdateSuccess = await updateDriver(selectedDriver, { isAvailable: false, currentTruckId: selectedTruck });

    if (truckUpdateSuccess && driverUpdateSuccess) {
      logUserAction('assign', 'truck_driver', `${truck.id}_${driver.id}`, 
        `Driver ${driver.name} assigned to truck ${truck.plateNumber}`);
      
      toast({
        title: "Driver Assigned",
        description: `Driver ${driver.name} has been assigned to truck ${truck.plateNumber}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign driver. Please try again.",
        variant: "destructive",
      });
    }

    setTruckDetailsOpen(false);
    setDriverDetailsOpen(false);
    setSelectedTruck(null);
    setSelectedDriver(null);
  };

  const handleAssignToPO = async () => {
    if (!selectedPO || !selectedDriver || !selectedTruck) {
      toast({
        title: "Error",
        description: "Please select a purchase order, driver, and truck for assignment.",
        variant: "destructive",
      });
      return;
    }

    const po = purchaseOrders.find(order => order.id === selectedPO);
    const driver = drivers.find(driver => driver.id === selectedDriver);
    const truck = trucks.find(truck => truck.id === selectedTruck);

    if (!po || !driver || !truck) {
      toast({
        title: "Error",
        description: "Selected items not found.",
        variant: "destructive",
      });
      return;
    }

    // First assign the driver to the truck if not already assigned
    if (truck.driverId !== driver.id) {
      await handleAssignDriver();
    }

    // Now assign to PO
    const driverAssignSuccess = await assignDriverToDelivery(selectedPO, selectedDriver);
    const truckAssignSuccess = await assignTruckToDelivery(selectedPO, selectedTruck);

    if (driverAssignSuccess && truckAssignSuccess) {
      logUserAction('assign', 'delivery', po.id, 
        `Driver ${driver.name} with truck ${truck.plateNumber} assigned to PO ${po.poNumber}`);
      
      toast({
        title: "Assignment Complete",
        description: `Driver and truck successfully assigned to purchase order ${po.poNumber}.`,
      });

      setAssignToPOOpen(false);
      setSelectedPO(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to complete assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartDelivery = async (poId: string) => {
    if (!poId) return;
    
    const po = purchaseOrders.find(order => order.id === poId);
    if (!po || !po.deliveryDetails?.driverId || !po.deliveryDetails?.truckId) {
      toast({
        title: "Error",
        description: "Purchase order must have both a driver and truck assigned before delivery can start.",
        variant: "destructive",
      });
      return;
    }
    
    // Update the delivery status to in_transit
    const success = await updateDeliveryStatus(poId, 'in_transit');
    
    if (success) {
      logUserAction('start', 'delivery', poId, 
        `Delivery started for PO ${po.poNumber}`);
      
      toast({
        title: "Delivery Started",
        description: `Delivery for purchase order ${po.poNumber} has been started.`,
      });
      refreshData();
    }
  };
  
  const updateDeliveryStatus = async (poId: string, status: 'pending' | 'in_transit' | 'delivered') => {
    try {
      let updatedOrder: PurchaseOrder | undefined;
      setPurchaseOrders(prev =>
        prev.map(order => {
          if (order.id === poId) {
            updatedOrder = {
              ...order,
              deliveryDetails: {
                ...order.deliveryDetails,
                status: status
              }
            };
            return updatedOrder;
          }
          return order;
        })
      );

      if (!updatedOrder) {
        toast({
          title: "Error",
          description: "Failed to update delivery status. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      logUserAction('update', 'delivery', poId, `Delivery status updated to ${status}`);

      return true;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUnassignDriver = async () => {
    if (!selectedTruck) {
      toast({
        title: "Error",
        description: "Please select a truck to unassign the driver.",
        variant: "destructive",
      });
      return;
    }

    const truck = trucks.find(truck => truck.id === selectedTruck);
    if (!truck || !truck.driverId) {
      toast({
        title: "Error",
        description: "No driver assigned to the selected truck.",
        variant: "destructive",
      });
      return;
    }

    const driverId = truck.driverId;
    const driver = drivers.find(d => d.id === driverId);

    // Update truck
    const truckUpdateSuccess = await updateTruck(selectedTruck, { isAvailable: true, driverId: null });
    const driverUpdateSuccess = await updateDriver(driverId, { isAvailable: true, currentTruckId: null });

    if (truckUpdateSuccess && driverUpdateSuccess && driver) {
      logUserAction('unassign', 'truck_driver', `${truck.id}_${driverId}`, 
        `Driver ${driver.name} unassigned from truck ${truck.plateNumber}`);
        
      toast({
        title: "Driver Unassigned",
        description: `Driver has been unassigned from truck ${truck.plateNumber}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to unassign driver. Please try again.",
        variant: "destructive",
      });
    }

    setTruckDetailsOpen(false);
    setSelectedTruck(null);
    setSelectedDriver(null);
  };

  const handleToggleGPS = async (truckId: string) => {
    const truck = trucks.find(truck => truck.id === truckId);
    if (!truck) return;
    
    if (truck.isGPSTagged) {
      const success = untagTruckGPS(truckId);
      if (success) {
        toast({
          title: "GPS Device Untagged",
          description: `GPS device has been successfully untagged from truck ${truck.plateNumber}.`,
        });
        refreshData();
      } else {
        toast({
          title: "Error",
          description: "Failed to untag GPS device. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setSelectedTruck(truckId);
      setGPSModalOpen(true);
    }
  };

  const form = useForm<z.infer<typeof gpsFormSchema>>({
    resolver: zodResolver(gpsFormSchema),
    defaultValues: {
      gpsDeviceId: "",
      latitude: 6.5244,
      longitude: 3.3792,
    },
  });

  const handleAddGPSDevice = useCallback((data: any) => {
    const success = tagTruckWithGPS(selectedTruck, data.gpsDeviceId);
    
    if (success) {
      toast({
        title: "GPS Device Tagged",
        description: `GPS device has been successfully tagged to truck.`,
      });
      setGPSModalOpen(false);
      refreshData();
    } else {
      toast({
        title: "Error",
        description: "Failed to tag GPS device. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedTruck, tagTruckWithGPS, toast, refreshData]);

  const handleUpdateGPSData = () => {
    if (!selectedTruck) return;

    // Mock GPS data update
    const latitude = 6.5244 + (Math.random() - 0.5) * 0.01;
    const longitude = 3.3792 + (Math.random() - 0.5) * 0.01;
    const speed = Math.floor(Math.random() * 100);

    updateGPSData(selectedTruck, latitude, longitude, speed);

    toast({
      title: "GPS Data Updated",
      description: `GPS data for truck has been updated.`,
    });
  };

  const toggleAutoUpdate = () => {
    setIsAutoUpdateEnabled(prev => {
      const newValue = !prev;

      if (newValue) {
        // Start auto-update
        setAutoUpdateInterval(setInterval(handleUpdateGPSData, 5000));
      } else {
        // Stop auto-update
        if (autoUpdateInterval) {
          clearInterval(autoUpdateInterval);
          setAutoUpdateInterval(null);
        }
      }

      return newValue;
    });
  };

  const handleAddDriverSuccess = () => {
    setIsAddDriverOpen(false);
    refreshData();
    toast({
      title: "Driver Added",
      description: "New driver has been successfully added to the system.",
    });
  };

  const handleAddTruckSuccess = () => {
    setIsAddTruckOpen(false);
    refreshData();
    toast({
      title: "Truck Added",
      description: "New truck has been successfully added to the system.",
    });
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PPP');
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'p');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Driver & Truck Assignment</h1>
        <div className="flex items-center gap-2">
          <Sheet open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
            <SheetTrigger asChild>
              <Button className="flex gap-2">
                <UserPlus className="w-4 h-4" />
                Add Driver
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add New Driver</SheetTitle>
                <SheetDescription>
                  Create a new driver record in the system
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <DriverForm onSuccess={handleAddDriverSuccess} onCancel={() => setIsAddDriverOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet open={isAddTruckOpen} onOpenChange={setIsAddTruckOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <TruckIcon className="w-4 h-4" />
                Add Truck
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add New Truck</SheetTitle>
                <SheetDescription>
                  Create a new truck record in the system
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TruckForm onSuccess={handleAddTruckSuccess} onCancel={() => setIsAddTruckOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Pending Purchase Orders Section */}
      {pendingPurchaseOrders.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Purchase Orders</CardTitle>
            <CardDescription>Purchase orders requiring driver and truck assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPurchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{formatDate(po.createdAt)}</TableCell>
                      <TableCell>{po.supplier?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePOSelection(po.id)}
                        >
                          Assign Driver & Truck
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="drivers">
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="drivers">Available Drivers</TabsTrigger>
          <TabsTrigger value="trucks">Available Trucks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drivers" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
              <CardDescription>Select a driver to view details and assign to a truck</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead className="text-right">Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableDrivers.map((driver) => (
                      <TableRow key={driver.id} onClick={() => handleDriverSelection(driver.id)} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.licenseNumber}</TableCell>
                        <TableCell className="text-right">{driver.yearsOfExperience} years</TableCell>
                      </TableRow>
                    ))}
                    {availableDrivers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No available drivers. Add a driver to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trucks" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Available Trucks</CardTitle>
              <CardDescription>Select a truck to view details and assign a driver</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Capacity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableTrucks.map((truck) => (
                      <TableRow key={truck.id} onClick={() => handleTruckSelection(truck.id)} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{truck.plateNumber}</TableCell>
                        <TableCell>{truck.model}</TableCell>
                        <TableCell className="text-right">{truck.capacity} L</TableCell>
                      </TableRow>
                    ))}
                    {availableTrucks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No available trucks. Add a truck to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Truck Details Modal */}
      {truckDetailsOpen && selectedTruck && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Truck Details</CardTitle>
            <CardDescription>Information about the selected truck</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {trucks.filter(truck => truck.id === selectedTruck).map(truck => (
              <div key={truck.id} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Plate Number</h3>
                    <p className="text-lg font-semibold">{truck.plateNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
                    <p className="text-lg font-semibold">{truck.model}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                    <p className="text-lg font-semibold">{truck.capacity} L</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-lg font-semibold">{truck.isAvailable ? 'Available' : 'Assigned'}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">GPS Tagged</h3>
                    <p className="text-lg font-semibold">
                      {truck.isGPSTagged ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          Tagged
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          Not Tagged
                        </span>
                      )}
                    </p>
                  </div>
                  {truck.isGPSTagged && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">GPS Device ID</h3>
                      <p className="text-lg font-semibold">{truck.gpsDeviceId}</p>
                    </div>
                  )}
                </div>
                
                {truck.driverId && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Assigned Driver</h3>
                      {drivers.filter(driver => driver.id === truck.driverId).map(driver => (
                        <div key={driver.id} className="space-y-1">
                          <p className="text-lg font-semibold">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.licenseNumber}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setTruckDetailsOpen(false)}>
                    Close
                  </Button>
                  
                  {truck.isAvailable ? (
                    <Button onClick={handleAssignDriver} disabled={!selectedDriver}>
                      Assign Driver
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleUnassignDriver}>
                      Unassign Driver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Driver Details Modal */}
      {driverDetailsOpen && selectedDriver && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Driver Details</CardTitle>
            <CardDescription>Information about the selected driver</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {drivers.filter(driver => driver.id === selectedDriver).map(driver => (
              <div key={driver.id} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p className="text-lg font-semibold">{driver.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">License Number</h3>
                    <p className="text-lg font-semibold">{driver.licenseNumber}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Years of Experience</h3>
                    <p className="text-lg font-semibold">{driver.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-lg font-semibold">{driver.isAvailable ? 'Available' : 'Assigned'}</p>
                  </div>
                </div>
                
                {driver.currentTruckId && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Assigned Truck</h3>
                      {trucks.filter(truck => truck.id === driver.currentTruckId).map(truck => (
                        <div key={truck.id} className="space-y-1">
                          <p className="text-lg font-semibold">{truck.plateNumber}</p>
                          <p className="text-sm text-muted-foreground">{truck.model}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setDriverDetailsOpen(false)}>
                    Close
                  </Button>
                  
                  {driver.isAvailable ? (
                    <Button onClick={handleAssignDriver} disabled={!selectedTruck}>
                      Assign to Truck
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleUnassignDriver} disabled={!selectedTruck}>
                      Unassign from Truck
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* GPS Management Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>GPS Management</CardTitle>
          <CardDescription>Tag and manage GPS devices for your trucks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Truck</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedTruck ? trucks.find(truck => truck.id === selectedTruck)?.plateNumber : "Select Truck"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {nonGPSTrucks.map(truck => (
                    <DropdownMenuItem key={truck.id} onClick={() => setSelectedTruck(truck.id)}>
                      {truck.plateNumber} - {truck.model}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (selectedTruck) {
                      handleToggleGPS(selectedTruck);
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select a truck first.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!selectedTruck}
                >
                  {trucks.find(truck => truck.id === selectedTruck)?.isGPSTagged ? 'Untag GPS' : 'Tag GPS'}
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (selectedTruck) {
                      navigate(`/truck-gps-history/${selectedTruck}`);
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select a truck first.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!selectedTruck}
                >
                  View GPS History
                </Button>
              </div>
            </div>
          </div>
          
          {selectedTruck && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Recent GPS Data</h3>
                <ScrollArea className="h-[200px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Latitude</TableHead>
                        <TableHead>Longitude</TableHead>
                        <TableHead>Speed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gpsData.map(data => (
                        <TableRow key={data.id}>
                          <TableCell>{formatTime(data.timestamp)}</TableCell>
                          <TableCell>{data.latitude.toFixed(4)}</TableCell>
                          <TableCell>{data.longitude.toFixed(4)}</TableCell>
                          <TableCell>{data.speed} km/h</TableCell>
                        </TableRow>
                      ))}
                      {gpsData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No GPS data available for this truck.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-x-2 flex items-center">
                  <Label htmlFor="auto-update">Auto Update</Label>
                  <Switch id="auto-update" checked={isAutoUpdateEnabled} onCheckedChange={toggleAutoUpdate} />
                </div>
                
                <Button onClick={handleUpdateGPSData} disabled={isAutoUpdateEnabled}>
                  Update GPS Data
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* GPS Device Modal */}
      <AlertDialog open={gpsModalOpen} onOpenChange={setGPSModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tag GPS Device</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the GPS device ID to tag to the selected truck.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(handleAddGPSDevice)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="gpsDeviceId">GPS Device ID</Label>
                <Input
                  id="gpsDeviceId"
                  placeholder="Enter GPS Device ID"
                  {...form.register("gpsDeviceId")}
                />
                {form.formState.errors.gpsDeviceId && (
                  <p className="text-sm text-red-500">{form.formState.errors.gpsDeviceId.message}</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit">Tag Device</Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Purchase Order Assignment Dialog */}
      <Dialog open={assignToPOOpen} onOpenChange={setAssignToPOOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Driver & Truck to Purchase Order</DialogTitle>
            <DialogDescription>
              Select a driver and truck to assign to this purchase order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPO && (
            <div className="grid gap-4 py-4">
              {purchaseOrders.filter(po => po.id === selectedPO).map(po => (
                <div key={po.id} className="grid gap-2">
                  <Label>Purchase Order</Label>
                  <div className="text-sm font-medium p-2 border rounded-md bg-muted/50">
                    {po.poNumber} - {po.supplier?.name}
                  </div>
                </div>
              ))}

              <div className="grid gap-2">
                <Label>Select Driver</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedDriver ? drivers.find(d => d.id === selectedDriver)?.name : "Select Driver"}
                      <Clipboard className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {availableDrivers.map(driver => (
                      <DropdownMenuItem key={driver.id} onClick={() => setSelectedDriver(driver.id)}>
                        {driver.name} - {driver.licenseNumber}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-2">
                <Label>Select Truck</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTruck ? trucks.find(t => t.id === selectedTruck)?.plateNumber : "Select Truck"}
                      <TruckIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {availableTrucks.map(truck => (
                      <DropdownMenuItem key={truck.id} onClick={() => setSelectedTruck(truck.id)}>
                        {truck.plateNumber} - {truck.model}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setAssignToPOOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignToPO} disabled={!selectedDriver || !selectedTruck}>
                  Assign to PO
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignDriver;
