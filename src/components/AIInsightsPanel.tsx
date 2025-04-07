
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BarChart3, TrendingUp, AlertCircle, ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { AIInsight } from '@/types';

export const AIInsightsPanel: React.FC = () => {
  const { aiInsights, getInsightsByType, generateAIInsights } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const [insightType, setInsightType] = useState<'efficiency_recommendation' | 'discrepancy_pattern' | 'driver_analysis'>('efficiency_recommendation');

  // Generate insights on initial load
  useEffect(() => {
    if (aiInsights.length === 0) {
      // Pass empty object as parameter to fix the error
      generateAIInsights({});
    }
  }, [aiInsights.length, generateAIInsights]);

  // Update current insight when insights change
  useEffect(() => {
    const insights = getInsightsByType(insightType);
    if (insights && insights.length > 0) {
      setCurrentInsight(insights[0]);
    } else {
      setCurrentInsight(null);
    }
  }, [insightType, getInsightsByType, aiInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'efficiency_recommendation':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'discrepancy_pattern':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'driver_analysis':
        return <User className="h-5 w-5 text-blue-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'efficiency_recommendation':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'discrepancy_pattern':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'driver_analysis':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-purple-200 bg-purple-50 text-purple-800';
    }
  };

  const handleChangeInsightType = (type: 'efficiency_recommendation' | 'discrepancy_pattern' | 'driver_analysis') => {
    setInsightType(type);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out border-t-4",
      currentInsight ? "border-t-blue-500" : "border-t-gray-200",
      expanded ? "h-auto" : "h-[120px]"
    )}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-700">AI Insights & Recommendations</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0 rounded-full"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {expanded ? "Collapse" : "Expand"}
              </span>
            </Button>
          </div>
        </div>
        
        {currentInsight ? (
          <div className="p-3">
            <div className={cn(
              "p-3 rounded-lg border mb-3",
              getInsightColor(currentInsight.type)
            )}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getInsightIcon(currentInsight.type)}
                </div>
                <div>
                  <p className="text-sm">{currentInsight.description}</p>
                  <p className="text-xs mt-1 opacity-70">
                    Generated {new Date(currentInsight.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {expanded && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleChangeInsightType('efficiency_recommendation')}
                  className={cn(
                    "h-8 text-xs justify-start",
                    insightType === 'efficiency_recommendation' ? "bg-blue-50 border-blue-200" : ""
                  )}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Efficiency
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleChangeInsightType('discrepancy_pattern')}
                  className={cn(
                    "h-8 text-xs justify-start",
                    insightType === 'discrepancy_pattern' ? "bg-blue-50 border-blue-200" : ""
                  )}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Discrepancies
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleChangeInsightType('driver_analysis')}
                  className={cn(
                    "h-8 text-xs justify-start",
                    insightType === 'driver_analysis' ? "bg-blue-50 border-blue-200" : ""
                  )}
                >
                  <User className="h-3 w-3 mr-1" />
                  Driver Analysis
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <BarChart3 className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No AI insights available yet. Add more delivery data to generate insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
