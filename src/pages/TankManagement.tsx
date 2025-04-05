import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmptyTankInitializer } from '@/hooks/useEmptyTankInitializer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { Tank, Dispenser } from '@/types';
import IconWithBackground from '@/components/IconWithBackground';
import { Fuel, Database as TankIcon, Trash, Link, Link2Off, Power, PowerOff, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const TankManagement: React.FC = () => {
  const { 
    tanks, addTank, updateTank, deleteTank, getAllTanks, 
    dispensers, getAllDispensers, connectTankToDispenser, 
    disconnectTankFromDispenser, setTankActive
  } = useApp();
  
  const [newTankName, setNewTankName] = useState('');
  const [newTankCapacity, setNewTankCapacity] = useState(0);
  const [newTankProduct, setNewTankProduct] = useState<'PMS' | 'AGO' | 'DPK'>('PMS');
  const [newTankMinVolume, setNewTankMinVolume] = useState(0);
  
  const [selectedTankId, setSelectedTankId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedDispenserId, setSelectedDispenserId] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tankToDelete, setTankToDelete] = useState<Tank | null>(null);
  
  const { initialized } = useEmptyTankInitializer();
  
  const createEmptyTanks = () => {
    addTank({
      name: "PMS Tank 1",
      capacity: 50000,
      currentVolume: 0,
      productType: "PMS",
      minVolume: 5000,
      status: "operational",
      connectedDispensers: []
    });

    addTank({
      name: "PMS Tank 2",
      capacity: 50000,
      currentVolume: 0,
      productType: "PMS",
      minVolume: 5000,
      status: "operational",
      connectedDispensers: []
    });

    addTank({
      name: "AGO Tank 1",
      capacity: 30000,
      currentVolume: 15000,
      productType: "AGO",
      minVolume: 3000,
      status: "operational",
      connectedDispensers: []
    });

    addTank({
      name: "DPK Tank 1",
      capacity: 20000,
      currentVolume: 5000,
      productType: "DPK",
      minVolume: 2000,
      status: "operational",
      connectedDispensers: []
    });

    addTank({
      name: "PMS Tank 3",
      capacity: 40000,
      currentVolume: 38000,
      productType: "PMS",
      minVolume: 4000,
      status: "operational",
      connectedDispensers: []
    });
  };
  
  const handleAddTank = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTank = {
      name: newTankName,
      capacity: newTankCapacity,
      currentVolume: 0,
      productType: newTankProduct,
      minVolume: newTankMinVolume,
      status: "operational" as const,
      connectedDispensers: []
    };
    
    addTank(newTank);
    
    setNewTankName('');
    setNewTankCapacity(0);
    setNewTankMinVolume(0);
  };
  
  const handleStatusUpdate = (tankId: string, newStatus: "operational" | "maintenance" | "offline") => {
    updateTank(tankId, { status: newStatus });
  };
  
  const handleEditTank = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (tank) {
      setEditingTank(tank);
      setIsEditModalOpen(true);
    }
  };
  
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTank) {
      updateTank(editingTank.id, {
        name: editingTank.name,
        capacity: editingTank.capacity,
        minVolume: editingTank.minVolume,
        status: editingTank.status
      });
      
      setIsEditModalOpen(false);
      setEditingTank(null);
    }
  };
  
  const handleDeleteTank = (tank: Tank) => {
    setTankToDelete(tank);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteTank = () => {
    if (tankToDelete) {
      deleteTank(tankToDelete.id);
      setIsDeleteModalOpen(false);
      setTankToDelete(null);
    }
  };
  
  const handleConnectTankToDispenser = (tankId: string) => {
    setSelectedTankId(tankId);
    setIsConnectModalOpen(true);
  };
  
  const confirmConnectTankToDispenser = () => {
    if (selectedTankId && selectedDispenserId) {
      connectTankToDispenser(selectedTankId, selectedDispenserId);
      setIsConnectModalOpen(false);
      setSelectedTankId('');
      setSelectedDispenserId('');
    }
  };
  
  const handleDisconnectTankFromDispenser = (tankId: string, dispenserId: string) => {
    disconnectTankFromDispenser(tankId, dispenserId);
  };
  
  const handleToggleActive = (tankId: string, isActive: boolean) => {
    setTankActive(tankId, isActive);
  };
  
  const getAvailableDispensers = (productType: string) => {
    return dispensers.filter(d => 
      d.productType === productType && 
      !d.connectedTankId
    );
  };
  
  const getConnectedDispensers = (tankId: string) => {
    return dispensers.filter(d => d.connectedTankId === tankId);
  };
  
  const tankStats = {
    totalCapacity: tanks.reduce((sum, tank) => sum + tank.capacity, 0),
    totalCurrentVolume: tanks.reduce((sum, tank) => sum + tank.currentVolume, 0),
    tankCount: tanks.length,
    pmsCount: tanks.filter(tank => tank.productType === 'PMS').length,
    agoCount: tanks.filter(tank => tank.productType === 'AGO').length,
    dpkCount: tanks.filter(tank => tank.productType === 'DPK').length,
    criticalLevelCount: tanks.filter(tank => tank.currentVolume <= tank.minVolume).length,
    fullTanksCount: tanks.filter(tank => tank.currentVolume >= tank.capacity * 0.9).length,
    emptyTanksCount: tanks.filter(tank => tank.currentVolume <= tank.capacity * 0.1).length,
    activeTanks: tanks.filter(tank => tank.isActive).length,
    connectedTanks: tanks.filter(tank => tank.connectedDispensers.length > 0).length,
  };
  
  const capacityUtilization = tankStats.totalCapacity > 0 
    ? (tankStats.totalCurrentVolume / tankStats.totalCapacity) * 100 
    : 0;
  
  const productDistributionData = [
    { 
      name: 'PMS', 
      value: tanks
        .filter(tank => tank.productType === 'PMS')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    },
    { 
      name: 'AGO', 
      value: tanks
        .filter(tank => tank.productType === 'AGO')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    },
    { 
      name: 'DPK', 
      value: tanks
        .filter(tank => tank.productType === 'DPK')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  const tanksByProductData = [
    { 
      name: 'PMS', 
      capacity: tanks
        .filter(tank => tank.productType === 'PMS')
        .reduce((sum, tank) => sum + tank.capacity, 0),
      current: tanks
        .filter(tank => tank.productType === 'PMS')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    },
    { 
      name: 'AGO', 
      capacity: tanks
        .filter(tank => tank.productType === 'AGO')
        .reduce((sum, tank) => sum + tank.capacity, 0),
      current: tanks
        .filter(tank => tank.productType === 'AGO')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    },
    { 
      name: 'DPK', 
      capacity: tanks
        .filter(tank => tank.productType === 'DPK')
        .reduce((sum, tank) => sum + tank.capacity, 0),
      current: tanks
        .filter(tank => tank.productType === 'DPK')
        .reduce((sum, tank) => sum + tank.currentVolume, 0) 
    }
  ];
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tank Management</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('add')}
            variant="outline"
          >
            Add New Tank
          </Button>
          
          <Button 
            onClick={createEmptyTanks}
            variant="default"
          >
            Create Test Tanks
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tanks">Tanks</TabsTrigger>
          <TabsTrigger value="add">Add New Tank</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Capacity</CardTitle>
                <CardDescription>All tanks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tankStats.totalCapacity.toLocaleString()} L</div>
                <p className="text-sm text-muted-foreground">{tankStats.tankCount} tanks</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Current Volume</CardTitle>
                <CardDescription>Total fuel stored</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tankStats.totalCurrentVolume.toLocaleString()} L</div>
                <div className="mt-2">
                  <Progress value={capacityUtilization} />
                  <p className="text-xs text-muted-foreground mt-1">{capacityUtilization.toFixed(1)}% utilization</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tank Status</CardTitle>
                <CardDescription>Monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200">
                    {tankStats.activeTanks} Active
                  </Badge>
                  <span>{((tankStats.activeTanks / Math.max(tankStats.tankCount, 1)) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
                    {tankStats.connectedTanks} Connected
                  </Badge>
                  <span>{((tankStats.connectedTanks / Math.max(tankStats.tankCount, 1)) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200">
                    {tankStats.criticalLevelCount} Critical
                  </Badge>
                  <span>{(tankStats.criticalLevelCount / Math.max(tankStats.tankCount, 1) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border-red-200">
                    {tankStats.emptyTanksCount} Near Empty
                  </Badge>
                  <span>{(tankStats.emptyTanksCount / Math.max(tankStats.tankCount, 1) * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product Distribution</CardTitle>
                <CardDescription>By fuel type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
                    PMS: {tankStats.pmsCount} tanks
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200">
                    AGO: {tankStats.agoCount} tanks
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200">
                    DPK: {tankStats.dpkCount} tanks
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Distribution</CardTitle>
                <CardDescription>Volume by product type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistributionData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {productDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} L`, 'Volume']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Capacity vs. Current Volume</CardTitle>
                <CardDescription>By product type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tanksByProductData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} L`, 'Volume']} />
                    <Legend />
                    <Bar dataKey="capacity" name="Total Capacity" fill="#8884d8" />
                    <Bar dataKey="current" name="Current Volume" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tanks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map(tank => {
              const fillPercentage = (tank.currentVolume / tank.capacity) * 100;
              const isCritical = tank.currentVolume <= tank.minVolume;
              const isFull = tank.currentVolume >= tank.capacity * 0.9;
              const isEmpty = tank.currentVolume <= tank.capacity * 0.1;
              const isConnected = tank.connectedDispensers.length > 0;
              const connectedDispensers = getConnectedDispensers(tank.id);
              
              return (
                <Card key={tank.id} className={`
                  ${isCritical ? 'border-red-300' : ''}
                  ${isFull ? 'border-green-300' : ''}
                  ${isEmpty ? 'border-amber-300' : ''}
                  ${tank.isActive ? 'border-blue-500 shadow-md' : ''}
                `}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{tank.name}</CardTitle>
                        <CardDescription>{tank.productType} - {tank.capacity.toLocaleString()} L</CardDescription>
                      </div>
                      <Badge variant={tank.status === "operational" ? "outline" : "secondary"}>
                        {tank.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center py-3">
                      <IconWithBackground 
                        icon={TankIcon} 
                        style="underground-tank" 
                        isConnected={isConnected}
                        isActive={tank.isActive}
                        productType={tank.productType}
                        volume={tank.currentVolume}
                        capacity={tank.capacity}
                        size={24}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Volume: {tank.currentVolume.toLocaleString()} L</span>
                        <span>{fillPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={fillPercentage} 
                        className={`h-2 ${
                          isCritical ? 'bg-red-200' : 
                          isFull ? 'bg-green-200' : 
                          isEmpty ? 'bg-amber-200' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                    
                    {connectedDispensers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Connected Dispensers:</h4>
                        <div className="flex flex-wrap gap-2">
                          {connectedDispensers.map(dispenser => (
                            <Badge key={dispenser.id} variant="outline" className="flex items-center gap-1.5">
                              <Fuel className="h-3 w-3" />
                              <span>#{dispenser.number}</span>
                              <button 
                                className="ml-1 text-gray-500 hover:text-red-500"
                                onClick={() => handleDisconnectTankFromDispenser(tank.id, dispenser.id)}
                              >
                                <Link2Off className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1 items-center"
                        onClick={() => handleEditTank(tank.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant={!tank.isActive && !isConnected ? "destructive" : "outline"} 
                        size="sm" 
                        className="flex gap-1 items-center"
                        disabled={tank.isActive || isConnected}
                        onClick={() => handleDeleteTank(tank)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex gap-1 items-center"
                        onClick={() => handleConnectTankToDispenser(tank.id)}
                      >
                        <Link className="h-3.5 w-3.5" />
                        Connect
                      </Button>
                      <Button 
                        variant={tank.isActive ? "default" : "outline"} 
                        size="sm" 
                        className="flex gap-1 items-center"
                        onClick={() => handleToggleActive(tank.id, !tank.isActive)}
                      >
                        {tank.isActive ? (
                          <PowerOff className="h-3.5 w-3.5" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )}
                        {tank.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {tanks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tanks registered yet. Add a new tank to get started.</p>
              <Button 
                className="mt-4"
                onClick={() => setActiveTab('add')}
              >
                Add New Tank
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Tank</CardTitle>
              <CardDescription>Register a new storage tank</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTank} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tank-name">Tank Name</Label>
                    <Input 
                      id="tank-name" 
                      placeholder="e.g., PMS Tank 1"
                      value={newTankName}
                      onChange={(e) => setNewTankName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tank-product">Product Type</Label>
                    <select 
                      id="tank-product"
                      className="w-full border border-gray-300 rounded-md h-10 px-3"
                      value={newTankProduct}
                      onChange={(e) => setNewTankProduct(e.target.value as any)}
                      required
                    >
                      <option value="PMS">PMS</option>
                      <option value="AGO">AGO</option>
                      <option value="DPK">DPK</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tank-capacity">Tank Capacity (liters)</Label>
                    <Input 
                      id="tank-capacity" 
                      type="number"
                      placeholder="e.g., 50000"
                      value={newTankCapacity || ''}
                      onChange={(e) => setNewTankCapacity(Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tank-min-volume">Minimum Volume (liters)</Label>
                    <Input 
                      id="tank-min-volume" 
                      type="number"
                      placeholder="e.g., 5000"
                      value={newTankMinVolume || ''}
                      onChange={(e) => setNewTankMinVolume(Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="mt-4">Add Tank</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tank</DialogTitle>
            <DialogDescription>
              Update tank information
            </DialogDescription>
          </DialogHeader>
          {editingTank && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tank-name">Tank Name</Label>
                <Input
                  id="edit-tank-name"
                  value={editingTank.name}
                  onChange={(e) => setEditingTank({...editingTank, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tank-capacity">Tank Capacity (liters)</Label>
                <Input
                  id="edit-tank-capacity"
                  type="number"
                  value={editingTank.capacity || ''}
                  onChange={(e) => setEditingTank({...editingTank, capacity: Number(e.target.value)})}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tank-min-volume">Minimum Volume (liters)</Label>
                <Input
                  id="edit-tank-min-volume"
                  type="number"
                  value={editingTank.minVolume || ''}
                  onChange={(e) => setEditingTank({...editingTank, minVolume: Number(e.target.value)})}
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tank-status">Tank Status</Label>
                <select
                  id="edit-tank-status"
                  className="w-full border border-gray-300 rounded-md h-10 px-3"
                  value={editingTank.status}
                  onChange={(e) => setEditingTank({...editingTank, status: e.target.value as "operational" | "maintenance" | "offline"})}
                  required
                >
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTank(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Tank to Dispenser</DialogTitle>
            <DialogDescription>
              Select a dispenser to connect to this tank
            </DialogDescription>
          </DialogHeader>
          {selectedTankId && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connect-dispenser">Select Dispenser</Label>
                  <select
                    id="connect-dispenser"
                    className="w-full border border-gray-300 rounded-md h-10 px-3"
                    value={selectedDispenserId}
                    onChange={(e) => setSelectedDispenserId(e.target.value)}
                    required
                  >
                    <option value="">Select a dispenser</option>
                    {getAvailableDispensers(tanks.find(t => t.id === selectedTankId)?.productType || '').map(dispenser => (
                      <option key={dispenser.id} value={dispenser.id}>
                        Dispenser #{dispenser.number} ({dispenser.productType})
                      </option>
                    ))}
                  </select>
                </div>
                
                {getAvailableDispensers(tanks.find(t => t.id === selectedTankId)?.productType || '').length === 0 && (
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Available Dispensers</AlertTitle>
                    <AlertDescription>
                      There are no available dispensers for this product type, or all dispensers are already connected to tanks.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsConnectModalOpen(false);
                    setSelectedTankId('');
                    setSelectedDispenserId('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmConnectTankToDispenser}
                  disabled={!selectedDispenserId}
                >
                  Connect
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tank</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tank? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {tankToDelete && (
            <>
              <div className="py-4">
                <p><strong>Name:</strong> {tankToDelete.name}</p>
                <p><strong>Product:</strong> {tankToDelete.productType}</p>
                <p><strong>Capacity:</strong> {tankToDelete.capacity.toLocaleString()} liters</p>
                <p><strong>Current Volume:</strong> {tankToDelete.currentVolume.toLocaleString()} liters</p>
              </div>
              
              {(tankToDelete.isActive || tankToDelete.connectedDispensers.length > 0) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Cannot Delete</AlertTitle>
                  <AlertDescription>
                    {tankToDelete.isActive && "This tank is active. Deactivate it first before deleting."}
                    {tankToDelete.connectedDispensers.length > 0 && "This tank is connected to dispensers. Disconnect all dispensers first before deleting."}
                  </AlertDescription>
                </Alert>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTankToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDeleteTank}
                  disabled={tankToDelete.isActive || tankToDelete.connectedDispensers.length > 0}
                >
                  Delete Tank
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TankManagement;
