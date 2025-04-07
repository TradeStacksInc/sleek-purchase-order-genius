import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { subMonths, isSameDay, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, AlertTriangle, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { exportDataToFile } from "@/utils/localStorage/export";

interface AnalyticsData {
  period: string;
  generatedAt: string;
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    inTransitDeliveries: number;
    pendingDeliveries: number;
    flaggedDeliveries: number;
    onTimeDeliveries: number;
    onTimeRate: number;
    avgDeliveryTime: number;
  };
  deliveryStatusBreakdown: {
    status: string;
    count: number;
    color: string;
  }[];
  discrepancyAnalysis: {
    flaggedOrders: number;
    averageDiscrepancy: number;
  };
  customerSatisfaction: {
    positiveFeedback: number;
    negativeFeedback: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics: React.FC = () => {
  const { purchaseOrders, getOrdersWithDeliveryStatus, getOrdersWithDiscrepancies } = useApp();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3); // Default to 3 months
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    generateAnalyticsData(selectedPeriod);
  }, [purchaseOrders, selectedPeriod]);

  const generateAnalyticsData = (months: number) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    const relevantOrders = purchaseOrders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const totalDeliveries = relevantOrders.length;
    const completedDeliveries = getOrdersWithDeliveryStatus('delivered').length;
    const inTransitDeliveries = getOrdersWithDeliveryStatus('in_transit').length;
    const pendingDeliveries = getOrdersWithDeliveryStatus('pending').length;
    const flaggedDeliveries = getOrdersWithDiscrepancies().length;

    // Mock on-time deliveries and average delivery time
    const onTimeDeliveries = Math.floor(completedDeliveries * 0.8); // Assuming 80% on-time
    const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
    const avgDeliveryTime = 72; // Mock average delivery time in hours

    const deliveryStatusBreakdown = [
      { status: 'Completed', count: completedDeliveries, color: '#0088FE' },
      { status: 'In Transit', count: inTransitDeliveries, color: '#00C49F' },
      { status: 'Pending', count: pendingDeliveries, color: '#FFBB28' },
      { status: 'Flagged', count: flaggedDeliveries, color: '#FF8042' },
    ];

    const totalDiscrepancies = getOrdersWithDiscrepancies().length;
    const averageDiscrepancy = totalDiscrepancies > 0 ? 3.5 : 0; // Mock discrepancy percentage

    // Mock customer satisfaction
    const positiveFeedback = Math.floor(completedDeliveries * 0.9);
    const negativeFeedback = completedDeliveries - positiveFeedback;

    const data: AnalyticsData = {
      period: `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`,
      generatedAt: new Date().toLocaleString(),
      stats: {
        totalDeliveries,
        completedDeliveries,
        inTransitDeliveries,
        pendingDeliveries,
        flaggedDeliveries,
        onTimeDeliveries,
        onTimeRate,
        avgDeliveryTime,
      },
      deliveryStatusBreakdown,
      discrepancyAnalysis: {
        flaggedOrders: totalDiscrepancies,
        averageDiscrepancy,
      },
      customerSatisfaction: {
        positiveFeedback,
        negativeFeedback,
      },
    };

    setAnalyticsData(data);
  };

  const deliveryStatusData = analyticsData?.deliveryStatusBreakdown || [];
  const customerSatisfactionData = [
    { name: 'Positive', value: analyticsData?.customerSatisfaction.positiveFeedback || 0 },
    { name: 'Negative', value: analyticsData?.customerSatisfaction.negativeFeedback || 0 },
  ];

  // In exportAnalyticsData function, update the call to exportDataToFile
  const exportAnalyticsData = () => {
    // Convert the analytics data to array format for export
    const dataForExport = [analyticsData];
    exportDataToFile(dataForExport, 'fuel-delivery-analytics', 'json');
  };

  return (
    <div className="container mx-auto p-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Analytics Data</DialogTitle>
            <DialogDescription>
              Would you like to export the current analytics data to a JSON file?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Confirm to download the analytics data.</p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => {
              exportAnalyticsData();
              setIsDialogOpen(false);
            }}>
              Confirm Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="text-2xl font-bold mb-4">Fuel Delivery Analytics</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
          <TabsTrigger value="satisfaction">Customer Satisfaction</TabsTrigger>
        </TabsList>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
          <div className="space-x-2">
            <Button
              variant={selectedPeriod === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(1)}
            >
              1 Month
            </Button>
            <Button
              variant={selectedPeriod === 3 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(3)}
            >
              3 Months
            </Button>
            <Button
              variant={selectedPeriod === 6 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(6)}
            >
              6 Months
            </Button>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Deliveries</CardTitle>
                <CardDescription>Number of deliveries in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.stats.totalDeliveries || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>On-Time Delivery Rate</CardTitle>
                <CardDescription>Percentage of deliveries completed on time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.stats.onTimeRate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Delivery Time</CardTitle>
                <CardDescription>Average time taken for deliveries (hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.stats.avgDeliveryTime || 0} hrs</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status Breakdown</CardTitle>
              <CardDescription>Distribution of delivery statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {deliveryStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deliveryStatusData}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count">
                      {deliveryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">No delivery data available for the selected period.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discrepancies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Orders</CardTitle>
                <CardDescription>Orders with discrepancies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.discrepancyAnalysis.flaggedOrders || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Discrepancy</CardTitle>
                <CardDescription>Average discrepancy percentage in flagged orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.discrepancyAnalysis.averageDiscrepancy?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
              <CardDescription>Positive vs. Negative feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {customerSatisfactionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={customerSatisfactionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {customerSatisfactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">No customer satisfaction data available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
