
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, AlertCircle, Truck, User, ArrowLeft, CheckCircle } from 'lucide-react';

const AssignDriverPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getPurchaseOrderById, 
    getAvailableDrivers, 
    getAvailableTrucks,
    assignDriverToDelivery,
    assignTruckToDelivery,
    addActivityLog
  } = useApp();
  
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  
  const purchaseOrder = id ? getPurchaseOrderById(id) : undefined;
  const availableDrivers = getAvailableDrivers();
  const availableTrucks = getAvailableTrucks();
  
  // Filter trucks with GPS
  const gpsEnabledTrucks = availableTrucks.filter(truck => truck.isGPSTagged);
  
  useEffect(() => {
    if (!purchaseOrder && id) {
      toast({
        title: "Error",
        description: `Purchase Order with ID ${id} not found.`,
        variant: "destructive",
      });
      navigate('/orders');
    }
    
    if (purchaseOrder?.deliveryDetails?.driverId && purchaseOrder?.deliveryDetails?.truckId) {
      setIsAssigned(true);
      setSelectedDriverId(purchaseOrder.deliveryDetails.driverId);
      setSelectedTruckId(purchaseOrder.deliveryDetails.truckId);
    }
  }, [purchaseOrder, id, toast, navigate]);
  
  const handleAssign = async () => {
    if (!id || !selectedDriverId || !selectedTruckId) {
      toast({
        title: "Error",
        description: "Please select both a driver and a truck.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Assign driver
      const driverSuccess = await assignDriverToDelivery(id, selectedDriverId);
      
      // Assign truck
      const truckSuccess = await assignTruckToDelivery(id, selectedTruckId);
      
      if (driverSuccess && truckSuccess) {
        // Log the assignment
        addActivityLog({
          action: 'assign_delivery',
          entityType: 'purchase_order',
          entityId: id,
          details: `Driver and truck assigned to Purchase Order ${purchaseOrder?.poNumber}`,
          user: 'Admin'
        });
        
        setIsAssigned(true);
        toast({
          title: "Success",
          description: "Driver and truck assigned successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to assign driver or truck. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning driver/truck:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/orders/${id}`);
  };
  
  if (!purchaseOrder) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <Loader className="animate-spin h-8 w-8 text-primary" />
            </div>
            <p className="text-center mt-4">Loading purchase order...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Assign Driver & Truck</CardTitle>
          <CardDescription>
            Assign a driver and truck to Purchase Order {purchaseOrder.poNumber}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isAssigned ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle>Assignment Completed</AlertTitle>
              <AlertDescription>
                Driver and truck have been assigned to this purchase order.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {availableDrivers.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Available Drivers</AlertTitle>
                  <AlertDescription>
                    There are no available drivers to assign. Please add drivers or make some available.
                  </AlertDescription>
                </Alert>
              )}
              
              {gpsEnabledTrucks.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No GPS-Enabled Trucks</AlertTitle>
                  <AlertDescription>
                    There are no GPS-enabled trucks available. Please add trucks with GPS capabilities.
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="block font-medium mb-2">
                  <User className="inline-block mr-2 h-4 w-4" /> Select Driver
                </label>
                <Select
                  value={selectedDriverId || ""}
                  onValueChange={(value) => setSelectedDriverId(value)}
                  disabled={availableDrivers.length === 0 || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.licenseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block font-medium mb-2">
                  <Truck className="inline-block mr-2 h-4 w-4" /> Select Truck (GPS Enabled Only)
                </label>
                <Select
                  value={selectedTruckId || ""}
                  onValueChange={(value) => setSelectedTruckId(value)}
                  disabled={gpsEnabledTrucks.length === 0 || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {gpsEnabledTrucks.map((truck) => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.plateNumber} ({truck.model}, {truck.capacity}L)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          {isAssigned ? (
            <Button onClick={handleBack}>
              Return to Order
            </Button>
          ) : (
            <Button 
              onClick={handleAssign} 
              disabled={!selectedDriverId || !selectedTruckId || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Driver & Truck'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssignDriverPage;
