
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OrderStatus, PurchaseOrder } from '@/types';
import { 
  ArrowRight,
  Calendar, 
  ChevronDown,
  PlusCircle,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import StatusTracker from '@/components/PurchaseOrder/StatusTracker';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const Orders: React.FC = () => {
  const { purchaseOrders } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const itemsPerPage = 10;

  // Filter orders based on selected date filter
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return purchaseOrders;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return purchaseOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
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
  }, [purchaseOrders, dateFilter, dateRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Purchase Orders</CardTitle>
                <CardDescription>
                  View and manage all your purchase orders
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
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
                    <SelectItem value="all">All Orders</SelectItem>
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
              
              <div className="ml-auto">
                <Link to="/create">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Status Preview - only shown when an order is selected */}
          {selectedOrder && (
            <div className="mb-6 border rounded-md p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                  Order Status: {selectedOrder.poNumber}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedOrder(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <StatusTracker 
                currentStatus={selectedOrder.status} 
                statusHistory={selectedOrder.statusHistory || [
                  {
                    id: 'preview',
                    status: selectedOrder.status,
                    timestamp: selectedOrder.createdAt,
                    user: 'Current User',
                    note: 'Order created'
                  }
                ]}
              />
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                      <TableCell className="font-medium">{order.poNumber}</TableCell>
                      <TableCell>{order.supplier.name}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>₦{order.grandTotal.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mb-2" />
                        <p>No orders found matching your filter criteria.</p>
                        <Link to="/create" className="mt-2">
                          <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create a new order
                          </Button>
                        </Link>
                      </div>
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

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-status-pending hover:bg-status-pending text-white">
          Pending
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-status-active hover:bg-status-active text-white">
          Active
        </Badge>
      );
    case 'fulfilled':
      return (
        <Badge className="bg-status-fulfilled hover:bg-status-fulfilled text-white">
          Fulfilled
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          Rejected
        </Badge>
      );
    case 'delivered':
      return (
        <Badge className="bg-blue-700 hover:bg-blue-800 text-white">
          Delivered
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
          {status}
        </Badge>
      );
  }
};

export default Orders;
