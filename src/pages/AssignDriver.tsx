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
} from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { GPSData, Truck, Driver } from '@/types';
import { format } from 'date-fns';
import { Circle, CheckCircle, AlertTriangle, MapPin, Gps } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gpsFormSchema } from '@/schemas/gpsFormSchema';

const AssignDriver: React.FC = () => {
  const { 
    trucks, 
    drivers, 
    getAvailableTrucks, 
    getAvailableDrivers, 
    updateTruck, 
    updateDriver,
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks,
    getGPSDataForTruck,
    updateGPSData
  } = useApp();
  
  const navigate = useNavigate();
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [truckDetailsOpen, setTruckDetailsOpen] = useState(false);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isDeleteTruckOpen, setIsDeleteTruckOpen] = useState(false);
  const [isDeleteDriverOpen, setIsDeleteDriverOpen] = useState(false);
  const [gpsModalOpen, setGPSModalOpen] = useState(false);
  const [gpsData, setGpsData] = useState<GPSData[]>([]);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of useEffect
  
  const availableTrucks = getAvailableTrucks();
  const availableDrivers = getAvailableDrivers();
  const nonGPSTrucks = getNonGPSTrucks();
  
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

    // Optimistically update the UI
    const updatedTrucks = trucks.map(t =>
      t.id === selectedTruck ? { ...t, isAvailable: false, driverId: selectedDriver } : t
    );
    const updatedDrivers = drivers.map(d =>
      d.id === selectedDriver ? { ...d, isAvailable: false, currentTruckId: selectedTruck } : d
    );

    // setTrucks(updatedTrucks);
    // setDrivers(updatedDrivers);

    // Update truck
    const truckUpdateSuccess = await updateTruck(selectedTruck, { isAvailable: false, driverId: selectedDriver });
    const driverUpdateSuccess = await updateDriver(selectedDriver, { isAvailable: false, currentTruckId: selectedTruck });

    if (truckUpdateSuccess && driverUpdateSuccess) {
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

      // Revert the UI update if the API call failed
      // setTrucks(trucks);
      // setDrivers(drivers);
    }

    setTruckDetailsOpen(false);
    setDriverDetailsOpen(false);
    setSelectedTruck(null);
    setSelectedDriver(null);
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

    // Optimistically update the UI
    const updatedTrucks = trucks.map(t =>
      t.id === selectedTruck ? { ...t, isAvailable: true, driverId: null } : t
    );
    const updatedDrivers = drivers.map(d =>
      d.id === driverId ? { ...d, isAvailable: true, currentTruckId: null } : d
    );

    // setTrucks(updatedTrucks);
    // setDrivers(updatedDrivers);

    // Update truck
    const truckUpdateSuccess = await updateTruck(selectedTruck, { isAvailable: true, driverId: null });
    const driverUpdateSuccess = await updateDriver(driverId, { isAvailable: true, currentTruckId: null });

    if (truckUpdateSuccess && driverUpdateSuccess) {
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

      // Revert the UI update if the API call failed
      // setTrucks(trucks);
      // setDrivers(drivers);
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
          description: `GPS device has been successfully untagged from truck ${truckId}.`,
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

  const formSchema = z.object({
    gpsDeviceId: z.string().min(1, "GPS device ID is required"),
  });

  const form = useForm<z.infer<typeof gpsFormSchema>>({
    resolver: zodResolver(gpsFormSchema),
    defaultValues: {
      gpsDeviceId: "",
      latitude: 6.5244,
      longitude: 3.3792,
    },
  })

  const handleAddGPSDevice = useCallback((data: any) => {
    const success = tagTruckWithGPS(selectedTruck, data.gpsDeviceId);
    
    if (success) {
      toast({
        title: "GPS Device Tagged",
        description: `GPS device has been successfully tagged to truck ${selectedTruck}.`,
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
      description: `GPS data for truck ${selectedTruck} has been updated.`,
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
      <div className="md:grid md:grid-cols-2 md:gap-6">
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
                      <TableCell className="text-right">{truck.capacity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

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
                      <TableCell className="text-right">{driver.yearsOfExperience}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

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
                    <p className="text-lg font-semibold">{truck.capacity}</p>
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
                    <p className="text-lg font-semibold">{driver.yearsOfExperience}</p>
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
                          <TableCell>{data.latitude}</TableCell>
                          <TableCell>{data.longitude}</TableCell>
                          <TableCell>{data.speed}</TableCell>
                        </TableRow>
                      ))}
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddGPSDevice)} className="space-y-4">
              <FormField
                control={form.control}
                name="gpsDeviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS Device ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GPS Device ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit">Tag Device</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssignDriver;
