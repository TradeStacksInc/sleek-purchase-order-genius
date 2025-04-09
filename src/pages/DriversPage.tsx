
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DriversPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Drivers Management</h1>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Drivers Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4 opacity-80" />
            <h3 className="text-xl font-medium mb-2">Driver Management Module</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              This module is currently under development. You'll be able to manage your drivers, 
              view their performance metrics, and assign them to routes here.
            </p>
            <Button>View Demo Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriversPage;
