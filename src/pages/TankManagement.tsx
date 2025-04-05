
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { format } from 'date-fns';
import { Tank } from '@/types';

// Reset the tank management data to fulfill the requirements
const TankManagement: React.FC = () => {
  const { tanks, addTank, updateTank, getAllTanks, recordOffloadingToTank } = useApp();
  
  // For new tank form
  const [newTankName, setNewTankName] = useState('');
  const [newTankCapacity, setNewTankCapacity] = useState(0);
  const [newTankProduct, setNewTankProduct] = useState<'PMS' | 'AGO' | 'DPK'>('PMS');
  const [newTankMinVolume, setNewTankMinVolume] = useState(0);
  
  // For offloading form
  const [selectedTankId, setSelectedTankId] = useState('');
  const [offloadVolume, setOffloadVolume] = useState(0);
  const [isOffloadingModalOpen, setIsOffloadingModalOpen] = useState(false);
  
  // For editing tank
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  
  // For tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Create two empty PMS tanks for testing
  const createEmptyTanks = () => {
    // First empty tank
    addTank({
      name: "PMS Tank 1",
      capacity: 50000,
      currentVolume: 0,
      productType: "PMS",
      minVolume: 5000,
      status: "operational",
      connectedDispensers: []
    });

    // Second empty tank
    addTank({
      name: "PMS Tank 2",
      capacity: 50000,
      currentVolume: 0,
      productType: "PMS",
      minVolume: 5000,
      status: "operational",
      connectedDispensers: []
    });

    // Also create an AGO tank that's 50% full
    addTank({
      name: "AGO Tank 1",
      capacity: 30000,
      currentVolume: 15000,
      productType: "AGO",
      minVolume: 3000,
      status: "operational",
      connectedDispensers: []
    });

    // And a DPK tank that's 25% full
    addTank({
      name: "DPK Tank 1",
      capacity: 20000,
      currentVolume: 5000,
      productType: "DPK",
      minVolume: 2000,
      status: "operational",
      connectedDispensers: []
    });

    // Add another PMS tank that's almost full
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
  
  // Handle form submission for adding a new tank
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
    
    // Reset form fields
    setNewTankName('');
    setNewTankCapacity(0);
    setNewTankMinVolume(0);
  };
  
  // Handle tank status update
  const handleStatusUpdate = (tankId: string, newStatus: "operational" | "maintenance" | "offline") => {
    updateTank(tankId, { status: newStatus });
  };
  
  // Handle tank offloading
  const handleOffload = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTank = tanks.find(tank => tank.id === selectedTankId);
    if (selectedTank) {
      recordOffloadingToTank(selectedTankId, offloadVolume, selectedTank.productType);
      setIsOffloadingModalOpen(false);
      setOffloadVolume(0);
      setSelectedTankId('');
    }
  };
  
  // Handle editing a tank
  const handleEditTank = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    if (tank) {
      setEditingTank(tank);
      setIsEditModalOpen(true);
    }
  };
  
  // Handle saving edited tank
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
  
  // Calculate tank statistics
  const tankStats = {
    totalCapacity: tanks.reduce((sum, tank) => sum + tank.capacity, 0),
    totalCurrentVolume: tanks.reduce((sum, tank) => sum + tank.currentVolume, 0),
    tankCount: tanks.length,
    pmsCount: tanks.filter(tank => tank.productType === 'PMS').length,
    agoCount: tanks.filter(tank => tank.productType === 'AGO').length,
    dpkCount: tanks.filter(tank => tank.productType === 'DPK').length,
    criticalLevelCount: tanks.filter(tank => tank.currentVolume <= tank.minVolume).length,
    fullTanksCount: tanks.filter(tank => tank.currentVolume >= tank.capacity * 0.9).length,
    emptyTanksCount: tanks.filter(tank => tank.currentVolume <= tank.capacity * 0.1).length
  };
  
  // Calculate tank capacity utilization percentage
  const capacityUtilization = tankStats.totalCapacity > 0 
    ? (tankStats.totalCurrentVolume / tankStats.totalCapacity) * 100 
    : 0;
  
  // Data for product distribution pie chart
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
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  // Group tanks by product type for bar chart
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
                    {tankStats.tankCount - tankStats.criticalLevelCount} Normal
                  </Badge>
                  <span>{((tankStats.tankCount - tankStats.criticalLevelCount) / Math.max(tankStats.tankCount, 1) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200">
                    {tankStats.criticalLevelCount} Critical
                  </Badge>
                  <span>{(tankStats.criticalLevelCount / Math.max(tankStats.tankCount, 1) * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">
                    {tankStats.fullTanksCount} Full
                  </Badge>
                  <span>{(tankStats.fullTanksCount / Math.max(tankStats.tankCount, 1) * 100).toFixed(0)}%</span>
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
              
              return (
                <Card key={tank.id} className={`
                  ${isCritical ? 'border-red-300' : ''}
                  ${isFull ? 'border-green-300' : ''}
                  ${isEmpty ? 'border-amber-300' : ''}
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
                    
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Minimum Level:</span>
                        <span>{tank.minVolume.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Space:</span>
                        <span>{(tank.capacity - tank.currentVolume).toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connected Dispensers:</span>
                        <span>{tank.connectedDispensers.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditTank(tank.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTankId(tank.id);
                          setIsOffloadingModalOpen(true);
                        }}
                      >
                        Offload
                      </Button>
                    </div>
                  </CardContent>
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
      
      {/* Offloading Modal */}
      {isOffloadingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Offload to Tank</CardTitle>
              <CardDescription>
                Add fuel volume to selected tank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOffload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tank-select">Select Tank</Label>
                  <select
                    id="tank-select"
                    className="w-full border border-gray-300 rounded-md h-10 px-3"
                    value={selectedTankId}
                    onChange={(e) => setSelectedTankId(e.target.value)}
                    required
                  >
                    <option value="">Select a tank</option>
                    {tanks.map(tank => (
                      <option key={tank.id} value={tank.id}>
                        {tank.name} ({tank.productType})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offload-volume">Volume to Offload (liters)</Label>
                  <Input
                    id="offload-volume"
                    type="number"
                    placeholder="e.g., 5000"
                    value={offloadVolume || ''}
                    onChange={(e) => setOffloadVolume(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsOffloadingModalOpen(false);
                      setSelectedTankId('');
                      setOffloadVolume(0);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Offload</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Edit Tank Modal */}
      {isEditModalOpen && editingTank && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Tank</CardTitle>
              <CardDescription>
                Update tank information
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                
                <div className="flex justify-end space-x-2 pt-4">
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
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TankManagement;
