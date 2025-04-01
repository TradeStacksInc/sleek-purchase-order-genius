
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isWithinInterval, subDays, startOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Check, Flag, Info, Truck, AlertTriangle } from 'lucide-react';
import { OffloadingDetails, PurchaseOrder, Incident } from '@/types';
import { cn } from '@/lib/utils';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const DeliveryLog: React.FC = () => {
  const { purchaseOrders, getDriverById, getTruckById } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter deliveries based on status and date
  const filteredDeliveries = useMemo(() => {
    let filtered = purchaseOrders.filter(order => order.deliveryDetails);

    // Filter by tab/status
    if (activeTab === 'delivered') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'delivered');
    } else if (activeTab === 'in-transit') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'in_transit');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'pending');
    } else if (activeTab === 'flagged') {
      filtered = filtered.filter(order => order.offloadingDetails?.isDiscrepancyFlagged);
    }

    // Apply date filter
    if (dateFilter === 'all') return filtered;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return filtered.filter(order => {
      if (!order.deliveryDetails) return false;
      
      const orderDate = order.deliveryDetails.destinationArrivalTime || order.updatedAt;
      
      switch (dateFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = subDays(today, 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthStart = startOfMonth(today);
          return orderDate >= monthStart;
        case 'custom':
          if (!dateRange?.from) return true;
          
          const from = new Date(dateRange.from);
          from.setHours(0, 0, 0, 0);
          
          let to = dateRange.to ? new Date(dateRange.to) : new Date(from);
          to.setHours(23, 59, 59, 999);
          
          return isWithinInterval(orderDate, { start: from, end: to });
        default:
          return true;
      }
    });
  }, [purchaseOrders, activeTab, dateFilter, dateRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Delivery Log</CardTitle>
              <CardDescription>
                Track and manage all product deliveries
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by:</span>
                <Select
                  value={dateFilter}
                  onValueChange={(value) => {
                    setDateFilter(value as DateFilter);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Deliveries</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateFilter === 'custom' && (
                <div className="w-full sm:w-auto">
                  <DateRangePicker 
                    date={dateRange} 
                    onDateChange={setDateRange} 
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              setCurrentPage(1);
            }}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="in-transit">In Transit</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged" className="text-red-500">
                Flagged
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Driver & Truck</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Discrepancy</TableHead>
                  <TableHead>Incidents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDeliveries.length > 0 ? (
                  currentDeliveries.map((order) => {
                    const delivery = order.deliveryDetails;
                    const offloading = order.offloadingDetails;
                    
                    if (!delivery) return null;
                    
                    const driver = delivery.driverId ? getDriverById(delivery.driverId) : undefined;
                    const truck = delivery.truckId ? getTruckById(delivery.truckId) : undefined;
                    
                    let discrepancyPercent = 0;
                    let rowColorClass = '';
                    
                    if (offloading) {
                      discrepancyPercent = offloading.discrepancyPercentage;
                      
                      if (discrepancyPercent > 5) {
                        rowColorClass = 'bg-red-50';
                      } else if (discrepancyPercent > 0) {
                        rowColorClass = 'bg-yellow-50';
                      } else {
                        rowColorClass = 'bg-green-50';
                      }
                    }
                    
                    return (
                      <TableRow key={order.id} className={rowColorClass}>
                        <TableCell className="font-medium">{order.poNumber}</TableCell>
                        <TableCell>
                          {driver ? (
                            <div>
                              <div>{driver.name}</div>
                              <div className="text-xs text-muted-foreground">{truck?.plateNumber}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DeliveryStatusBadge status={delivery.status} />
                        </TableCell>
                        <TableCell>
                          {delivery.destinationArrivalTime && delivery.depotDepartureTime ? (
                            calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {offloading ? (
                            <div>
                              <div>{offloading.deliveredVolume.toLocaleString()} L</div>
                              <div className="text-xs text-muted-foreground">of {offloading.loadedVolume.toLocaleString()} L</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {offloading ? (
                            <DiscrepancyBadge discrepancyPercent={discrepancyPercent} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.incidents && order.incidents.length > 0 ? (
                            <div className="flex gap-1">
                              {order.incidents.some(inc => inc.impact === 'negative') && (
                                <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
                                  <span>-</span>
                                </Badge>
                              )}
                              {order.incidents.some(inc => inc.impact === 'positive') && (
                                <Badge variant="outline" className="bg-green-100 h-6 w-6 p-0 flex items-center justify-center rounded-full">
                                  <span>+</span>
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <DetailsDialog order={order} />
                            
                            {delivery.status === 'delivered' && !offloading && (
                              <OffloadingDialog orderId={order.id} />
                            )}
                            
                            <IncidentDialog orderId={order.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No deliveries found matching your filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to calculate delivery time
const calculateDeliveryTime = (start: Date, end: Date) => {
  const diffMs = end.getTime() - start.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};

// Delivery Status Badge Component
const DeliveryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'delivered':
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white">
          Delivered
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500 text-white">
          In Transit
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
          Pending
        </Badge>
      );
    default:
      return null;
  }
};

// Discrepancy Badge Component
const DiscrepancyBadge: React.FC<{ discrepancyPercent: number }> = ({ discrepancyPercent }) => {
  if (discrepancyPercent > 5) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {discrepancyPercent.toFixed(1)}%
      </Badge>
    );
  } else if (discrepancyPercent > 0) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Info className="h-3 w-3" />
        {discrepancyPercent.toFixed(1)}%
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
        <Check className="h-3 w-3" />
        0%
      </Badge>
    );
  }
};

// Details Dialog Component
const DetailsDialog: React.FC<{ order: PurchaseOrder }> = ({ order }) => {
  const { getDriverById, getTruckById } = useApp();
  
  if (!order.deliveryDetails) return null;
  
  const delivery = order.deliveryDetails;
  const driver = delivery.driverId ? getDriverById(delivery.driverId) : undefined;
  const truck = delivery.truckId ? getTruckById(delivery.truckId) : undefined;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Details - PO #{order.poNumber}</DialogTitle>
          <DialogDescription>
            Detailed information about this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Delivery Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Status:</span>
                <span><DeliveryStatusBadge status={delivery.status} /></span>
              </div>
              
              {delivery.depotDepartureTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Departure:</span>
                  <span>{format(delivery.depotDepartureTime, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              
              {delivery.destinationArrivalTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Arrival:</span>
                  <span>{format(delivery.destinationArrivalTime, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              
              {delivery.depotDepartureTime && delivery.destinationArrivalTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span>{calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Driver & Truck</h4>
            <div className="space-y-2">
              {driver ? (
                <>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Driver:</span>
                    <span>{driver.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{driver.contact}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">License:</span>
                    <span>{driver.licenseNumber}</span>
                  </div>
                </>
              ) : (
                <div className="pb-1 text-center text-muted-foreground">No driver assigned</div>
              )}
              
              {truck ? (
                <>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Truck:</span>
                    <span>{truck.plateNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{truck.model}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span>{truck.capacity.toLocaleString()} L</span>
                  </div>
                </>
              ) : (
                <div className="pb-1 text-center text-muted-foreground">No truck assigned</div>
              )}
            </div>
          </div>
        </div>
        
        {order.offloadingDetails && (
          <div>
            <h4 className="text-sm font-medium mb-2">Offloading Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Loaded Volume:</span>
                  <span>{order.offloadingDetails.loadedVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Delivered Volume:</span>
                  <span>{order.offloadingDetails.deliveredVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Discrepancy:</span>
                  <DiscrepancyBadge discrepancyPercent={order.offloadingDetails.discrepancyPercentage} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Initial Tank Volume:</span>
                  <span>{order.offloadingDetails.initialTankVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Final Tank Volume:</span>
                  <span>{order.offloadingDetails.finalTankVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Measured By:</span>
                  <span>{order.offloadingDetails.measuredBy} ({order.offloadingDetails.measuredByRole})</span>
                </div>
              </div>
            </div>
            
            {order.offloadingDetails.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm border rounded-md p-2 bg-muted">
                  {order.offloadingDetails.notes}
                </p>
              </div>
            )}
            
            {order.offloadingDetails.isDiscrepancyFlagged && (
              <div className="mt-4 p-2 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-800">
                  This delivery has been flagged for investigation due to significant volume discrepancy.
                </p>
              </div>
            )}
          </div>
        )}
        
        {order.incidents && order.incidents.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Incidents</h4>
            <div className="space-y-3">
              {order.incidents.map(incident => (
                <div key={incident.id} className={cn(
                  "p-2 rounded-md border text-sm",
                  incident.impact === 'positive' ? "bg-green-50 border-green-200" :
                  incident.impact === 'negative' ? "bg-red-50 border-red-200" :
                  "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{incident.type}</span>
                    <span className="text-xs">{format(incident.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <p>{incident.description}</p>
                  <div className="text-xs mt-1">Reported by: {incident.reportedBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Offloading Form Schema
const offloadingFormSchema = z.object({
  loadedVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  deliveredVolume: z.coerce.number().min(1, "Volume must be greater than 0"),
  initialTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  finalTankVolume: z.coerce.number().min(0, "Volume cannot be negative"),
  measuredBy: z.string().min(2, "Name must be at least 2 characters"),
  measuredByRole: z.string().min(2, "Role must be at least 2 characters"),
  notes: z.string().optional(),
});

// Offloading Dialog Component
const OffloadingDialog: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { recordOffloadingDetails } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof offloadingFormSchema>>({
    resolver: zodResolver(offloadingFormSchema),
    defaultValues: {
      loadedVolume: 0,
      deliveredVolume: 0,
      initialTankVolume: 0,
      finalTankVolume: 0,
      measuredBy: "",
      measuredByRole: "",
      notes: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof offloadingFormSchema>) {
    recordOffloadingDetails(orderId, values);
    setIsOpen(false);
    form.reset();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="h-4 w-4 mr-2" />
          Offload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Offloading Details</DialogTitle>
          <DialogDescription>
            Enter the offloading details to complete the delivery record.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loadedVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loaded Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Volume loaded at depot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveredVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivered Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Volume offloaded at destination
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialTankVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Tank Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tank volume before offloading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="finalTankVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Tank Volume (L)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tank volume after offloading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="measuredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measured By</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of staff who measured
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="measuredByRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Position of the staff
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Add any relevant notes about the offloading process"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Offloading Details</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Incident Form Schema
const incidentFormSchema = z.object({
  type: z.enum(['delay', 'mechanical', 'accident', 'feedback', 'other'], {
    required_error: "Please select an incident type",
  }),
  description: z.string().min(5, "Description must be at least 5 characters"),
  impact: z.enum(['positive', 'negative', 'neutral'], {
    required_error: "Please select an impact level",
  }),
  reportedBy: z.string().min(2, "Name must be at least 2 characters"),
});

// Incident Dialog Component
const IncidentDialog: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { addIncident } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof incidentFormSchema>>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      type: 'feedback',
      description: "",
      impact: 'neutral',
      reportedBy: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof incidentFormSchema>) {
    addIncident(orderId, values);
    setIsOpen(false);
    form.reset();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>
            Record any incidents or feedback related to this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="delay">Delay</SelectItem>
                        <SelectItem value="mechanical">Mechanical Issue</SelectItem>
                        <SelectItem value="accident">Accident</SelectItem>
                        <SelectItem value="feedback">Customer Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive (+)</SelectItem>
                        <SelectItem value="negative">Negative (-)</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Describe the incident or feedback"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reportedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Record Incident</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryLog;
