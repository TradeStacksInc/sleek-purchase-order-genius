
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { Tank, ProductType } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEmptyTankInitializer } from '@/hooks/useEmptyTankInitializer';
import { AlertCircle, CheckCircle2, DropletIcon, Fuel, Info, Plus, Settings, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const TankManagement = () => {
  const { tanks, setTankActive, deleteTank, addTank } = useApp();
  const { initialized } = useEmptyTankInitializer();
  const [activeTab, setActiveTab] = useState('PMS');
  
  // State for creating new tank
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTankName, setNewTankName] = useState('');
  const [newTankCapacity, setNewTankCapacity] = useState('20000');
  const [newTankProduct, setNewTankProduct] = useState<ProductType>('PMS');
  
  // Filter tanks based on selected product type
  const filteredTanks = tanks.filter(tank => tank.productType === activeTab);
  
  const handleCreateTank = () => {
    if (!newTankName || !newTankCapacity) {
      toast({
        title: "Missing Information",
        description: "Please provide all required tank details",
        variant: "destructive"
      });
      return;
    }
    
    addTank({
      name: newTankName,
      capacity: parseInt(newTankCapacity),
      currentVolume: 0,
      productType: newTankProduct,
      minVolume: Math.floor(parseInt(newTankCapacity) * 0.1), // 10% of capacity
      status: 'operational',
      isActive: true,
      connectedDispensers: []
    });
    
    toast({
      title: "Tank Created",
      description: `${newTankName} has been added successfully.`,
    });
    
    // Reset form
    setNewTankName('');
    setNewTankCapacity('20000');
    setIsDialogOpen(false);
  };
  
  const handleDeleteTank = async (tankId: string, tankName: string) => {
    if (confirm(`Are you sure you want to delete ${tankName}?`)) {
      const success = await deleteTank(tankId);
      
      if (success) {
        toast({
          title: "Tank Deleted",
          description: `${tankName} has been removed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete tank. It may be in use or have connected dispensers.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleActivationToggle = (tankId: string, isActive: boolean, tankName: string) => {
    const success = setTankActive(tankId, !isActive);
    
    if (success) {
      toast({
        title: isActive ? "Tank Deactivated" : "Tank Activated",
        description: `${tankName} is now ${isActive ? 'inactive' : 'active'}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update tank status.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-8 p-1">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tank Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Tank
        </Button>
      </div>
      
      <Tabs 
        defaultValue="PMS" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProductType)}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="PMS">PMS (Petrol)</TabsTrigger>
            <TabsTrigger value="AGO">AGO (Diesel)</TabsTrigger>
            <TabsTrigger value="DPK">DPK (Kerosene)</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 items-center">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Active
            </Badge>
            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Inactive
            </Badge>
          </div>
        </div>
        
        <TabsContent value="PMS" className="mt-0">
          <TankList 
            tanks={filteredTanks}
            onDelete={handleDeleteTank}
            onToggleActive={handleActivationToggle}
          />
        </TabsContent>
        
        <TabsContent value="AGO" className="mt-0">
          <TankList 
            tanks={filteredTanks}
            onDelete={handleDeleteTank}
            onToggleActive={handleActivationToggle}
          />
        </TabsContent>
        
        <TabsContent value="DPK" className="mt-0">
          <TankList 
            tanks={filteredTanks}
            onDelete={handleDeleteTank}
            onToggleActive={handleActivationToggle}
          />
        </TabsContent>
      </Tabs>
      
      {/* New Tank Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tank</DialogTitle>
            <DialogDescription>
              Create a new storage tank for fuel products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tankName">Tank Name</Label>
              <Input 
                id="tankName" 
                value={newTankName} 
                onChange={(e) => setNewTankName(e.target.value)}
                placeholder="e.g., PMS Tank 4"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Liters)</Label>
              <Input 
                id="capacity" 
                value={newTankCapacity} 
                onChange={(e) => setNewTankCapacity(e.target.value)}
                type="number"
                min="1000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product Type</Label>
              <Select 
                value={newTankProduct} 
                onValueChange={(value) => setNewTankProduct(value as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PMS">PMS (Petrol)</SelectItem>
                  <SelectItem value="AGO">AGO (Diesel)</SelectItem>
                  <SelectItem value="DPK">DPK (Kerosene)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTank}>Create Tank</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TankListProps {
  tanks: Tank[];
  onDelete: (id: string, name: string) => void;
  onToggleActive: (id: string, isActive: boolean, name: string) => void;
}

const TankList: React.FC<TankListProps> = ({ tanks, onDelete, onToggleActive }) => {
  if (tanks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <DropletIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="font-medium text-lg">No Tanks Available</h3>
        <p className="text-muted-foreground">Add a new tank to get started</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tanks.map(tank => (
        <TankCard 
          key={tank.id} 
          tank={tank} 
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};

interface TankCardProps {
  tank: Tank;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (id: string, isActive: boolean, name: string) => void;
}

const TankCard: React.FC<TankCardProps> = ({ tank, onDelete, onToggleActive }) => {
  // Calculate fill percentage
  const fillPercentage = Math.min(100, (tank.currentVolume || 0) / tank.capacity * 100);
  const isLow = fillPercentage <= 20;
  const isActive = tank.isActive !== false; // Default to true if undefined
  const statusColor = isActive ? 'bg-green-500' : 'bg-red-500';
  const lastRefillText = tank.lastRefillDate 
    ? new Date(tank.lastRefillDate).toLocaleDateString() 
    : 'Never';
    
  return (
    <Card className={`${!isActive ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
              <CardTitle className="text-xl">{tank.name}</CardTitle>
            </div>
            <CardDescription>
              {tank.capacity.toLocaleString()} Liters Capacity
            </CardDescription>
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onToggleActive(tank.id, !!tank.isActive, tank.name)}
              title={isActive ? "Deactivate Tank" : "Activate Tank"}
            >
              {isActive 
                ? <AlertCircle className="h-4 w-4 text-amber-500" /> 
                : <CheckCircle2 className="h-4 w-4 text-green-500" />
              }
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(tank.id, tank.name)}
              title="Delete Tank"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Current Level: {(tank.currentVolume || 0).toLocaleString()} L</span>
              <span className={isLow ? "text-red-500" : ""}>
                {fillPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={fillPercentage} 
              className="h-2"
              indicatorClassName={isLow ? "bg-red-500" : undefined}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Min. Level</span>
              <span>{(tank.minVolume || 0).toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Last Refill</span>
              <span>{lastRefillText}</span>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connected Dispensers</span>
              <span className="font-medium">{(tank.connectedDispensers || []).length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankManagement;
