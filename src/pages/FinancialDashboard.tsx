
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, startOfToday, startOfWeek, startOfMonth, startOfYear, subDays, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  CircleDollarSign, 
  Download, 
  CreditCard, 
  TrendingDown, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  Filter 
} from 'lucide-react';

const FinancialDashboard: React.FC = () => {
  const { 
    purchaseOrders, 
    sales, 
    prices
  } = useApp();
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterType, setFilterType] = useState('month');
  const [productFilter, setProductFilter] = useState('all');
  
  // Get date range based on filter type
  const getDateRange = useMemo(() => {
    const today = new Date();
    let from: Date, to: Date;
    
    switch (filterType) {
      case 'today':
        from = startOfToday();
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        from = startOfWeek(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'month':
        from = startOfMonth(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'year':
        from = startOfYear(today);
        to = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'custom':
        if (dateRange?.from) {
          from = dateRange.from;
          to = dateRange.to || dateRange.from;
          
          // Set time to end of day for 'to' date
          to = new Date(to);
          to.setHours(23, 59, 59, 999);
        } else {
          from = startOfMonth(today);
          to = new Date(today.setHours(23, 59, 59, 999));
        }
        break;
      default:
        from = startOfMonth(today);
        to = new Date(today.setHours(23, 59, 59, 999));
    }
    
    return { from, to };
  }, [filterType, dateRange]);
  
  // Filter data based on date range and product
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = sale.timestamp;
      const dateMatches = isWithinInterval(saleDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
      
      const productMatches = productFilter === 'all' || sale.productType === productFilter;
      
      return dateMatches && productMatches;
    });
  }, [sales, getDateRange, productFilter]);
  
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const orderDate = order.createdAt;
      const dateMatches = isWithinInterval(orderDate, { 
        start: getDateRange.from, 
        end: getDateRange.to 
      });
      
      const productMatches = productFilter === 'all' || order.items.some(item => item.product === productFilter);
      
      return dateMatches && productMatches;
    });
  }, [purchaseOrders, getDateRange, productFilter]);
  
  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalExpenses = filteredOrders.reduce((acc, order) => acc + order.grandTotal, 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Last period for comparison
    const prevPeriodStart = new Date(getDateRange.from);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - (getDateRange.to.getTime() - getDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    const prevPeriodSales = sales.filter(sale => {
      const saleDate = sale.timestamp;
      return isWithinInterval(saleDate, { 
        start: prevPeriodStart, 
        end: new Date(getDateRange.from.getTime() - 1) 
      }) && (productFilter === 'all' || sale.productType === productFilter);
    });
    
    const prevPeriodRevenue = prevPeriodSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const revenueChange = prevPeriodRevenue > 0 
      ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100 
      : 100;
    
    // Group sales by product
    const salesByProduct = filteredSales.reduce((acc, sale) => {
      const { productType, totalAmount } = sale;
      if (!acc[productType]) acc[productType] = 0;
      acc[productType] += totalAmount;
      return acc;
    }, {} as Record<string, number>);
    
    // Daily revenue data for chart
    const dailyRevenue: { date: string, revenue: number }[] = [];
    const dataMap = new Map<string, number>();
    
    filteredSales.forEach(sale => {
      const date = format(sale.timestamp, 'yyyy-MM-dd');
      const currentAmount = dataMap.get(date) || 0;
      dataMap.set(date, currentAmount + sale.totalAmount);
    });
    
    // Sort by date
    const sortedDates = [...dataMap.keys()].sort();
    sortedDates.forEach(date => {
      dailyRevenue.push({
        date: format(new Date(date), 'MMM dd'),
        revenue: dataMap.get(date) || 0
      });
    });
    
    // Accounts receivable (simple simulation - 10% of sales not paid yet)
    const accountsReceivable = totalRevenue * 0.1;
    
    // Payment methods distribution (simulated data)
    const paymentMethodsData = [
      { name: 'Cash', value: totalRevenue * 0.6 },
      { name: 'Card', value: totalRevenue * 0.25 },
      { name: 'Transfer', value: totalRevenue * 0.15 }
    ];
    
    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      revenueChange,
      salesByProduct,
      dailyRevenue,
      accountsReceivable,
      paymentMethodsData
    };
  }, [filteredSales, filteredOrders, getDateRange.from, getDateRange.to, productFilter, sales]);
  
  // Export data functions (simulated)
  const exportToPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('Exporting to PDF...');
  };
  
  const exportToExcel = () => {
    // In a real app, this would generate and download an Excel file
    alert('Exporting to Excel...');
  };
  
  // Chart colors
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button 
              variant={filterType === 'today' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('today')}
            >
              Today
            </Button>
            <Button 
              variant={filterType === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('week')}
            >
              Week
            </Button>
            <Button 
              variant={filterType === 'month' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('month')}
            >
              Month
            </Button>
            <Button 
              variant={filterType === 'year' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('year')}
            >
              Year
            </Button>
            <Button 
              variant={filterType === 'custom' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-md"
              onClick={() => setFilterType('custom')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Custom
            </Button>
          </div>
          
          {filterType === 'custom' && (
            <DateRangePicker 
              date={dateRange} 
              onDateChange={setDateRange} 
            />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-0 md:ml-2">
                <Filter className="h-4 w-4 mr-2" />
                {productFilter === 'all' ? 'All Products' : productFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setProductFilter('all')}>
                All Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('PMS')}>
                PMS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('AGO')}>
                AGO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setProductFilter('DPK')}>
                DPK
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-0 md:ml-2">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPDF}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing data from {format(getDateRange.from, 'MMM dd, yyyy')} to {format(getDateRange.to, 'MMM dd, yyyy')}
      </div>
      
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">₦{financialMetrics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {financialMetrics.revenueChange >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                      <p className="text-xs text-green-500">+{Math.abs(financialMetrics.revenueChange).toFixed(1)}%</p>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                      <p className="text-xs text-red-500">-{Math.abs(financialMetrics.revenueChange).toFixed(1)}%</p>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground ml-2">vs. previous period</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold">₦{financialMetrics.totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  From {filteredOrders.length} purchase orders
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-700">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit</p>
                <p className="text-2xl font-bold">
                  <span className={financialMetrics.profit >= 0 ? "text-green-600" : "text-red-600"}>
                    ₦{financialMetrics.profit.toLocaleString()}
                  </span>
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    Margin: <span className={financialMetrics.profitMargin >= 0 ? "text-green-500" : "text-red-500"}>
                      {financialMetrics.profitMargin.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-full ${financialMetrics.profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer rounded-xl overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accounts Receivable</p>
                <p className="text-2xl font-bold">₦{financialMetrics.accountsReceivable.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Outstanding payments
                </p>
              </div>
              <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialMetrics.dailyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
            <CardDescription>Revenue distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialMetrics.paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {financialMetrics.paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Product performance */}
      <Card className="shadow-md rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Sales by Product</CardTitle>
          <CardDescription>Revenue breakdown by product type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={Object.entries(financialMetrics.salesByProduct).map(([name, value]) => ({ name, value }))} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="value" name="Revenue">
                  {Object.entries(financialMetrics.salesByProduct).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
