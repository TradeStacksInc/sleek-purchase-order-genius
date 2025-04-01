
import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AIInsight } from '@/types';

export const AIInsightsPanel: React.FC = () => {
  const { aiInsights, generateDiscrepancyInsights, markInsightAsRead } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const unreadInsightsCount = aiInsights.filter(insight => !insight.isRead).length;
  
  const handleGenerateInsights = () => {
    generateDiscrepancyInsights();
    if (!isOpen) setIsOpen(true);
  };
  
  const handleMarkAsRead = (id: string) => {
    markInsightAsRead(id);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg p-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Insights & Recommendations</h2>
          {unreadInsightsCount > 0 && (
            <Badge className="bg-primary">{unreadInsightsCount} new</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateInsights}
            className="flex items-center gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Generate Insights</span>
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle AI Insights</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent className="mt-4 space-y-3">
        {aiInsights.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No insights generated yet. Click "Generate Insights" to analyze delivery data.</p>
          </div>
        ) : (
          aiInsights.map((insight) => (
            <InsightItem 
              key={insight.id} 
              insight={insight}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const InsightItem: React.FC<{ 
  insight: AIInsight;
  onMarkAsRead: (id: string) => void;
}> = ({ insight, onMarkAsRead }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return "border-red-200 bg-red-50";
      case 'medium':
        return "border-yellow-200 bg-yellow-50";
      case 'low':
        return "border-blue-200 bg-blue-50";
      default:
        return "";
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'discrepancy_pattern':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'efficiency_recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'driver_analysis':
        return <Brain className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <Alert className={cn(
      "flex justify-between items-start border",
      getSeverityStyles(insight.severity),
      insight.isRead ? "opacity-70" : ""
    )}>
      <div>
        <div className="flex items-center gap-2">
          {getIcon(insight.type)}
          <AlertTitle className="capitalize">
            {insight.type.replace('_', ' ')}
          </AlertTitle>
          <Badge variant={
            insight.severity === 'high' ? "destructive" : 
            insight.severity === 'medium' ? "outline" : 
            "secondary"
          } className="capitalize">
            {insight.severity}
          </Badge>
        </div>
        <AlertDescription className="mt-2">
          {insight.description}
        </AlertDescription>
        <div className="mt-2 text-xs text-muted-foreground">
          Generated: {format(new Date(insight.generatedAt), 'MMM dd, yyyy HH:mm')}
        </div>
      </div>
      
      {!insight.isRead && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onMarkAsRead(insight.id)}
          className="shrink-0"
        >
          <Check className="h-4 w-4 mr-1" />
          Mark as read
        </Button>
      )}
    </Alert>
  );
};
