
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
    case 'approved':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Approved
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-status-active hover:bg-status-active text-white">
          Active
        </Badge>
      );
    case 'delivered':
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
          Delivered
        </Badge>
      );
    case 'fulfilled':
      return (
        <Badge className="bg-status-fulfilled hover:bg-status-fulfilled text-white">
          Fulfilled
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-destructive hover:bg-destructive text-white">
          Rejected
        </Badge>
      );
    default:
      return null;
  }
};

export default StatusBadge;
