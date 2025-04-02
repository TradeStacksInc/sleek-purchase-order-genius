
import React from 'react';
import { MoreHorizontal, RefreshCw, Calendar, Download, Map, Truck, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateFilter } from '@/types/filters';

interface MoreOptionsProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  onRefresh: () => void;
  onMapView: () => void;
  onManageTrucks?: () => void;
  onViewAnalytics?: () => void;
  exportData: () => void;
  isRefreshing?: boolean;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({
  dateFilter,
  onDateFilterChange,
  onRefresh,
  onMapView,
  onManageTrucks,
  onViewAnalytics,
  exportData,
  isRefreshing = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            onRefresh();
          }} disabled={isRefreshing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            onMapView();
          }}>
            <Map className="mr-2 h-4 w-4" />
            <span>Map View</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Date Filter</DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              onDateFilterChange('all');
            }}
            disabled={dateFilter === 'all'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>All Time</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              onDateFilterChange('today');
            }}
            disabled={dateFilter === 'today'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Today</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              onDateFilterChange('week');
            }}
            disabled={dateFilter === 'week'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>This Week</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              onDateFilterChange('month');
            }}
            disabled={dateFilter === 'month'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>This Month</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              onDateFilterChange('custom');
            }}
            disabled={dateFilter === 'custom'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Custom Range</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault();
            exportData();
          }}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Log</span>
          </DropdownMenuItem>
          {onManageTrucks && (
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              onManageTrucks();
            }}>
              <Truck className="mr-2 h-4 w-4" />
              <span>Manage Trucks</span>
            </DropdownMenuItem>
          )}
          {onViewAnalytics && (
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              onViewAnalytics();
            }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>View Analytics</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreOptions;
