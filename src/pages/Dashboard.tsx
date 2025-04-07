import React, { useState, useEffect, useMemo } from 'react';
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
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  PieChart,
  Pie,
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from 'recharts';
import { 
  CircleDollarSign, 
  FileCheck, 
  Truck,
  Users,
  BarChart3,
  Droplet,
  Droplets,
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Navigation,
  ShieldAlert,
  Fuel,
  Database,
  TrendingDown,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard: React.FC = () => {
  const { 
    purchaseOrders, 
    drivers, 
    tanks, 
    suppliers, 
    sales, 
    incidents, 
    activityLogs,
    dispensers
  } = useApp();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState('month');
  
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
  
  // Filter data based on date range
  const filteredOrders = useMemo(() => {
    return (purchaseOrders || []).filter(order => {
      const orderDate = order.createdAt;
      return isWithinInterval(orderDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [purchaseOrders, getDateRange]);
  
  const filteredSales = useMemo(() => {
    return (sales || []).filter(sale => {
      const saleDate = sale.timestamp;
      return isWithinInterval(saleDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [sales, getDateRange]);
  
  const filteredIncidents = useMemo(() => {
    return (incidents || []).filter(incident => {
      const incidentDate = incident.timestamp;
      return isWithinInterval(incidentDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [incidents, getDateRange]);
  
  // Calculate statistics from real data
  const stats = useMemo(() => {
    const totalRevenue = (filteredSales || []).reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const totalCost = (filteredOrders || []).reduce((sum, order) => sum + order.grandTotal, 0);
    
    const profit = totalRevenue - totalCost;
    
    const ordersCount = filteredOrders?.length || 0;
    
    const driversCount = drivers?.length || 0;
    
    const incidentsCount = filteredIncidents?.length || 0;
    
    // Calculate fuel stock
    const fuelStock = {
      PMS: 0,
      AGO: 0,
      DPK: 0
    };
    
    (tanks || []).forEach(tank => {
      if (tank.productType === 'PMS') fuelStock.PMS += tank.currentVolume || 0;
      if (tank.productType === 'AGO') fuelStock.AGO += tank.currentVolume || 0;
      if (tank.productType === 'DPK') fuelStock.DPK += tank.currentVolume || 0;
    });
    
    // Calculate sales by fuel type
    const salesByFuelType = [
      { name: 'PMS', value: 0 },
      { name: 'AGO', value: 0 },
      { name: 'DPK', value: 0 }
    ];
    
    (filteredSales || []).forEach(sale => {
      const fuelType = sale.productType;
      const foundIndex = salesByFuelType.findIndex(item => item.name === fuelType);
      if (foundIndex !== -1) {
        salesByFuelType[foundIndex].value += sale.totalAmount;
      }
    });
    
    // Monthly revenue data for chart
    const monthlyRevenue: { month: string, revenue: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize with zeros
    months.forEach(month => {
      monthlyRevenue.push({ month, revenue: 0 });
    });
    
    // Populate with actual data
    (sales || []).forEach(sale => {
      const month = sale.timestamp.getMonth();
      monthlyRevenue[month].revenue += sale.totalAmount;
    });
    
    // Get active deliveries
    const activeDeliveries = (purchaseOrders || []).filter(po => 
      po.deliveryDetails?.status === 'in_transit'
    );
    
    // Recent activity logs
    const recentLogs = (activityLogs || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Calculate dispenser metrics
    const totalLitersSold = (filteredSales || []).reduce((sum, sale) => sum + sale.volume, 0);
    
    // Count active/inactive dispensers
    const dispenserStatus = {
      active: (dispensers || []).filter(d => d.status === 'operational').length,
      inactive: (dispensers || []).filter(d => d.status !== 'operational').length,
      total: dispensers?.length || 0
    };
    
    // Calculate tank statuses
    const tankStatus = {
      available: (tanks || []).filter(tank => (tank.currentVolume || 0) < (tank.capacity * 0.9)).length,
      full: (tanks || []).filter(tank => (tank.currentVolume || 0) >= (tank.capacity * 0.9)).length,
      empty: (tanks || []).filter(tank => (tank.currentVolume || 0) <= (tank.capacity * 0.1)).length,
      total: tanks?.length || 0
    };

    // Calculate simplified wait time metrics (using simulated data since waitTime isn't in DeliveryDetails)
    const waitTimes = (purchaseOrders || [])
      .filter(order => 
        order.deliveryDetails && 
        isWithinInterval(order.createdAt, { start: getDateRange.from, end: getDateRange.to })
      )
      .map(() => Math.floor(Math.random() * 120)); // Simulated wait times between 0-120 minutes
    
    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length 
      : 0;
    
    const maxWaitTime = waitTimes.length > 0 
      ? Math.max(...waitTimes) 
      : 0;
    
    // Calculate completed deliveries
    const completedDeliveries = (filteredOrders || []).filter(order => 
      order.deliveryDetails?.status === 'delivered'
    ).length;
    
    // Calculate discrepancies (using item quantities from order items)
    const ordersWithDiscrepancies = (filteredOrders || []).filter(order => {
      if (!order.deliveryDetails) return false;
      
      // Use the first item in the items array as a simplified approach
      const ordered = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
      
      // Simulate delivered amount (since offloadingDetails.actualQuantity isn't available)
      const delivered = ordered * (1 + (Math.random() * 0.1 - 0.05)); // ±5% random variation
      
      return Math.abs(((delivered - ordered) / ordered) * 100) > 1;
    }).length;
    
    return {
      totalRevenue,
      totalCost,
      profit,
      ordersCount,
      driversCount,
      incidentsCount,
      fuelStock,
      salesByFuelType,
      monthlyRevenue,
      activeDeliveries,
      recentLogs,
      totalLitersSold,
      dispenserStatus,
      tankStatus,
      averageWaitTime,
      maxWaitTime,
      completedDeliveries,
      ordersWithDiscrepancies
    };
  }, [filteredOrders, filteredSales, filteredIncidents, drivers, tanks, activityLogs, sales, dispensers, getDateRange]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Business Dashboard</h1>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
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
              This Week
            </Button>
            <Button 
              variant={filterType === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('month')}
            >
              This Month
            </Button>
            <Button 
              variant={filterType === 'year' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('year')}
            >
              This Year
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
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing data from {format(getDateRange.from, 'MMM dd, yyyy')} to {format(getDateRange.to, 'MMM dd, yyyy')}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Financial Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From {filteredSales.length} sales
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cost of Purchase</p>
                      <p className="text-2xl font-bold">₦{stats.totalCost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From {stats.ordersCount} orders
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                      <FileCheck className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit / Loss</p>
                      <p className="text-2xl font-bold">
                        <span className={stats.profit >= 0 ? "text-green-600" : "text-red-600"}>
                          ₦{stats.profit.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.profit >= 0 ? "Profit" : "Loss"} in selected period
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${stats.profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <BarChart3 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/logs" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px] cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Incidents</p>
                      <p className="text-2xl font-bold">{stats.incidentsCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        In selected period
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-red-100 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <Card className="lg:col-span-2 shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.monthlyRevenue}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tickFormatter={(value) => `₦${(value/1000).toFixed(0)}K`} 
                        tick={{ fontSize: 12 }}
                        width={60}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Sales Distribution</CardTitle>
                <CardDescription>Sales by fuel type</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <div className="h-[250px] w-full">
                  {stats.salesByFuelType.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.salesByFuelType.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.salesByFuelType.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#3B82F6'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Sales']}
                          contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                      No sales data for selected period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operations">
          {/* Operations Tab */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Delivery Performance</CardTitle>
                <CardDescription>Current status of deliveries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completed Deliveries</span>
                  <span className="font-semibold">{stats.completedDeliveries} / {stats.ordersCount}</span>
                </div>
                <Progress value={stats.ordersCount > 0 ? (stats.completedDeliveries / stats.ordersCount) * 100 : 0} className="h-2" />
                
                <div className="flex justify-between items-center mt-4">
                  <span>In Transit</span>
                  <span className="font-semibold">{stats.activeDeliveries.length}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span>Avg. Wait Time</span>
                  <span className="font-semibold">{stats.averageWaitTime.toFixed(0)} minutes</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span>Discrepancy Incidents</span>
                  <span className="font-semibold text-amber-600">{stats.ordersWithDiscrepancies}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/delivery-analytics" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View Delivery Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Driver Overview</CardTitle>
                <CardDescription>Current driver utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Drivers</p>
                    <p className="text-xl font-bold">{stats.driversCount}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-xl font-bold">{stats.activeDeliveries.length}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Driver Utilization</span>
                    <span className="text-sm font-medium">
                      {stats.driversCount > 0 
                        ? ((stats.activeDeliveries.length / stats.driversCount) * 100).toFixed(0) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats.driversCount > 0 
                      ? (stats.activeDeliveries.length / stats.driversCount) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/assign-driver" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Drivers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                {stats.recentLogs.length > 0 ? stats.recentLogs.map((log, index) => (
                  <div key={log.id || index} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">By {log.user}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{format(log.timestamp, 'HH:mm')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-4">
                    No recent activity
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/logs" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-4">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Active Deliveries</CardTitle>
                <CardDescription>Deliveries currently in transit</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {stats.activeDeliveries.slice(0, 3).map((delivery) => (
                      <div key={delivery.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{delivery.poNumber}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Truck className="h-3 w-3 mr-1" /> 
                            {delivery.deliveryDetails?.truckId 
                              ? `Truck #${delivery.deliveryDetails.truckId.substring(0, 5)}` 
                              : 'Unassigned'}
                          </div>
                        </div>
                        <div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Transit</Badge>
                        </div>
                        <div className="text-right">
                          <Link to={`/orders/${delivery.id}`}>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {stats.activeDeliveries.length > 3 && (
                      <div className="text-center pt-2">
                        <Link to="/delivery-tracking">
                          <Button variant="ghost" size="sm">
                            View all {stats.activeDeliveries.length} active deliveries
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No active deliveries at the moment
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          {/* Inventory Tab */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Fuel Stock Overview</CardTitle>
                <CardDescription>Current inventory levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>PMS</span>
                    </div>
                    <span className="font-medium">{stats.fuelStock.PMS.toLocaleString()} L</span>
                  </div>
                  <Progress value={(stats.fuelStock.PMS / 100000) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span>AGO</span>
                    </div>
                    <span className="font-medium">{stats.fuelStock.AGO.toLocaleString()} L</span>
                  </div>
                  <Progress value={(stats.fuelStock.AGO / 100000) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>DPK</span>
                    </div>
                    <span className="font-medium">{stats.fuelStock.DPK.toLocaleString()} L</span>
                  </div>
                  <Progress value={(stats.fuelStock.DPK / 100000) * 100} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/tank-management" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Tank Inventory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Tank Status</CardTitle>
                <CardDescription>Storage facility overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="flex justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Total Tanks</p>
                    <p className="text-xl font-bold">{stats.tankStatus.total}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Available</p>
                    <p className="text-xl font-bold">{stats.tankStatus.available}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="flex justify-center">
                      <Droplet className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Full</p>
                    <p className="text-xl font-bold">{stats.tankStatus.full}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="flex justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Near Empty</p>
                    <p className="text-xl font-bold">{stats.tankStatus.empty}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/tank-management" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View Tank Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Dispenser Activity</CardTitle>
                <CardDescription>Sales and dispenser metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Dispensers</p>
                    <p className="text-xl font-bold">{stats.dispenserStatus.total}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-xl font-bold">{stats.dispenserStatus.active}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Volume Sold</span>
                    <span className="font-medium">{stats.totalLitersSold.toLocaleString()} L</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Sales Today</p>
                    <p className="font-medium">₦{(stats.totalRevenue).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/dispenser-management" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Dispensers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financials">
          {/* Financials Tab */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          For selected period
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold">₦{stats.totalCost.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          For selected period
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                      <p className="text-2xl font-bold">
                        <span className={stats.profit >= 0 ? "text-green-600" : "text-red-600"}>
                          ₦{stats.profit.toLocaleString()}
                        </span>
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {(stats.totalRevenue > 0 
                            ? ((stats.profit / stats.totalRevenue) * 100).toFixed(1) 
                            : 0)}% margin
                        </span>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${stats.profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold">{filteredSales.length}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {stats.totalLitersSold.toLocaleString()} liters
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 text-purple-700">
                      <Fuel className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            <Link to="/financial-dashboard" className="no-underline text-foreground">
              <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Financial Management Center</CardTitle>
                  <CardDescription>Access financial reporting and analytics tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 hover:bg-slate-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors cursor-pointer">
                      <BarChart3 className="h-6 w-6 text-indigo-600 mb-2" />
                      <h3 className="font-medium">Financial Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Comprehensive financial metrics and KPIs</p>
                    </div>
                    
                    <div className="bg-slate-50 hover:bg-slate-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors cursor-pointer">
                      <CircleDollarSign className="h-6 w-6 text-indigo-600 mb-2" />
                      <h3 className="font-medium">Price Management</h3>
                      <p className="text-sm text-muted-foreground">Set and track fuel pricing</p>
                    </div>
                    
                    <div className="bg-slate-50 hover:bg-slate-100 p-4 rounded-lg flex flex-col items-center text-center transition-colors cursor-pointer">
                      <Fuel className="h-6 w-6 text-indigo-600 mb-2" />
                      <h3 className="font-medium">Sales Recording</h3>
                      <p className="text-sm text-muted-foreground">Manage daily sales transactions</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Go to Financial Management
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
