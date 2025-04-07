
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Truck } from '@/types';
import { PaginationParams } from '@/utils/localStorage/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const TruckManagement: React.FC = () => {
  const { 
    getAllTrucks,
    updateTruck, 
    tagTruckWithGPS,
    untagTruckGPS,
    getNonGPSTrucks
  } = useApp();
  
  const { toast } = useToast();
  const [gpsTaggedTrucks, setGpsTaggedTrucks] = useState<Truck[]>([]);
  const [nonTaggedTrucks, setNonTaggedTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load trucks from Supabase instead of localStorage
  useEffect(() => {
    const fetchTrucks = async () => {
      setLoading(true);
      try {
        // Get trucks from Supabase
        const { data: truckData, error } = await supabase
          .from('trucks')
          .select('*');
          
        if (error) {
          console.error('Error fetching trucks:', error);
          toast({
            title: "Error loading trucks",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Filter tagged and non-tagged trucks
        const tagged = truckData.filter(truck => truck.is_gps_tagged);
        const nonTagged = truckData.filter(truck => !truck.is_gps_tagged);
        
        setGpsTaggedTrucks(tagged.map(t => ({
          id: t.id,
          plateNumber: t.plate_number,
          model: t.model,
          capacity: t.capacity,
          hasGPS: t.has_gps,
          isAvailable: t.is_available,
          isGPSTagged: t.is_gps_tagged,
          driverId: t.driver_id,
          gpsDeviceId: t.gps_device_id,
          lastLatitude: t.last_latitude,
          lastLongitude: t.last_longitude,
          lastSpeed: t.last_speed,
          createdAt: t.created_at ? new Date(t.created_at) : undefined,
          updatedAt: t.updated_at ? new Date(t.updated_at) : undefined
        })));
        
        setNonTaggedTrucks(nonTagged.map(t => ({
          id: t.id,
          plateNumber: t.plate_number,
          model: t.model,
          capacity: t.capacity,
          hasGPS: t.has_gps,
          isAvailable: t.is_available,
          isGPSTagged: t.is_gps_tagged,
          driverId: t.driver_id,
          gpsDeviceId: t.gps_device_id,
          lastLatitude: t.last_latitude,
          lastLongitude: t.last_longitude,
          lastSpeed: t.last_speed,
          createdAt: t.created_at ? new Date(t.created_at) : undefined,
          updatedAt: t.updated_at ? new Date(t.updated_at) : undefined
        })));
      } catch (error) {
        console.error('Error in truck management:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrucks();
  }, [toast]);
  
  const handleTagTruck = async (truck: Truck) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('trucks')
        .update({ is_gps_tagged: true })
        .eq('id', truck.id);
        
      if (error) throw error;
      
      // Also update in local state for immediate UI change
      const updatedTruck = { ...truck, isGPSTagged: true };
      setNonTaggedTrucks(prev => prev.filter(t => t.id !== truck.id));
      setGpsTaggedTrucks(prev => [...prev, updatedTruck]);
      
      toast({
        title: "Success",
        description: `Truck ${truck.plateNumber} has been tagged with GPS`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to tag truck: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleUntagTruck = async (truck: Truck) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('trucks')
        .update({ is_gps_tagged: false })
        .eq('id', truck.id);
        
      if (error) throw error;
      
      // Also update in local state for immediate UI change
      const updatedTruck = { ...truck, isGPSTagged: false };
      setGpsTaggedTrucks(prev => prev.filter(t => t.id !== truck.id));
      setNonTaggedTrucks(prev => [...prev, updatedTruck]);
      
      toast({
        title: "Success",
        description: `GPS tag removed from truck ${truck.plateNumber}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to untag truck: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Truck GPS Management</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* GPS Tagged Trucks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>GPS Tagged Trucks</span>
              <Badge className="ml-2 bg-green-500">{gpsTaggedTrucks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : gpsTaggedTrucks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No GPS tagged trucks</p>
            ) : (
              <div className="space-y-4">
                {gpsTaggedTrucks.map(truck => (
                  <div key={truck.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{truck.plateNumber}</p>
                      <p className="text-sm text-muted-foreground">{truck.model} • {truck.capacity} L</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUntagTruck(truck)}
                    >
                      Remove GPS Tag
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Non-Tagged Trucks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Trucks Without GPS Tag</span>
              <Badge className="ml-2">{nonTaggedTrucks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : nonTaggedTrucks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All trucks have GPS tags</p>
            ) : (
              <div className="space-y-4">
                {nonTaggedTrucks.map(truck => (
                  <div key={truck.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{truck.plateNumber}</p>
                      <p className="text-sm text-muted-foreground">{truck.model} • {truck.capacity} L</p>
                      {!truck.hasGPS && (
                        <Badge variant="outline" className="text-xs">No GPS Hardware</Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!truck.hasGPS}
                      onClick={() => handleTagTruck(truck)}
                    >
                      Add GPS Tag
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TruckManagement;
