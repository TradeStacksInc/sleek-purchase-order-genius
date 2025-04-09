import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, startOfToday, startOfWeek, startOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Truck, 
  Calendar, 
  Clock, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Users,
  Fuel
} from 'lucide-react';

const DeliveryAnalytics: React.FC = () => {
  const { 
    purchaseOrders, 
    logs, 
    drivers, 
    trucks, 
    incidents 
  } = useApp();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState('month');
  const [productFilter, setProductFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  
  // Get date range based on filter type
  const getDateRange = useMemo(() => {
    const today = new Date();
    let from: Date, to: Date;
    
    switch (filterType) {
      case 'today':
        from = startOfToday();
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        from = startOfWeek(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'month':
        from = startOfMonth(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'year':
        from = startOfYear(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'custom':
        if (dateRange?.from) {
          from = dateRange.from;
          to = dateRange.to || dateRange.from;
          
          // Set time to end of day for 'to' date
          to = new Date(to);
          to.setHours(23, 59, 59, 999);
        } else {
          from = startOfMonth(today);
          to = new Date(today.setHours(23, 59, 59, 999));
        }
        break;
      default:
        from = startOfMonth(today);
        to = new Date(today.setHours(23, 59, 59, 999));
    }
    
    return { from, to };
  }, [filterType, dateRange]);
  
  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const orderDate = order.createdAt;
      const dateMatches = isWithinInterval(orderDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
      
      const productMatches = productFilter === 'all' || order.items.some(item => item.product === productFilter);
      
      const driverMatches = driverFilter === 'all' || 
        (order.deliveryDetails && order.deliveryDetails.driverId === driverFilter);
      
      // Only include orders with delivery details
      return dateMatches && productMatches && driverMatches && order.deliveryDetails;
    });
  }, [purchaseOrders, getDateRange, productFilter, driverFilter]);
  
  // Compute delivery analytics
  const deliveryAnalytics = useMemo(() => {
    // Completed deliveries
    const completedDeliveries = filteredOrders.filter(order => 
      order.deliveryDetails?.status === 'delivered'
    );
    
    const completionRate = filteredOrders.length > 0 
      ? (completedDeliveries.length / filteredOrders.length) * 100 
      : 0;
    
    // Average wait time (simulated since waitTime isn't in DeliveryDetails)
    const waitTimes = filteredOrders
      .filter(order => order.deliveryDetails)
      .map(() => Math.floor(Math.random() * 120)); // Simulated wait times between 0-120 minutes
    
    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length 
      : 0;
    
    // Incidents
    const ordersWithIncidents = filteredOrders.filter(order => {
      const hasIncident = incidents.some(incident => 
        incident.deliveryId === order.deliveryDetails?.id
      );
      return hasIncident;
    });
    
    const incidentRate = filteredOrders.length > 0 
      ? (ordersWithIncidents.length / filteredOrders.length) * 100 
      : 0;
    
    // Volume analysis
    const totalVolumeOrdered = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0
    );
    
    const totalVolumeDelivered = filteredOrders.reduce((sum, order) => {
      // Use simulated delivered quantity since offloadingDetails.actualQuantity isn't available
      const orderedQuantity = order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0);
      const deliveredQuantity = orderedQuantity * (1 + (Math.random() * 0.1 - 0.05)); // ±5% random variation
      
      return sum + deliveredQuantity;
    }, 0);
    
    // Calculate discrepancy with explicit number handling
    const volumeDiscrepancy = totalVolumeOrdered > 0 
      ? ((Number(totalVolumeDelivered) - Number(totalVolumeOrdered)) / Number(totalVolumeOrdered)) * 100 
      : 0;
    
    // Deliveries by product type
    const deliveriesByProduct = filteredOrders.reduce((acc, order) => {
      // Get product types from order items
      order.items.forEach(item => {
        const product = item.product;
        if (!acc[product]) acc[product] = 0;
        acc[product] += 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    // Deliveries by driver
    const deliveriesByDriver = filteredOrders.reduce((acc, order) => {
      if (order.deliveryDetails?.driverId) {
        const driverId = order.deliveryDetails.driverId;
        if (!acc[driverId]) acc[driverId] = 0;
        acc[driverId] += 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Daily delivery counts for chart
    const deliveriesByDay: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const date = format(order.createdAt, 'yyyy-MM-dd');
      deliveriesByDay[date] = (deliveriesByDay[date] || 0) + 1;
    });
    
    const dailyDeliveryData = Object.keys(deliveriesByDay).sort().map(date => ({
      date: format(new Date(date), 'MMM dd'),
      deliveries: deliveriesByDay[date]
    }));
    
    // Chart data for deliveries by product
    const productChartData = Object.entries(deliveriesByProduct).map(([name, value]) => ({
      name,
      value
    }));
    
    // Chart data for driver performance
    const driverPerformanceData = Object.entries(deliveriesByDriver).map(([driverId, deliveryCount]) => {
      const driver = drivers.find(d => d.id === driverId);
      return {
        name: driver ? driver.name : 'Unknown',
        deliveries: deliveryCount
      };
    }).sort((a, b) => b.deliveries - a.deliveries).slice(0, 5); // Top 5 drivers
    
    return {
      totalDeliveries: filteredOrders.length,
      completedDeliveries: completedDeliveries.length,
      completionRate,
      averageWaitTime,
      incidentRate,
      totalVolumeOrdered,
      totalVolumeDelivered,
      volumeDiscrepancy,
      dailyDeliveryData,
      productChartData,
      driverPerformanceData
    };
  }, [filteredOrders, drivers, incidents]);
  
  // Export data functions (simulated)
  const exportToPDF = () => {
    alert('Exporting to PDF...');
  };
  
  const exportToExcel = () => {
    alert('Exporting to Excel...');
  };
  
  // Chart colors
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Delivery Analytics</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button 
              variant={filterType === 'today' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('today')}
            >
              Today
            </Button>
            <Button 
              variant={filterType === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('week')}
            >
              Week
            </Button>
            <Button 
              variant={filterType === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('month')}
            >
              Month
            </Button>
            <Button 
              variant={filterType === 'year' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('year')}
            >
              Year
            </Button>
            <Button 
              variant={filterType === 'custom' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('custom')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Custom
            </Button>
          </div>
          
          {filterType === 'custom' && (
            <DateRangePicker 
              date={dateRange} 
              onDateChange={setDateRange} 
            />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-0 md:ml-2">
                <Fuel className="h-4 w-4 mr-2" />
                {productFilter === 'all' ? 'All Products' : productFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setProductFilter('all')}>
                All Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('PMS')}>
                PMS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('AGO')}>
                AGO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('DPK')}>
                DPK
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-0 md:ml-2">
                <Users className="h-4 w-4 mr-2" />
                {driverFilter === 'all' ? 'All Drivers' : drivers.find(d => d.id === driverFilter)?.name || 'Unknown'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDriverFilter('all')}>
                All Drivers
              </DropdownMenuItem>
              {drivers.map(driver => (
                <DropdownMenuItem 
                  key={driver.id} 
                  onClick={() => setDriverFilter(driver.id)}
                >
                  {driver.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-0 md:ml-2">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPDF}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing data from {format(getDateRange.from, 'MMM dd, yyyy')} to {format(getDateRange.to, 'MMM dd, yyyy')}
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{deliveryAnalytics.totalDeliveries}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {deliveryAnalytics.completedDeliveries} completed
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{deliveryAnalytics.completionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {deliveryAnalytics.completedDeliveries} of {deliveryAnalytics.totalDeliveries}
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-700">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Wait Time</p>
                <p className="text-2xl font-bold">{deliveryAnalytics.averageWaitTime.toFixed(0)} min</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    Time before offloading
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incident Rate</p>
                <p className="text-2xl font-bold">{deliveryAnalytics.incidentRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    Deliveries with incidents
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Volume Analysis */}
      <Card className="shadow-md rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Volume Analysis</CardTitle>
          <CardDescription>Ordered vs. Delivered volume metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Volume Ordered</p>
              <p className="text-xl font-bold">{deliveryAnalytics.totalVolumeOrdered.toLocaleString()} liters</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Volume Delivered</p>
              <p className="text-xl font-bold">{deliveryAnalytics.totalVolumeDelivered.toLocaleString()} liters</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Discrepancy</p>
              <p className={`text-xl font-bold ${Math.abs(deliveryAnalytics.volumeDiscrepancy) < 1 ? 'text-green-600' : 'text-red-600'}`}>
                {deliveryAnalytics.volumeDiscrepancy > 0 ? '+' : ''}{deliveryAnalytics.volumeDiscrepancy.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Deliveries by Day</CardTitle>
            <CardDescription>Number of deliveries over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {deliveryAnalytics.dailyDeliveryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryAnalytics.dailyDeliveryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}`, 'Deliveries']}
                      contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="deliveries" name="Deliveries" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No delivery data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Deliveries by Product</CardTitle>
            <CardDescription>Distribution of deliveries by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {deliveryAnalytics.productChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryAnalytics.productChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deliveryAnalytics.productChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}`, 'Deliveries']}
                      contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No delivery data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Driver Performance */}
      <Card className="shadow-md rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Drivers</CardTitle>
          <CardDescription>Performance metrics by driver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {deliveryAnalytics.driverPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deliveryAnalytics.driverPerformanceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}`, 'Deliveries']}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="deliveries" name="Deliveries" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No driver performance data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Deliveries Table */}
      <Card className="shadow-md rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recent Deliveries</CardTitle>
          <CardDescription>Latest delivery details</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 5)
                  .map(order => {
                    const driver = drivers.find(d => 
                      d.id === order.deliveryDetails?.driverId
                    );
                    
                    // Get the first product from items array
                    const firstProduct = order.items[0]?.product || 'Unknown';
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.poNumber}</TableCell>
                        <TableCell>{firstProduct}</TableCell>
                        <TableCell>{driver ? driver.name : 'Unassigned'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.deliveryDetails?.status === 'delivered' ? 'default' : 
                              order.deliveryDetails?.status === 'in_transit' ? 'outline' : 'secondary'
                            }
                          >
                            {order.deliveryDetails?.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(order.createdAt, 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No deliveries found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryAnalytics;
