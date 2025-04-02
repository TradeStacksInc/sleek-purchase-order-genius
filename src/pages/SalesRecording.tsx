
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, PlusCircle, Calendar, Download, FileText, CheckSquare, Fuel, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SalesRecord {
  id: string;
  date: Date;
  staffId: string;
  staffName: string;
  shift: 'morning' | 'afternoon';
  dispenserId: string;
  dispenserNumber: number;
  nozzleNumber: number;
  fuelType: 'PMS' | 'AGO';
  volumeSold: number;
  amountCollected: number;
  verified: boolean;
  systemRecordedVolume?: number;
  discrepancy?: number;
  discrepancyPercentage?: number;
  notes?: string;
}

const SalesRecording: React.FC = () => {
  const { toast } = useToast();
  
  // State for sales records
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([
    {
      id: 'sale-1',
      date: new Date(2025, 3, 2),
      staffId: 'staff-1',
      staffName: 'John Doe',
      shift: 'morning',
      dispenserId: 'disp-1',
      dispenserNumber: 1,
      nozzleNumber: 1,
      fuelType: 'AGO',
      volumeSold: 980,
      amountCollected: 225400,
      verified: true,
      systemRecordedVolume: 985,
      discrepancy: 5,
      discrepancyPercentage: 0.51
    },
    {
      id: 'sale-2',
      date: new Date(2025, 3, 2),
      staffId: 'staff-3',
      staffName: 'Robert Chen',
      shift: 'morning',
      dispenserId: 'disp-4',
      dispenserNumber: 4,
      nozzleNumber: 1,
      fuelType: 'AGO',
      volumeSold: 1250,
      amountCollected: 287500,
      verified: true,
      systemRecordedVolume: 1248,
      discrepancy: -2,
      discrepancyPercentage: -0.16
    },
    {
      id: 'sale-3',
      date: new Date(2025, 3, 2),
      staffId: 'staff-2',
      staffName: 'Sarah Johnson',
      shift: 'afternoon',
      dispenserId: 'disp-2',
      dispenserNumber: 2,
      nozzleNumber: 2,
      fuelType: 'AGO',
      volumeSold: 1100,
      amountCollected: 253000,
      verified: true,
      systemRecordedVolume: 1180,
      discrepancy: 80,
      discrepancyPercentage: 6.78,
      notes: "Staff claims payment was for 1100L, system shows higher volume dispensed."
    },
    {
      id: 'sale-4',
      date: new Date(2025, 3, 2),
      staffId: 'staff-4',
      staffName: 'Maria Garcia',
      shift: 'afternoon',
      dispenserId: 'disp-4',
      dispenserNumber: 4,
      nozzleNumber: 2,
      fuelType: 'AGO',
      volumeSold: 950,
      amountCollected: 218500,
      verified: false
    }
  ]);
  
  // State for new sales record
  const [newSale, setNewSale] = useState({
    staffId: '',
    shift: 'morning',
    dispenserId: '',
    nozzleNumber: '1',
    fuelType: 'AGO',
    volumeSold: '',
    amountCollected: '',
    notes: ''
  });
  
  // Mock staff data for dropdown
  const staffMembers = [
    { id: 'staff-1', name: 'John Doe', shift: 'morning' },
    { id: 'staff-2', name: 'Sarah Johnson', shift: 'afternoon' },
    { id: 'staff-3', name: 'Robert Chen', shift: 'morning' },
    { id: 'staff-4', name: 'Maria Garcia', shift: 'afternoon' }
  ];
  
  // Mock dispenser data for dropdown
  const dispensers = [
    { id: 'disp-1', number: 1, type: 'AGO' },
    { id: 'disp-2', number: 2, type: 'AGO' },
    { id: 'disp-3', number: 3, type: 'AGO' },
    { id: 'disp-4', number: 4, type: 'AGO' },
    { id: 'disp-5', number: 5, type: 'AGO' },
    { id: 'disp-6', number: 6, type: 'AGO' }
  ];
  
  // Calculate fuel prices
  const fuelPrices = {
    AGO: 230, // ₦ per liter
    PMS: 210  // ₦ per liter
  };
  
  // Add new sales record
  const handleAddSalesRecord = () => {
    // Validate form
    if (
      !newSale.staffId || 
      !newSale.dispenserId || 
      !newSale.volumeSold || 
      !newSale.amountCollected
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const volumeSold = parseFloat(newSale.volumeSold);
    const amountCollected = parseFloat(newSale.amountCollected);
    
    if (isNaN(volumeSold) || isNaN(amountCollected)) {
      toast({
        title: "Invalid Input",
        description: "Volume and amount must be valid numbers.",
        variant: "destructive"
      });
      return;
    }
    
    // Get staff and dispenser details
    const staff = staffMembers.find(s => s.id === newSale.staffId);
    const dispenser = dispensers.find(d => d.id === newSale.dispenserId);
    
    if (!staff || !dispenser) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid staff member and dispenser.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new sales record
    const salesRecord: SalesRecord = {
      id: `sale-${Date.now()}`,
      date: new Date(),
      staffId: staff.id,
      staffName: staff.name,
      shift: staff.shift as 'morning' | 'afternoon',
      dispenserId: dispenser.id,
      dispenserNumber: dispenser.number,
      nozzleNumber: parseInt(newSale.nozzleNumber),
      fuelType: newSale.fuelType as 'PMS' | 'AGO',
      volumeSold,
      amountCollected,
      verified: false,
      notes: newSale.notes || undefined
    };
    
    // Add to sales records
    setSalesRecords(prev => [salesRecord, ...prev]);
    
    // Reset form
    setNewSale({
      staffId: '',
      shift: 'morning',
      dispenserId: '',
      nozzleNumber: '1',
      fuelType: 'AGO',
      volumeSold: '',
      amountCollected: '',
      notes: ''
    });
    
    toast({
      title: "Sales Record Added",
      description: `Sales record for ${staff.name} has been added successfully.`
    });
  };
  
  // Calculate expected amount based on volume and fuel type
  const calculateExpectedAmount = (volume: string, fuelType: string) => {
    const numVolume = parseFloat(volume);
    if (isNaN(numVolume)) return '';
    
    const price = fuelType === 'PMS' ? fuelPrices.PMS : fuelPrices.AGO;
    return (numVolume * price).toString();
  };
  
  // Handle volume change in form
  const handleVolumeChange = (volume: string) => {
    setNewSale(prev => ({
      ...prev,
      volumeSold: volume,
      amountCollected: calculateExpectedAmount(volume, prev.fuelType)
    }));
  };
  
  // Handle fuel type change in form
  const handleFuelTypeChange = (fuelType: string) => {
    setNewSale(prev => ({
      ...prev,
      fuelType,
      amountCollected: prev.volumeSold ? calculateExpectedAmount(prev.volumeSold, fuelType) : ''
    }));
  };
  
  // Calculate statistics
  const totalLitersSold = salesRecords.reduce((sum, record) => sum + record.volumeSold, 0);
  const totalRevenue = salesRecords.reduce((sum, record) => sum + record.amountCollected, 0);
  const totalAGOSold = salesRecords.filter(r => r.fuelType === 'AGO').reduce((sum, record) => sum + record.volumeSold, 0);
  const totalPMSSold = salesRecords.filter(r => r.fuelType === 'PMS').reduce((sum, record) => sum + record.volumeSold, 0);
  
  // Records with significant discrepancies (>5%)
  const flaggedRecords = salesRecords.filter(r => 
    r.verified && r.discrepancyPercentage !== undefined && Math.abs(r.discrepancyPercentage) > 5
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Sales Recording</CardTitle>
          <CardDescription>
            Record and verify daily fuel sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="record-sales">
            <TabsList>
              <TabsTrigger value="record-sales">Record Sales</TabsTrigger>
              <TabsTrigger value="sales-history">Sales History</TabsTrigger>
              <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="record-sales" className="space-y-6 mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Liters Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Fuel className="h-8 w-8 text-primary mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{totalLitersSold.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          liters ({totalAGOSold.toLocaleString()} AGO, {totalPMSSold.toLocaleString()} PMS)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          for {salesRecords.length} transactions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Flagged Discrepancies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{flaggedRecords.length}</div>
                        <div className="text-xs text-muted-foreground">
                          transactions with &gt;5% variance
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* New Sales Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Sales Record</CardTitle>
                  <CardDescription>
                    Record a new sales transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staff">Staff Member*</Label>
                        <Select 
                          value={newSale.staffId}
                          onValueChange={(value) => setNewSale(prev => ({ ...prev, staffId: value }))}
                        >
                          <SelectTrigger id="staff">
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                          <SelectContent>
                            {staffMembers.map(staff => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name} ({staff.shift} shift)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dispenser">Dispenser*</Label>
                        <Select 
                          value={newSale.dispenserId}
                          onValueChange={(value) => setNewSale(prev => ({ ...prev, dispenserId: value }))}
                        >
                          <SelectTrigger id="dispenser">
                            <SelectValue placeholder="Select dispenser" />
                          </SelectTrigger>
                          <SelectContent>
                            {dispensers.map(dispenser => (
                              <SelectItem key={dispenser.id} value={dispenser.id}>
                                Dispenser {dispenser.number} ({dispenser.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="nozzle">Nozzle Number*</Label>
                        <Select 
                          value={newSale.nozzleNumber}
                          onValueChange={(value) => setNewSale(prev => ({ ...prev, nozzleNumber: value }))}
                        >
                          <SelectTrigger id="nozzle">
                            <SelectValue placeholder="Select nozzle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Nozzle 1</SelectItem>
                            <SelectItem value="2">Nozzle 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type*</Label>
                        <Select 
                          value={newSale.fuelType}
                          onValueChange={handleFuelTypeChange}
                        >
                          <SelectTrigger id="fuelType">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AGO">AGO (Diesel) - ₦{fuelPrices.AGO}/liter</SelectItem>
                            <SelectItem value="PMS">PMS (Petrol) - ₦{fuelPrices.PMS}/liter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="volumeSold">Volume Sold (Liters)*</Label>
                        <Input
                          id="volumeSold"
                          type="number"
                          value={newSale.volumeSold}
                          onChange={(e) => handleVolumeChange(e.target.value)}
                          placeholder="Enter volume in liters"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="amountCollected">Amount Collected (₦)*</Label>
                        <Input
                          id="amountCollected"
                          type="number"
                          value={newSale.amountCollected}
                          onChange={(e) => setNewSale(prev => ({ ...prev, amountCollected: e.target.value }))}
                          placeholder="Enter amount in Naira"
                          min="0"
                        />
                        {newSale.volumeSold && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expected: ₦{calculateExpectedAmount(newSale.volumeSold, newSale.fuelType)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newSale.notes}
                      onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes about this transaction"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setNewSale({
                      staffId: '',
                      shift: 'morning',
                      dispenserId: '',
                      nozzleNumber: '1',
                      fuelType: 'AGO',
                      volumeSold: '',
                      amountCollected: '',
                      notes: ''
                    })}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleAddSalesRecord}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sales Record
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="sales-history" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sales Transaction History</CardTitle>
                      <CardDescription>
                        Record of all sales transactions
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Date Range</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Dispenser</TableHead>
                        <TableHead>Fuel</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesRecords.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {format(record.date, 'MMM dd, yyyy')}
                            <div className="text-xs text-muted-foreground">
                              {record.shift} shift
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.staffName}
                          </TableCell>
                          <TableCell>
                            Disp {record.dispenserNumber}-{record.nozzleNumber}
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.fuelType === 'PMS' ? 'destructive' : 'default'}>
                              {record.fuelType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.volumeSold.toLocaleString()} L
                            {record.systemRecordedVolume && (
                              <div className="text-xs text-muted-foreground">
                                System: {record.systemRecordedVolume.toLocaleString()} L
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            ₦{record.amountCollected.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {record.verified ? (
                              <div className="flex items-center">
                                <CheckSquare className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm">Verified</span>
                              </div>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discrepancies" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discrepancy Analysis</CardTitle>
                  <CardDescription>
                    Transactions with variance between reported and system values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {flaggedRecords.length > 0 ? (
                    <div className="space-y-6">
                      {flaggedRecords.map(record => (
                        <div key={record.id} className="p-4 border rounded-md bg-amber-50">
                          <div className="flex items-start gap-4">
                            <AlertTriangle className="h-10 w-10 text-amber-500 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h3 className="font-medium text-lg">
                                  {record.staffName} - {format(record.date, 'MMM dd, yyyy')}
                                </h3>
                                <Badge variant="destructive" className="sm:ml-2 mt-1 sm:mt-0 w-fit">
                                  {record.discrepancyPercentage?.toFixed(2)}% Variance
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-sm font-medium">Dispenser Info</p>
                                  <p className="text-sm">
                                    Dispenser {record.dispenserNumber}, Nozzle {record.nozzleNumber}
                                  </p>
                                  <p className="text-sm">{record.fuelType} Fuel</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Reported by Staff</p>
                                  <p className="text-sm">Volume: {record.volumeSold.toLocaleString()} L</p>
                                  <p className="text-sm">Amount: ₦{record.amountCollected.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">System Recorded</p>
                                  <p className="text-sm">Volume: {record.systemRecordedVolume?.toLocaleString()} L</p>
                                  <p className="text-sm">
                                    Difference: {record.discrepancy && record.discrepancy > 0 ? '+' : ''}
                                    {record.discrepancy?.toLocaleString()} L
                                  </p>
                                </div>
                              </div>
                              {record.notes && (
                                <div className="mt-2 p-2 bg-white rounded border border-amber-200 text-sm">
                                  <p className="font-medium">Notes:</p>
                                  <p>{record.notes}</p>
                                </div>
                              )}
                              <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" className="mr-2">
                                  Mark as Resolved
                                </Button>
                                <Button size="sm">
                                  Investigate
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckSquare className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-1">No Significant Discrepancies</h3>
                      <p className="text-muted-foreground">
                        All verified transactions are within acceptable variance limits
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Discrepancy Prevention</CardTitle>
                  <CardDescription>
                    Analytics and trends to help identify potential issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium text-lg mb-2">Staff Performance Analysis</h3>
                      <p className="text-sm mb-3">
                        Track discrepancy patterns by staff member to identify training or fraud concerns
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full">
                          View Staff Analysis
                        </Button>
                        <Button variant="outline" className="w-full">
                          Schedule Training
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium text-lg mb-2">Equipment Calibration Schedule</h3>
                      <p className="text-sm mb-3">
                        Regular dispenser calibration can prevent measurement discrepancies
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full">
                          View Calibration History
                        </Button>
                        <Button variant="outline" className="w-full">
                          Schedule Calibration
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRecording;
