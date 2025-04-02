
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Ban, AlertCircle, Check, ChevronRight, BarChart, Clock, Truck, MapPin, Droplet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { PurchaseOrder } from '@/types';

interface InsightDialogProps {
  orderId: string;
  children?: React.ReactNode;
}

const InsightDialog: React.FC<InsightDialogProps> = ({ orderId, children }) => {
  const { purchaseOrders } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Find the current order
  const currentOrder = purchaseOrders.find(order => order.id === orderId);
  
  // Get all delivered orders
  const deliveredOrders = purchaseOrders.filter(order => 
    order.deliveryDetails?.status === 'delivered' && order.offloadingDetails
  );
  
  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simulate API call for generating insights
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      
      toast({
        title: "Insights generated",
        description: "Delivery insights have been generated successfully.",
      });
    }, 2000);
  };
  
  const resetState = () => {
    setIsGenerated(false);
  };
  
  const getRandomPercentage = () => {
    return Math.floor(Math.random() * 100);
  };
  
  const getRandomValue = (min: number, max: number) => {
    return (Math.random() * (max - min) + min).toFixed(1);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetState();
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            <span>Generate Insight</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery Insights</DialogTitle>
          <DialogDescription>
            Generate data-driven insights and analysis for this delivery.
          </DialogDescription>
        </DialogHeader>
        
        {!isGenerated ? (
          <div className="space-y-6">
            {/* Explanation of what insights will be generated */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">What insights will be generated?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Performance Analysis:</span> Compare this delivery against historical data to identify patterns and anomalies.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Risk Assessment:</span> Identify potential risks and disruptions based on route and timing analysis.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Efficiency Metrics:</span> Calculate key performance indicators including fuel efficiency, time management, and volume accuracy.
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order basic info */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Delivery Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">PO: {currentOrder?.poNumber || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Status: {currentOrder?.deliveryDetails?.status 
                      ? currentOrder.deliveryDetails.status.charAt(0).toUpperCase() + 
                        currentOrder.deliveryDetails.status.slice(1).replace('_', ' ') 
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Supplier: {currentOrder?.supplier.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Volume: {currentOrder?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString() || 0} L
                  </span>
                </div>
              </div>
            </div>
            
            {isGenerating ? (
              <div className="space-y-4 py-6">
                <div className="text-center">
                  <BarChart className="h-10 w-10 mx-auto text-blue-500 animate-pulse mb-2" />
                  <p className="text-sm text-muted-foreground">Analyzing delivery data and generating insights...</p>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            ) : (
              <Button 
                onClick={generateInsights} 
                className="w-full"
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Delivery Insights
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Performance Analysis
                  </CardTitle>
                  <Badge 
                    variant={getRandomPercentage() > 50 ? "outline" : "secondary"} 
                    className={`bg-${getRandomPercentage() > 50 ? "green" : "amber"}-50`}
                  >
                    {getRandomPercentage() > 50 ? "Above Average" : "Below Average"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Delivery Time</span>
                    <span className="font-medium">{getRandomValue(2, 5)} hours (Average: 3.2 hours)</span>
                  </div>
                  <Progress value={getRandomPercentage()} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fuel Efficiency</span>
                    <span className="font-medium">{getRandomValue(8, 12)} km/L (Average: 10.5 km/L)</span>
                  </div>
                  <Progress value={getRandomPercentage()} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Volume Accuracy</span>
                    <span className="font-medium">{getRandomValue(96, 99.9)}% (Average: 98.2%)</span>
                  </div>
                  <Progress value={getRandomPercentage()} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            {/* Risk Assessment */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Risk Assessment
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border flex items-start gap-3 ${getRandomPercentage() > 70 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                    {getRandomPercentage() > 70 ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">Route Risk</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getRandomPercentage() > 70 
                          ? "No significant risks identified on the current route. Traffic conditions are normal."
                          : "Moderate traffic congestion expected on parts of the route. Consider alternative paths."}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border flex items-start gap-3 ${getRandomPercentage() > 50 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {getRandomPercentage() > 50 ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Ban className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">Weather Impact</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getRandomPercentage() > 50 
                          ? "Weather conditions are favorable for delivery. No delays expected."
                          : "Heavy rainfall expected along the route. Potential for delays and reduced visibility."}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border flex items-start gap-3 ${getRandomPercentage() > 60 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                    {getRandomPercentage() > 60 ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">Vehicle Condition</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getRandomPercentage() > 60 
                          ? "Vehicle is in optimal condition based on maintenance records."
                          : "Vehicle is due for maintenance in the next 500km. Schedule service after this delivery."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">Optimize departure time to avoid peak traffic hours (recommended: 6:00 AM - 7:00 AM).</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">Fuel efficiency is {getRandomPercentage() > 50 ? "above" : "below"} average. {getRandomPercentage() > 50 ? "Maintain current driving patterns." : "Consider driver training on fuel-efficient driving techniques."}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">Based on historical data, this route typically experiences {getRandomValue(1, 3)} incidents per month. Ensure driver is briefed on emergency procedures.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <DialogFooter className="mt-6">
          <Button onClick={() => setIsOpen(false)} variant="outline">Close</Button>
          {isGenerated && (
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Import Badge component
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  const selectedVariant = variantStyles[variant] || variantStyles.default;
  
  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};

export default InsightDialog;
