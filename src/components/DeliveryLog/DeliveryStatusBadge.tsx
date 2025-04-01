
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, PackageOpen, CheckCircle, HourglassClock } from 'lucide-react';

const DeliveryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'delivered':
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Delivered</span>
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500 text-white flex items-center gap-1">
          <Truck className="h-3 w-3 animate-pulse" />
          <span>In Transit</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white flex items-center gap-1">
          <HourglassClock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      );
    case 'offloading':
      return (
        <Badge className="bg-purple-500 hover:bg-purple-500 text-white flex items-center gap-1">
          <PackageOpen className="h-3 w-3" />
          <span>Offloading</span>
        </Badge>
      );
    case 'delayed':
      return (
        <Badge className="bg-orange-500 hover:bg-orange-500 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Delayed</span>
        </Badge>
      );
    default:
      return null;
  }
};

export default DeliveryStatusBadge;
