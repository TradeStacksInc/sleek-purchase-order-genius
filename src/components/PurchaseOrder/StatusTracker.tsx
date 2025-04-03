
import React from 'react';
import { OrderStatus, StatusHistoryEntry } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface StatusTrackerProps {
  currentStatus: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ 
  currentStatus,
  statusHistory = []
}) => {
  // Order of statuses in the flow
  const statusOrder: OrderStatus[] = ['pending', 'approved', 'active', 'delivered', 'fulfilled'];
  
  // Get the most recent entry for each status
  const latestStatusEntries = statusOrder.map(status => {
    const entries = statusHistory.filter(entry => entry.status === status);
    return entries.length > 0 
      ? entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
      : null;
  });
  
  // Current status index in the flow
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Handle the rejected status specially
  const isRejected = currentStatus === 'rejected';
  const rejectedEntry = statusHistory.find(entry => entry.status === 'rejected');
  
  return (
    <div className="w-full py-4">
      {isRejected ? (
        <div className="flex flex-col items-center mb-6">
          <Badge variant="destructive" className="mb-2 px-3 py-1 text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Order Rejected
          </Badge>
          
          {rejectedEntry?.note && (
            <p className="text-sm text-destructive mt-1">{rejectedEntry.note}</p>
          )}
        </div>
      ) : null}
      
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted transform -translate-y-1/2 rounded">
          <div 
            className="h-full bg-primary rounded transition-all duration-300 ease-in-out"
            style={{ 
              width: `${isRejected ? 0 : Math.max(0, Math.min(100, (currentIndex / (statusOrder.length - 1)) * 100))}%` 
            }}
          />
        </div>
        
        {/* Status steps */}
        <div className="relative flex justify-between">
          {statusOrder.map((status, index) => {
            const entry = latestStatusEntries[index];
            const isActive = status === currentStatus;
            const isPassed = statusOrder.indexOf(currentStatus) > index;
            
            let statusClass = "bg-muted text-muted-foreground";
            
            if (isPassed) {
              statusClass = "bg-primary text-primary-foreground";
            } else if (isActive) {
              statusClass = "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2";
            }
            
            return (
              <div key={status} className="flex flex-col items-center">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${statusClass} z-10`}>
                  {renderStatusIcon(status, isPassed || isActive)}
                </div>
                
                <span className={`text-xs mt-2 font-medium ${isActive || isPassed ? 'text-primary' : 'text-muted-foreground'}`}>
                  {formatStatus(status)}
                </span>
                
                {entry && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const renderStatusIcon = (status: OrderStatus, isActiveOrPassed: boolean) => {
  const color = isActiveOrPassed ? 'currentColor' : 'currentColor';
  
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5" color={color} />;
    case 'approved':
      return <CheckCircle className="h-5 w-5" color={color} />;
    case 'active':
      return <DollarSign className="h-5 w-5" color={color} />;
    case 'delivered':
      return <Truck className="h-5 w-5" color={color} />;
    case 'fulfilled':
      return <CheckCircle className="h-5 w-5" color={color} />;
    case 'rejected':
      return <XCircle className="h-5 w-5" color={color} />;
    default:
      return <Clock className="h-5 w-5" color={color} />;
  }
};

const formatStatus = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'approved': return 'Approved';
    case 'active': return 'Paid';
    case 'delivered': return 'Delivered';
    case 'fulfilled': return 'Fulfilled';
    case 'rejected': return 'Rejected';
    default: return status;
  }
};

export default StatusTracker;
