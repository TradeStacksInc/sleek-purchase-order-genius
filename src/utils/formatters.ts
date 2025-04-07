
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'completed': 'bg-purple-100 text-purple-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '₦0.00';
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};
