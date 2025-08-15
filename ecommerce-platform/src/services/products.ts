// Products service

import { apiClient, uploadFiles } from './api';
import type { 
  Product, 
  ProductSearchParams, 
  ProductFilters,
  PaginatedResponse,
  Category,
  Review,
  ProductFormData
} from '@/types';

// Helper function to check if a value should be included in URL params
const shouldIncludeInParams = (value: any): boolean => {
  return value !== undefined && value !== null && value !== '' && value !== false;
};

export interface ProductsResponse {
  products: Product[];
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductCreateData extends Omit<ProductFormData, 'images'> {
  images?: string[]; // Array of uploaded image URLs
}

export interface ProductUpdateData extends Partial<ProductCreateData> {}

export interface SearchSuggestion {
  suggestion: string;
  type: 'product' | 'category' | 'query';
  relevance: number;
}

export const productsService = {
  // Product listing and search
  searchProducts: async (params: ProductSearchParams): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(`${key}[]`, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return apiClient.get<ProductsResponse>(`/products/search?${searchParams.toString()}`);
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    sellerId?: string;
    featured?: boolean;
    status?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (shouldIncludeInParams(value)) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get<PaginatedResponse<Product>>(`/products?${searchParams.toString()}`);
  },

  getFeaturedProducts: async (limit: number = 12): Promise<Product[]> => {
    return apiClient.get<Product[]>(`/products/featured?limit=${limit}`);
  },

  getRecommendedProducts: async (productId?: string, limit: number = 8): Promise<Product[]> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (productId) {
      params.append('productId', productId);
    }
    return apiClient.get<Product[]>(`/products/recommended?${params.toString()}`);
  },

  getProductsByCategory: async (
    categorySlug: string, 
    params?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (shouldIncludeInParams(value)) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get<PaginatedResponse<Product>>(
      `/products/category/${categorySlug}?${searchParams.toString()}`
    );
  },

  // Individual product operations
  getProduct: async (slugOrId: string): Promise<Product> => {
    return apiClient.get<Product>(`/products/${slugOrId}`);
  },

  createProduct: async (productData: ProductCreateData): Promise<Product> => {
    return apiClient.post<Product>('/products', productData);
  },

  updateProduct: async (productId: string, productData: ProductUpdateData): Promise<Product> => {
    return apiClient.put<Product>(`/products/${productId}`, productData);
  },

  deleteProduct: async (productId: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${productId}`);
  },

  // Product images
  uploadProductImages: async (
    files: File[], 
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<string[]> => {
    return uploadFiles('/products/images/upload', files, 'images', onUploadProgress);
  },

  deleteProductImage: async (imageId: string): Promise<void> => {
    return apiClient.delete<void>(`/products/images/${imageId}`);
  },

  setPrimaryImage: async (productId: string, imageId: string): Promise<void> => {
    return apiClient.patch<void>(`/products/${productId}/images/${imageId}/primary`);
  },

  reorderImages: async (productId: string, imageIds: string[]): Promise<void> => {
    return apiClient.patch<void>(`/products/${productId}/images/reorder`, { imageIds });
  },

  // Product reviews
  getProductReviews: async (
    productId: string, 
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      verifiedOnly?: boolean;
    }
  ): Promise<PaginatedResponse<Review>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (shouldIncludeInParams(value)) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get<PaginatedResponse<Review>>(
      `/products/${productId}/reviews?${searchParams.toString()}`
    );
  },

  getProductRatingStats: async (productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> => {
    return apiClient.get(`/products/${productId}/reviews/stats`);
  },

  // Categories
  getCategories: async (parentId?: string): Promise<Category[]> => {
    const params = parentId ? `?parentId=${parentId}` : '';
    return apiClient.get<Category[]>(`/categories${params}`);
  },

  getCategoryTree: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/tree');
  },

  getCategory: async (slugOrId: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${slugOrId}`);
  },

  // Search and suggestions
  getSearchSuggestions: async (query: string, limit: number = 8): Promise<SearchSuggestion[]> => {
    return apiClient.get<SearchSuggestion[]>(
      `/products/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`
    );
  },

  trackProductView: async (productId: string): Promise<void> => {
    return apiClient.post<void>(`/products/${productId}/view`);
  },

  // Seller products (for seller dashboard)
  getSellerProducts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (shouldIncludeInParams(value)) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get<PaginatedResponse<Product>>(`/seller/products?${searchParams.toString()}`);
  },

  updateProductStatus: async (productId: string, status: string): Promise<Product> => {
    return apiClient.patch<Product>(`/products/${productId}/status`, { status });
  },

  updateProductStock: async (productId: string, stockQuantity: number): Promise<Product> => {
    return apiClient.patch<Product>(`/products/${productId}/stock`, { stockQuantity });
  },

  bulkUpdateProducts: async (updates: Array<{
    productId: string;
    data: Partial<ProductUpdateData>;
  }>): Promise<Product[]> => {
    return apiClient.patch<Product[]>('/seller/products/bulk-update', { updates });
  },

  duplicateProduct: async (productId: string): Promise<Product> => {
    return apiClient.post<Product>(`/products/${productId}/duplicate`);
  },

  // Product variants (if needed in the future)
  getProductVariants: async (productId: string): Promise<Array<{
    id: string;
    name: string;
    value: string;
    price: number;
    stock: number;
    sku: string;
  }>> => {
    return apiClient.get(`/products/${productId}/variants`);
  },

  // Product comparison
  compareProducts: async (productIds: string[]): Promise<{
    products: Product[];
    comparison: Record<string, any>;
  }> => {
    return apiClient.post('/products/compare', { productIds });
  },

  // Inventory management
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    return apiClient.get<Product[]>(`/seller/products/low-stock?threshold=${threshold}`);
  },

  getOutOfStockProducts: async (): Promise<Product[]> => {
    return apiClient.get<Product[]>('/seller/products/out-of-stock');
  },

  // Product analytics (for sellers)
  getProductAnalytics: async (
    productId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      period?: 'day' | 'week' | 'month';
    }
  ): Promise<{
    views: number;
    cartAdditions: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    analytics: Array<{
      date: string;
      views: number;
      cartAdditions: number;
      orders: number;
      revenue: number;
    }>;
  }> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (shouldIncludeInParams(value)) {
          searchParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/products/${productId}/analytics?${searchParams.toString()}`);
  },
};