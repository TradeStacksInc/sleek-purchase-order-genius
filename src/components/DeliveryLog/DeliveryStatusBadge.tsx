
import React from 'react';
import { Badge } from '@/components/ui/badge';

const DeliveryStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'delivered':
      return (
        <Badge className="bg-green-500 hover:bg-green-500 text-white">
          Delivered
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-500 text-white">
          In Transit
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
          Pending
        </Badge>
      );
    default:
      return null;
  }
};

export default DeliveryStatusBadge;
