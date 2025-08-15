import { useState, useEffect } from 'react';
import { productsService } from '@/services/products';
import type { Product, ProductSearchParams } from '@/types';

interface UseProductsParams {
  featured?: boolean;
  limit?: number;
  categoryId?: string;
  query?: string;
}

interface UseProductsReturn {
  data: Product[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(params: UseProductsParams = {}): UseProductsReturn {
  const [data, setData] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, return mock data since we don't have the backend running
      const mockProducts: Product[] = [
        {
          id: '1',
          sellerId: 'seller1',
          categoryId: 'cat1',
          name: 'Premium Wireless Headphones',
          slug: 'premium-wireless-headphones',
          description: 'High-quality noise-cancelling headphones with premium sound',
          sku: 'AM-WH-001',
          basePrice: 199.99,
          wholesalePrice: 149.99,
          minWholesaleQuantity: 10,
          stockQuantity: 150,
          weight: 0.3,
          dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img1',
              productId: '1',
              imageUrl: '/images/electronics-category.jpg',
              altText: 'Wireless Headphones',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.8,
          totalReviews: 234,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          sellerId: 'seller2',
          categoryId: 'cat2',
          name: 'Modern Office Chair',
          slug: 'modern-office-chair',
          description: 'Ergonomic office chair with lumbar support and premium materials',
          sku: 'EM-OC-002',
          basePrice: 299.99,
          wholesalePrice: 225.99,
          minWholesaleQuantity: 5,
          stockQuantity: 45,
          weight: 15.5,
          dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img2',
              productId: '2',
              imageUrl: '/images/furniture-category.jpg',
              altText: 'Office Chair',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.6,
          totalReviews: 89,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          sellerId: 'seller3',
          categoryId: 'cat1',
          name: 'Smart Fitness Tracker',
          slug: 'smart-fitness-tracker',
          description: 'Advanced fitness tracker with heart rate monitoring and GPS',
          sku: 'FT-ST-003',
          basePrice: 149.99,
          wholesalePrice: 119.99,
          minWholesaleQuantity: 20,
          stockQuantity: 200,
          weight: 0.05,
          dimensions: { length: 4, width: 3, height: 1, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img3',
              productId: '3',
              imageUrl: '/images/electronics-category.jpg',
              altText: 'Fitness Tracker',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.7,
          totalReviews: 156,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          sellerId: 'seller4',
          categoryId: 'cat3',
          name: 'Premium Coffee Maker',
          slug: 'premium-coffee-maker',
          description: 'Professional-grade coffee maker with multiple brewing options',
          sku: 'BM-CM-004',
          basePrice: 249.99,
          wholesalePrice: 189.99,
          minWholesaleQuantity: 8,
          stockQuantity: 75,
          weight: 5.2,
          dimensions: { length: 35, width: 25, height: 40, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img4',
              productId: '4',
              imageUrl: '/images/furniture-category.jpg',
              altText: 'Coffee Maker',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.9,
          totalReviews: 342,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          sellerId: 'seller5',
          categoryId: 'cat4',
          name: 'Designer Backpack',
          slug: 'designer-backpack',
          description: 'Stylish and functional backpack with laptop compartment',
          sku: 'UC-BP-005',
          basePrice: 89.99,
          wholesalePrice: 67.99,
          minWholesaleQuantity: 15,
          stockQuantity: 120,
          weight: 1.2,
          dimensions: { length: 45, width: 30, height: 15, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img5',
              productId: '5',
              imageUrl: '/images/electronics-category.jpg',
              altText: 'Designer Backpack',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.5,
          totalReviews: 78,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6',
          sellerId: 'seller1',
          categoryId: 'cat1',
          name: 'Wireless Charging Pad',
          slug: 'wireless-charging-pad',
          description: 'Fast wireless charging pad compatible with all Qi devices',
          sku: 'CF-WC-006',
          basePrice: 39.99,
          wholesalePrice: 29.99,
          minWholesaleQuantity: 25,
          stockQuantity: 300,
          weight: 0.2,
          dimensions: { length: 10, width: 10, height: 1, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img6',
              productId: '6',
              imageUrl: '/images/electronics-category.jpg',
              altText: 'Wireless Charging Pad',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.4,
          totalReviews: 67,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '7',
          sellerId: 'seller6',
          categoryId: 'cat3',
          name: 'Luxury Bedding Set',
          slug: 'luxury-bedding-set',
          description: 'Premium cotton bedding set with elegant design',
          sku: 'CL-BS-007',
          basePrice: 179.99,
          wholesalePrice: 134.99,
          minWholesaleQuantity: 6,
          stockQuantity: 60,
          weight: 2.5,
          dimensions: { length: 50, width: 40, height: 10, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img7',
              productId: '7',
              imageUrl: '/images/furniture-category.jpg',
              altText: 'Luxury Bedding Set',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.8,
          totalReviews: 123,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '8',
          sellerId: 'seller7',
          categoryId: 'cat1',
          name: 'Professional Camera Lens',
          slug: 'professional-camera-lens',
          description: 'High-quality camera lens for professional photography',
          sku: 'LM-CL-008',
          basePrice: 599.99,
          wholesalePrice: 449.99,
          minWholesaleQuantity: 3,
          stockQuantity: 25,
          weight: 0.8,
          dimensions: { length: 12, width: 8, height: 8, unit: 'cm' },
          status: 'active',
          isFeatured: true,
          images: [
            {
              id: 'img8',
              productId: '8',
              imageUrl: '/images/electronics-category.jpg',
              altText: 'Camera Lens',
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date()
            }
          ],
          averageRating: 4.9,
          totalReviews: 45,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Filter based on params
      let filteredProducts = mockProducts;
      
      if (params.featured) {
        filteredProducts = filteredProducts.filter(p => p.isFeatured);
      }
      
      if (params.categoryId) {
        filteredProducts = filteredProducts.filter(p => 
          p.categoryId === params.categoryId
        );
      }
      
      if (params.query) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          p.description.toLowerCase().includes(params.query!.toLowerCase())
        );
      }
      
      if (params.limit) {
        filteredProducts = filteredProducts.slice(0, params.limit);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setData(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProducts
  };
}

