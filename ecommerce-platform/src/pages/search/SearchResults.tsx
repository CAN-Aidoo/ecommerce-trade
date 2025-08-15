import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart,
  ShoppingCart,
  Star,
  Package,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { formatCurrency } from '@/utils';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import type { Product, ProductSearchParams } from '@/types';

interface SearchResultsProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  searchQuery: ProductSearchParams;
  onPageChange: (page: number) => void;
}

export function SearchResults({ 
  products, 
  viewMode, 
  searchQuery, 
  onPageChange 
}: SearchResultsProps) {
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();

  // Mock pagination data
  const currentPage = searchQuery.page || 1;
  const totalPages = Math.ceil(products.length / (searchQuery.limit || 12));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleAddToCart = (product: Product) => {
    addItem(product, 1, false);
  };

  const handleWishlistToggle = (product: Product) => {
    toggleWishlist(product);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-6">
          {searchQuery.query
            ? `No results found for "${searchQuery.query}". Try adjusting your search or filters.`
            : 'No products match your current filters. Try adjusting your criteria.'
          }
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Suggestions:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Try different keywords</li>
            <li>• Check your spelling</li>
            <li>• Use more general terms</li>
            <li>• Remove some filters</li>
          </ul>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.images?.[0]?.imageUrl || '/images/electronics-category.jpg'}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg border hover:opacity-75 transition-opacity"
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        <Link 
                          to={`/product/${product.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      {product.sku && (
                        <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {formatCurrency(product.basePrice)}
                      </div>
                      {product.wholesalePrice && (
                        <div className="text-sm text-green-600">
                          Wholesale: {formatCurrency(product.wholesalePrice)}
                          <span className="text-gray-500 ml-1">
                            (Min {product.minWholesaleQuantity})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Badges and Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    {product.isFeatured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {product.averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({product.totalReviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>
                        {product.stockQuantity > 0 
                          ? `${product.stockQuantity} in stock`
                          : 'Out of stock'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0}
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWishlistToggle(product)}
                      className={
                        wishlistItems.some(item => item.productId === product.id)
                          ? 'text-red-600 border-red-300 hover:bg-red-50'
                          : ''
                      }
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          wishlistItems.some(item => item.productId === product.id)
                            ? 'fill-current'
                            : ''
                        }`}
                      />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/product/${product.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 7 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="w-9"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 7 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-9"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}