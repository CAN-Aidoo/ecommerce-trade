import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye, 
  Package,
  Truck,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';

import { useCartStore } from '@/store/cart';
import { useWishlistStore, useIsInWishlist } from '@/store/wishlist';
import { 
  formatPrice, 
  getProductPrice, 
  getProductDiscountPercentage,
  getProductAvailabilityText,
  cn 
} from '@/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickActions?: boolean;
  showSellerInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductCard({ 
  product, 
  className, 
  showQuickActions = true, 
  showSellerInfo = false,
  size = 'md'
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist } = useWishlistStore();
  const isInWishlist = useIsInWishlist(product.id);

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const wholesaleDiscount = getProductDiscountPercentage(product, product.minWholesaleQuantity);
  const isWholesaleEligible = product.wholesalePrice && product.minWholesaleQuantity;
  const availabilityText = getProductAvailabilityText(product);
  const isOutOfStock = product.stockQuantity === 0;

  const sizeClasses = {
    sm: {
      card: 'h-64',
      image: 'h-32',
      title: 'text-sm',
      price: 'text-base',
    },
    md: {
      card: 'h-80',
      image: 'h-48',
      title: 'text-base',
      price: 'text-lg',
    },
    lg: {
      card: 'h-96',
      image: 'h-56',
      title: 'text-lg',
      price: 'text-xl',
    },
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(product, quantity, false);
      // TODO: Show success toast
    } catch (error) {
      // TODO: Show error toast
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(product);
    // TODO: Show success toast
  };

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      sizeClasses[size].card,
      className
    )}>
      <Link to={`/product/${product.id}`} className="block h-full">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image section */}
          <div className={cn(
            'relative overflow-hidden bg-muted',
            sizeClasses[size].image
          )}>
            {primaryImage && (
              <img
                src={primaryImage.imageUrl}
                alt={primaryImage.altText || product.name}
                className={cn(
                  'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoading && 'opacity-0'
                )}
                onLoad={() => setImageLoading(false)}
                loading="lazy"
              />
            )}

            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isFeatured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
              {wholesaleDiscount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {wholesaleDiscount}% off bulk
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                        onClick={handleToggleWishlist}
                      >
                        <Heart 
                          className={cn(
                            'h-4 w-4',
                            isInWishlist && 'fill-current text-red-500'
                          )} 
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: Quick view modal
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Quick view
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Add to cart overlay */}
            {!isOutOfStock && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              {/* Category and seller */}
              {showSellerInfo && product.seller && (
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  {product.category && (
                    <Link 
                      to={`/categories/${product.category.slug}`}
                      className="hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.category.name}
                    </Link>
                  )}
                  <span>by {product.seller.firstName} {product.seller.lastName}</span>
                </div>
              )}

              {/* Product name */}
              <h3 className={cn(
                'font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors',
                sizeClasses[size].title
              )}>
                {product.name}
              </h3>

              {/* Rating */}
              {product.averageRating && product.totalReviews && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm font-medium ml-1">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.totalReviews} reviews)
                  </span>
                </div>
              )}

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.shortDescription}
                </p>
              )}
            </div>

            <div className="mt-auto">
              {/* Pricing */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className={cn('font-bold text-primary', sizeClasses[size].price)}>
                  {formatPrice(product.basePrice)}
                </span>
                {isWholesaleEligible && (
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(product.wholesalePrice!)} bulk
                  </span>
                )}
              </div>

              {/* Wholesale info */}
              {isWholesaleEligible && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Tag className="h-3 w-3" />
                  <span>Min. order: {product.minWholesaleQuantity} units</span>
                </div>
              )}

              {/* Availability */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    isOutOfStock ? 'bg-destructive' :
                    product.stockQuantity <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isOutOfStock ? 'text-destructive' :
                    product.stockQuantity <= 10 ? 'text-yellow-600' : 'text-green-600'
                  )}>
                    {availabilityText}
                  </span>
                </div>

                {/* Free shipping indicator */}
                {product.basePrice >= 75 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Truck className="h-3 w-3" />
                    <span>Free shipping</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}