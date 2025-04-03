
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GPSTrackingTab from '@/components/Dashboard/GPSTrackingTab';
import OrdersTab from '@/components/Dashboard/OrdersTab';
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  Area, 
  AreaChart,
  Bar, 
  BarChart,
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CircleDollarSign, 
  FileCheck, 
  Hourglass,
  Truck,
  Users,
  BarChart3,
  Droplets,
  AlertCircle,
  GaugeCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { purchaseOrders, updateOrderStatus, getDriverById, getTruckById, tanks = [] } = useApp();
  const [timeRange, setTimeRange] = useState('1y');
  
  // Calculate stats
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length;
  const activeOrders = purchaseOrders.filter(po => po.status === 'active').length;
  const fulfilledOrders = purchaseOrders.filter(po => po.status === 'fulfilled').length;
  
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const activeTotalValue = purchaseOrders
    .filter(po => po.status === 'active')
    .reduce((sum, po) => sum + po.grandTotal, 0);
    
  // Get active deliveries
  const activeDeliveries = purchaseOrders.filter(po => 
    po.deliveryDetails?.status === 'in_transit'
  );

  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 1200000 },
    { month: 'Feb', revenue: 900000 },
    { month: 'Mar', revenue: 1500000 },
    { month: 'Apr', revenue: 1800000 },
    { month: 'May', revenue: 1600000 },
    { month: 'Jun', revenue: 2100000 },
    { month: 'Jul', revenue: 1900000 },
    { month: 'Aug', revenue: 2300000 },
    { month: 'Sep', revenue: 2500000 },
    { month: 'Oct', revenue: 2700000 },
    { month: 'Nov', revenue: 2400000 },
    { month: 'Dec', revenue: 3100000 },
  ];

  const fuelSales = [
    { name: 'PMS', value: 65 },
    { name: 'AGO', value: 25 },
    { name: 'DPK', value: 10 },
  ];

  // Use actual tank data if available, otherwise use mock data
  const tankLevels = tanks.length > 0 
    ? tanks.map(tank => ({
        name: `${tank.name} (${tank.productType})`,
        level: Math.round((tank.currentVolume / tank.capacity) * 100),
        capacity: `${tank.capacity.toLocaleString()}L`,
        current: `${tank.currentVolume.toLocaleString()}L`,
      }))
    : [
        { name: 'Tank 1 (PMS)', level: 75, capacity: '45,000L', current: '33,750L' },
        { name: 'Tank 2 (PMS)', level: 60, capacity: '45,000L', current: '27,000L' },
        { name: 'Tank 3 (AGO)', level: 45, capacity: '45,000L', current: '20,250L' },
        { name: 'Tank 4 (AGO)', level: 30, capacity: '45,000L', current: '13,500L' },
      ];

  const alerts = [
    { id: 1, type: 'critical', message: 'Tank 4 level below 35%', timestamp: '2 hours ago' },
    { id: 2, type: 'warning', message: 'Dispenser 3 offline', timestamp: '3 hours ago' },
    { id: 3, type: 'info', message: 'Truck PMS-001 arrived at station', timestamp: '6 hours ago' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Business Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setTimeRange('7d')}>
            7D
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setTimeRange('1m')}>
            1M
          </Badge>
          <Badge variant="outline" className={`cursor-pointer ${timeRange === '1y' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`} onClick={() => setTimeRange('1y')}>
            1Y
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setTimeRange('all')}>
            All
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          description={`${fulfilledOrders} fulfilled orders`}
          icon={<FileCheck className="h-4 w-4" />}
          trend={7.2}
          trendUp={true}
        />
        <MetricCard 
          title="Pending Orders" 
          value={pendingOrders.toString()} 
          description={`Awaiting payment or approval`}
          icon={<Hourglass className="h-4 w-4" />}
          iconColor="bg-amber-100 text-amber-700"
          trend={2.1}
          trendUp={false}
        />
        <MetricCard 
          title="Active Orders" 
          value={activeOrders.toString()} 
          description={`${activeDeliveries.length} deliveries in transit`}
          icon={<Truck className="h-4 w-4" />}
          iconColor="bg-blue-100 text-blue-700"
          trend={12.5}
          trendUp={true}
        />
        <MetricCard 
          title="Total Revenue" 
          value={`₦${(totalValue/1000000).toFixed(2)}M`}
          description={`₦${(activeTotalValue/1000000).toFixed(2)}M in active orders`}
          icon={<CircleDollarSign className="h-4 w-4" />}
          iconColor="bg-green-100 text-green-700"
          trend={15.3}
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500 transition-transform hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRevenue}
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
                    tickFormatter={(value) => `₦${value/1000000}M`} 
                    tick={{ fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₦${(value/1000000).toFixed(2)}M`, 'Revenue']}
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

        <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-green-500 transition-transform hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-base font-medium">Fuel Sales Distribution</CardTitle>
            <CardDescription>Sales by fuel type</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fuelSales}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Percentage']}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-blue-500 transition-transform hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Tank Levels</CardTitle>
                <CardDescription>Current storage capacity</CardDescription>
              </div>
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tankLevels.map((tank, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{tank.name}</span>
                    <span className="font-medium">{tank.level}% ({tank.current}/{tank.capacity})</span>
                  </div>
                  <Progress 
                    value={tank.level} 
                    className="h-2 rounded-full" 
                    indicatorClassName={
                      tank.level < 30 ? "bg-red-500 rounded-full" : 
                      tank.level < 50 ? "bg-amber-500 rounded-full" : 
                      "bg-green-500 rounded-full"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-purple-500 transition-transform hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Staff Overview</CardTitle>
                <CardDescription>Shift and attendance</CardDescription>
              </div>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-purple-600 font-medium">On Shift</p>
                <p className="text-2xl font-bold text-purple-700">12</p>
                <p className="text-xs text-purple-600">of 15 staff</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-blue-600 font-medium">Attendance</p>
                <p className="text-2xl font-bold text-blue-700">92%</p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-green-600 font-medium">Productivity</p>
                <p className="text-2xl font-bold text-green-700">94%</p>
                <p className="text-xs text-green-600">Target: 85%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-amber-600 font-medium">Drivers</p>
                <p className="text-2xl font-bold text-amber-700">8</p>
                <p className="text-xs text-amber-600">5 in transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-xl overflow-hidden border-t-4 border-t-red-500 transition-transform hover:scale-[1.01] hover:shadow-lg">
          <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">System Alerts</CardTitle>
                <CardDescription>Issues that need attention</CardDescription>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg flex items-start space-x-3 shadow-sm hover:shadow-md transition-all duration-200
                    ${alert.type === 'critical' ? 'bg-red-50 text-red-800' : 
                      alert.type === 'warning' ? 'bg-amber-50 text-amber-800' :
                      'bg-blue-50 text-blue-800'}`}
                >
                  <div 
                    className={`p-1 rounded-full
                      ${alert.type === 'critical' ? 'bg-red-200' : 
                        alert.type === 'warning' ? 'bg-amber-200' :
                        'bg-blue-200'}`}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <span className="text-xs opacity-70">{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No alerts at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 rounded-lg">
          <TabsTrigger value="orders" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Purchase Orders</TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">GPS Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="animate-fade-in">
          <OrdersTab 
            purchaseOrders={purchaseOrders}
            updateOrderStatus={updateOrderStatus}
            getDriverById={getDriverById}
          />
        </TabsContent>
        
        <TabsContent value="tracking" className="animate-fade-in">
          <GPSTrackingTab 
            activeDeliveries={activeDeliveries}
            getDriverById={getDriverById}
            getTruckById={getTruckById}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend: number;
  trendUp: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconColor = "bg-primary/20 text-primary",
  trend,
  trendUp
}) => (
  <Card className="shadow-md rounded-xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg border-t-4 border-t-primary">
    <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center mt-1 text-xs">
            <span className={`mr-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}%
            </span>
            <span className="text-muted-foreground">{description}</span>
          </div>
        </div>
        <div className={`p-2 rounded-full ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
