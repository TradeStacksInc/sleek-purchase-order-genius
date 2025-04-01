
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, Check } from 'lucide-react';

const DiscrepancyBadge: React.FC<{ discrepancyPercent: number }> = ({ discrepancyPercent }) => {
  if (discrepancyPercent > 5) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {discrepancyPercent.toFixed(1)}%
      </Badge>
    );
  } else if (discrepancyPercent > 0) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Info className="h-3 w-3" />
        {discrepancyPercent.toFixed(1)}%
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
        <Check className="h-3 w-3" />
        0%
      </Badge>
    );
  }
};

export default DiscrepancyBadge;
