
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import PaginatedLogs from '@/components/PaginatedLogs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, Database, FileText, Truck, Package, User, Filter, BarChart2, 
  LogIn, LogOut, CreditCard, Settings, UserPlus, ShieldAlert, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { cn } from '@/lib/utils';
import { ActivityLog as ActivityLogType } from '@/types';

const ActivityLog: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const filteredLogs = useMemo(() => {
    let logs = [...activityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (searchQuery) {
      logs = logs.filter(log => 
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (entityFilter !== 'all') {
      logs = logs.filter(log => log.entityType === entityFilter);
    }
    
    if (actionFilter !== 'all') {
      logs = logs.filter(log => log.action === actionFilter);
    }
    
    if (dateRange && dateRange.from) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        
        if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return logDate >= startDate && logDate <= endDate;
        }
        
        return logDate >= startDate;
      });
    }
    
    return logs;
  }, [activityLogs, searchQuery, entityFilter, actionFilter, dateRange]);

  const entityTypes = useMemo(() => {
    const types = new Set<string>();
    activityLogs.forEach(log => types.add(log.entityType));
    return Array.from(types);
  }, [activityLogs]);
  
  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    activityLogs.forEach(log => types.add(log.action));
    return Array.from(types);
  }, [activityLogs]);
  
  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'tank': return <Database className="h-4 w-4" />;
      case 'truck': return <Truck className="h-4 w-4" />;
      case 'purchase_order': return <FileText className="h-4 w-4" />;
      case 'staff': return <User className="h-4 w-4" />;
      case 'sale': return <Package className="h-4 w-4" />;
      case 'authentication': return <LogIn className="h-4 w-4" />;
      case 'price': return <CreditCard className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'offloading': return <Package className="h-4 w-4" />;
      case 'fraud': return <ShieldAlert className="h-4 w-4" />;
      case 'gps': return <MapPin className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'update': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'delete': return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'view': return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case 'approve': return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'reject': return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'login': return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case 'logout': return "bg-slate-100 text-slate-800 hover:bg-slate-200";
      case 'assign': return "bg-teal-100 text-teal-800 hover:bg-teal-200";
      case 'track': return "bg-sky-100 text-sky-800 hover:bg-sky-200";
      case 'detect': return "bg-rose-100 text-rose-800 hover:bg-rose-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const columns = [
    {
      key: 'timestamp',
      title: 'Timestamp',
      render: (log: ActivityLogType) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="whitespace-nowrap">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</span>
          <span className="text-muted-foreground ml-1">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
        </div>
      )
    },
    {
      key: 'action',
      title: 'Action',
      render: (log: ActivityLogType) => (
        <Badge className={cn("capitalize rounded-xl transition-all duration-200", getActionColor(log.action))}>
          {log.action}
        </Badge>
      )
    },
    {
      key: 'details',
      title: 'Details',
      render: (log: ActivityLogType) => <span className="text-sm">{log.details}</span>
    },
    {
      key: 'user',
      title: 'User',
      render: (log: ActivityLogType) => (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{log.user}</span>
        </div>
      )
    },
    {
      key: 'entityType',
      title: 'Entity Type',
      render: (log: ActivityLogType) => (
        <Badge variant="outline" className="capitalize flex items-center gap-1 rounded-xl transition-all duration-200">
          {getEntityTypeIcon(log.entityType)}
          {log.entityType.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'entityId',
      title: 'Entity ID',
      render: (log: ActivityLogType) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">{log.entityId}</span>
      )
    }
  ];
  
  const clearFilters = () => {
    setSearchQuery('');
    setEntityFilter('all');
    setActionFilter('all');
    setDateRange(undefined);
  };
  
  const stats = useMemo(() => {
    return {
      total: activityLogs.length,
      today: activityLogs.filter(log => {
        const now = new Date();
        const logDate = new Date(log.timestamp);
        return logDate.getDate() === now.getDate() &&
               logDate.getMonth() === now.getMonth() &&
               logDate.getFullYear() === now.getFullYear();
      }).length,
      create: activityLogs.filter(log => log.action === 'create').length,
      update: activityLogs.filter(log => log.action === 'update').length,
      delete: activityLogs.filter(log => log.action === 'delete').length,
    };
  }, [activityLogs]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-2">
          Track all system activities and user actions
        </p>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg transition-all duration-200">All Activities</TabsTrigger>
          <TabsTrigger value="auth" className="rounded-lg transition-all duration-200">User Authentication</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg transition-all duration-200">Orders & Deliveries</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg transition-all duration-200">Inventory & Sales</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg transition-all duration-200">System Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="transition-all duration-200 rounded-xl hover:shadow-md">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-5">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All system activities</p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl hover:shadow-md">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-5">
                <div className="text-2xl font-bold">{stats.today}</div>
                <p className="text-xs text-muted-foreground">Activities in the last 24 hours</p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl hover:shadow-md">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Create Operations</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-5">
                <div className="text-2xl font-bold">{stats.create}</div>
                <p className="text-xs text-muted-foreground">New items created</p>
              </CardContent>
            </Card>
            <Card className="transition-all duration-200 rounded-xl hover:shadow-md">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Update Operations</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-5">
                <div className="text-2xl font-bold">{stats.update}</div>
                <p className="text-xs text-muted-foreground">Existing items updated</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="rounded-xl transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Activity Filters</CardTitle>
              <CardDescription>
                Filter activity logs based on various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-lg transition-all duration-200"
                    />
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entity Type</label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="rounded-lg transition-all duration-200">
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="all">All Entities</SelectItem>
                      {entityTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="rounded-lg transition-all duration-200">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="all">All Actions</SelectItem>
                      {actionTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="rounded-lg transition-all duration-200"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <PaginatedLogs
            data={filteredLogs}
            columns={columns}
            title="System Activity Logs"
            itemsPerPage={15}
            filterKey="action"
            emptyMessage="No activity logs found based on your filters."
          />
        </TabsContent>
        
        <TabsContent value="auth" className="space-y-4 mt-4">
          <PaginatedLogs
            data={filteredLogs.filter(log => log.entityType === 'authentication')}
            columns={columns}
            title="Authentication Activities"
            itemsPerPage={15}
            filterKey="action"
            emptyMessage="No authentication activities found."
          />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4 mt-4">
          <PaginatedLogs
            data={filteredLogs.filter(log => ['purchase_order', 'supplier', 'delivery', 'driver'].includes(log.entityType))}
            columns={columns}
            title="Order & Delivery Activities"
            itemsPerPage={15}
            filterKey="action"
            emptyMessage="No order or delivery activities found."
          />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <PaginatedLogs
            data={filteredLogs.filter(log => ['tank', 'dispenser', 'sale', 'price'].includes(log.entityType))}
            columns={columns}
            title="Inventory & Sales Activities"
            itemsPerPage={15}
            filterKey="action"
            emptyMessage="No inventory or sales activities found."
          />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4 mt-4">
          <PaginatedLogs
            data={filteredLogs.filter(log => ['system', 'staff', 'fraud', 'gps', 'ai'].includes(log.entityType))}
            columns={columns}
            title="System Events"
            itemsPerPage={15}
            filterKey="action"
            emptyMessage="No system events found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLog;
