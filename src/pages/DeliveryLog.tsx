
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, subDays, startOfMonth } from 'date-fns';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import DeliveryTable from '@/components/DeliveryLog/DeliveryTable';
import { useToast } from '@/hooks/use-toast';
import { DateFilter } from '@/types/filters';
import { exportDataToFile } from '@/utils/localStorage';
import MapView from '@/components/DeliveryLog/MapView';
import DeliveryLogHeader from '@/components/DeliveryLog/DeliveryLogHeader';
import DeliveryLogPagination from '@/components/DeliveryLog/DeliveryLogPagination';

const DeliveryLog: React.FC = () => {
  const { purchaseOrders } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced to show fewer items per page
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

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
    try {
      exportDataToFile(
        filteredDeliveries,
        `delivery-log-export-${new Date().toISOString().split('T')[0]}`,
        'csv'
      );
      
      toast({
        title: "Export successful",
        description: "Your delivery log data has been exported to a CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh - in a real app, this would fetch new data
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Delivery information has been updated with the latest data.",
      });
    }, 1500);
  };

  const handleTruckManagement = () => {
    navigate('/manage-trucks');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  if (showMapView) {
    return <MapView onBack={() => setShowMapView(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
          <DeliveryLogHeader 
            dateFilter={dateFilter}
            dateRange={dateRange}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onMapView={() => setShowMapView(true)}
            onDateFilterChange={setDateFilter}
            onDateRangeChange={setDateRange}
            onExport={handleExport}
            onManageTrucks={handleTruckManagement}
            onViewAnalytics={handleViewAnalytics}
          />
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
          
          <DeliveryLogPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryLog;
