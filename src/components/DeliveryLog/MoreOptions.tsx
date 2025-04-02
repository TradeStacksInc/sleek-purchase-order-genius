
import React from 'react';
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarShortcut } from '@/components/ui/menubar';
import { SlidersHorizontal, FileDown, Filter, Calendar, Truck, Info, Download, RefreshCw, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateFilter } from '@/types/filters';
import { exportDataToFile } from '@/utils/localStorage';
import { useNavigate } from 'react-router-dom';

interface MoreOptionsProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  onRefresh: () => void;
  onMapView: () => void;
  exportData: () => void;
  isRefreshing: boolean;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({
  dateFilter,
  onDateFilterChange,
  onRefresh,
  onMapView,
  exportData,
  isRefreshing
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleManageTrucks = () => {
    // Navigate to truck management page
    navigate('/manage-trucks');
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics dashboard
    navigate('/analytics');
  };

  return (
    <div className="flex items-center space-x-2">
      <Menubar className="h-10">
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem 
              className={dateFilter === 'all' ? 'bg-accent' : ''}
              onClick={() => onDateFilterChange('all')}
            >
              All Deliveries
              <MenubarShortcut>A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              className={dateFilter === 'today' ? 'bg-accent' : ''}
              onClick={() => onDateFilterChange('today')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today
              <MenubarShortcut>T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              className={dateFilter === 'week' ? 'bg-accent' : ''}
              onClick={() => onDateFilterChange('week')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              This Week
              <MenubarShortcut>W</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              className={dateFilter === 'month' ? 'bg-accent' : ''}
              onClick={() => onDateFilterChange('month')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              This Month
              <MenubarShortcut>M</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem 
              className={dateFilter === 'custom' ? 'bg-accent' : ''}
              onClick={() => onDateFilterChange('custom')}
            >
              Custom Range
              <MenubarShortcut>C</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Options</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Log
              <MenubarShortcut>E</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleManageTrucks}>
              <Truck className="h-4 w-4 mr-2" />
              Manage Trucks
            </MenubarItem>
            <MenubarItem onClick={handleViewAnalytics}>
              <Info className="h-4 w-4 mr-2" />
              View Analytics
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default MoreOptions;
