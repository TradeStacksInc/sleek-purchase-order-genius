
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconColor = "bg-primary/20 text-primary" 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={cn("p-2 rounded-full", iconColor)}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
