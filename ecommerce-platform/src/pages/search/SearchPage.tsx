import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Filter,
  SlidersHorizontal,
  Search,
  X,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { ProductSort } from './ProductSort';
import { useProducts } from '@/hooks/api/useProducts';
import BreadcrumbNav from '@/components/ui/breadcrumb-nav';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { ProductSearchParams } from '@/types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Extract search parameters from URL
  const searchQuery = useMemo(() => {
    const query = searchParams.get('q') || '';
    const categories = searchParams.getAll('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') as ProductSearchParams['sortBy'];
    const inStockOnly = searchParams.get('inStock') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');

    return {
      query,
      categoryIds: categories,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseInt(minRating) : undefined,
      sortBy: sortBy || 'relevance',
      inStockOnly,
      featuredOnly,
      page,
      limit: 12
    } as ProductSearchParams;
  }, [searchParams]);

  const { data: productsData, isLoading } = useProducts(searchQuery);
  const products = productsData || [];

  // Update page title based on search
  useEffect(() => {
    if (searchQuery.query) {
      document.title = `Search results for "${searchQuery.query}" - E-Commerce Platform`;
    } else {
      document.title = 'Search Products - E-Commerce Platform';
    }
  }, [searchQuery.query]);

  const handleFilterChange = (filters: Partial<ProductSearchParams>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.delete(key);
        value.forEach(v => newParams.append(key, v));
      } else {
        newParams.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change
    if (!filters.page) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
      newParams.set('q', query);
    }
    setSearchParams(newParams);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.categoryIds?.length) count++;
    if (searchQuery.minPrice || searchQuery.maxPrice) count++;
    if (searchQuery.minRating) count++;
    if (searchQuery.inStockOnly) count++;
    if (searchQuery.featuredOnly) count++;
    return count;
  }, [searchQuery]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Results', href: '/search' }
  ];

  if (searchQuery.query) {
    breadcrumbItems.push({ 
      label: `"${searchQuery.query}"`, 
      href: `/search?q=${searchQuery.query}` 
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery.query ? `Search Results for "${searchQuery.query}"` : 'All Products'}
              </h1>
              {!isLoading && (
                <p className="text-gray-600 mt-1">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery.categoryIds?.map(category => (
                <Badge key={category} variant="secondary" className="gap-1">
                  Category: {category}
                  <button
                    onClick={() => {
                      const newCategories = searchQuery.categoryIds?.filter(c => c !== category) || [];
                      handleFilterChange({ categoryIds: newCategories });
                    }}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {(searchQuery.minPrice || searchQuery.maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  Price: ${searchQuery.minPrice || 0} - ${searchQuery.maxPrice || '∞'}
                  <button
                    onClick={() => handleFilterChange({ minPrice: undefined, maxPrice: undefined })}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery.minRating && (
                <Badge variant="secondary" className="gap-1">
                  Rating: {searchQuery.minRating}+ stars
                  <button
                    onClick={() => handleFilterChange({ minRating: undefined })}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery.inStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  In Stock Only
                  <button
                    onClick={() => handleFilterChange({ inStockOnly: false })}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery.featuredOnly && (
                <Badge variant="secondary" className="gap-1">
                  Featured Only
                  <button
                    onClick={() => handleFilterChange({ featuredOnly: false })}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {activeFilterCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchFilters
                  searchParams={searchQuery}
                  onFilterChange={handleFilterChange}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filters Sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4" onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="py-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h3>
                <SearchFilters
                  searchParams={searchQuery}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="lg:hidden">
                <Button variant="outline" onClick={() => setShowFilters(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <ProductSort
                  value={searchQuery.sortBy || 'relevance'}
                  onChange={(sortBy) => handleFilterChange({ sortBy })}
                />
                
                {/* Mobile View Mode Toggle */}
                <div className="md:hidden flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Searching products..." />
              </div>
            ) : (
              <SearchResults
                products={products}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onPageChange={(page) => handleFilterChange({ page })}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}