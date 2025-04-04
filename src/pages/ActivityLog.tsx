
import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import PaginatedLogs from '@/components/PaginatedLogs';
import { Badge } from '@/components/ui/badge';

const ActivityLog: React.FC = () => {
  const { activityLogs } = useApp();
  
  // Sort logs by timestamp (newest first)
  const sortedLogs = useMemo(() => {
    return [...activityLogs].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [activityLogs]);
  
  const columns = [
    {
      key: 'timestamp',
      title: 'Timestamp',
      render: (log) => format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')
    },
    {
      key: 'action',
      title: 'Action',
      render: (log) => log.action
    },
    {
      key: 'user',
      title: 'User',
      render: (log) => log.user
    },
    {
      key: 'entityType',
      title: 'Entity Type',
      render: (log) => (
        <Badge variant="outline" className="capitalize">
          {log.entityType}
        </Badge>
      )
    },
    {
      key: 'entityId',
      title: 'Entity ID',
      render: (log) => log.entityId
    }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-2">
          Track all system activities and user actions
        </p>
      </div>
      
      <PaginatedLogs
        data={sortedLogs}
        columns={columns}
        title="System Activity Logs"
        itemsPerPage={15}
        filterKey="action"
        emptyMessage="No activity logs found."
      />
    </div>
  );
};

export default ActivityLog;
