import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Lightbulb, BarChart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface InsightDialogProps {
  orderId: string;
  children?: React.ReactNode;
}

const InsightDialog: React.FC<InsightDialogProps> = ({ orderId, children }) => {
  const { toast } = useToast();
  const { getOrderById } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  const order = getOrderById(orderId);
  
  const handleGenerateInsights = () => {
    setIsGenerating(true);
    
    // Simulate AI insight generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Insights generated",
        description: "AI analysis has been completed for this delivery.",
      });
    }, 2500);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Insight
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Delivery Insights & Analysis</DialogTitle>
          <DialogDescription>
            AI-powered insights and recommendations for this delivery.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {isGenerating ? (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium mb-2">Generating Insights</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our AI is analyzing delivery data and generating recommendations...
                </p>
              </div>
              <Progress value={65} className="h-2 w-2/3 mx-auto" />
            </div>
          ) : (
            <div>
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Delivery Overview</CardTitle>
                      <CardDescription>Key metrics and performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Delivery Time</div>
                          <div className="text-2xl font-bold">5h 23m</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            <span>12% faster than average</span>
                          </div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Fuel Efficiency</div>
                          <div className="text-2xl font-bold">8.2 km/L</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            <span>5% better than fleet average</span>
                          </div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Volume Accuracy</div>
                          <div className="text-2xl font-bold">98.7%</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            <span>Within acceptable range</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Key Observations</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Driver maintained optimal speed throughout the journey, contributing to fuel efficiency.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Route selection avoided major traffic congestion areas, saving approximately 45 minutes.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>Minor delay at checkpoint due to documentation verification (15 minutes).</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="efficiency" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Efficiency Analysis</CardTitle>
                      <CardDescription>Detailed breakdown of operational efficiency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Route Efficiency</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Optimal Route Adherence</span>
                                <span className="text-sm font-medium">92%</span>
                              </div>
                              <Progress value={92} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Traffic Avoidance</span>
                                <span className="text-sm font-medium">85%</span>
                              </div>
                              <Progress value={85} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Stop Duration Optimization</span>
                                <span className="text-sm font-medium">78%</span>
                              </div>
                              <Progress value={78} className="h-2" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-3">Time Efficiency</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="text-sm font-medium">Loading Time</div>
                              <div className="text-xl font-bold mt-1">32 min</div>
                              <div className="text-xs text-green-600 mt-1">8 min below average</div>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="text-sm font-medium">Offloading Time</div>
                              <div className="text-xl font-bold mt-1">45 min</div>
                              <div className="text-xs text-amber-600 mt-1">5 min above average</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-3">Resource Utilization</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Truck Capacity Utilization</span>
                                <span className="text-sm font-medium">94%</span>
                              </div>
                              <Progress value={94} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Fuel Efficiency</span>
                                <span className="text-sm font-medium">88%</span>
                              </div>
                              <Progress value={88} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="risks" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                      <CardDescription>Identified risks and mitigation status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Factor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Probability</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                              <tr>
                                <td className="px-4 py-3 text-sm">Volume Discrepancy</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    <span>Mitigated</span>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm">Route Safety</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Medium</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    <span>Mitigated</span>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm">Weather Impact</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Medium</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Medium</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                                    <span>Monitored</span>
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm">Documentation Compliance</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    <span>Verified</span>
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-amber-800 mb-1">Weather Risk Note</h4>
                              <p className="text-sm text-amber-700">
                                Seasonal rain patterns may affect future deliveries on this route. Consider scheduling deliveries earlier in the day to avoid afternoon showers.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">AI Recommendations</CardTitle>
                      <CardDescription>Suggested actions to improve future deliveries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Positive Patterns to Maintain
                          </h4>
                          <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Continue using the current route which has proven efficient and avoids major traffic areas.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Maintain the current loading procedures which are 8 minutes faster than average.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Keep the same driver assignment as their performance is above average for this route.</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Improvement Opportunities
                          </h4>
                          <ul className="space-y-2 text-sm text-blue-700">
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Optimize offloading procedures to reduce time by 5-10 minutes. Consider additional training for offloading staff.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Pre-verify documentation before departure to avoid checkpoint delays.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Consider adjusting departure time by 30 minutes earlier to avoid morning traffic patterns.</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                            <BarChart className="h-4 w-4 mr-2" />
                            Data-Driven Insights
                          </h4>
                          <ul className="space-y-2 text-sm text-purple-700">
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Based on 12 similar deliveries, this route performs 8% better when departing between 6:00-7:00 AM.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Historical data suggests fuel consumption could be reduced by 3-5% with more consistent cruising speeds.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-medium">•</span>
                              <span>Weather pattern analysis indicates potential for delays during the upcoming rainy season (next month).</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleGenerateInsights}>
                  <FileText className="h-4 w-4 mr-2" />
                  Regenerate Insights
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsightDialog;
