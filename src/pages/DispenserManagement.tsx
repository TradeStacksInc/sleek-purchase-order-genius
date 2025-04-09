
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel } from 'lucide-react';

const DispenserManagement: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dispenser Management</h1>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-6 w-6 text-primary" />
            Fuel Dispensers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h3 className="text-xl font-medium mb-2">Dispenser Management Page</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Monitor and manage fuel dispensers, track usage and maintenance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispenserManagement;
