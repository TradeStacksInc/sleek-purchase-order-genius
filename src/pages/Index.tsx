
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart2, Droplet, Truck } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Filling Station Management System</h1>
        <p className="text-muted-foreground mt-2">Complete solution for managing your filling station operations</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Dashboard
            </CardTitle>
            <CardDescription>View real-time analytics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get a comprehensive overview of your station's performance, inventory levels, and sales.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full transition-all duration-200">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Orders
            </CardTitle>
            <CardDescription>Manage purchase orders and deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and track purchase orders, assign drivers, and manage delivery logistics.</p>
            <Button onClick={() => navigate('/orders')} className="w-full transition-all duration-200">
              Manage Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              Tank Management
            </CardTitle>
            <CardDescription>Monitor and manage fuel tanks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Track fuel levels, schedule refills, and analyze consumption patterns.</p>
            <Button onClick={() => navigate('/tank-management')} className="w-full transition-all duration-200">
              View Tanks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
