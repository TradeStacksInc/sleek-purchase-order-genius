
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { isWithinInterval, subDays, startOfMonth } from 'date-fns';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { Button } from '@/components/ui/button';
import { Calendar, DownloadIcon, FilterIcon, Printer, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PurchaseOrder } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import DiscrepancyBadge from '@/components/DeliveryLog/DiscrepancyBadge';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const OffloadLog: React.FC = () => {
  const { purchaseOrders } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState('all');
  const itemsPerPage = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter offloaded orders
  const offloadedOrders = useMemo(() => {
    let filtered = purchaseOrders.filter(order => 
      order.deliveryDetails?.status === 'delivered' && order.offloadingDetails
    );

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.poNumber.toLowerCase().includes(term) ||
        order.supplier.name.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    if (tab === 'discrepancy') {
      filtered = filtered.filter(order => 
        order.offloadingDetails && order.offloadingDetails.discrepancyPercentage > 0
      );
    } else if (tab === 'flagged') {
      filtered = filtered.filter(order => 
        order.offloadingDetails?.isDiscrepancyFlagged
      );
    }

    // Apply date filter
    if (dateFilter === 'all') return filtered;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return filtered.filter(order => {
      if (!order.offloadingDetails?.timestamp) return false;
      
      const offloadDate = new Date(order.offloadingDetails.timestamp);
      
      switch (dateFilter) {
        case 'today':
          return offloadDate >= today;
        case 'week':
          const weekAgo = subDays(today, 7);
          return offloadDate >= weekAgo;
        case 'month':
          const monthStart = startOfMonth(today);
          return offloadDate >= monthStart;
        case 'custom':
          if (!dateRange?.from) return true;
          
          const from = new Date(dateRange.from);
          from.setHours(0, 0, 0, 0);
          
          let to = dateRange.to ? new Date(dateRange.to) : new Date(from);
          to.setHours(23, 59, 59, 999);
          
          return isWithinInterval(offloadDate, { start: from, end: to });
        default:
          return true;
      }
    });
  }, [purchaseOrders, dateFilter, dateRange, searchTerm, tab]);

  const totalPages = Math.ceil(offloadedOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = offloadedOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Offload log has been updated with the latest data.",
      });
    }, 1500);
  };

  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your offload log data is being prepared for export.",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Print initiated",
      description: "Preparing offload log for printing.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Offload Log</CardTitle>
              <CardDescription>
                Track and monitor all product offloading activities
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-1"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-1"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by PO number or supplier..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('all')}
              >
                All Time
              </Button>
              <Button 
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('today')}
              >
                <Calendar className="mr-1 h-4 w-4" />
                Today
              </Button>
              <Button 
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('week')}
              >
                <Calendar className="mr-1 h-4 w-4" />
                This Week
              </Button>
              <Button 
                variant={dateFilter === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('month')}
              >
                <Calendar className="mr-1 h-4 w-4" />
                This Month
              </Button>
              <Button 
                variant={dateFilter === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('custom')}
              >
                Custom
              </Button>
            </div>
          </div>
          
          {dateFilter === 'custom' && (
            <div className="mt-4">
              <DateRangePicker 
                date={dateRange} 
                onDateChange={setDateRange} 
                className="w-full sm:w-auto"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* AI Insights Panel */}
          <div className="mb-6">
            <AIInsightsPanel />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={tab} 
            onValueChange={(value) => {
              setTab(value);
              setCurrentPage(1);
            }}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Offloads</TabsTrigger>
              <TabsTrigger value="discrepancy">With Discrepancy</TabsTrigger>
              <TabsTrigger value="flagged" className="text-red-500">
                Flagged
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {currentItems.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">No offload records found</p>
                <p className="text-muted-foreground/70 text-sm mt-1">Try adjusting your filters or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Offload Date</TableHead>
                    <TableHead>Loaded Vol.</TableHead>
                    <TableHead>Delivered Vol.</TableHead>
                    <TableHead>Discrepancy</TableHead>
                    <TableHead>Measured By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((order) => {
                    const offloading = order.offloadingDetails;
                    if (!offloading) return null;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.poNumber}</TableCell>
                        <TableCell>{order.supplier.name}</TableCell>
                        <TableCell>
                          {offloading.timestamp 
                            ? format(new Date(offloading.timestamp), 'MMM dd, yyyy HH:mm') 
                            : "Unknown"}
                        </TableCell>
                        <TableCell>{offloading.loadedVolume.toLocaleString()} L</TableCell>
                        <TableCell>{offloading.deliveredVolume.toLocaleString()} L</TableCell>
                        <TableCell>
                          <DiscrepancyBadge discrepancyPercent={offloading.discrepancyPercentage} />
                        </TableCell>
                        <TableCell>{offloading.measuredBy}</TableCell>
                        <TableCell>
                          {offloading.isDiscrepancyFlagged ? (
                            <Badge variant="destructive">Flagged</Badge>
                          ) : offloading.discrepancyPercentage > 0 ? (
                            <Badge variant="secondary">Discrepancy</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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

export default OffloadLog;
