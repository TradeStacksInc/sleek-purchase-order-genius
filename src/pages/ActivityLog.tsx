
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogEntry } from '@/types';

const ActivityLog: React.FC = () => {
  const { logs, purchaseOrders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  
  // Function to filter logs based on time periods
  useEffect(() => {
    let filteredResults = logs;
    
    // Apply search filter first
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter((log) => {
        const order = purchaseOrders.find((po) => po.id === log.poId);
        
        return (
          log.action.toLowerCase().includes(searchTermLower) ||
          log.user.toLowerCase().includes(searchTermLower) ||
          (order && order.poNumber.toLowerCase().includes(searchTermLower))
        );
      });
    }
    
    // Then apply date filter
    const now = new Date();
    
    if (filterType === 'today') {
      // Today's activities (current day)
      const today = now.setHours(0, 0, 0, 0);
      filteredResults = filteredResults.filter(log => 
        new Date(log.timestamp).setHours(0, 0, 0, 0) === today
      );
    } else if (filterType === 'week') {
      // Last 7 days
      const weekAgo = subDays(now, 7);
      filteredResults = filteredResults.filter(log => 
        new Date(log.timestamp) >= weekAgo
      );
    } else if (filterType === 'month') {
      // Current month
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filteredResults = filteredResults.filter(log => 
        isWithinInterval(new Date(log.timestamp), { start: monthStart, end: monthEnd })
      );
    } else if (filterType === 'custom' && dateRange && dateRange.from) {
      // Custom date range
      const rangeStart = new Date(dateRange.from);
      // If only one date is selected, use that date as both start and end
      const rangeEnd = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      rangeEnd.setHours(23, 59, 59, 999); // End of the day
      
      filteredResults = filteredResults.filter(log => 
        isWithinInterval(new Date(log.timestamp), { start: rangeStart, end: rangeEnd })
      );
    }
    
    // Sort by newest first
    filteredResults = [...filteredResults].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setDisplayedLogs(filteredResults);
  }, [logs, searchTerm, filterType, dateRange, purchaseOrders]);
  
  // Group logs by date
  const groupedLogs: Record<string, typeof logs> = {};
  
  displayedLogs.forEach((log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Handle filter type change
  const handleFilterChange = (value: string) => {
    if (value) {
      setFilterType(value);
      // Reset custom date range when switching to a different filter
      if (value !== 'custom') {
        setDateRange(undefined);
      }
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Filter by time period</h4>
                <ToggleGroup type="single" value={filterType} onValueChange={handleFilterChange}>
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="today">Today</ToggleGroupItem>
                  <ToggleGroupItem value="week">Week</ToggleGroupItem>
                  <ToggleGroupItem value="month">Month</ToggleGroupItem>
                  <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
                </ToggleGroup>
                
                {filterType === 'custom' && (
                  <div className="pt-2">
                    <DateRangePicker 
                      date={dateRange} 
                      onDateChange={setDateRange} 
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            Track all purchase order activities and changes
            {filterType !== 'all' && (
              <span className="ml-2 text-primary">
                {filterType === 'today' && '(Today)'}
                {filterType === 'week' && '(Last 7 days)'}
                {filterType === 'month' && '(Current month)'}
                {filterType === 'custom' && dateRange?.from && (
                  <>
                    ({format(dateRange.from, 'MMM dd, yyyy')}
                    {dateRange.to && ` - ${format(dateRange.to, 'MMM dd, yyyy')}`})
                  </>
                )}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="font-medium text-sm uppercase text-muted-foreground mb-4">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-5">
                  {groupedLogs[date].map((log) => {
                    const order = purchaseOrders.find((po) => po.id === log.poId);
                    
                    return (
                      <div key={log.id}>
                        <div className="flex gap-3">
                          <div className="flex-none mt-0.5">
                            <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium">
                              {log.user.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="text-sm font-medium">{log.action}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.timestamp), 'h:mm a')}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <span>{log.user}</span>
                              {order && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Link 
                                    to={`/orders/${order.id}`}
                                    className="text-primary hover:underline"
                                  >
                                    View Order
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Separator className="my-4" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {sortedDates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No activity logs found</p>
                {(searchTerm || filterType !== 'all') && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try changing your search terms or filters
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
