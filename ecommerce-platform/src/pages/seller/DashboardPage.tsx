import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Eye,
  Plus,
  BarChart3,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Edit
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { SellerStats, Order, Product } from '@/types';

// Mock data for demonstration
const MOCK_STATS: SellerStats = {
  totalProducts: 24,
  activeProducts: 22,
  lowStockProducts: 3,
  outOfStockProducts: 2,
  totalOrders: 156,
  pendingOrders: 8,
  totalRevenue: 15420.50,
  averageRating: 4.6,
  totalReviews: 89
};

const MOCK_RECENT_ORDERS = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-001',
    status: 'pending' as const,
    totalAmount: 199.99,
    createdAt: new Date('2024-01-15'),
    buyer: { 
      id: '1', 
      firstName: 'John', 
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'buyer' as const,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD-002',
    status: 'processing' as const,
    totalAmount: 89.99,
    createdAt: new Date('2024-01-14'),
    buyer: { 
      id: '2', 
      firstName: 'Jane', 
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'buyer' as const,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'ORD-003',
    orderNumber: 'ORD-003',
    status: 'shipped' as const,
    totalAmount: 299.99,
    createdAt: new Date('2024-01-13'),
    buyer: { 
      id: '3', 
      firstName: 'Mike', 
      lastName: 'Johnson',
      email: 'mike@example.com',
      role: 'buyer' as const,
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

const MOCK_LOW_STOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    stockQuantity: 2,
    basePrice: 199.99,
    images: [{ 
      id: 'img1',
      productId: '1',
      imageUrl: '/images/electronics-category.jpg',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date()
    }]
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    stockQuantity: 1,
    basePrice: 299.99,
    images: [{ 
      id: 'img2',
      productId: '2',
      imageUrl: '/images/electronics-category.jpg',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date()
    }]
  }
];

export function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<typeof MOCK_RECENT_ORDERS>([]);
  const [lowStockProducts, setLowStockProducts] = useState<typeof MOCK_LOW_STOCK_PRODUCTS>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(MOCK_STATS);
      setRecentOrders(MOCK_RECENT_ORDERS);
      setLowStockProducts(MOCK_LOW_STOCK_PRODUCTS);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link to="/seller/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/seller/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-yellow-600">{stats.pendingOrders} pending</span>
              </p>
            </CardContent>
          </Card>

          {/* Active Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProducts} total products
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Orders
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/seller/orders">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">{order.orderNumber}</h4>
                          <p className="text-sm text-gray-600">
                            {order.buyer?.firstName} {order.buyer?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.createdAt!)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(order.totalAmount!)}</div>
                        <Badge className={`mt-1 ${getStatusColor(order.status!)}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/seller/products/new">
                      <Plus className="w-6 h-6" />
                      <span className="text-sm">Add Product</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/seller/orders">
                      <Package className="w-6 h-6" />
                      <span className="text-sm">Manage Orders</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/seller/products">
                      <Edit className="w-6 h-6" />
                      <span className="text-sm">Edit Products</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link to="/seller/analytics">
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm">View Reports</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts & Notifications */}
          <div className="space-y-6">
            {/* Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-orange-600">Low Stock Items</p>
                      <p className="text-sm text-gray-600">{stats.lowStockProducts} products</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {stats.lowStockProducts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600">Out of Stock</p>
                      <p className="text-sm text-gray-600">{stats.outOfStockProducts} products</p>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      {stats.outOfStockProducts}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/seller/products?filter=low-stock">
                      Manage Inventory
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Products */}
            {lowStockProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Products Running Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.imageUrl || '/images/electronics-category.jpg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{product.name}</h4>
                          <p className="text-xs text-gray-600">
                            {product.stockQuantity} left
                          </p>
                        </div>
                        <Badge variant="outline" className="text-orange-600">
                          Low
                        </Badge>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/seller/products?filter=low-stock">
                        View All Low Stock
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Orders</span>
                  <span className="font-medium">+23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-medium">+{formatCurrency(1250.00)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Reviews</span>
                  <span className="font-medium">+7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="font-medium">{stats.averageRating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}