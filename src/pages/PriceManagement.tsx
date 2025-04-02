import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Tag, History, ArrowUpRight, ArrowDownRight, Fuel, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PriceHistory {
  id: string;
  productType: 'PMS' | 'AGO';
  purchasePrice: number;
  sellingPrice: number;
  effectiveDate: Date;
  setBy: string;
  reason?: string;
}

const PriceManagement: React.FC = () => {
  const { toast } = useToast();
  
  const [currentPrices, setCurrentPrices] = useState({
    pms: { purchase: 180, selling: 210 },
    ago: { purchase: 195, selling: 230 }
  });
  
  const [newPrices, setNewPrices] = useState({
    pms: { purchase: '', selling: '' },
    ago: { purchase: '', selling: '' }
  });
  
  const [priceChangeReason, setPriceChangeReason] = useState('');
  
  const [authCode, setAuthCode] = useState('');
  const validAuthCode = '123456';
  
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([
    {
      id: 'ph-1',
      productType: 'PMS',
      purchasePrice: 180,
      sellingPrice: 210,
      effectiveDate: new Date(2025, 3, 1),
      setBy: 'Admin User'
    },
    {
      id: 'ph-2',
      productType: 'AGO',
      purchasePrice: 195,
      sellingPrice: 230,
      effectiveDate: new Date(2025, 3, 1),
      setBy: 'Admin User'
    },
    {
      id: 'ph-3',
      productType: 'PMS',
      purchasePrice: 170,
      sellingPrice: 195,
      effectiveDate: new Date(2025, 2, 15),
      setBy: 'Admin User',
      reason: 'Market price adjustment'
    },
    {
      id: 'ph-4',
      productType: 'AGO',
      purchasePrice: 185,
      sellingPrice: 215,
      effectiveDate: new Date(2025, 2, 15),
      setBy: 'Admin User',
      reason: 'Market price adjustment'
    }
  ]);
  
  const handlePriceUpdate = (productType: 'pms' | 'ago') => {
    if (authCode !== validAuthCode) {
      toast({
        title: "Invalid Authorization",
        description: "The authorization code you entered is incorrect.",
        variant: "destructive"
      });
      return;
    }
    
    const purchasePrice = parseFloat(newPrices[productType].purchase);
    const sellingPrice = parseFloat(newPrices[productType].selling);
    
    if (isNaN(purchasePrice) || isNaN(sellingPrice)) {
      toast({
        title: "Invalid Prices",
        description: "Please enter valid purchase and selling prices.",
        variant: "destructive"
      });
      return;
    }
    
    if (sellingPrice <= purchasePrice) {
      toast({
        title: "Invalid Pricing",
        description: "Selling price must be higher than purchase price.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentPrices(prev => ({
      ...prev,
      [productType]: {
        purchase: purchasePrice,
        selling: sellingPrice
      }
    }));
    
    const newPriceHistory: PriceHistory = {
      id: `ph-${Date.now()}`,
      productType: productType === 'pms' ? 'PMS' : 'AGO',
      purchasePrice,
      sellingPrice,
      effectiveDate: new Date(),
      setBy: 'Admin User',
      reason: priceChangeReason || undefined
    };
    
    setPriceHistory(prev => [newPriceHistory, ...prev]);
    
    setNewPrices(prev => ({
      ...prev,
      [productType]: { purchase: '', selling: '' }
    }));
    setPriceChangeReason('');
    setAuthCode('');
    
    toast({
      title: "Price Updated",
      description: `${productType.toUpperCase()} prices have been updated successfully.`
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Price Management</CardTitle>
          <CardDescription>
            Set and manage fuel prices for sales and accounting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current">Current Prices</TabsTrigger>
              <TabsTrigger value="pms">Update PMS Price</TabsTrigger>
              <TabsTrigger value="ago">Update AGO Price</TabsTrigger>
              <TabsTrigger value="history">Price History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-red-50">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-red-600" />
                      <CardTitle>PMS (Petrol) Price</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Purchase Price</Label>
                          <div className="text-2xl font-bold flex items-center">
                            ₦{currentPrices.pms.purchase.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground ml-2">per liter</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Selling Price</Label>
                          <div className="text-2xl font-bold flex items-center">
                            ₦{currentPrices.pms.selling.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground ml-2">per liter</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-green-50">
                            {((currentPrices.pms.selling - currentPrices.pms.purchase) / currentPrices.pms.purchase * 100).toFixed(2)}% Margin
                          </Badge>
                          <span className="text-sm text-muted-foreground ml-2">
                            (₦{(currentPrices.pms.selling - currentPrices.pms.purchase).toFixed(2)} per liter)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-blue-600" />
                      <CardTitle>AGO (Diesel) Price</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Purchase Price</Label>
                          <div className="text-2xl font-bold flex items-center">
                            ₦{currentPrices.ago.purchase.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground ml-2">per liter</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Selling Price</Label>
                          <div className="text-2xl font-bold flex items-center">
                            ₦{currentPrices.ago.selling.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground ml-2">per liter</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-green-50">
                            {((currentPrices.ago.selling - currentPrices.ago.purchase) / currentPrices.ago.purchase * 100).toFixed(2)}% Margin
                          </Badge>
                          <span className="text-sm text-muted-foreground ml-2">
                            (₦{(currentPrices.ago.selling - currentPrices.ago.purchase).toFixed(2)} per liter)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis</CardTitle>
                  <CardDescription>
                    Estimated profits based on current prices and volumes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center">
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          PMS Profit Calculation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Purchase Price:</span>
                            <span>₦{currentPrices.pms.purchase.toFixed(2)}/liter</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Selling Price:</span>
                            <span className="font-medium">₦{currentPrices.pms.selling.toFixed(2)}/liter</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Profit per Liter:</span>
                            <span className="font-medium">₦{(currentPrices.pms.selling - currentPrices.pms.purchase).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span>Average Daily Sales:</span>
                              <span>10,000 liters</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Estimated Daily Profit:</span>
                              <span>₦{(10000 * (currentPrices.pms.selling - currentPrices.pms.purchase)).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          AGO Profit Calculation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Purchase Price:</span>
                            <span>₦{currentPrices.ago.purchase.toFixed(2)}/liter</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Selling Price:</span>
                            <span className="font-medium">₦{currentPrices.ago.selling.toFixed(2)}/liter</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Profit per Liter:</span>
                            <span className="font-medium">₦{(currentPrices.ago.selling - currentPrices.ago.purchase).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span>Average Daily Sales:</span>
                              <span>8,000 liters</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Estimated Daily Profit:</span>
                              <span>₦{(8000 * (currentPrices.ago.selling - currentPrices.ago.purchase)).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div className="text-lg font-medium mb-2 sm:mb-0">
                          Combined Daily Profit Estimate:
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ₦{(
                            10000 * (currentPrices.pms.selling - currentPrices.pms.purchase) +
                            8000 * (currentPrices.ago.selling - currentPrices.ago.purchase)
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pms" className="space-y-6 mt-6">
              <PriceUpdateForm
                productType="PMS"
                productColor="red"
                currentPurchasePrice={currentPrices.pms.purchase}
                currentSellingPrice={currentPrices.pms.selling}
                newPurchasePrice={newPrices.pms.purchase}
                newSellingPrice={newPrices.pms.selling}
                onPurchasePriceChange={(value) => setNewPrices(prev => ({
                  ...prev,
                  pms: { ...prev.pms, purchase: value }
                }))}
                onSellingPriceChange={(value) => setNewPrices(prev => ({
                  ...prev,
                  pms: { ...prev.pms, selling: value }
                }))}
                reason={priceChangeReason}
                onReasonChange={setPriceChangeReason}
                authCode={authCode}
                onAuthCodeChange={setAuthCode}
                onSubmit={() => handlePriceUpdate('pms')}
              />
            </TabsContent>
            
            <TabsContent value="ago" className="space-y-6 mt-6">
              <PriceUpdateForm
                productType="AGO"
                productColor="blue"
                currentPurchasePrice={currentPrices.ago.purchase}
                currentSellingPrice={currentPrices.ago.selling}
                newPurchasePrice={newPrices.ago.purchase}
                newSellingPrice={newPrices.ago.selling}
                onPurchasePriceChange={(value) => setNewPrices(prev => ({
                  ...prev,
                  ago: { ...prev.ago, purchase: value }
                }))}
                onSellingPriceChange={(value) => setNewPrices(prev => ({
                  ...prev,
                  ago: { ...prev.ago, selling: value }
                }))}
                reason={priceChangeReason}
                onReasonChange={setPriceChangeReason}
                authCode={authCode}
                onAuthCodeChange={setAuthCode}
                onSubmit={() => handlePriceUpdate('ago')}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <CardTitle>Price Change History</CardTitle>
                  </div>
                  <CardDescription>
                    Record of all price changes with timestamps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Set By</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceHistory.map((record) => {
                        const margin = ((record.sellingPrice - record.purchasePrice) / record.purchasePrice) * 100;
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {format(record.effectiveDate, 'MMM dd, yyyy')}
                              <div className="text-xs text-muted-foreground">
                                {format(record.effectiveDate, 'h:mm a')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={record.productType === 'PMS' ? 'destructive' : 'default'}>
                                {record.productType}
                              </Badge>
                            </TableCell>
                            <TableCell>₦{record.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell>₦{record.sellingPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {margin >= 0 ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                {Math.abs(margin).toFixed(2)}%
                              </div>
                            </TableCell>
                            <TableCell>{record.setBy}</TableCell>
                            <TableCell>{record.reason || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
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

interface PriceUpdateFormProps {
  productType: string;
  productColor: string;
  currentPurchasePrice: number;
  currentSellingPrice: number;
  newPurchasePrice: string;
  newSellingPrice: string;
  onPurchasePriceChange: (value: string) => void;
  onSellingPriceChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  authCode: string;
  onAuthCodeChange: (value: string) => void;
  onSubmit: () => void;
}

const PriceUpdateForm: React.FC<PriceUpdateFormProps> = ({
  productType,
  productColor,
  currentPurchasePrice,
  currentSellingPrice,
  newPurchasePrice,
  newSellingPrice,
  onPurchasePriceChange,
  onSellingPriceChange,
  reason,
  onReasonChange,
  authCode,
  onAuthCodeChange,
  onSubmit
}) => {
  const bgColor = productColor === 'red' ? 'bg-red-50' : 'bg-blue-50';
  const purchasePrice = parseFloat(newPurchasePrice || '0');
  const sellingPrice = parseFloat(newSellingPrice || '0');
  const margin = !isNaN(purchasePrice) && !isNaN(sellingPrice) && purchasePrice > 0
    ? ((sellingPrice - purchasePrice) / purchasePrice) * 100
    : 0;
  const isValid = !isNaN(purchasePrice) && !isNaN(sellingPrice) && sellingPrice > purchasePrice && authCode.length === 6;
  
  return (
    <Card>
      <CardHeader className={bgColor}>
        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <CardTitle>Update {productType} Prices</CardTitle>
        </div>
        <CardDescription>
          Set new purchase and selling prices for {productType}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Current Prices</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <Label>Current Purchase Price</Label>
                  <div className="mt-2 text-xl font-bold">₦{currentPurchasePrice.toFixed(2)}</div>
                </div>
                <div className="p-4 border rounded-md">
                  <Label>Current Selling Price</Label>
                  <div className="mt-2 text-xl font-bold">₦{currentSellingPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">New Prices</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">New Purchase Price (₦)</Label>
                  <Input
                    id="purchasePrice"
                    value={newPurchasePrice}
                    onChange={(e) => onPurchasePriceChange(e.target.value)}
                    placeholder={currentPurchasePrice.toString()}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">New Selling Price (₦)</Label>
                  <Input
                    id="sellingPrice"
                    value={newSellingPrice}
                    onChange={(e) => onSellingPriceChange(e.target.value)}
                    placeholder={currentSellingPrice.toString()}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              {!isNaN(margin) && newPurchasePrice && newSellingPrice && (
                <div className="flex items-center mt-2">
                  <Badge variant={margin > 0 ? "secondary" : "destructive"}>
                    {margin.toFixed(2)}% Margin
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-2">
                    (₦{(sellingPrice - purchasePrice).toFixed(2)} per liter)
                  </span>
                </div>
              )}
              
              {sellingPrice <= purchasePrice && newPurchasePrice && newSellingPrice && (
                <div className="text-sm text-red-500">
                  Selling price must be higher than purchase price
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Price Change</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Market price adjustment, supply changes, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="authCode">Authorization Code</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Enter 6-digit code to authorize price change
              </span>
            </div>
            <InputOTP
              maxLength={6}
              value={authCode}
              onChange={onAuthCodeChange}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} index={index} {...slot} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline">Cancel</Button>
        <Button onClick={onSubmit} disabled={!isValid}>
          <DollarSign className="mr-2 h-4 w-4" />
          Update {productType} Prices
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PriceManagement;
