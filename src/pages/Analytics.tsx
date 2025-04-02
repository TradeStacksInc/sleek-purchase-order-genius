
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ArrowUpDown, Clock, AlertTriangle, Truck, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isWithinInterval, subDays, startOfMonth, startOfYear, format, differenceInDays } from 'date-fns';
import { exportDataToFile } from '@/utils/localStorage';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/types';

const Analytics: React.FC = () => {
  const { purchaseOrders, getOrdersWithDiscrepancies } = useApp();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Date filter function
  const filterByDate = (orders: PurchaseOrder[]) => {
    if (!dateRange?.from) {
      // Default filter based on period
      const today = new Date();
      
      switch (period) {
        case 'week':
          const weekAgo = subDays(today, 7);
          return orders.filter(order => {
            const orderDate = order.deliveryDetails?.destinationArrivalTime || order.updatedAt;
            return orderDate >= weekAgo;
          });
        case 'month':
          const monthStart = startOfMonth(today);
          return orders.filter(order => {
            const orderDate = order.deliveryDetails?.destinationArrivalTime || order.updatedAt;
            return orderDate >= monthStart;
          });
        case 'year':
          const yearStart = startOfYear(today);
          return orders.filter(order => {
            const orderDate = order.deliveryDetails?.destinationArrivalTime || order.updatedAt;
            return orderDate >= yearStart;
          });
        default:
          return orders;
      }
    }
    
    // Custom date range filter
    return orders.filter(order => {
      if (!dateRange.from) return true;
      
      const orderDate = order.deliveryDetails?.destinationArrivalTime || order.updatedAt;
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      
      let to = dateRange.to ? new Date(dateRange.to) : new Date(from);
      to.setHours(23, 59, 59, 999);
      
      return isWithinInterval(orderDate, { start: from, end: to });
    });
  };
  
  // Filtered orders
  const filteredOrders = useMemo(() => filterByDate(purchaseOrders), [purchaseOrders, dateRange, period]);
  
  // Calculate delivery statistics
  const stats = useMemo(() => {
    const totalDeliveries = filteredOrders.filter(order => order.deliveryDetails).length;
    const completedDeliveries = filteredOrders.filter(order => order.deliveryDetails?.status === 'delivered').length;
    const inTransitDeliveries = filteredOrders.filter(order => order.deliveryDetails?.status === 'in_transit').length;
    const pendingDeliveries = filteredOrders.filter(order => order.deliveryDetails?.status === 'pending').length;
    const flaggedDeliveries = getOrdersWithDiscrepancies().length;
    const onTimeDeliveries = filteredOrders.filter(order => {
      if (!order.deliveryDetails?.destinationArrivalTime || !order.deliveryDetails?.expectedArrivalTime) return false;
      return order.deliveryDetails.destinationArrivalTime <= order.deliveryDetails.expectedArrivalTime;
    }).length;
    
    // Calculate on-time rate
    const onTimeRate = completedDeliveries > 0 
      ? Math.round((onTimeDeliveries / completedDeliveries) * 100) 
      : 0;
    
    // Calculate average delivery time in hours
    const deliveryTimes = filteredOrders
      .filter(order => 
        order.deliveryDetails?.depotDepartureTime && 
        order.deliveryDetails?.destinationArrivalTime
      )
      .map(order => {
        const departure = new Date(order.deliveryDetails!.depotDepartureTime!);
        const arrival = new Date(order.deliveryDetails!.destinationArrivalTime!);
        return (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60); // hours
      });
    
    const avgDeliveryTime = deliveryTimes.length 
      ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length) 
      : 0;
    
    return {
      totalDeliveries,
      completedDeliveries,
      inTransitDeliveries,
      pendingDeliveries,
      flaggedDeliveries,
      onTimeDeliveries,
      onTimeRate,
      avgDeliveryTime
    };
  }, [filteredOrders, getOrdersWithDiscrepancies]);
  
  // Prepare chart data
  const deliveryStatusData = [
    { name: 'Completed', value: stats.completedDeliveries, color: '#16a34a' },
    { name: 'In Transit', value: stats.inTransitDeliveries, color: '#2563eb' },
    { name: 'Pending', value: stats.pendingDeliveries, color: '#d97706' }
  ];
  
  const discrepancyData = useMemo(() => {
    const discrepancies = filteredOrders
      .filter(order => order.offloadingDetails?.discrepancyPercentage !== undefined)
      .map(order => ({
        poNumber: order.poNumber,
        discrepancy: order.offloadingDetails!.discrepancyPercentage,
        flagged: order.offloadingDetails!.isDiscrepancyFlagged,
        planned: order.offloadingDetails!.loadedVolume,
        actual: order.offloadingDetails!.deliveredVolume
      }));
    
    return discrepancies;
  }, [filteredOrders]);
  
  const timePerformanceData = useMemo(() => {
    // Group by day
    const deliveriesByDay = filteredOrders
      .filter(order => order.deliveryDetails?.destinationArrivalTime)
      .reduce((acc, order) => {
        const date = format(new Date(order.deliveryDetails!.destinationArrivalTime!), 'yyyy-MM-dd');
        
        if (!acc[date]) {
          acc[date] = {
            date,
            onTime: 0,
            delayed: 0,
            total: 0
          };
        }
        
        acc[date].total += 1;
        
        const isOnTime = order.deliveryDetails!.destinationArrivalTime! <= 
                         (order.deliveryDetails!.expectedArrivalTime || new Date());
        
        if (isOnTime) {
          acc[date].onTime += 1;
        } else {
          acc[date].delayed += 1;
        }
        
        return acc;
      }, {} as Record<string, { date: string, onTime: number, delayed: number, total: number }>);
    
    // Convert to array and sort by date
    return Object.values(deliveriesByDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);
  
  // Export analytics data
  const handleExport = () => {
    const exportData = {
      period: dateRange 
        ? `Custom (${format(dateRange.from!, 'yyyy-MM-dd')} to ${dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from!, 'yyyy-MM-dd')})`
        : period,
      generatedAt: new Date().toISOString(),
      stats: stats,
      deliveryStatusBreakdown: deliveryStatusData,
      discrepancyAnalysis: discrepancyData,
      timePerformance: timePerformanceData
    };
    
    exportDataToFile(exportData, `delivery-analytics-${format(new Date(), 'yyyyMMdd')}`, 'json');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Delivery Analytics</CardTitle>
              <CardDescription>
                Analyze delivery performance and trends
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select 
                value={period} 
                onValueChange={(value) => {
                  setPeriod(value);
                  setDateRange(undefined);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <DateRangePicker 
              date={dateRange} 
              onDateChange={(newRange) => {
                setDateRange(newRange);
                if (newRange?.from) {
                  setPeriod('custom');
                }
              }} 
              className="w-full sm:w-auto"
            />
            {dateRange?.from && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing data from {format(dateRange.from, 'MMM dd, yyyy')} 
                {dateRange.to && ` to ${format(dateRange.to, 'MMM dd, yyyy')}`}
                {dateRange.from && dateRange.to && (
                  <> ({differenceInDays(dateRange.to, dateRange.from) + 1} days)</>
                )}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="overview" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
              <TabsTrigger value="performance">Time Performance</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center">
                    <Truck className="h-8 w-8 text-primary mr-4 opacity-80" />
                    <div>
                      <div className="text-3xl font-bold">{stats.totalDeliveries}</div>
                      <div className="text-xs text-muted-foreground">
                        {period === 'week' ? 'Past 7 days' : 
                         period === 'month' ? 'This month' : 
                         period === 'year' ? 'This year' : 'All time'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    On-Time Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-primary mr-4 opacity-80" />
                    <div>
                      <div className="text-3xl font-bold">{stats.onTimeRate}%</div>
                      <div className="text-xs text-muted-foreground">
                        {stats.onTimeDeliveries} of {stats.completedDeliveries} deliveries
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg. Delivery Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center">
                    <ArrowUpDown className="h-8 w-8 text-primary mr-4 opacity-80" />
                    <div>
                      <div className="text-3xl font-bold">{stats.avgDeliveryTime} hrs</div>
                      <div className="text-xs text-muted-foreground">
                        From departure to arrival
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
                    <AlertTriangle className="h-8 w-8 text-red-500 mr-4 opacity-80" />
                    <div>
                      <div className="text-3xl font-bold">{stats.flaggedDeliveries}</div>
                      <div className="text-xs text-muted-foreground">
                        Deliveries with significant volume loss
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Status Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Status Breakdown</CardTitle>
                <CardDescription>
                  Distribution of deliveries by current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deliveryStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deliveryStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discrepancies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Volume Discrepancies</CardTitle>
                <CardDescription>
                  Analysis of differences between loaded and delivered volumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {discrepancyData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                    <AlertTriangle className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-xl">No discrepancy data available</p>
                    <p className="text-sm mt-2">
                      There are no completed deliveries with recorded offloading details
                      in the selected period.
                    </p>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={discrepancyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="poNumber" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'discrepancy') return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, 'Discrepancy'];
                            if (name === 'planned') return [`${typeof value === 'number' ? value.toLocaleString() : value} L`, 'Planned Volume'];
                            if (name === 'actual') return [`${typeof value === 'number' ? value.toLocaleString() : value} L`, 'Actual Volume'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="planned" name="Planned Volume" fill="#8884d8" />
                        <Bar yAxisId="left" dataKey="actual" name="Actual Volume" fill="#82ca9d" />
                        <Bar yAxisId="right" dataKey="discrepancy" name="Discrepancy %" fill="#ff7300" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#8884d8] rounded-full mr-2"></div>
                    <span className="text-sm">Planned Volume</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#82ca9d] rounded-full mr-2"></div>
                    <span className="text-sm">Actual Volume</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#ff7300] rounded-full mr-2"></div>
                    <span className="text-sm">Discrepancy %</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flagged Discrepancies</CardTitle>
                <CardDescription>
                  Deliveries with significant volume discrepancies requiring investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {discrepancyData.filter(d => d.flagged).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mb-2 text-green-500 opacity-40" />
                    <p>No flagged discrepancies in the selected period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discrepancyData
                      .filter(d => d.flagged)
                      .sort((a, b) => b.discrepancy - a.discrepancy)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-md border border-red-100">
                          <div>
                            <h4 className="font-medium">{item.poNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              Planned: {item.planned.toLocaleString()} L | 
                              Actual: {item.actual.toLocaleString()} L
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {item.discrepancy.toFixed(2)}% Loss
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Time Performance</CardTitle>
                <CardDescription>
                  Analysis of on-time vs. delayed deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timePerformanceData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                    <Clock className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-xl">No time performance data available</p>
                    <p className="text-sm mt-2">
                      There are no completed deliveries in the selected period.
                    </p>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timePerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={value => format(new Date(value), 'MMM dd')} />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={value => format(new Date(value), 'MMMM dd, yyyy')}
                          formatter={(value: any, name: string) => {
                            if (name === 'onTime') return [value, 'On Time'];
                            if (name === 'delayed') return [value, 'Delayed'];
                            if (name === 'total') return [value, 'Total Deliveries'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="total" name="Total Deliveries" stroke="#8884d8" />
                        <Line type="monotone" dataKey="onTime" name="On Time" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#ff7300" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Time Statistics</CardTitle>
                <CardDescription>
                  Average times for each stage of delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                    <div className="mb-2 text-primary">
                      <Clock className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats.avgDeliveryTime} hrs</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Average Total Delivery Time
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                    <div className="mb-2 text-green-500">
                      <Badge className="h-8 px-3 py-1 text-green-700 bg-green-100">
                        {stats.onTimeRate}%
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold">{stats.onTimeDeliveries}</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      On-Time Deliveries
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                    <div className="mb-2 text-amber-500">
                      <Badge className="h-8 px-3 py-1 text-amber-700 bg-amber-100">
                        {stats.completedDeliveries - stats.onTimeDeliveries}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold">
                      {stats.completedDeliveries > 0 
                        ? 100 - stats.onTimeRate 
                        : 0}%
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Delayed Deliveries
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
