
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
  TrendingUp
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
    return purchaseOrders.filter(order => {
      const orderDate = order.createdAt;
      return isWithinInterval(orderDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [purchaseOrders, getDateRange]);
  
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = sale.timestamp;
      return isWithinInterval(saleDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [sales, getDateRange]);
  
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const incidentDate = incident.timestamp;
      return isWithinInterval(incidentDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
    });
  }, [incidents, getDateRange]);
  
  // Calculate statistics from real data
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const totalCost = filteredOrders.reduce((sum, order) => sum + order.grandTotal, 0);
    
    const profit = totalRevenue - totalCost;
    
    const ordersCount = filteredOrders.length;
    
    const driversCount = drivers.length;
    
    const incidentsCount = filteredIncidents.length;
    
    // Calculate fuel stock
    const fuelStock = {
      PMS: 0,
      AGO: 0,
      DPK: 0
    };
    
    tanks.forEach(tank => {
      if (tank.productType === 'PMS') fuelStock.PMS += tank.currentVolume;
      if (tank.productType === 'AGO') fuelStock.AGO += tank.currentVolume;
      if (tank.productType === 'DPK') fuelStock.DPK += tank.currentVolume;
    });
    
    // Calculate sales by fuel type
    const salesByFuelType = [
      { name: 'PMS', value: 0 },
      { name: 'AGO', value: 0 },
      { name: 'DPK', value: 0 }
    ];
    
    filteredSales.forEach(sale => {
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
    sales.forEach(sale => {
      const month = sale.timestamp.getMonth();
      monthlyRevenue[month].revenue += sale.totalAmount;
    });
    
    // Get active deliveries
    const activeDeliveries = purchaseOrders.filter(po => 
      po.deliveryDetails?.status === 'in_transit'
    );
    
    // Recent activity logs
    const recentLogs = activityLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
    
    // Calculate dispenser metrics
    const totalLitersSold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Count active/inactive dispensers
    const dispenserStatus = {
      active: dispensers.filter(d => d.status === 'active').length,
      inactive: dispensers.filter(d => d.status !== 'active').length,
      total: dispensers.length
    };
    
    // Calculate tank statuses
    const tankStatus = {
      available: tanks.filter(tank => tank.currentVolume < tank.capacity * 0.9).length,
      full: tanks.filter(tank => tank.currentVolume >= tank.capacity * 0.9).length,
      empty: tanks.filter(tank => tank.currentVolume <= tank.capacity * 0.1).length,
      total: tanks.length
    };

    // Calculate wait time metrics
    const waitTimes = purchaseOrders
      .filter(order => 
        order.deliveryDetails?.waitTime !== undefined && 
        isWithinInterval(order.createdAt, { start: getDateRange.from, end: getDateRange.to })
      )
      .map(order => order.deliveryDetails?.waitTime || 0);
    
    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length 
      : 0;
    
    const maxWaitTime = waitTimes.length > 0 
      ? Math.max(...waitTimes) 
      : 0;
    
    // Calculate completed deliveries
    const completedDeliveries = filteredOrders.filter(order => 
      order.deliveryDetails?.status === 'delivered'
    ).length;
    
    // Calculate discrepancies
    const ordersWithDiscrepancies = filteredOrders.filter(order => {
      if (!order.deliveryDetails?.offloadingDetails) return false;
      
      const ordered = order.quantity;
      const delivered = order.deliveryDetails.offloadingDetails.actualQuantity;
      
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
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <p>No sales data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Active Deliveries</CardTitle>
                    <CardDescription>Trucks currently in transit</CardDescription>
                  </div>
                  <Truck className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                {stats.activeDeliveries.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Truck className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No active deliveries at this time</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.activeDeliveries.slice(0, 3).map((delivery) => {
                      const driverId = delivery.deliveryDetails?.driverId;
                      const driver = drivers.find(d => d.id === driverId);
                      
                      return (
                        <Link 
                          key={delivery.id} 
                          to={`/delivery-tracking?id=${delivery.id}`}
                          className="block no-underline"
                        >
                          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                            <div className="flex items-center">
                              <div className="mr-3 bg-amber-100 p-2 rounded-full">
                                <Navigation className="h-5 w-5 text-amber-700" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{delivery.poNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  Driver: {driver ? driver.name : 'Unassigned'}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      );
                    })}
                    
                    {stats.activeDeliveries.length > 3 && (
                      <Link to="/gps-tracking" className="block no-underline">
                        <Button variant="ghost" size="sm" className="w-full text-amber-700">
                          View all {stats.activeDeliveries.length} active deliveries
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-indigo-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                    <CardDescription>System activity log</CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent>
                {stats.recentLogs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No recent activity to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className="bg-indigo-100 p-1.5 rounded-full mt-0.5">
                          {log.entityType === 'incident' ? (
                            <ShieldAlert className="h-4 w-4 text-indigo-700" />
                          ) : (
                            <Clock className="h-4 w-4 text-indigo-700" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(log.timestamp, 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Link to="/logs" className="block no-underline">
                      <Button variant="ghost" size="sm" className="w-full text-indigo-700">
                        View all activity logs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="operations">
          {/* Operations Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Orders Created</p>
                    <p className="text-2xl font-bold">{stats.ordersCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      In the selected period
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                    <FileCheck className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trucks Dispatched</p>
                    <p className="text-2xl font-bold">
                      {stats.activeDeliveries.length + stats.completedDeliveries}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.activeDeliveries.length} currently active
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deliveries Completed</p>
                    <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((stats.completedDeliveries / stats.ordersCount) * 100 || 0)}% completion rate
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Orders with Discrepancies</p>
                    <p className="text-2xl font-bold">{stats.ordersWithDiscrepancies}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((stats.ordersWithDiscrepancies / stats.ordersCount) * 100 || 0)}% of all orders
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Wait Time Metrics</CardTitle>
                <CardDescription>Time trucks wait before offloading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Average Wait Time</p>
                      <p className="text-xl font-bold">{Math.round(stats.averageWaitTime)} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Maximum Wait Time</p>
                      <p className="text-xl font-bold">{Math.round(stats.maxWaitTime)} minutes</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Wait Time Distribution</p>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>0 min</span>
                      <span>{Math.round(stats.maxWaitTime / 2)} min</span>
                      <span>{Math.round(stats.maxWaitTime)} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Driver Metrics</CardTitle>
                <CardDescription>Driver availability and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Total Drivers</p>
                    <p className="text-xl font-bold">{stats.driversCount}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Currently On Delivery</p>
                    <p className="text-xl font-bold">{stats.activeDeliveries.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Available</p>
                    <p className="text-xl font-bold">{stats.driversCount - stats.activeDeliveries.length}</p>
                  </div>
                </div>
                
                <Link to="/staff-management" className="block no-underline">
                  <Button variant="outline" className="w-full">
                    View Driver Management
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          {/* Inventory Statistics */}
          <Card className="shadow-md rounded-xl overflow-hidden mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Tank Status Overview</CardTitle>
                  <CardDescription>Current tank capacity utilization</CardDescription>
                </div>
                <Database className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/tank-management" className="no-underline text-foreground">
                  <div className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">PMS Tanks</p>
                      <Badge className="bg-green-500">{stats.fuelStock.PMS.toLocaleString()} L</Badge>
                    </div>
                    <Progress 
                      value={(stats.fuelStock.PMS / 120000) * 100} 
                      className="h-3"
                      indicatorClassName="bg-green-500" 
                    />
                  </div>
                </Link>
                
                <Link to="/tank-management" className="no-underline text-foreground">
                  <div className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">AGO Tanks</p>
                      <Badge className="bg-amber-500">{stats.fuelStock.AGO.toLocaleString()} L</Badge>
                    </div>
                    <Progress 
                      value={(stats.fuelStock.AGO / 60000) * 100} 
                      className="h-3"
                      indicatorClassName="bg-amber-500" 
                    />
                  </div>
                </Link>
                
                <Link to="/tank-management" className="no-underline text-foreground">
                  <div className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">DPK Tanks</p>
                      <Badge className="bg-blue-500">{stats.fuelStock.DPK.toLocaleString()} L</Badge>
                    </div>
                    <Progress 
                      value={(stats.fuelStock.DPK / 40000) * 100} 
                      className="h-3"
                      indicatorClassName="bg-blue-500" 
                    />
                  </div>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Available Tanks</p>
                  <p className="text-xl font-bold text-green-700">{stats.tankStatus.available}</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">Full Tanks</p>
                  <p className="text-xl font-bold text-amber-700">{stats.tankStatus.full}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">Empty Tanks</p>
                  <p className="text-xl font-bold text-red-700">{stats.tankStatus.empty}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Total Tanks</p>
                  <p className="text-xl font-bold text-blue-700">{stats.tankStatus.total}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t">
              <Link to="/tank-management" className="w-full no-underline">
                <Button variant="outline" className="w-full">
                  View Tank Management
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Dispenser Activity</CardTitle>
                  <CardDescription>Sales and dispenser status</CardDescription>
                </div>
                <Fuel className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Total Liters Sold</p>
                  <p className="text-xl font-bold">{stats.totalLitersSold.toLocaleString()} L</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    In the selected period
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Active Dispensers</p>
                  <p className="text-xl font-bold">{stats.dispenserStatus.active}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Of {stats.dispenserStatus.total} total
                  </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Average Sales per Dispenser</p>
                  <p className="text-xl font-bold">
                    {stats.dispenserStatus.active > 0 
                      ? Math.round(stats.totalLitersSold / stats.dispenserStatus.active).toLocaleString() 
                      : 0} L
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t">
              <Link to="/dispenser-management" className="w-full no-underline">
                <Button variant="outline" className="w-full">
                  View Dispenser Management
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials">
          {/* Financial Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                    <p className="text-2xl font-bold">₦{stats.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Purchases and operations
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Profit</p>
                    <p className="text-2xl font-bold">
                      <span className={stats.profit >= 0 ? "text-green-600" : "text-red-600"}>
                        ₦{stats.profit.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.profit >= 0 ? "Net profit" : "Net loss"}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stats.profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Outstanding Payments</p>
                    <p className="text-2xl font-bold">₦{(stats.totalRevenue * 0.1).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated receivables
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-red-100 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card className="shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Sales by Product Type</CardTitle>
                    <CardDescription>Revenue distribution across fuel products</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {stats.salesByFuelType.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.salesByFuelType.filter(item => item.value > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₦${(value/1000).toFixed(0)}K`} />
                        <Tooltip 
                          formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                          contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Revenue">
                          {stats.salesByFuelType.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#3B82F6'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <p>No sales data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t">
                <Link to="/financial-dashboard" className="w-full no-underline">
                  <Button variant="outline" className="w-full">
                    View Financial Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
