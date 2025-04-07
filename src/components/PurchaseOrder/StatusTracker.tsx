
import React from 'react';
import { Circle, CheckCircle } from 'lucide-react';

export interface StatusTrackerProps {
  currentStatus: string;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ currentStatus }) => {
  const statuses = ['pending', 'approved', 'active', 'delivered', 'completed'];
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between mt-4">
      {statuses.map((status, index) => {
        const isActive = index <= currentIndex;
        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-1 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {isActive ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </div>
              <span className={`text-xs capitalize mt-1 ${isActive ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                {status}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusTracker;
