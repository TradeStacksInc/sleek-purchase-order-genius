
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PurchaseOrder } from '@/types';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DiscrepancyBadge from './DiscrepancyBadge';
import DetailsDialog from './DetailsDialog';
import OffloadingDialog from './OffloadingDialog';
import IncidentDialog from './IncidentDialog';
import { useApp } from '@/context/AppContext';

interface DeliveryTableProps {
  deliveries: PurchaseOrder[];
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  const { getDriverById, getTruckById } = useApp();

  const calculateDeliveryTime = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Driver & Truck</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery Time</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Discrepancy</TableHead>
            <TableHead>Incidents</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length > 0 ? (
            deliveries.map((order) => {
              const delivery = order.deliveryDetails;
              const offloading = order.offloadingDetails;
              
              if (!delivery) return null;
              
              const driver = delivery.driverId ? getDriverById(delivery.driverId) : undefined;
              const truck = delivery.truckId ? getTruckById(delivery.truckId) : undefined;
              
              let discrepancyPercent = 0;
              let rowColorClass = '';
              
              if (offloading) {
                discrepancyPercent = offloading.discrepancyPercentage;
                
                if (discrepancyPercent > 5) {
                  rowColorClass = 'bg-red-50';
                } else if (discrepancyPercent > 0) {
                  rowColorClass = 'bg-yellow-50';
                } else {
                  rowColorClass = 'bg-green-50';
                }
              }
              
              return (
                <TableRow key={order.id} className={rowColorClass}>
                  <TableCell className="font-medium">{order.poNumber}</TableCell>
                  <TableCell>
                    {driver ? (
                      <div>
                        <div>{driver.name}</div>
                        <div className="text-xs text-muted-foreground">{truck?.plateNumber}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusBadge status={delivery.status} />
                  </TableCell>
                  <TableCell>
                    {delivery.destinationArrivalTime && delivery.depotDepartureTime ? (
                      calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {offloading ? (
                      <div>
                        <div>{offloading.deliveredVolume.toLocaleString()} L</div>
                        <div className="text-xs text-muted-foreground">of {offloading.loadedVolume.toLocaleString()} L</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {offloading ? (
                      <DiscrepancyBadge discrepancyPercent={discrepancyPercent} />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.incidents && order.incidents.length > 0 ? (
                      <div className="flex gap-1">
                        {order.incidents.some(inc => inc.impact === 'negative') && (
                          <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
                            <span>-</span>
                          </Badge>
                        )}
                        {order.incidents.some(inc => inc.impact === 'positive') && (
                          <Badge variant="outline" className="bg-green-100 h-6 w-6 p-0 flex items-center justify-center rounded-full">
                            <span>+</span>
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <DetailsDialog order={order} />
                      
                      {delivery.status === 'delivered' && !offloading && (
                        <OffloadingDialog orderId={order.id} />
                      )}
                      
                      <IncidentDialog orderId={order.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No deliveries found matching your filter criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeliveryTable;
