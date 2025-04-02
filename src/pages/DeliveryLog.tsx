
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
import DeliveryTable from '@/components/DeliveryLog/DeliveryTable';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarShortcut } from '@/components/ui/menubar';
import { SlidersHorizontal, FileDown, Filter, Calendar, Truck, Info, Download, RefreshCw, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const DeliveryLog: React.FC = () => {
  const { purchaseOrders } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced to show fewer items per page
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredDeliveries = useMemo(() => {
    let filtered = purchaseOrders.filter(order => order.deliveryDetails);

    if (activeTab === 'delivered') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'delivered');
    } else if (activeTab === 'in-transit') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'in_transit');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(order => order.deliveryDetails?.status === 'pending');
    } else if (activeTab === 'flagged') {
      filtered = filtered.filter(order => order.offloadingDetails?.isDiscrepancyFlagged);
    }

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

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your delivery log data is being prepared for export.",
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Delivery information has been updated with the latest data.",
      });
    }, 1500);
  };

  const handleViewMap = () => {
    toast({
      title: "Map view",
      description: "Switching to map view is coming soon.",
    });
  };

  const handleManageTrucks = () => {
    toast({
      title: "Manage Trucks",
      description: "Redirecting to truck management...",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "View Analytics",
      description: "Redirecting to analytics dashboard...",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Delivery Log</CardTitle>
              <CardDescription>
                Track and manage all product deliveries
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
                onClick={handleViewMap}
                className="flex items-center gap-1"
              >
                <Map className="h-4 w-4" />
                <span>Map View</span>
              </Button>
              
              <Menubar className="h-10">
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem 
                      className={dateFilter === 'all' ? 'bg-accent' : ''}
                      onClick={() => {
                        setDateFilter('all');
                        setCurrentPage(1);
                      }}
                    >
                      All Deliveries
                      <MenubarShortcut>A</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem 
                      className={dateFilter === 'today' ? 'bg-accent' : ''}
                      onClick={() => {
                        setDateFilter('today');
                        setCurrentPage(1);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Today
                      <MenubarShortcut>T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem 
                      className={dateFilter === 'week' ? 'bg-accent' : ''}
                      onClick={() => {
                        setDateFilter('week');
                        setCurrentPage(1);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      This Week
                      <MenubarShortcut>W</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem 
                      className={dateFilter === 'month' ? 'bg-accent' : ''}
                      onClick={() => {
                        setDateFilter('month');
                        setCurrentPage(1);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      This Month
                      <MenubarShortcut>M</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem 
                      className={dateFilter === 'custom' ? 'bg-accent' : ''}
                      onClick={() => {
                        setDateFilter('custom');
                        setCurrentPage(1);
                      }}
                    >
                      Custom Range
                      <MenubarShortcut>C</MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Options</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Log
                      <MenubarShortcut>E</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleManageTrucks}>
                      <Truck className="h-4 w-4 mr-2" />
                      Manage Trucks
                    </MenubarItem>
                    <MenubarItem onClick={handleViewAnalytics}>
                      <Info className="h-4 w-4 mr-2" />
                      View Analytics
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
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
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              setCurrentPage(1);
            }}
            className="mb-6"
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

          <DeliveryTable deliveries={currentDeliveries} />
          
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

export default DeliveryLog;
