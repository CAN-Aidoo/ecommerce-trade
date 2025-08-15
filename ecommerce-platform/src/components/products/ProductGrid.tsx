import React from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { cn } from '@/utils';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  cardSize?: 'sm' | 'md' | 'lg';
  showQuickActions?: boolean;
  showSellerInfo?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
  cardSize = 'md',
  showQuickActions = true,
  showSellerInfo = false,
  className,
  emptyMessage = 'No products found.'
}: ProductGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-6', gridClasses[columns], className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} size={cardSize} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          size={cardSize}
          showQuickActions={showQuickActions}
          showSellerInfo={showSellerInfo}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
  };

  const imageSizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-56',
  };

  return (
    <div className={cn(
      'bg-card border rounded-lg overflow-hidden animate-pulse',
      sizeClasses[size]
    )}>
      <div className={cn('bg-muted', imageSizeClasses[size])} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-6 bg-muted rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

export { ProductCardSkeleton };