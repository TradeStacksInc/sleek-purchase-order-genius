
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, PackageOpen, CheckCircle, Hourglass } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DeliveryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Delivered',
          icon: <CheckCircle className="h-3 w-3" />,
          color: 'bg-green-500 hover:bg-green-500',
          tooltip: 'Product has been successfully delivered'
        };
      case 'in_transit':
        return {
          label: 'In Transit',
          icon: <Truck className="h-3 w-3 animate-pulse" />,
          color: 'bg-blue-500 hover:bg-blue-500',
          tooltip: 'Product is currently being transported'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: <Hourglass className="h-3 w-3" />,
          color: 'bg-yellow-500 hover:bg-yellow-500',
          tooltip: 'Delivery is pending departure'
        };
      case 'offloading':
        return {
          label: 'Offloading',
          icon: <PackageOpen className="h-3 w-3" />,
          color: 'bg-purple-500 hover:bg-purple-500',
          tooltip: 'Product is being offloaded at destination'
        };
      case 'delayed':
        return {
          label: 'Delayed',
          icon: <Clock className="h-3 w-3" />,
          color: 'bg-orange-500 hover:bg-orange-500',
          tooltip: 'Delivery is delayed'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusDetails();
  if (!statusInfo) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{statusInfo.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeliveryStatusBadge;
