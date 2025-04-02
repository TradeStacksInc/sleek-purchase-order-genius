
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Database, Droplet, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Tank {
  id: string;
  name: string;
  type: 'PMS' | 'AGO';
  capacity: number;
  currentVolume: number;
  lastUpdated: Date;
  alerts: string[];
}

const TankManagement: React.FC = () => {
  // Mock data for demonstration - in a real app, this would come from your context or API
  const [tanks, setTanks] = useState<Tank[]>([
    {
      id: 'tank-pms-1',
      name: 'PMS Tank 1',
      type: 'PMS',
      capacity: 60000,
      currentVolume: 45000,
      lastUpdated: new Date(),
      alerts: []
    },
    {
      id: 'tank-pms-2',
      name: 'PMS Tank 2',
      type: 'PMS',
      capacity: 60000,
      currentVolume: 32000,
      lastUpdated: new Date(),
      alerts: []
    },
    {
      id: 'tank-pms-3',
      name: 'PMS Tank 3',
      type: 'PMS',
      capacity: 60000,
      currentVolume: 58000,
      lastUpdated: new Date(),
      alerts: []
    },
    {
      id: 'tank-ago-1',
      name: 'AGO Tank',
      type: 'AGO',
      capacity: 60000,
      currentVolume: 27000,
      lastUpdated: new Date(),
      alerts: ['Low volume alert - below 50%']
    }
  ]);

  const pmsTanks = tanks.filter(tank => tank.type === 'PMS');
  const agoTanks = tanks.filter(tank => tank.type === 'AGO');
  
  const totalPMSCapacity = pmsTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalPMSVolume = pmsTanks.reduce((sum, tank) => sum + tank.currentVolume, 0);
  const totalAGOCapacity = agoTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalAGOVolume = agoTanks.reduce((sum, tank) => sum + tank.currentVolume, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Tank Management</CardTitle>
          <CardDescription>
            Monitor and manage underground storage tanks for PMS and AGO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pms-tanks">PMS Tanks</TabsTrigger>
              <TabsTrigger value="ago-tanks">AGO Tank</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                      <Progress value={(totalPMSVolume / totalPMSCapacity) * 100} className="h-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span>{Math.round((totalPMSVolume / totalPMSCapacity) * 100)}% full</span>
                        <span>{(totalPMSCapacity - totalPMSVolume).toLocaleString()} liters free</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Droplet className="mr-2 h-5 w-5 text-blue-500" />
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
                      <Progress value={(totalAGOVolume / totalAGOCapacity) * 100} className="h-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span>{Math.round((totalAGOVolume / totalAGOCapacity) * 100)}% full</span>
                        <span>{(totalAGOCapacity - totalAGOVolume).toLocaleString()} liters free</span>
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
                  {tanks.some(tank => tank.alerts.length > 0) ? (
                    <div className="space-y-4">
                      {tanks.filter(tank => tank.alerts.length > 0).map(tank => (
                        <div key={tank.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{tank.name}</h4>
                            <ul className="mt-1 space-y-1">
                              {tank.alerts.map((alert, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  {alert}
                                </li>
                              ))}
                            </ul>
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
                {pmsTanks.map(tank => (
                  <TankCard key={tank.id} tank={tank} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="ago-tanks" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agoTanks.map(tank => (
                  <TankCard key={tank.id} tank={tank} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const TankCard: React.FC<{ tank: Tank }> = ({ tank }) => {
  const percentFull = (tank.currentVolume / tank.capacity) * 100;
  
  // Determine status color based on fill level
  let statusColor = "bg-green-500";
  if (percentFull < 30) {
    statusColor = "bg-red-500";
  } else if (percentFull < 50) {
    statusColor = "bg-amber-500";
  }
  
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
          <Badge variant={tank.type === 'PMS' ? 'destructive' : 'default'}>
            {tank.type}
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
              className={`${statusColor} h-4 rounded-full`} 
              style={{ width: `${percentFull}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>{Math.round(percentFull)}% full</span>
            <span>{(tank.capacity - tank.currentVolume).toLocaleString()} liters free</span>
          </div>
          
          <div className="pt-2 text-xs text-muted-foreground">
            Last updated: {tank.lastUpdated.toLocaleString()}
          </div>
          
          {tank.alerts.length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
              <div className="font-medium flex items-center text-amber-700">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Alerts
              </div>
              <ul className="mt-1 space-y-1 pl-5 list-disc">
                {tank.alerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TankManagement;
