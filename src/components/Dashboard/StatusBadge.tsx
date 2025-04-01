
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-status-pending hover:bg-status-pending text-white">
          Pending
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-status-active hover:bg-status-active text-white">
          Active
        </Badge>
      );
    case 'fulfilled':
      return (
        <Badge className="bg-status-fulfilled hover:bg-status-fulfilled text-white">
          Fulfilled
        </Badge>
      );
    default:
      return null;
  }
};

export default StatusBadge;
