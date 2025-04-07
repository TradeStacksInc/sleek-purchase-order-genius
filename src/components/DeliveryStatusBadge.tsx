
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Clock, Truck } from 'lucide-react';

interface DeliveryStatusBadgeProps {
  status?: string;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  
  switch (status) {
    case 'delivered':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Delivered
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Truck className="h-3 w-3" />
          In Transit
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
  }
};

export default DeliveryStatusBadge;
