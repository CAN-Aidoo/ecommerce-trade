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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Package,
  AlertTriangle,
  Star,
  TrendingUp,
  Grid,
  List
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Product, ProductStatus } from '@/types';

// Mock products data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sellerId: 'seller1',
    categoryId: 'electronics',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    description: 'High-quality noise-cancelling wireless headphones with premium sound quality.',
    sku: 'AWH-001',
    basePrice: 199.99,
    wholesalePrice: 159.99,
    minWholesaleQuantity: 10,
    stockQuantity: 25,
    status: 'active',
    isFeatured: true,
    images: [{
      id: 'img1',
      productId: '1',
      imageUrl: '/images/electronics-category.jpg',
      altText: 'Premium Wireless Headphones',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date()
    }],
    averageRating: 4.8,
    totalReviews: 156,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    sellerId: 'seller1',
    categoryId: 'electronics',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
    sku: 'SFW-002',
    basePrice: 299.99,
    wholesalePrice: 239.99,
    minWholesaleQuantity: 5,
    stockQuantity: 8,
    status: 'active',
    isFeatured: false,
    images: [{
      id: 'img2',
      productId: '2',
      imageUrl: '/images/electronics-category.jpg',
      altText: 'Smart Fitness Watch',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date()
    }],
    averageRating: 4.5,
    totalReviews: 89,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    sellerId: 'seller1',
    categoryId: 'electronics',
    name: 'Wireless Charging Pad',
    slug: 'wireless-charging-pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    sku: 'WCP-003',
    basePrice: 39.99,
    wholesalePrice: 29.99,
    minWholesaleQuantity: 20,
    stockQuantity: 0,
    status: 'out_of_stock',
    isFeatured: false,
    images: [{
      id: 'img3',
      productId: '3',
      imageUrl: '/images/electronics-category.jpg',
      altText: 'Wireless Charging Pad',
      sortOrder: 1,
      isPrimary: true,
      createdAt: new Date()
    }],
    averageRating: 4.2,
    totalReviews: 34,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14')
  }
];

export function SellerProductsPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>(
    (searchParams.get('status') as ProductStatus) || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredProducts = MOCK_PRODUCTS;
      
      // Apply search filter
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.status === statusFilter);
      }
      
      setProducts(filteredProducts);
      setIsLoading(false);
    };

    fetchProducts();
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

  const handleStatusFilter = (status: ProductStatus | 'all') => {
    setStatusFilter(status);
    const newParams = new URLSearchParams(searchParams);
    if (status !== 'all') {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      out_of_stock: 'Out of Stock'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600' };
    if (quantity <= 5) return { label: 'Low Stock', color: 'text-orange-600' };
    return { label: 'In Stock', color: 'text-green-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product catalog and inventory
              </p>
            </div>
            <Button asChild>
              <Link to="/seller/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Link>
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => handleStatusFilter(value as ProductStatus | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'No products match your current filters.'
                : 'Start by adding your first product to your catalog.'
              }
            </p>
            <Button asChild>
              <Link to="/seller/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Link>
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity);
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.images[0]?.imageUrl || '/images/electronics-category.jpg'}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              SKU: {product.sku} • Created {formatDate(product.createdAt)}
                            </p>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(product.status)}
                              {product.isFeatured && (
                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <span className={`text-sm font-medium ${stockStatus.color}`}>
                                {stockStatus.label} ({product.stockQuantity})
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 mb-1">
                              {formatCurrency(product.basePrice)}
                            </div>
                            {product.wholesalePrice && (
                              <div className="text-sm text-green-600">
                                Wholesale: {formatCurrency(product.wholesalePrice)}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">
                                {product.averageRating?.toFixed(1)} ({product.totalReviews})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/product/${product.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/seller/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity);
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <img
                        src={product.images[0]?.imageUrl || '/images/electronics-category.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(product.status)}
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">
                            {formatCurrency(product.basePrice)}
                          </div>
                          {product.wholesalePrice && (
                            <div className="text-sm text-green-600">
                              W: {formatCurrency(product.wholesalePrice)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${stockStatus.color}`}>
                            {product.stockQuantity} left
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {product.averageRating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/seller/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/product/${product.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}