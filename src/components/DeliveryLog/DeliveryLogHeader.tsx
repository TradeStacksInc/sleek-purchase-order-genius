
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { RefreshCw, Map } from 'lucide-react';
import MoreOptions from '@/components/DeliveryLog/MoreOptions';
import { DateFilter } from '@/types/filters';

interface DeliveryLogHeaderProps {
  dateFilter: DateFilter;
  dateRange: DateRange | undefined;
  isRefreshing: boolean;
  onRefresh: () => void;
  onMapView: () => void;
  onDateFilterChange: (filter: DateFilter) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onExport: () => void;
  onManageTrucks: () => void;
  onViewAnalytics: () => void;
}

const DeliveryLogHeader: React.FC<DeliveryLogHeaderProps> = ({
  dateFilter,
  dateRange,
  isRefreshing,
  onRefresh,
  onMapView,
  onDateFilterChange,
  onDateRangeChange,
  onExport,
  onManageTrucks,
  onViewAnalytics
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle>Delivery Log</CardTitle>
          <CardDescription>
            Track and manage all product deliveries
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={onMapView}
            className="flex items-center gap-1"
          >
            <Map className="h-4 w-4" />
            <span>Map View</span>
          </Button>
          
          <MoreOptions 
            dateFilter={dateFilter}
            onDateFilterChange={onDateFilterChange}
            onRefresh={onRefresh}
            onMapView={onMapView}
            exportData={onExport}
            onManageTrucks={onManageTrucks}
            onViewAnalytics={onViewAnalytics}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
      
      {dateFilter === 'custom' && (
        <div className="mt-4">
          <DateRangePicker 
            date={dateRange} 
            onDateChange={onDateRangeChange} 
            className="w-full sm:w-auto"
          />
        </div>
      )}
    </>
  );
};

export default DeliveryLogHeader;
