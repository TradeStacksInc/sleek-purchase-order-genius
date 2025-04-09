
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DeliveryAnalytics: React.FC = () => {
  const { getAllPurchaseOrders } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const allOrders = getAllPurchaseOrders();
      setOrders(allOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [getAllPurchaseOrders]);

  const deliveredOrders = orders.filter(order => order.deliveryDetails?.status === 'delivered');
  const inTransitOrders = orders.filter(order => order.deliveryDetails?.status === 'in_transit');
  const pendingOrders = orders.filter(order => !order.deliveryDetails || order.deliveryDetails?.status === 'pending');

  const totalOrders = orders.length;
  const deliveredPercentage = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;
  const inTransitPercentage = totalOrders > 0 ? (inTransitOrders.length / totalOrders) * 100 : 0;
  const pendingPercentage = totalOrders > 0 ? (pendingOrders.length / totalOrders) * 100 : 0;

  const calculateDiscrepancies = (orders) => {
    const filteredOrders = orders.filter(order => order.offloadingDetails);

    const totalVolumeOrdered = filteredOrders.reduce((sum, order) => {
      const orderedQuantity = Number(order.volumeOrdered || 0);
      return sum + orderedQuantity;
    }, 0);
    
    const totalVolumeDelivered = filteredOrders.reduce((sum, order) => {
      const deliveredQuantity = Number(order.deliveryDetails?.deliveredVolume || 0);
      return sum + deliveredQuantity;
    }, 0);
    
    // Fix the calculation to ensure proper number types
    const volumeDiscrepancy = Number(totalVolumeOrdered) > 0 
      ? ((Number(totalVolumeDelivered) - Number(totalVolumeOrdered)) / Number(totalVolumeOrdered)) * 100 
      : 0;

    return {
      totalOrders: filteredOrders.length,
      totalVolumeOrdered,
      totalVolumeDelivered,
      volumeDiscrepancy,
    };
  };

  const discrepancies = calculateDiscrepancies(orders);

  const deliveryPerformanceData = [
    { name: 'Delivered', value: deliveredOrders.length },
    { name: 'In Transit', value: inTransitOrders.length },
    { name: 'Pending', value: pendingOrders.length },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Delivery Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Overview of delivery statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4">
              <Badge variant="secondary">Delivered: {deliveredPercentage.toFixed(2)}%</Badge>
              <Badge variant="outline">In Transit: {inTransitPercentage.toFixed(2)}%</Badge>
              <Badge>Pending: {pendingPercentage.toFixed(2)}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Discrepancies</CardTitle>
            <CardDescription>Analysis of volume differences in deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[150px]" />
            ) : (
              <>
                <p>Total Orders with Discrepancies: {discrepancies.totalOrders}</p>
                <p>Total Volume Ordered: {discrepancies.totalVolumeOrdered.toFixed(2)} L</p>
                <p>Total Volume Delivered: {discrepancies.totalVolumeDelivered.toFixed(2)} L</p>
                <p>Volume Discrepancy: {discrepancies.volumeDiscrepancy.toFixed(2)}%</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Metrics</CardTitle>
            <CardDescription>Other relevant delivery metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[150px]" />
            ) : (
              <p>Total Deliveries: {deliveredOrders.length}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryAnalytics;
