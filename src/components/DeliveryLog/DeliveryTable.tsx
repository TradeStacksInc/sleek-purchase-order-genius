
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
import { Truck, MapPin, Clock, ChevronRight, Info, FileText, Droplet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
            <TableHead>Tracking</TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Droplet className="h-4 w-4" /> 
                      <span>Volume</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Product volume information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
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
                } else if (delivery.status === 'delivered') {
                  rowColorClass = 'bg-green-50/50';
                }
              }
              
              // Calculate progress percentage for in-transit deliveries
              let progressPercentage = 0;
              let eta = "";
              
              if (delivery.status === 'in_transit') {
                const totalDistance = delivery.totalDistance || 100;
                const distanceCovered = delivery.distanceCovered || 0;
                progressPercentage = Math.min(Math.round((distanceCovered / totalDistance) * 100), 100);
                
                if (delivery.expectedArrivalTime) {
                  eta = format(new Date(delivery.expectedArrivalTime), 'h:mm a, MMM d');
                }
              } else if (delivery.status === 'delivered') {
                progressPercentage = 100;
              }
              
              // Get product type from the order items (first item for simplicity)
              const productType = order.items && order.items.length > 0 
                ? order.items[0].description 
                : "Unknown Product";

              return (
                <TableRow key={order.id} className={`${rowColorClass} delivery-log-card`}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-base">{order.poNumber}</div>
                      <div className="text-sm text-muted-foreground mt-1">{order.supplier.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> {productType}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {driver ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {truck?.plateNumber} {truck?.isGPSTagged && 
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs ml-1">GPS</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>This truck is equipped with GPS tracking</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusBadge status={delivery.status} />
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {delivery.status === 'in_transit' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" /> Depot
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Site
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <Progress value={progressPercentage} className="h-2.5" />
                          <div className="absolute" 
                               style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)', top: '50%' }}>
                            <Truck className="h-5 w-5 text-blue-600 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" /> ETA: {eta || "Calculating..."}
                        </div>
                      </div>
                    ) : delivery.status === 'delivered' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" /> Depot
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Site
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <Progress value={100} className="h-2.5 bg-green-100" />
                          <div className="absolute" style={{ right: '0%', transform: 'translateX(50%) translateY(-50%)', top: '50%' }}>
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-1 text-xs text-green-600 font-medium">
                          {delivery.destinationArrivalTime && delivery.depotDepartureTime ? (
                            <span>Completed in {calculateDeliveryTime(delivery.depotDepartureTime, delivery.destinationArrivalTime)}</span>
                          ) : (
                            <span>Completed</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        {delivery.status === 'pending' ? 'Awaiting departure' : 'Status unknown'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {offloading ? (
                      <div className="space-y-1">
                        <div className="font-medium text-base">{offloading.deliveredVolume.toLocaleString()} L</div>
                        <div className="text-sm text-muted-foreground">of {offloading.loadedVolume.toLocaleString()} L</div>
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {order.items[0].description}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Volume pending</span>
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {order.items[0].description}
                          </div>
                        )}
                      </div>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="destructive" className="h-7 w-7 p-0 flex items-center justify-center rounded-full">
                                  <span>-</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>This delivery has negative incidents reported</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {order.incidents.some(inc => inc.impact === 'positive') && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="bg-green-100 h-7 w-7 p-0 flex items-center justify-center rounded-full">
                                  <span>+</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>This delivery has positive feedback</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DetailsDialog order={order} />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>View detailed information about this delivery</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {delivery.status === 'delivered' && !offloading && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <OffloadingDialog orderId={order.id} />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Record offloading details for this delivery</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IncidentDialog orderId={order.id} />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Report an incident for this delivery</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Truck className="h-12 w-12 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground">No deliveries found matching your filter criteria.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeliveryTable;
