
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck } from 'lucide-react';

const GPSTracking: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">GPS Tracking</h1>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Vehicle Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h3 className="text-xl font-medium mb-2">GPS Tracking Page</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Track vehicle locations in real-time and monitor delivery routes.
              View current location and movement history of all active fleet vehicles.
            </p>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-gray-400" />
              <span className="ml-2 text-gray-500">Map View Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GPSTracking;
