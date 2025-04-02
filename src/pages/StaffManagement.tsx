
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus, UserCog, ShieldAlert, CheckCircle, UserCheck, Clock, Pen } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Staff {
  id: string;
  name: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'unassigned';
  contactNumber: string;
  email?: string;
  assignedDispensers: { id: string, name: string }[];
  status: 'active' | 'inactive';
  joinDate: Date;
  performanceRating?: number;
}

const StaffManagement: React.FC = () => {
  const { toast } = useToast();
  
  // State for staff members
  const [staffMembers, setStaffMembers] = useState<Staff[]>([
    {
      id: 'staff-1',
      name: 'John Doe',
      role: 'Attendant',
      shift: 'morning',
      contactNumber: '123-456-7890',
      email: 'john.doe@example.com',
      assignedDispensers: [{ id: 'disp-1', name: 'Dispenser 1 Nozzle 1' }],
      status: 'active',
      joinDate: new Date(2024, 8, 15),
      performanceRating: 4.5
    },
    {
      id: 'staff-2',
      name: 'Sarah Johnson',
      role: 'Attendant',
      shift: 'afternoon',
      contactNumber: '123-456-7891',
      email: 'sarah.j@example.com',
      assignedDispensers: [{ id: 'disp-2', name: 'Dispenser 2 Nozzle 2' }],
      status: 'active',
      joinDate: new Date(2024, 9, 3),
      performanceRating: 4.2
    },
    {
      id: 'staff-3',
      name: 'Robert Chen',
      role: 'Attendant',
      shift: 'morning',
      contactNumber: '123-456-7892',
      assignedDispensers: [{ id: 'disp-4', name: 'Dispenser 4 Nozzle 1' }],
      status: 'active',
      joinDate: new Date(2023, 11, 10),
      performanceRating: 3.8
    },
    {
      id: 'staff-4',
      name: 'Maria Garcia',
      role: 'Attendant',
      shift: 'afternoon',
      contactNumber: '123-456-7893',
      email: 'maria.g@example.com',
      assignedDispensers: [{ id: 'disp-4', name: 'Dispenser 4 Nozzle 2' }],
      status: 'active',
      joinDate: new Date(2024, 2, 22),
      performanceRating: 4.7
    },
    {
      id: 'staff-5',
      name: 'David Wilson',
      role: 'Attendant',
      shift: 'unassigned',
      contactNumber: '123-456-7894',
      assignedDispensers: [],
      status: 'inactive',
      joinDate: new Date(2024, 7, 5)
    }
  ]);
  
  // State for new staff form
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Attendant',
    shift: 'unassigned',
    contactNumber: '',
    email: '',
    status: 'active'
  });
  
  // Add new staff member
  const handleAddStaff = () => {
    // Validate form
    if (!newStaff.name || !newStaff.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new staff member
    const staff: Staff = {
      id: `staff-${Date.now()}`,
      name: newStaff.name,
      role: newStaff.role,
      shift: newStaff.shift as 'morning' | 'afternoon' | 'unassigned',
      contactNumber: newStaff.contactNumber,
      email: newStaff.email || undefined,
      assignedDispensers: [],
      status: newStaff.status as 'active' | 'inactive',
      joinDate: new Date()
    };
    
    // Add to staff members
    setStaffMembers(prev => [staff, ...prev]);
    
    // Reset form
    setNewStaff({
      name: '',
      role: 'Attendant',
      shift: 'unassigned',
      contactNumber: '',
      email: '',
      status: 'active'
    });
    
    toast({
      title: "Staff Added",
      description: `${staff.name} has been added successfully.`
    });
  };
  
  // Count staff by shift
  const morningShiftCount = staffMembers.filter(s => s.shift === 'morning' && s.status === 'active').length;
  const afternoonShiftCount = staffMembers.filter(s => s.shift === 'afternoon' && s.status === 'active').length;
  const unassignedShiftCount = staffMembers.filter(s => s.shift === 'unassigned' && s.status === 'active').length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            Manage staff, shifts, and dispenser assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staff-list">
            <TabsList>
              <TabsTrigger value="staff-list">Staff List</TabsTrigger>
              <TabsTrigger value="add-staff">Add Staff</TabsTrigger>
              <TabsTrigger value="shift-management">Shift Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="staff-list" className="space-y-6 mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-primary mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{staffMembers.length}</div>
                        <div className="text-xs text-muted-foreground">
                          {staffMembers.filter(s => s.status === 'active').length} active
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Morning Shift
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-orange-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{morningShiftCount}</div>
                        <div className="text-xs text-muted-foreground">
                          staff assigned
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Afternoon Shift
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-blue-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{afternoonShiftCount}</div>
                        <div className="text-xs text-muted-foreground">
                          staff assigned
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Staff Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Staff Directory</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Staff
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Staff</DialogTitle>
                          <DialogDescription>
                            Fill in the details to add a new staff member
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name*</Label>
                            <Input
                              id="name"
                              value={newStaff.name}
                              onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Full Name"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={newStaff.role}
                                onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}
                              >
                                <SelectTrigger id="role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Attendant">Attendant</SelectItem>
                                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                                  <SelectItem value="Manager">Manager</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="shift">Shift</Label>
                              <Select
                                value={newStaff.shift}
                                onValueChange={(value) => setNewStaff(prev => ({ ...prev, shift: value }))}
                              >
                                <SelectTrigger id="shift">
                                  <SelectValue placeholder="Select shift" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">Morning</SelectItem>
                                  <SelectItem value="afternoon">Afternoon</SelectItem>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contactNumber">Contact Number*</Label>
                            <Input
                              id="contactNumber"
                              value={newStaff.contactNumber}
                              onChange={(e) => setNewStaff(prev => ({ ...prev, contactNumber: e.target.value }))}
                              placeholder="Phone Number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newStaff.email}
                              onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email Address (Optional)"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={newStaff.status}
                              onValueChange={(value) => setNewStaff(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button type="submit" onClick={handleAddStaff}>
                            Add Staff
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map(staff => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.name}
                            {staff.performanceRating && (
                              <div className="text-xs text-muted-foreground">
                                Rating: {staff.performanceRating}/5
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>
                            <Badge variant={
                              staff.shift === 'morning' ? 'outline' : 
                              staff.shift === 'afternoon' ? 'secondary' : 
                              'default'
                            }>
                              {staff.shift === 'morning' ? 'Morning' : 
                              staff.shift === 'afternoon' ? 'Afternoon' : 
                              'Unassigned'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {staff.contactNumber}
                            {staff.email && (
                              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {staff.email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {staff.assignedDispensers.length > 0 ? (
                              <div className="space-y-1">
                                {staff.assignedDispensers.map((disp, idx) => (
                                  <div key={idx} className="text-sm">
                                    {disp.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={staff.status === 'active' ? 'success' : 'destructive'}>
                              {staff.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon">
                                <Pen className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              
                              <Button variant="ghost" size="icon">
                                <UserCog className="h-4 w-4" />
                                <span className="sr-only">Manage</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="add-staff" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Staff Member</CardTitle>
                  <CardDescription>
                    Add details for a new staff member to join the team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-name">Full Name*</Label>
                      <Input
                        id="add-name"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-role">Role</Label>
                        <Select
                          value={newStaff.role}
                          onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger id="add-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Attendant">Attendant</SelectItem>
                            <SelectItem value="Supervisor">Supervisor</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="add-shift">Shift</Label>
                        <Select
                          value={newStaff.shift}
                          onValueChange={(value) => setNewStaff(prev => ({ ...prev, shift: value }))}
                        >
                          <SelectTrigger id="add-shift">
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-contact">Contact Number*</Label>
                        <Input
                          id="add-contact"
                          value={newStaff.contactNumber}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, contactNumber: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="add-email">Email Address</Label>
                        <Input
                          id="add-email"
                          type="email"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="add-status">Status</Label>
                      <Select
                        value={newStaff.status}
                        onValueChange={(value) => setNewStaff(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger id="add-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setNewStaff({
                      name: '',
                      role: 'Attendant',
                      shift: 'unassigned',
                      contactNumber: '',
                      email: '',
                      status: 'active'
                    })}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleAddStaff}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff Member
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="shift-management" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shift Management</CardTitle>
                  <CardDescription>
                    Manage staff shifts and allocations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="morning">
                    <TabsList>
                      <TabsTrigger value="morning">Morning Shift</TabsTrigger>
                      <TabsTrigger value="afternoon">Afternoon Shift</TabsTrigger>
                      <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="morning" className="mt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Dispenser Assignment</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {staffMembers
                              .filter(s => s.shift === 'morning' && s.status === 'active')
                              .map(staff => (
                                <TableRow key={staff.id}>
                                  <TableCell className="font-medium">{staff.name}</TableCell>
                                  <TableCell>{staff.role}</TableCell>
                                  <TableCell>
                                    {staff.assignedDispensers.length > 0 ? (
                                      <div className="space-y-1">
                                        {staff.assignedDispensers.map((disp, idx) => (
                                          <div key={idx} className="text-sm flex items-center">
                                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                            {disp.name}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">None</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Select>
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Change shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="afternoon">Move to Afternoon</SelectItem>
                                          <SelectItem value="unassigned">Set as Unassigned</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            
                            {staffMembers.filter(s => s.shift === 'morning' && s.status === 'active').length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                  No staff assigned to the morning shift
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="afternoon" className="mt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Dispenser Assignment</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {staffMembers
                              .filter(s => s.shift === 'afternoon' && s.status === 'active')
                              .map(staff => (
                                <TableRow key={staff.id}>
                                  <TableCell className="font-medium">{staff.name}</TableCell>
                                  <TableCell>{staff.role}</TableCell>
                                  <TableCell>
                                    {staff.assignedDispensers.length > 0 ? (
                                      <div className="space-y-1">
                                        {staff.assignedDispensers.map((disp, idx) => (
                                          <div key={idx} className="text-sm flex items-center">
                                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                            {disp.name}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">None</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Select>
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Change shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="morning">Move to Morning</SelectItem>
                                          <SelectItem value="unassigned">Set as Unassigned</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            
                            {staffMembers.filter(s => s.shift === 'afternoon' && s.status === 'active').length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                  No staff assigned to the afternoon shift
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="unassigned" className="mt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {staffMembers
                              .filter(s => s.shift === 'unassigned')
                              .map(staff => (
                                <TableRow key={staff.id}>
                                  <TableCell className="font-medium">{staff.name}</TableCell>
                                  <TableCell>{staff.role}</TableCell>
                                  <TableCell>
                                    <Badge variant={staff.status === 'active' ? 'success' : 'destructive'}>
                                      {staff.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Select disabled={staff.status !== 'active'}>
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Assign to shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="morning">Assign to Morning</SelectItem>
                                          <SelectItem value="afternoon">Assign to Afternoon</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            
                            {staffMembers.filter(s => s.shift === 'unassigned').length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                  No unassigned staff members
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
