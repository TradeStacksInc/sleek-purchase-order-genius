
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isWithinInterval, subDays, startOfMonth } from 'date-fns';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import DeliveryTable from '@/components/DeliveryLog/DeliveryTable';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const DeliveryLog: React.FC = () => {
  const { purchaseOrders } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

          <DeliveryTable deliveries={currentDeliveries} />
          
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

export default DeliveryLog;
