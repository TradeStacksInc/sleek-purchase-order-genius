
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Database, Droplet, AlertTriangle, PlusCircle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';
import { Tank as TankType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const TankManagement: React.FC = () => {
  const { getAllTanks, addTank, updateTank } = useApp();
  const { toast } = useToast();
  
  // Tank state
  const [tanks, setTanks] = useState<TankType[]>([]);
  const [isAddTankDialogOpen, setIsAddTankDialogOpen] = useState(false);
  
  // Form state for adding a new tank
  const [newTankName, setNewTankName] = useState('');
  const [newTankProduct, setNewTankProduct] = useState('PMS');
  const [newTankCapacity, setNewTankCapacity] = useState('30000');
  const [newTankCurrentVolume, setNewTankCurrentVolume] = useState('0');
  
  // Load tanks from context
  useEffect(() => {
    const loadedTanks = getAllTanks();
    
    // Check if tanks need to be reset (for demo purposes)
    if (loadedTanks.length === 0) {
      // Add empty PMS tanks per requirements
      addInitialTanks();
    } else {
      setTanks(loadedTanks);
    }
  }, [getAllTanks]);
  
  // Add initial empty tanks for testing
  const addInitialTanks = () => {
    // Add two empty PMS tanks
    const pmsNewTank1 = addTank({
      name: 'PMS Tank 1',
      productType: 'PMS',
      capacity: 30000,
      currentVolume: 0,
      location: 'Underground',
      status: 'active',
      lastRefillDate: new Date()
    });
    
    const pmsNewTank2 = addTank({
      name: 'PMS Tank 2',
      productType: 'PMS',
      capacity: 30000,
      currentVolume: 0,
      location: 'Underground',
      status: 'active',
      lastRefillDate: new Date()
    });
    
    // Add AGO tank
    const agoNewTank = addTank({
      name: 'AGO Tank 1',
      productType: 'AGO',
      capacity: 20000,
      currentVolume: 0,
      location: 'Underground',
      status: 'active',
      lastRefillDate: new Date()
    });
    
    toast({
      title: "Tanks Created",
      description: "Initial tanks have been created for testing",
    });
    
    // Refresh tanks
    setTanks(getAllTanks());
  };
  
  const handleAddTank = () => {
    if (!newTankName || !newTankProduct || !newTankCapacity) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    const capacity = parseInt(newTankCapacity);
    const currentVolume = parseInt(newTankCurrentVolume || '0');
    
    if (isNaN(capacity) || capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "Capacity must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(currentVolume) || currentVolume < 0) {
      toast({
        title: "Validation Error",
        description: "Current volume must be a non-negative number",
        variant: "destructive",
      });
      return;
    }
    
    if (currentVolume > capacity) {
      toast({
        title: "Validation Error",
        description: "Current volume cannot exceed capacity",
        variant: "destructive",
      });
      return;
    }
    
    const newTank = addTank({
      name: newTankName,
      productType: newTankProduct as any,
      capacity: capacity,
      currentVolume: currentVolume,
      location: 'Underground',
      status: 'active',
      lastRefillDate: new Date()
    });
    
    // Reset form
    setNewTankName('');
    setNewTankProduct('PMS');
    setNewTankCapacity('30000');
    setNewTankCurrentVolume('0');
    
    // Close dialog
    setIsAddTankDialogOpen(false);
    
    // Refresh tanks
    setTanks(getAllTanks());
  };
  
  // Filter tanks by product type
  const pmsTanks = tanks.filter(tank => tank.productType === 'PMS');
  const agoTanks = tanks.filter(tank => tank.productType === 'AGO');
  const dpkTanks = tanks.filter(tank => tank.productType === 'DPK');
  
  // Calculate totals
  const totalPMSCapacity = pmsTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalPMSVolume = pmsTanks.reduce((sum, tank) => sum + tank.currentVolume, 0);
  const totalAGOCapacity = agoTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalAGOVolume = agoTanks.reduce((sum, tank) => sum + tank.currentVolume, 0);
  const totalDPKCapacity = dpkTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalDPKVolume = dpkTanks.reduce((sum, tank) => sum + tank.currentVolume, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tank Management</CardTitle>
            <CardDescription>
              Monitor and manage underground storage tanks
            </CardDescription>
          </div>
          <Dialog open={isAddTankDialogOpen} onOpenChange={setIsAddTankDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Tank
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tank</DialogTitle>
                <DialogDescription>
                  Create a new underground storage tank to track fuel inventory.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tankName">Tank Name</Label>
                  <Input
                    id="tankName"
                    value={newTankName}
                    onChange={(e) => setNewTankName(e.target.value)}
                    placeholder="e.g., PMS Tank 3"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <select 
                    id="productType"
                    value={newTankProduct}
                    onChange={(e) => setNewTankProduct(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PMS">PMS (Petrol)</option>
                    <option value="AGO">AGO (Diesel)</option>
                    <option value="DPK">DPK (Kerosene)</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity (liters)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newTankCapacity}
                    onChange={(e) => setNewTankCapacity(e.target.value)}
                    placeholder="e.g., 30000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currentVolume">Current Volume (liters)</Label>
                  <Input
                    id="currentVolume"
                    type="number"
                    value={newTankCurrentVolume}
                    onChange={(e) => setNewTankCurrentVolume(e.target.value)}
                    placeholder="e.g., 0"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTankDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTank}>
                  Add Tank
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pms-tanks">PMS Tanks</TabsTrigger>
              <TabsTrigger value="ago-tanks">AGO Tanks</TabsTrigger>
              <TabsTrigger value="dpk-tanks">DPK Tanks</TabsTrigger>
              <TabsTrigger value="list">All Tanks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Droplet className="mr-2 h-5 w-5 text-red-500" />
                      PMS Storage
                    </CardTitle>
                    <CardDescription>
                      Total capacity: {totalPMSCapacity.toLocaleString()} liters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current volume:</span>
                        <span className="font-bold">{totalPMSVolume.toLocaleString()} liters</span>
                      </div>
                      <Progress 
                        value={totalPMSCapacity > 0 ? (totalPMSVolume / totalPMSCapacity) * 100 : 0} 
                        className="h-3" 
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>{totalPMSCapacity > 0 ? Math.round((totalPMSVolume / totalPMSCapacity) * 100) : 0}% full</span>
                        <span>{(totalPMSCapacity - totalPMSVolume).toLocaleString()} liters free</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Droplet className="mr-2 h-5 w-5 text-amber-500" />
                      AGO Storage
                    </CardTitle>
                    <CardDescription>
                      Total capacity: {totalAGOCapacity.toLocaleString()} liters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current volume:</span>
                        <span className="font-bold">{totalAGOVolume.toLocaleString()} liters</span>
                      </div>
                      <Progress 
                        value={totalAGOCapacity > 0 ? (totalAGOVolume / totalAGOCapacity) * 100 : 0} 
                        className="h-3" 
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>{totalAGOCapacity > 0 ? Math.round((totalAGOVolume / totalAGOCapacity) * 100) : 0}% full</span>
                        <span>{(totalAGOCapacity - totalAGOVolume).toLocaleString()} liters free</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Droplet className="mr-2 h-5 w-5 text-blue-500" />
                      DPK Storage
                    </CardTitle>
                    <CardDescription>
                      Total capacity: {totalDPKCapacity.toLocaleString()} liters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current volume:</span>
                        <span className="font-bold">{totalDPKVolume.toLocaleString()} liters</span>
                      </div>
                      <Progress 
                        value={totalDPKCapacity > 0 ? (totalDPKVolume / totalDPKCapacity) * 100 : 0} 
                        className="h-3" 
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>{totalDPKCapacity > 0 ? Math.round((totalDPKVolume / totalDPKCapacity) * 100) : 0}% full</span>
                        <span>{(totalDPKCapacity - totalDPKVolume).toLocaleString()} liters free</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tank Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Tank Alerts</CardTitle>
                  <CardDescription>
                    Notifications and warnings for all tanks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tanks.some(tank => isLowVolume(tank) || isHighVolume(tank)) ? (
                    <div className="space-y-4">
                      {tanks.filter(tank => isLowVolume(tank)).map(tank => (
                        <div key={`low-${tank.id}`} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{tank.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Low volume alert - below 20% capacity ({Math.round((tank.currentVolume / tank.capacity) * 100)}%)
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {tanks.filter(tank => isHighVolume(tank)).map(tank => (
                        <div key={`high-${tank.id}`} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <AlertOctagon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{tank.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              High volume alert - above 90% capacity ({Math.round((tank.currentVolume / tank.capacity) * 100)}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                      <Database className="h-10 w-10 mb-3 opacity-20" />
                      <p>No alerts or warnings</p>
                      <p className="text-sm">All tanks are operating normally</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pms-tanks" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pmsTanks.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    <Database className="h-10 w-10 opacity-20 mx-auto mb-2" />
                    <p>No PMS tanks found</p>
                    <p className="text-sm">Add some tanks to get started</p>
                  </div>
                ) : (
                  pmsTanks.map(tank => (
                    <TankCard key={tank.id} tank={tank} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ago-tanks" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agoTanks.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    <Database className="h-10 w-10 opacity-20 mx-auto mb-2" />
                    <p>No AGO tanks found</p>
                    <p className="text-sm">Add some tanks to get started</p>
                  </div>
                ) : (
                  agoTanks.map(tank => (
                    <TankCard key={tank.id} tank={tank} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="dpk-tanks" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dpkTanks.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    <Database className="h-10 w-10 opacity-20 mx-auto mb-2" />
                    <p>No DPK tanks found</p>
                    <p className="text-sm">Add some tanks to get started</p>
                  </div>
                ) : (
                  dpkTanks.map(tank => (
                    <TankCard key={tank.id} tank={tank} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tank Name</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Current Volume</TableHead>
                    <TableHead>Fill %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Refill</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tanks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No tanks found. Add some tanks to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tanks.map(tank => {
                      const percentFull = (tank.currentVolume / tank.capacity) * 100;
                      
                      return (
                        <TableRow key={tank.id}>
                          <TableCell className="font-medium">{tank.name}</TableCell>
                          <TableCell>
                            <Badge variant={
                              tank.productType === 'PMS' ? 'destructive' : 
                              tank.productType === 'AGO' ? 'default' : 'secondary'
                            }>
                              {tank.productType}
                            </Badge>
                          </TableCell>
                          <TableCell>{tank.capacity.toLocaleString()} L</TableCell>
                          <TableCell>{tank.currentVolume.toLocaleString()} L</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Progress value={percentFull} className="h-2 w-20 mr-2" />
                              <span className="text-xs">{Math.round(percentFull)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isReadyForOffload(tank) ? 'success' : 'warning'}>
                              {isReadyForOffload(tank) ? 'Ready for Offload' : 'Not Ready'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {tank.lastRefillDate ? format(tank.lastRefillDate, 'MMM dd, yyyy') : 'Never'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const isLowVolume = (tank: TankType) => {
  return (tank.currentVolume / tank.capacity) < 0.2;
};

const isHighVolume = (tank: TankType) => {
  return (tank.currentVolume / tank.capacity) > 0.9;
};

const isReadyForOffload = (tank: TankType) => {
  const percentFull = (tank.currentVolume / tank.capacity) * 100;
  return percentFull < 90; // Tank is ready for offload if it's less than 90% full
};

// Import format function
const format = (date: Date, formatStr: string): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

interface TankCardProps {
  tank: TankType;
}

const TankCard: React.FC<TankCardProps> = ({ tank }) => {
  const percentFull = (tank.currentVolume / tank.capacity) * 100;
  
  // Determine status color based on fill level
  let statusColor = "bg-green-500";
  if (percentFull < 20) {
    statusColor = "bg-red-500";
  } else if (percentFull > 90) {
    statusColor = "bg-amber-500";
  }
  
  const isReady = isReadyForOffload(tank);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{tank.name}</CardTitle>
            <CardDescription>
              {tank.capacity.toLocaleString()} liter capacity
            </CardDescription>
          </div>
          <Badge variant={
            tank.productType === 'PMS' ? 'destructive' : 
            tank.productType === 'AGO' ? 'default' : 'secondary'
          }>
            {tank.productType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current volume:</span>
            <span className="font-bold">{tank.currentVolume.toLocaleString()} liters</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`${statusColor} h-4 rounded-full transition-all duration-500`} 
              style={{ width: `${percentFull}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>{Math.round(percentFull)}% full</span>
            <span>{(tank.capacity - tank.currentVolume).toLocaleString()} liters free</span>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Badge variant={isReady ? 'success' : 'warning'} className="flex items-center">
              {isReady ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ready for Offload
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Not Ready
                </>
              )}
            </Badge>
          </div>
          
          <div className="pt-2 text-xs text-muted-foreground">
            Last updated: {tank.lastRefillDate ? format(tank.lastRefillDate, 'MMM dd, yyyy') : 'Never'}
          </div>
          
          {isLowVolume(tank) && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
              <div className="font-medium flex items-center text-amber-700">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Low Volume Warning
              </div>
              <p className="text-xs mt-1">
                This tank is below 20% capacity and may need refilling soon.
              </p>
            </div>
          )}
          
          {isHighVolume(tank) && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <div className="font-medium flex items-center text-blue-700">
                <AlertOctagon className="h-4 w-4 mr-1" />
                High Volume Warning
              </div>
              <p className="text-xs mt-1">
                This tank is above 90% capacity and may have limited space for offloading.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TankManagement;
