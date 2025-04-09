
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/Dashboard/StatCard';
import RecentOrdersTable from '@/components/Dashboard/RecentOrdersTable';
import DriverSituationCard from '@/components/Dashboard/DriverSituationCard';
import GPSTrackingTab from '@/components/Dashboard/GPSTrackingTab';
import OrdersTab from '@/components/Dashboard/OrdersTab';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your operations.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Deliveries"
          value="1,284"
          change="+12.5%"
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          description="vs. last month"
          trend="up"
          trendIcon={<ArrowUpRight className="mr-1 h-4 w-4" />}
        />
        <StatCard 
          title="Active Orders"
          value="24"
          change="+8.2%"
          icon={<ArrowRight className="h-4 w-4 text-muted-foreground" />}
          description="vs. yesterday"
          trend="up"
          trendIcon={<ArrowUpRight className="mr-1 h-4 w-4" />}
        />
        <StatCard 
          title="Trucks En Route"
          value="18"
          change="+3"
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          description="vs. yesterday"
          trend="up"
          trendIcon={<ArrowUpRight className="mr-1 h-4 w-4" />}
        />
        <StatCard 
          title="Total Fuel Delivered"
          value="342kL"
          change="+14.8%"
          icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          description="vs. last month"
          trend="up"
          trendIcon={<ArrowUpRight className="mr-1 h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tracking">GPS Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your most recent purchase orders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrdersTable />
              </CardContent>
            </Card>
            <DriverSituationCard />
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4 pt-4">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="tracking" className="pt-4">
          <GPSTrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
