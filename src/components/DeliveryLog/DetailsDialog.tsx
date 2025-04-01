
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseOrder } from '@/types';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DiscrepancyBadge from './DiscrepancyBadge';
import { useApp } from '@/context/AppContext';

interface DetailsDialogProps {
  order: PurchaseOrder;
}

const DetailsDialog: React.FC<DetailsDialogProps> = ({ order }) => {
  const { getDriverById, getTruckById } = useApp();
  
  if (!order.deliveryDetails) return null;
  
  const delivery = order.deliveryDetails;
  const driver = delivery.driverId ? getDriverById(delivery.driverId) : undefined;
  const truck = delivery.truckId ? getTruckById(delivery.truckId) : undefined;
  
  const calculateDeliveryTime = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Details - PO #{order.poNumber}</DialogTitle>
          <DialogDescription>
            Detailed information about this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Delivery Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Status:</span>
                <span><DeliveryStatusBadge status={delivery.status} /></span>
              </div>
              
              {delivery.depotDepartureTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Departure:</span>
                  <span>{format(delivery.depotDepartureTime, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              
              {delivery.destinationArrivalTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Arrival:</span>
                  <span>{format(delivery.destinationArrivalTime, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              
              {delivery.depotDepartureTime && delivery.destinationArrivalTime && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Delivery Time:</span>
                  <span>{calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Driver & Truck</h4>
            <div className="space-y-2">
              {driver ? (
                <>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Driver:</span>
                    <span>{driver.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{driver.contact}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">License:</span>
                    <span>{driver.licenseNumber}</span>
                  </div>
                </>
              ) : (
                <div className="pb-1 text-center text-muted-foreground">No driver assigned</div>
              )}
              
              {truck ? (
                <>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Truck:</span>
                    <span>{truck.plateNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{truck.model}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span>{truck.capacity.toLocaleString()} L</span>
                  </div>
                </>
              ) : (
                <div className="pb-1 text-center text-muted-foreground">No truck assigned</div>
              )}
            </div>
          </div>
        </div>
        
        {order.offloadingDetails && (
          <div>
            <h4 className="text-sm font-medium mb-2">Offloading Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Loaded Volume:</span>
                  <span>{order.offloadingDetails.loadedVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Delivered Volume:</span>
                  <span>{order.offloadingDetails.deliveredVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Discrepancy:</span>
                  <DiscrepancyBadge discrepancyPercent={order.offloadingDetails.discrepancyPercentage} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Initial Tank Volume:</span>
                  <span>{order.offloadingDetails.initialTankVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Final Tank Volume:</span>
                  <span>{order.offloadingDetails.finalTankVolume.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Measured By:</span>
                  <span>{order.offloadingDetails.measuredBy} ({order.offloadingDetails.measuredByRole})</span>
                </div>
              </div>
            </div>
            
            {order.offloadingDetails.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm border rounded-md p-2 bg-muted">
                  {order.offloadingDetails.notes}
                </p>
              </div>
            )}
            
            {order.offloadingDetails.isDiscrepancyFlagged && (
              <div className="mt-4 p-2 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-800">
                  This delivery has been flagged for investigation due to significant volume discrepancy.
                </p>
              </div>
            )}
          </div>
        )}
        
        {order.incidents && order.incidents.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Incidents</h4>
            <div className="space-y-3">
              {order.incidents.map(incident => (
                <div key={incident.id} className={cn(
                  "p-2 rounded-md border text-sm",
                  incident.impact === 'positive' ? "bg-green-50 border-green-200" :
                  incident.impact === 'negative' ? "bg-red-50 border-red-200" :
                  "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{incident.type}</span>
                    <span className="text-xs">{format(incident.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <p>{incident.description}</p>
                  <div className="text-xs mt-1">Reported by: {incident.reportedBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
