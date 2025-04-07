import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DateRangePicker } from "@/components/DateRangePicker";
import { addDays } from 'date-fns';

const Analytics = () => {
  const { purchaseOrders, sales, incidents, generateAIInsights } = useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  useEffect(() => {
    generateAnalyticsData();
  }, [dateRange, purchaseOrders]);

  const generateAnalyticsData = () => {
    const filteredOrders = purchaseOrders.filter(order => {
      const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      return (
        orderDate >= dateRange.from &&
        orderDate <= dateRange.to
      );
    });
    
    const totalOrders = filteredOrders.length;
    const totalOrderValue = filteredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
    
    const orderStatusBreakdown = [
      { name: 'Completed', value: completedOrders },
      { name: 'Pending', value: pendingOrders },
      { name: 'Cancelled', value: cancelledOrders },
    ];
    
    const deliveries = filteredOrders.filter(order => order.deliveryDetails);
    const completedDeliveries = deliveries.filter(order => order.deliveryDetails?.status === 'delivered').length;
    const inTransitDeliveries = deliveries.filter(order => order.deliveryDetails?.status === 'in_transit').length;
    const pendingDeliveries = deliveries.filter(order => order.deliveryDetails?.status === 'pending').length;
    const flaggedDeliveries = deliveries.filter(order => order.offloadingDetails?.isDiscrepancyFlagged).length;
    
    const onTimeDeliveries = deliveries.filter(order => {
      if (order.deliveryDetails?.actualArrivalTime && order.deliveryDetails?.expectedArrivalTime) {
        const actual = new Date(order.deliveryDetails.actualArrivalTime);
        const expected = new Date(order.deliveryDetails.expectedArrivalTime);
        return actual <= expected;
      }
      return false;
    }).length;
    
    const onTimeRate = deliveries.length > 0 ? (onTimeDeliveries / completedDeliveries) * 100 : 0;
    
    const avgDeliveryTime = deliveries
      .filter(order => order.deliveryDetails?.actualArrivalTime && order.deliveryDetails?.depotDepartureTime)
      .reduce((sum, order) => {
        const start = new Date(order.deliveryDetails!.depotDepartureTime!);
        const end = new Date(order.deliveryDetails!.actualArrivalTime!);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Hours
      }, 0) / completedDeliveries || 0;
    
    const deliveryStatusBreakdown = [
      { name: 'Completed', value: completedDeliveries },
      { name: 'In Transit', value: inTransitDeliveries },
      { name: 'Pending', value: pendingDeliveries },
    ];
    
    const ordersWithDiscrepancies = filteredOrders.filter(order => order.offloadingDetails?.isDiscrepancyFlagged);
    const discrepancyRate = filteredOrders.length > 0 ? (ordersWithDiscrepancies.length / filteredOrders.length) * 100 : 0;
    const averageDiscrepancyPercentage = ordersWithDiscrepancies.reduce((sum, order) => {
      return sum + (order.offloadingDetails?.discrepancyPercentage || 0);
    }, 0) / ordersWithDiscrepancies.length || 0;
    
    const montlyTrend = Array.from({ length: 6 }).map((_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - 5 + i);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      return {
        name: monthName,
        orders: Math.floor(Math.random() * 20) + 10, // Mock data
        deliveries: Math.floor(Math.random() * 15) + 5, // Mock data
        revenue: Math.floor(Math.random() * 5000) + 2000 // Mock data
      };
    });
    
    const data = {
      period: `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`,
      generatedAt: new Date().toLocaleString(),
      stats: {
        totalOrders,
        totalOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalDeliveries: deliveries.length,
        completedDeliveries,
        inTransitDeliveries,
        pendingDeliveries,
        flaggedDeliveries,
        onTimeDeliveries,
        onTimeRate,
        avgDeliveryTime
      },
      orderStatusBreakdown,
      deliveryStatusBreakdown,
      discrepancyAnalysis: {
        ordersWithDiscrepancies: ordersWithDiscrepancies.length,
        discrepancyRate,
        averageDiscrepancyPercentage
      },
      montlyTrend
    };
    
    setAnalyticsData(data);
    
    generateAIInsights(data);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!analyticsData) {
    return (
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Analytics</h1>
        <DateRangePicker 
          date={dateRange}
          onDateChange={(date) => {
            if (date?.from) {
              setDateRange({
                from: date.from,
                to: date.to || new Date()
              });
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="transition-all duration-200 rounded-xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{analyticsData.stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Period: {analyticsData.period}</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 rounded-xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Order Value</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">₦{analyticsData.stats.totalOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total value of all orders</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 rounded-xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{analyticsData.stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.stats.totalOrders > 0 
                ? `${((analyticsData.stats.completedOrders / analyticsData.stats.totalOrders) * 100).toFixed(1)}% of total orders`
                : 'No orders available'}
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 rounded-xl">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{analyticsData.stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.stats.totalOrders > 0 
                ? `${((analyticsData.stats.pendingOrders / analyticsData.stats.totalOrders) * 100).toFixed(1)}% of total orders`
                : 'No orders available'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="orders" className="transition-all duration-200">Order Analytics</TabsTrigger>
          <TabsTrigger value="delivery" className="transition-all duration-200">Delivery Analytics</TabsTrigger>
          <TabsTrigger value="financial" className="transition-all duration-200">Financial Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.orderStatusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.orderStatusBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Monthly Order Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.montlyTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.completedOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.pendingOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cancelled</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.cancelledOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Delivery Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.deliveryStatusBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.deliveryStatusBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Monthly Delivery Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.montlyTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deliveries" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">On-Time Delivery Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.onTimeRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{analyticsData.stats.onTimeDeliveries} out of {analyticsData.stats.completedDeliveries} deliveries were on time</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Delivery Time</p>
                    <p className="text-2xl font-bold">{analyticsData.stats.avgDeliveryTime.toFixed(1)} hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Discrepancy Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Discrepancy Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.discrepancyAnalysis.discrepancyRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{analyticsData.discrepancyAnalysis.ordersWithDiscrepancies} orders had discrepancies</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Discrepancy</p>
                    <p className="text-2xl font-bold">{analyticsData.discrepancyAnalysis.averageDiscrepancyPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.montlyTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Total Order Value</p>
                    <p className="text-2xl font-bold">₦{analyticsData.stats.totalOrderValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Order Value</p>
                    <p className="text-2xl font-bold">
                      ₦{(analyticsData.stats.totalOrderValue / analyticsData.stats.totalOrders || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="transition-all duration-200 rounded-xl">
        <CardHeader>
          <CardTitle>Analysis Period: {analyticsData.period}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analytics report generated at {analyticsData.generatedAt}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
