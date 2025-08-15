// Shopping cart store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, CartState } from '@/types';
import { CART_STORAGE_KEY, MAX_CART_ITEMS } from '@/constants';
import { 
  calculateCartTotal, 
  calculateCartItemCount,
  getProductPrice 
} from '@/utils';

interface CartStore extends CartState {
  // Actions
  addItem: (product: Product, quantity?: number, isWholesale?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (isLoading: boolean) => void;
  syncWithServer: (serverItems: CartItem[]) => void;
  // Computed properties
  getTotalAmount: () => number;
  getTotalItems: () => number;
  getItemByProductId: (productId: string) => CartItem | undefined;
  canAddItem: (quantity?: number) => boolean;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  totalItems: 0,
  totalAmount: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (product: Product, quantity = 1, isWholesale = false) => {
        const state = get();
        const existingItem = state.items.find(item => item.productId === product.id);

        // Check if we can add more items
        const currentTotalItems = state.totalItems;
        const additionalItems = existingItem ? quantity : quantity;
        
        if (currentTotalItems + additionalItems > MAX_CART_ITEMS) {
          throw new Error(`Cannot add more than ${MAX_CART_ITEMS} items to cart`);
        }

        // Check stock availability
        const requestedQuantity = existingItem 
          ? existingItem.quantity + quantity 
          : quantity;
        
        if (product.stockQuantity < requestedQuantity) {
          throw new Error(`Only ${product.stockQuantity} items available in stock`);
        }

        // Validate wholesale pricing
        if (isWholesale && (!product.wholesalePrice || requestedQuantity < product.minWholesaleQuantity)) {
          throw new Error(`Minimum quantity of ${product.minWholesaleQuantity} required for wholesale pricing`);
        }

        let updatedItems: CartItem[];

        if (existingItem) {
          // Update existing item
          updatedItems = state.items.map(item =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  isWholesale,
                  updatedAt: new Date(),
                }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            userId: '', // Will be set when user is logged in
            productId: product.id,
            quantity,
            isWholesale,
            product,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          updatedItems = [...state.items, newItem];
        }

        // Calculate totals
        const totalItems = calculateCartItemCount(updatedItems);
        const totalAmount = calculateCartTotal(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      removeItem: (productId: string) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.productId !== productId);
        
        const totalItems = calculateCartItemCount(updatedItems);
        const totalAmount = calculateCartTotal(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const state = get();
        const item = state.items.find(item => item.productId === productId);
        
        if (!item || !item.product) return;

        // Check stock availability
        if (item.product.stockQuantity < quantity) {
          throw new Error(`Only ${item.product.stockQuantity} items available in stock`);
        }

        // Validate wholesale pricing
        if (item.isWholesale && quantity < item.product.minWholesaleQuantity) {
          throw new Error(`Minimum quantity of ${item.product.minWholesaleQuantity} required for wholesale pricing`);
        }

        const updatedItems = state.items.map(cartItem =>
          cartItem.productId === productId
            ? {
                ...cartItem,
                quantity,
                updatedAt: new Date(),
              }
            : cartItem
        );

        const totalItems = calculateCartItemCount(updatedItems);
        const totalAmount = calculateCartTotal(updatedItems);

        set({
          items: updatedItems,
          totalItems,
          totalAmount,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      syncWithServer: (serverItems: CartItem[]) => {
        const totalItems = calculateCartItemCount(serverItems);
        const totalAmount = calculateCartTotal(serverItems);

        set({
          items: serverItems,
          totalItems,
          totalAmount,
          isLoading: false,
        });
      },

      // Computed properties
      getTotalAmount: () => {
        return calculateCartTotal(get().items);
      },

      getTotalItems: () => {
        return calculateCartItemCount(get().items);
      },

      getItemByProductId: (productId: string) => {
        return get().items.find(item => item.productId === productId);
      },

      canAddItem: (quantity = 1) => {
        const currentTotalItems = get().totalItems;
        return currentTotalItems + quantity <= MAX_CART_ITEMS;
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items.map(item => ({
          ...item,
          // Don't persist the full product object to reduce storage size
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            basePrice: item.product.basePrice,
            wholesalePrice: item.product.wholesalePrice,
            minWholesaleQuantity: item.product.minWholesaleQuantity,
            stockQuantity: item.product.stockQuantity,
            status: item.product.status,
            images: item.product.images.slice(0, 1), // Only keep primary image
          } : undefined,
        })),
      }),
    }
  )
);

// Selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartTotalItems = () => useCartStore((state) => state.totalItems);
export const useCartTotalAmount = () => useCartStore((state) => state.totalAmount);
export const useCartItemCount = (productId: string) => 
  useCartStore((state) => {
    const item = state.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  });

// Helper functions
export const isItemInCart = (productId: string): boolean => {
  return useCartStore.getState().items.some(item => item.productId === productId);
};

export const getCartItemsCount = (): number => {
  return useCartStore.getState().totalItems;
};

export const getCartTotal = (): number => {
  return useCartStore.getState().totalAmount;
};