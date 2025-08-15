import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  Package,
  Tag,
  DollarSign,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ProductSearchParams } from '@/types';

interface SearchFiltersProps {
  searchParams: ProductSearchParams;
  onFilterChange: (filters: Partial<ProductSearchParams>) => void;
}

// Mock categories for now
const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', count: 156 },
  { id: 'fashion', name: 'Fashion & Clothing', count: 89 },
  { id: 'home-garden', name: 'Home & Garden', count: 234 },
  { id: 'sports', name: 'Sports & Outdoors', count: 67 },
  { id: 'books', name: 'Books & Media', count: 123 },
  { id: 'toys', name: 'Toys & Games', count: 45 },
  { id: 'beauty', name: 'Beauty & Personal Care', count: 78 },
  { id: 'automotive', name: 'Automotive', count: 92 }
];

const RATING_FILTERS = [
  { value: 4, label: '4+ Stars', count: 245 },
  { value: 3, label: '3+ Stars', count: 423 },
  { value: 2, label: '2+ Stars', count: 567 },
  { value: 1, label: '1+ Stars', count: 689 }
];

export function SearchFilters({ searchParams, onFilterChange }: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true,
    features: true
  });

  const [priceRange, setPriceRange] = useState([
    searchParams.minPrice || 0,
    searchParams.maxPrice || 1000
  ]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const currentCategories = searchParams.categoryIds || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId);
    
    onFilterChange({ categoryIds: newCategories });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const applyPriceFilter = () => {
    onFilterChange({
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined
    });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = searchParams.minRating === rating ? undefined : rating;
    onFilterChange({ minRating: newRating });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categories
          </h3>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={category.id}
                    checked={searchParams.categoryIds?.includes(category.id) || false}
                    onCheckedChange={(checked) => 
                      handleCategoryToggle(category.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range
          </h3>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0] || ''}
                onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                className="flex-1"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1] || ''}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 1000])}
                className="flex-1"
                min="0"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>

            <Button
              onClick={applyPriceFilter}
              size="sm"
              className="w-full"
              variant="outline"
            >
              Apply Price Filter
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Customer Rating
          </h3>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSections.rating && (
          <div className="space-y-2">
            {RATING_FILTERS.map(rating => (
              <div key={rating.value} className="flex items-center justify-between">
                <button
                  onClick={() => handleRatingChange(rating.value)}
                  className={`flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 w-full text-left ${
                    searchParams.minRating === rating.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rating.value
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span>{rating.label}</span>
                </button>
                <Badge variant="outline" className="text-xs">
                  {rating.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Availability
          </h3>
          {expandedSections.availability ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSections.availability && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={searchParams.inStockOnly || false}
                onCheckedChange={(checked) => 
                  onFilterChange({ inStockOnly: checked as boolean })
                }
              />
              <Label htmlFor="in-stock" className="text-sm font-medium leading-none cursor-pointer">
                In Stock Only
              </Label>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Features */}
      <div>
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Features
          </h3>
          {expandedSections.features ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSections.features && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={searchParams.featuredOnly || false}
                onCheckedChange={(checked) => 
                  onFilterChange({ featuredOnly: checked as boolean })
                }
              />
              <Label htmlFor="featured" className="text-sm font-medium leading-none cursor-pointer">
                Featured Products Only
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}