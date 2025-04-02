
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ShieldCheck, UserX, BarChart3, AlertTriangle, FileText, Calendar, User, ArrowUpRight, Fuel, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FraudAlert {
  id: string;
  date: Date;
  staffId: string;
  staffName: string;
  type: 'volume_discrepancy' | 'price_manipulation' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: {
    volumeReported?: number;
    volumeRecorded?: number;
    amountCollected?: number;
    expectedAmount?: number;
    pattern?: string;
    daysActive?: number;
  };
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
}

interface StaffRiskScore {
  staffId: string;
  staffName: string;
  riskScore: number;
  discrepancyRate: number;
  totalTransactions: number;
  flaggedTransactions: number;
  lastIncident?: Date;
}

const FraudDetection: React.FC = () => {
  const { toast } = useToast();
  
  // State for fraud alerts
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    {
      id: 'alert-1',
      date: new Date(2025, 3, 1),
      staffId: 'staff-2',
      staffName: 'Sarah Johnson',
      type: 'volume_discrepancy',
      severity: 'high',
      description: 'Significant volume discrepancy between reported and actual dispensed fuel',
      details: {
        volumeReported: 1100,
        volumeRecorded: 1180,
        amountCollected: 253000,
        expectedAmount: 271400
      },
      status: 'investigating',
      assignedTo: 'Admin User'
    },
    {
      id: 'alert-2',
      date: new Date(2025, 2, 29),
      staffId: 'staff-5',
      staffName: 'David Wilson',
      type: 'price_manipulation',
      severity: 'medium',
      description: 'Possible price manipulation detected in multiple transactions',
      details: {
        volumeReported: 890,
        volumeRecorded: 890,
        amountCollected: 198000,
        expectedAmount: 204700
      },
      status: 'new'
    },
    {
      id: 'alert-3',
      date: new Date(2025, 2, 28),
      staffId: 'staff-2',
      staffName: 'Sarah Johnson',
      type: 'pattern_anomaly',
      severity: 'medium',
      description: 'Unusual pattern of transaction adjustments detected',
      details: {
        pattern: 'Multiple small adjustments to volume reported',
        daysActive: 7
      },
      status: 'new'
    },
    {
      id: 'alert-4',
      date: new Date(2025, 2, 25),
      staffId: 'staff-3',
      staffName: 'Robert Chen',
      type: 'volume_discrepancy',
      severity: 'low',
      description: 'Minor but consistent volume discrepancies across shifts',
      details: {
        volumeReported: 2100,
        volumeRecorded: 2135,
        daysActive: 14
      },
      status: 'resolved',
      resolution: 'Dispenser calibration issue identified and fixed'
    }
  ]);
  
  // State for staff risk scores
  const [riskScores, setRiskScores] = useState<StaffRiskScore[]>([
    {
      staffId: 'staff-2',
      staffName: 'Sarah Johnson',
      riskScore: 72,
      discrepancyRate: 5.8,
      totalTransactions: 245,
      flaggedTransactions: 14,
      lastIncident: new Date(2025, 3, 1)
    },
    {
      staffId: 'staff-5',
      staffName: 'David Wilson',
      riskScore: 48,
      discrepancyRate: 3.2,
      totalTransactions: 156,
      flaggedTransactions: 5,
      lastIncident: new Date(2025, 2, 29)
    },
    {
      staffId: 'staff-3',
      staffName: 'Robert Chen',
      riskScore: 21,
      discrepancyRate: 1.8,
      totalTransactions: 220,
      flaggedTransactions: 4,
      lastIncident: new Date(2025, 2, 25)
    },
    {
      staffId: 'staff-1',
      staffName: 'John Doe',
      riskScore: 18,
      discrepancyRate: 1.5,
      totalTransactions: 268,
      flaggedTransactions: 4
    },
    {
      staffId: 'staff-4',
      staffName: 'Maria Garcia',
      riskScore: 12,
      discrepancyRate: 0.9,
      totalTransactions: 212,
      flaggedTransactions: 2
    }
  ]);
  
  // Update alert status
  const updateAlertStatus = (alertId: string, newStatus: 'investigating' | 'resolved' | 'dismissed') => {
    setFraudAlerts(prev => 
      prev.map(alert => {
        if (alert.id === alertId) {
          return {
            ...alert,
            status: newStatus,
            assignedTo: newStatus === 'investigating' ? 'Admin User' : alert.assignedTo
          };
        }
        return alert;
      })
    );
    
    toast({
      title: "Alert Updated",
      description: `Alert status has been updated to ${newStatus}.`
    });
  };
  
  // Get badge variant based on severity
  const getSeverityBadge = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Get alert type display name
  const getAlertTypeDisplay = (type: string) => {
    switch (type) {
      case 'volume_discrepancy':
        return 'Volume Discrepancy';
      case 'price_manipulation':
        return 'Price Manipulation';
      case 'pattern_anomaly':
        return 'Pattern Anomaly';
      default:
        return type;
    }
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'destructive';
      case 'investigating':
        return 'default';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Get risk level label
  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Minimal Risk';
  };
  
  // Count alerts by status
  const newAlerts = fraudAlerts.filter(a => a.status === 'new').length;
  const investigatingAlerts = fraudAlerts.filter(a => a.status === 'investigating').length;
  const resolvedAlerts = fraudAlerts.filter(a => a.status === 'resolved').length;
  
  // Calculate potential financial impact
  const potentialFinancialImpact = fraudAlerts
    .filter(a => a.status !== 'dismissed' && a.details.expectedAmount && a.details.amountCollected)
    .reduce((sum, alert) => {
      const diff = (alert.details.expectedAmount || 0) - (alert.details.amountCollected || 0);
      return sum + (diff > 0 ? diff : 0);
    }, 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection & Prevention</CardTitle>
          <CardDescription>
            Identify and investigate potential fraud and discrepancies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts">
            <TabsList>
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
              <TabsTrigger value="prevention">Prevention Measures</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-6 mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      New Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <ShieldAlert className="h-8 w-8 text-red-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{newAlerts}</div>
                        <div className="text-xs text-muted-foreground">
                          unaddressed alerts
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Under Investigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <UserX className="h-8 w-8 text-amber-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{investigatingAlerts}</div>
                        <div className="text-xs text-muted-foreground">
                          alerts being investigated
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Resolved Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <ShieldCheck className="h-8 w-8 text-green-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">{resolvedAlerts}</div>
                        <div className="text-xs text-muted-foreground">
                          alerts resolved
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Financial Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-blue-500 mr-4 opacity-80" />
                      <div>
                        <div className="text-3xl font-bold">₦{potentialFinancialImpact.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          potential loss
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Critical Alert Banner */}
              {fraudAlerts.some(a => a.severity === 'critical' && a.status === 'new') && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Critical Alert Detected</AlertTitle>
                  <AlertDescription>
                    There is a critical fraud alert that requires immediate attention. Please investigate as soon as possible.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Fraud Alerts List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fraud Alerts</CardTitle>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter alerts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Alerts</SelectItem>
                          <SelectItem value="new">New Alerts</SelectItem>
                          <SelectItem value="investigating">Under Investigation</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Date Range</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudAlerts.filter(a => a.status !== 'dismissed').map(alert => (
                      <div key={alert.id} className={`border rounded-lg overflow-hidden ${
                        alert.severity === 'critical' || alert.severity === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : alert.severity === 'medium'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-gray-200'
                      }`}>
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                              <AlertTriangle className={`h-5 w-5 ${
                                alert.severity === 'critical' || alert.severity === 'high' 
                                  ? 'text-red-600' 
                                  : alert.severity === 'medium'
                                  ? 'text-amber-600'
                                  : 'text-gray-600'
                              }`} />
                              <h3 className="font-medium text-lg">
                                {getAlertTypeDisplay(alert.type)}
                              </h3>
                              <Badge variant={getSeverityBadge(alert.severity)}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadge(alert.status)}>
                                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                {format(alert.date, 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                          
                          <p className="mb-4">{alert.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Staff Member</div>
                              <div className="text-sm flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {alert.staffName}
                              </div>
                            </div>
                            
                            {alert.type === 'volume_discrepancy' && (
                              <>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Volume Discrepancy</div>
                                  <div className="text-sm flex items-center">
                                    <Fuel className="h-4 w-4 mr-1" />
                                    Reported: {alert.details.volumeReported?.toLocaleString()} L
                                  </div>
                                  <div className="text-sm flex items-center">
                                    <Fuel className="h-4 w-4 mr-1" />
                                    Actual: {alert.details.volumeRecorded?.toLocaleString()} L
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Financial Impact</div>
                                  <div className="text-sm flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Collected: ₦{alert.details.amountCollected?.toLocaleString()}
                                  </div>
                                  <div className="text-sm flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Expected: ₦{alert.details.expectedAmount?.toLocaleString()}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {alert.type === 'price_manipulation' && (
                              <>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Price Discrepancy</div>
                                  <div className="text-sm flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Collected: ₦{alert.details.amountCollected?.toLocaleString()}
                                  </div>
                                  <div className="text-sm flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Expected: ₦{alert.details.expectedAmount?.toLocaleString()}
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Volume</div>
                                  <div className="text-sm flex items-center">
                                    <Fuel className="h-4 w-4 mr-1" />
                                    {alert.details.volumeReported?.toLocaleString()} L
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {alert.type === 'pattern_anomaly' && (
                              <>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Pattern Detected</div>
                                  <div className="text-sm">
                                    {alert.details.pattern}
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">Activity Period</div>
                                  <div className="text-sm flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {alert.details.daysActive} days
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {alert.status === 'resolved' && alert.resolution && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="text-sm font-medium">Resolution</div>
                              <div className="text-sm">{alert.resolution}</div>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            
                            {alert.status === 'new' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateAlertStatus(alert.id, 'investigating')}
                              >
                                Investigate
                              </Button>
                            )}
                            
                            {alert.status === 'investigating' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateAlertStatus(alert.id, 'dismissed')}
                                >
                                  Dismiss
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => updateAlertStatus(alert.id, 'resolved')}
                                >
                                  Mark Resolved
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="risk-assessment" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Risk Assessment</CardTitle>
                  <CardDescription>
                    Risk evaluation of staff members based on transaction analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskScores
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .map(staff => (
                        <div key={staff.staffId} className="p-4 border rounded-md">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                              <User className="h-5 w-5" />
                              <h3 className="font-medium text-lg">{staff.staffName}</h3>
                              <Badge variant={
                                staff.riskScore >= 70 ? 'destructive' : 
                                staff.riskScore >= 40 ? 'default' : 
                                'outline'
                              }>
                                {getRiskLevel(staff.riskScore)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">Risk Score:</span>
                              <span className={`text-lg font-bold ${
                                staff.riskScore >= 70 ? 'text-red-600' : 
                                staff.riskScore >= 40 ? 'text-amber-600' : 
                                staff.riskScore >= 20 ? 'text-blue-600' : 
                                'text-green-600'
                              }`}>
                                {staff.riskScore}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Low Risk</span>
                              <span className="text-xs">High Risk</span>
                            </div>
                            <Progress value={staff.riskScore} className={
                              staff.riskScore >= 70 ? 'bg-red-100' : 
                              staff.riskScore >= 40 ? 'bg-amber-100' : 
                              'bg-gray-100'
                            } />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Transaction Analysis</div>
                              <div className="text-sm">
                                Total Transactions: {staff.totalTransactions}
                              </div>
                              <div className="text-sm">
                                Flagged Transactions: {staff.flaggedTransactions} ({(staff.flaggedTransactions / staff.totalTransactions * 100).toFixed(1)}%)
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Discrepancy Rate</div>
                              <div className="text-sm flex items-center">
                                <ArrowUpRight className={`h-4 w-4 mr-1 ${
                                  staff.discrepancyRate > 5 ? 'text-red-500' : 
                                  staff.discrepancyRate > 2 ? 'text-amber-500' : 
                                  'text-blue-500'
                                }`} />
                                {staff.discrepancyRate.toFixed(1)}% average
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Last Incident</div>
                              <div className="text-sm">
                                {staff.lastIncident 
                                  ? format(staff.lastIncident, 'MMM dd, yyyy') 
                                  : 'No recent incidents'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm">
                              View Full History
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics Explanation</CardTitle>
                  <CardDescription>
                    Understanding how risk scores are calculated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-medium">Risk Score Components</h3>
                        <ul className="space-y-1 text-sm ml-4 list-disc">
                          <li>Transaction volume discrepancies (60%)</li>
                          <li>Price manipulation patterns (20%)</li>
                          <li>Historical incident rate (10%)</li>
                          <li>Behavioral anomalies (10%)</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">Risk Level Classification</h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Badge variant="destructive" className="mr-2">High Risk</Badge>
                            <span className="text-sm">Score 70-100</span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="default" className="mr-2">Medium Risk</Badge>
                            <span className="text-sm">Score 40-69</span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-blue-50">Low Risk</Badge>
                            <span className="text-sm">Score 20-39</span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">Minimal Risk</Badge>
                            <span className="text-sm">Score 0-19</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Risk Score Calculation</h3>
                      <p className="text-sm mb-2">
                        Risk scores are calculated using a weighted algorithm that analyzes transaction patterns, 
                        compares reported vs. system-recorded volumes, and evaluates pricing consistency.
                      </p>
                      <p className="text-sm">
                        Scores are updated daily based on the most recent 30 days of transactions.
                        A staff member with multiple significant discrepancies will have a higher risk score.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prevention" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Prevention Measures</CardTitle>
                  <CardDescription>
                    Strategies and systems to prevent fuel fraud
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base">Automated Monitoring</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Real-time dispenser data integration</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Automatic volume discrepancy detection</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Anomaly detection algorithms</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Daily reconciliation reports</span>
                            </li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">Configure Monitoring</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-base">Staff Controls</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Staff rotation policies</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Dual verification for high value transactions</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Training on fraud awareness</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Random spot checks</span>
                            </li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">Manage Staff Controls</Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-base">Equipment Security</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Regular dispenser calibration</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Tamper-evident seals</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>CCTV monitoring of dispensers</span>
                            </li>
                            <li className="flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>Secure access controls</span>
                            </li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">Equipment Security</Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div className="p-4 border rounded-md bg-blue-50">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <ShieldCheck className="h-5 w-5 text-blue-500 mr-2" />
                        Recommended Actions
                      </h3>
                      <p className="text-sm mb-4">
                        Based on current risk assessment and fraud alerts, we recommend the following actions:
                      </p>
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded-md">
                          <h4 className="font-medium mb-1">Conduct Staff Training</h4>
                          <p className="text-sm">
                            Schedule fraud awareness training for all staff, with special focus on 
                            accurate reporting procedures and ethical responsibilities.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white rounded-md">
                          <h4 className="font-medium mb-1">Update Calibration Schedule</h4>
                          <p className="text-sm">
                            Increase frequency of dispenser calibration checks to weekly for the next 
                            month to identify any equipment issues.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-white rounded-md">
                          <h4 className="font-medium mb-1">Enhance Monitoring</h4>
                          <p className="text-sm">
                            Implement real-time alerts for any transaction with over 3% volume discrepancy
                            to enable immediate investigation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Audit Schedule</CardTitle>
                  <CardDescription>
                    Regular audit activities to prevent and detect fraud
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Responsible</TableHead>
                        <TableHead>Last Completed</TableHead>
                        <TableHead>Next Scheduled</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Dispenser Calibration</TableCell>
                        <TableCell>Monthly</TableCell>
                        <TableCell>Maintenance Team</TableCell>
                        <TableCell>{format(new Date(2025, 3, 5), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(2025, 4, 5), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">Completed</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Staff Transaction Audit</TableCell>
                        <TableCell>Weekly</TableCell>
                        <TableCell>Finance Manager</TableCell>
                        <TableCell>{format(new Date(2025, 3, 28), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(2025, 4, 5), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Pending</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tank Reconciliation</TableCell>
                        <TableCell>Daily</TableCell>
                        <TableCell>Operations Manager</TableCell>
                        <TableCell>{format(new Date(2025, 4, 1), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(2025, 4, 2), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="default">In Progress</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Full System Audit</TableCell>
                        <TableCell>Quarterly</TableCell>
                        <TableCell>External Auditor</TableCell>
                        <TableCell>{format(new Date(2025, 0, 15), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(2025, 4, 15), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Scheduled</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">CCTV Footage Review</TableCell>
                        <TableCell>Weekly</TableCell>
                        <TableCell>Security Officer</TableCell>
                        <TableCell>{format(new Date(2025, 3, 28), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(2025, 4, 5), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetection;
