
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ActivityLog: React.FC = () => {
  const { logs, purchaseOrders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter logs based on search term
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    const order = purchaseOrders.find((po) => po.id === log.poId);
    
    return (
      log.action.toLowerCase().includes(searchTermLower) ||
      log.user.toLowerCase().includes(searchTermLower) ||
      (order && order.poNumber.toLowerCase().includes(searchTermLower))
    );
  });
  
  // Group logs by date
  const groupedLogs: Record<string, typeof logs> = {};
  
  filteredLogs.forEach((log) => {
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
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            Track all purchase order activities and changes
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
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try changing your search terms
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
