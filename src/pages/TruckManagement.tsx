
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Truck, Tag, AlertTriangle, CheckCircle, XCircle, RotateCw, MapPin } from 'lucide-react';
import { Truck as TruckType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const TruckManagement: React.FC = () => {
  const { 
    trucks, 
    getGPSTaggedTrucks, 
    getNonTaggedTrucks, 
    getNonGPSTrucks,
    tagTruckWithGPS,
    untagTruckGPS,
    addTruck 
  } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null);
  
  // New truck form state
  const [newTruck, setNewTruck] = useState({
    plateNumber: '',
    model: '',
    capacity: '',
    year: '',
    hasGPS: false
  });
  
  // GPS tagging form state
  const [gpsInfo, setGpsInfo] = useState({
    deviceId: '',
    latitude: '6.5244',  // Default location (Lagos)
    longitude: '3.3792'
  });

  // Filter trucks based on active tab and search term
  const filteredTrucks = useMemo(() => {
    let filtered: TruckType[] = [];
    
    if (activeTab === 'all') {
      filtered = trucks;
    } else if (activeTab === 'gps_tagged') {
      filtered = getGPSTaggedTrucks();
    } else if (activeTab === 'non_tagged') {
      filtered = getNonTaggedTrucks();
    } else if (activeTab === 'non_gps') {
      filtered = getNonGPSTrucks();
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(truck => 
        truck.plateNumber.toLowerCase().includes(term) ||
        truck.model.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [trucks, activeTab, searchTerm, getGPSTaggedTrucks, getNonTaggedTrucks, getNonGPSTrucks]);

  const handleAddTruck = () => {
    // Validation
    if (!newTruck.plateNumber || !newTruck.model || !newTruck.capacity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new truck object
    const truckData = {
      plateNumber: newTruck.plateNumber,
      model: newTruck.model,
      capacity: parseFloat(newTruck.capacity),
      year: parseInt(newTruck.year || new Date().getFullYear().toString()),
      hasGPS: newTruck.hasGPS,
      isGPSTagged: false,
      isAvailable: true,
      gpsDeviceId: undefined
    };
    
    // Add truck
    addTruck(truckData);
    
    // Reset form and close dialog
    setNewTruck({
      plateNumber: '',
      model: '',
      capacity: '',
      year: '',
      hasGPS: false
    });
    setIsAddDialogOpen(false);
  };

  const handleTagTruck = () => {
    if (!selectedTruck) return;
    
    // Validation
    if (!gpsInfo.deviceId) {
      toast({
        title: "Validation Error",
        description: "Please enter a GPS device ID.",
        variant: "destructive"
      });
      return;
    }
    
    // Tag truck with GPS
    tagTruckWithGPS(
      selectedTruck.id,
      gpsInfo.deviceId,
      parseFloat(gpsInfo.latitude),
      parseFloat(gpsInfo.longitude)
    );
    
    // Reset form and close dialog
    setGpsInfo({
      deviceId: '',
      latitude: '6.5244',
      longitude: '3.3792'
    });
    setIsTagDialogOpen(false);
    setSelectedTruck(null);
  };

  const handleUntagTruck = (truckId: string) => {
    untagTruckGPS(truckId);
    
    toast({
      title: "GPS Untagged",
      description: "The GPS device has been successfully untagged from the truck.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Truck Management</CardTitle>
              <CardDescription>
                Manage all trucks and their GPS tracking devices
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Truck</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by plate number or model..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Trucks</TabsTrigger>
              <TabsTrigger value="gps_tagged">GPS Tagged</TabsTrigger>
              <TabsTrigger value="non_tagged">GPS-Ready</TabsTrigger>
              <TabsTrigger value="non_gps">No GPS</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredTrucks.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No trucks found</p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  {activeTab === 'all' 
                    ? "Try adding a new truck to get started"
                    : "Try adjusting your filters or adding trucks with the required criteria"}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Truck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>GPS Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrucks.map((truck) => (
                    <TableRow key={truck.id}>
                      <TableCell className="font-medium">{truck.plateNumber}</TableCell>
                      <TableCell>{truck.model} ({truck.year})</TableCell>
                      <TableCell>{truck.capacity.toLocaleString()} L</TableCell>
                      <TableCell>
                        {truck.hasGPS ? (
                          truck.isGPSTagged ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tagged
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Not Tagged
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-slate-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            No GPS
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {truck.isAvailable ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            In Use
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {truck.hasGPS && !truck.isGPSTagged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTruck(truck);
                              setIsTagDialogOpen(true);
                            }}
                            className="mr-2"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            Tag GPS
                          </Button>
                        )}
                        
                        {truck.isGPSTagged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUntagTruck(truck.id)}
                          >
                            <RotateCw className="h-3 w-3 mr-1" />
                            Untag
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Total trucks: {trucks.length} | GPS-capable: {getGPSTaggedTrucks().length + getNonTaggedTrucks().length} | GPS tagged: {getGPSTaggedTrucks().length}
        </CardFooter>
      </Card>
      
      {/* Add Truck Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Truck</DialogTitle>
            <DialogDescription>
              Enter the details of the new truck to add it to your fleet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plateNumber" className="text-right">
                Plate Number*
              </Label>
              <Input
                id="plateNumber"
                placeholder="e.g., ABC-123XY"
                className="col-span-3"
                value={newTruck.plateNumber}
                onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model*
              </Label>
              <Input
                id="model"
                placeholder="e.g., Mercedes Actros"
                className="col-span-3"
                value={newTruck.model}
                onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity (L)*
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 33000"
                className="col-span-3"
                value={newTruck.capacity}
                onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                className="col-span-3"
                value={newTruck.year}
                onChange={(e) => setNewTruck({ ...newTruck, year: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasGPS" className="text-right">
                GPS Capability
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasGPS"
                  checked={newTruck.hasGPS}
                  onChange={(e) => setNewTruck({ ...newTruck, hasGPS: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="hasGPS" className="text-sm text-gray-700">
                  This truck has GPS capability
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTruck}>Add Truck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tag GPS Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag GPS Device</DialogTitle>
            <DialogDescription>
              {selectedTruck && (
                <>Assign a GPS tracking device to truck: <strong>{selectedTruck.plateNumber}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceId" className="text-right">
                Device ID*
              </Label>
              <Input
                id="deviceId"
                placeholder="e.g., GPS-12345"
                className="col-span-3"
                value={gpsInfo.deviceId}
                onChange={(e) => setGpsInfo({ ...gpsInfo, deviceId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Initial Latitude
              </Label>
              <Input
                id="latitude"
                placeholder="e.g., 6.5244"
                className="col-span-3"
                value={gpsInfo.latitude}
                onChange={(e) => setGpsInfo({ ...gpsInfo, latitude: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Initial Longitude
              </Label>
              <Input
                id="longitude"
                placeholder="e.g., 3.3792"
                className="col-span-3"
                value={gpsInfo.longitude}
                onChange={(e) => setGpsInfo({ ...gpsInfo, longitude: e.target.value })}
              />
            </div>
            
            <div className="col-span-4 flex items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-100">
              <MapPin className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-gray-600">
                Initial position: Lagos, Nigeria (Default)
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTagTruck}>Tag Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TruckManagement;
