
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Filter, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={() => navigate('/create')}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Orders Management
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h3 className="text-xl font-medium mb-2">Orders Page</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              View and manage all purchase orders here. This page displays a list of 
              all orders with filtering and search capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
