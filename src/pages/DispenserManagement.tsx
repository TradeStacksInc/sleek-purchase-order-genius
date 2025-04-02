
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Fuel, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Nozzle {
  id: string;
  number: number;
  type: 'PMS' | 'AGO';
  totalVolumeSold: number;
  assignedStaffId?: string;
  assignedStaffName?: string;
}

interface Dispenser {
  id: string;
  number: number;
  type: 'AGO';
  status: 'operational' | 'maintenance' | 'offline';
  nozzles: Nozzle[];
  lastMaintenanceDate?: Date;
  issues: string[];
}

interface Staff {
  id: string;
  name: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'unassigned';
}

const DispenserManagement: React.FC = () => {
  const { toast } = useToast();

  // Mock data for demonstration
  const [dispensers, setDispensers] = useState<Dispenser[]>([
    {
      id: 'disp-1',
      number: 1,
      type: 'AGO',
      status: 'operational',
      nozzles: [
        { id: 'noz-1-1', number: 1, type: 'AGO', totalVolumeSold: 12500, assignedStaffId: 'staff-1', assignedStaffName: 'John Doe' },
        { id: 'noz-1-2', number: 2, type: 'AGO', totalVolumeSold: 10800 }
      ],
      lastMaintenanceDate: new Date(2025, 2, 15),
      issues: []
    },
    {
      id: 'disp-2',
      number: 2,
      type: 'AGO',
      status: 'operational',
      nozzles: [
        { id: 'noz-2-1', number: 1, type: 'AGO', totalVolumeSold: 9500 },
        { id: 'noz-2-2', number: 2, type: 'AGO', totalVolumeSold: 11200, assignedStaffId: 'staff-2', assignedStaffName: 'Sarah Johnson' }
      ],
      lastMaintenanceDate: new Date(2025, 2, 20),
      issues: []
    },
    {
      id: 'disp-3',
      number: 3,
      type: 'AGO',
      status: 'maintenance',
      nozzles: [
        { id: 'noz-3-1', number: 1, type: 'AGO', totalVolumeSold: 5200 },
        { id: 'noz-3-2', number: 2, type: 'AGO', totalVolumeSold: 4800 }
      ],
      lastMaintenanceDate: new Date(2025, 3, 1),
      issues: ['Calibration needed', 'Flow rate inconsistent']
    },
    {
      id: 'disp-4',
      number: 4,
      type: 'AGO',
      status: 'operational',
      nozzles: [
        { id: 'noz-4-1', number: 1, type: 'AGO', totalVolumeSold: 15800, assignedStaffId: 'staff-3', assignedStaffName: 'Robert Chen' },
        { id: 'noz-4-2', number: 2, type: 'AGO', totalVolumeSold: 14200, assignedStaffId: 'staff-4', assignedStaffName: 'Maria Garcia' }
      ],
      lastMaintenanceDate: new Date(2025, 2, 25),
      issues: []
    },
    {
      id: 'disp-5',
      number: 5,
      type: 'AGO',
      status: 'operational',
      nozzles: [
        { id: 'noz-5-1', number: 1, type: 'AGO', totalVolumeSold: 8200 },
        { id: 'noz-5-2', number: 2, type: 'AGO', totalVolumeSold: 7500 }
      ],
      lastMaintenanceDate: new Date(2025, 2, 10),
      issues: []
    },
    {
      id: 'disp-6',
      number: 6,
      type: 'AGO',
      status: 'offline',
      nozzles: [
        { id: 'noz-6-1', number: 1, type: 'AGO', totalVolumeSold: 3200 },
        { id: 'noz-6-2', number: 2, type: 'AGO', totalVolumeSold: 2800 }
      ],
      lastMaintenanceDate: new Date(2025, 3, 2),
      issues: ['Power supply issue', 'Needs replacement parts']
    }
  ]);

  // Mock staff data
  const [staffList, setStaffList] = useState<Staff[]>([
    { id: 'staff-1', name: 'John Doe', role: 'Attendant', shift: 'morning' },
    { id: 'staff-2', name: 'Sarah Johnson', role: 'Attendant', shift: 'afternoon' },
    { id: 'staff-3', name: 'Robert Chen', role: 'Attendant', shift: 'morning' },
    { id: 'staff-4', name: 'Maria Garcia', role: 'Attendant', shift: 'afternoon' },
    { id: 'staff-5', name: 'David Wilson', role: 'Attendant', shift: 'unassigned' },
    { id: 'staff-6', name: 'Emily Brown', role: 'Attendant', shift: 'unassigned' }
  ]);

  // Function to assign staff to a nozzle
  const assignStaffToNozzle = (dispenserId: string, nozzleId: string, staffId: string) => {
    const selectedStaff = staffList.find(staff => staff.id === staffId);
    if (!selectedStaff) return;

    setDispensers(prev => 
      prev.map(dispenser => {
        if (dispenser.id === dispenserId) {
          const updatedNozzles = dispenser.nozzles.map(nozzle => {
            if (nozzle.id === nozzleId) {
              return {
                ...nozzle,
                assignedStaffId: staffId,
                assignedStaffName: selectedStaff.name
              };
            }
            return nozzle;
          });
          return { ...dispenser, nozzles: updatedNozzles };
        }
        return dispenser;
      })
    );

    toast({
      title: "Staff Assigned",
      description: `${selectedStaff.name} has been assigned to Dispenser ${dispensers.find(d => d.id === dispenserId)?.number} Nozzle ${nozzleId.split('-')[2]}.`,
    });
  };

  const totalOperationalDispensers = dispensers.filter(d => d.status === 'operational').length;
  const totalMaintenanceDispensers = dispensers.filter(d => d.status === 'maintenance').length;
  const totalOfflineDispensers = dispensers.filter(d => d.status === 'offline').length;
  const totalVolumeSold = dispensers.reduce((sum, dispenser) => 
    sum + dispenser.nozzles.reduce((nozSum, nozzle) => nozSum + nozzle.totalVolumeSold, 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Dispenser Management</CardTitle>
          <CardDescription>
            Monitor and manage all AGO dispensers and nozzle assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dispensers">Dispensers</TabsTrigger>
              <TabsTrigger value="assignments">Staff Assignments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Dispensers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Fuel className="h-8 w-8 text-primary mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{dispensers.length}</div>
                        <div className="text-xs text-muted-foreground">
                          {dispensers.length * 2} nozzles total
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Operational Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{totalOperationalDispensers}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalMaintenanceDispensers} in maintenance, {totalOfflineDispensers} offline
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Staff Assigned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">
                          {dispensers.reduce((sum, d) => sum + d.nozzles.filter(n => n.assignedStaffId).length, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of {dispensers.length * 2} nozzles
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Volume Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Fuel className="h-8 w-8 text-amber-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{totalVolumeSold.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          liters dispensed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Dispenser Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Dispenser Issues</CardTitle>
                  <CardDescription>
                    Active maintenance and issues with dispensers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dispensers.some(d => d.issues.length > 0) ? (
                    <div className="space-y-4">
                      {dispensers.filter(d => d.issues.length > 0).map(dispenser => (
                        <div key={dispenser.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Dispenser {dispenser.number} Issues</h4>
                            <div className="flex items-center mt-1 mb-2">
                              <Badge variant={
                                dispenser.status === 'operational' ? 'outline' : 
                                dispenser.status === 'maintenance' ? 'secondary' : 
                                'destructive'
                              }>
                                {dispenser.status.charAt(0).toUpperCase() + dispenser.status.slice(1)}
                              </Badge>
                              {dispenser.lastMaintenanceDate && (
                                <span className="text-xs text-muted-foreground ml-2 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Last maintenance: {dispenser.lastMaintenanceDate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <ul className="mt-1 space-y-1">
                              {dispenser.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                      <CheckCircle className="h-10 w-10 mb-3 text-green-500 opacity-30" />
                      <p>No active issues</p>
                      <p className="text-sm">All dispensers are functioning properly</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dispensers" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dispensers.map(dispenser => (
                  <Card key={dispenser.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Dispenser {dispenser.number}</CardTitle>
                        <Badge variant={
                          dispenser.status === 'operational' ? 'outline' : 
                          dispenser.status === 'maintenance' ? 'secondary' : 
                          'destructive'
                        }>
                          {dispenser.status.charAt(0).toUpperCase() + dispenser.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {dispenser.type} - {dispenser.nozzles.length} nozzles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dispenser.nozzles.map(nozzle => (
                          <div key={nozzle.id} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Nozzle {nozzle.number}</h4>
                              <Badge variant="outline">{nozzle.type}</Badge>
                            </div>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between items-center">
                                <span>Volume Sold:</span>
                                <span className="font-medium">{nozzle.totalVolumeSold.toLocaleString()} liters</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Assigned To:</span>
                                <span className={`font-medium ${!nozzle.assignedStaffName ? 'text-muted-foreground' : ''}`}>
                                  {nozzle.assignedStaffName || 'Unassigned'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {dispenser.issues.length > 0 && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                            <div className="font-medium flex items-center text-amber-700">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Issues
                            </div>
                            <ul className="mt-1 space-y-1 pl-5 list-disc">
                              {dispenser.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                      {dispenser.lastMaintenanceDate ? (
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Last maintenance: {dispenser.lastMaintenanceDate.toLocaleDateString()}
                        </div>
                      ) : (
                        <div>No maintenance records</div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="assignments" className="mt-4">
              <div className="space-y-6">
                {dispensers.map(dispenser => (
                  <Card key={dispenser.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Dispenser {dispenser.number} Assignments</CardTitle>
                        <Badge variant={
                          dispenser.status === 'operational' ? 'outline' : 
                          dispenser.status === 'maintenance' ? 'secondary' : 
                          'destructive'
                        }>
                          {dispenser.status.charAt(0).toUpperCase() + dispenser.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dispenser.nozzles.map(nozzle => (
                          <div key={nozzle.id} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 p-4 border rounded-md">
                            <div className="flex-1">
                              <h4 className="font-medium">Nozzle {nozzle.number}</h4>
                              <p className="text-sm text-muted-foreground">
                                {nozzle.type} - {nozzle.totalVolumeSold.toLocaleString()} liters sold
                              </p>
                              <div className="mt-1 text-sm">
                                <span className="font-medium">Current Assignment: </span>
                                <span className={!nozzle.assignedStaffName ? 'italic text-muted-foreground' : ''}>
                                  {nozzle.assignedStaffName || 'None'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center w-full sm:w-64">
                                <Select 
                                  onValueChange={(value) => assignStaffToNozzle(dispenser.id, nozzle.id, value)}
                                  disabled={dispenser.status !== 'operational'}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Assign staff" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {staffList.map(staff => (
                                      <SelectItem key={staff.id} value={staff.id}>
                                        {staff.name} ({staff.shift})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {dispenser.status !== 'operational' && (
                                <p className="text-xs text-muted-foreground">
                                  Cannot assign staff to non-operational dispensers
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispenserManagement;
