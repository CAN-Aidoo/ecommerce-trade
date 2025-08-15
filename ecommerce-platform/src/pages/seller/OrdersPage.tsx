import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Order, OrderStatus } from '@/types';

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    buyerId: 'buyer1',
    orderNumber: 'ORD-001',
    status: 'pending',
    paymentStatus: 'paid',
    totalAmount: 199.99,
    shippingAmount: 9.99,
    taxAmount: 15.99,
    discountAmount: 0,
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'New York',
      stateProvince: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1-555-0123'
    },
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'New York',
      stateProvince: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1-555-0123'
    },
    paymentMethod: 'Credit Card',
    items: [
      {
        id: 'item1',
        orderId: 'ORD-001',
        productId: '1',
        sellerId: 'seller1',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
        isWholesale: false,
        createdAt: new Date()
      }
    ],
    buyer: {
      id: 'buyer1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'ORD-002',
    buyerId: 'buyer2',
    orderNumber: 'ORD-002',
    status: 'processing',
    paymentStatus: 'paid',
    totalAmount: 89.99,
    shippingAmount: 5.99,
    taxAmount: 7.20,
    discountAmount: 10.00,
    billingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      addressLine1: '456 Oak Ave',
      city: 'Los Angeles',
      stateProvince: 'CA',
      postalCode: '90210',
      country: 'US',
      phone: '+1-555-0124'
    },
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      addressLine1: '456 Oak Ave',
      city: 'Los Angeles',
      stateProvince: 'CA',
      postalCode: '90210',
      country: 'US',
      phone: '+1-555-0124'
    },
    paymentMethod: 'PayPal',
    items: [
      {
        id: 'item2',
        orderId: 'ORD-002',
        productId: '2',
        sellerId: 'seller1',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99,
        isWholesale: false,
        createdAt: new Date()
      }
    ],
    buyer: {
      id: 'buyer2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'ORD-003',
    buyerId: 'buyer3',
    orderNumber: 'ORD-003',
    status: 'shipped',
    paymentStatus: 'paid',
    totalAmount: 299.99,
    shippingAmount: 0,
    taxAmount: 24.00,
    discountAmount: 0,
    billingAddress: {
      firstName: 'Mike',
      lastName: 'Johnson',
      addressLine1: '789 Pine Rd',
      city: 'Chicago',
      stateProvince: 'IL',
      postalCode: '60601',
      country: 'US',
      phone: '+1-555-0125'
    },
    shippingAddress: {
      firstName: 'Mike',
      lastName: 'Johnson',
      addressLine1: '789 Pine Rd',
      city: 'Chicago',
      stateProvince: 'IL',
      postalCode: '60601',
      country: 'US',
      phone: '+1-555-0125'
    },
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK123456789',
    items: [
      {
        id: 'item3',
        orderId: 'ORD-003',
        productId: '3',
        sellerId: 'seller1',
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99,
        isWholesale: false,
        createdAt: new Date()
      }
    ],
    buyer: {
      id: 'buyer3',
      email: 'mike@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'buyer',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14')
  }
];

export function SellerOrdersPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(
    (searchParams.get('status') as OrderStatus) || 'all'
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredOrders = MOCK_ORDERS;
      
      // Apply search filter
      if (searchQuery) {
        filteredOrders = filteredOrders.filter(order =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${order.buyer?.firstName} ${order.buyer?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      setOrders(filteredOrders);
      setIsLoading(false);
    };

    fetchOrders();
  }, [searchQuery, statusFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleStatusFilter = (status: OrderStatus | 'all') => {
    setStatusFilter(status);
    const newParams = new URLSearchParams(searchParams);
    if (status !== 'all') {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      refunded: AlertCircle
    };

    const Icon = icons[status];

    return (
      <Badge className={`${variants[status]} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partially_refunded: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">
                Manage and track your customer orders
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Orders
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => handleStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : 'You haven\'t received any orders yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {order.shippingAddress.city}, {order.shippingAddress.stateProvince}
                        </span>
                        {order.trackingNumber && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {order.buyer?.firstName} {order.buyer?.lastName}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {order.buyer?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.shippingAddress.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/seller/orders/${order.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                      
                      {/* Status Update Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {order.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Order
                            </DropdownMenuItem>
                          )}
                          {order.status === 'confirmed' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Start Processing
                            </DropdownMenuItem>
                          )}
                          {order.status === 'processing' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === 'shipped' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Print Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Order Items</h5>
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x Product #{item.productId}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}