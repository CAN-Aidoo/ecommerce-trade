// Wishlist store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItem, Product, WishlistState } from '@/types';
import { WISHLIST_STORAGE_KEY } from '@/constants';

interface WishlistStore extends WishlistState {
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  setLoading: (isLoading: boolean) => void;
  syncWithServer: (serverItems: WishlistItem[]) => void;
  toggleItem: (product: Product) => void;
  // Computed properties
  isItemInWishlist: (productId: string) => boolean;
  getItemByProductId: (productId: string) => WishlistItem | undefined;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  totalItems: 0,
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (product: Product) => {
        const state = get();
        const existingItem = state.items.find(item => item.productId === product.id);

        if (existingItem) {
          // Item already in wishlist, don't add duplicate
          return;
        }

        const newItem: WishlistItem = {
          id: `${product.id}-${Date.now()}`,
          userId: '', // Will be set when user is logged in
          productId: product.id,
          product,
          createdAt: new Date(),
        };

        const updatedItems = [...state.items, newItem];

        set({
          items: updatedItems,
          totalItems: updatedItems.length,
        });
      },

      removeItem: (productId: string) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.productId !== productId);

        set({
          items: updatedItems,
          totalItems: updatedItems.length,
        });
      },

      clearWishlist: () => {
        set({
          items: [],
          totalItems: 0,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      syncWithServer: (serverItems: WishlistItem[]) => {
        set({
          items: serverItems,
          totalItems: serverItems.length,
          isLoading: false,
        });
      },

      toggleItem: (product: Product) => {
        const state = get();
        const existingItem = state.items.find(item => item.productId === product.id);

        if (existingItem) {
          // Remove from wishlist
          state.removeItem(product.id);
        } else {
          // Add to wishlist
          state.addItem(product);
        }
      },

      // Computed properties
      isItemInWishlist: (productId: string) => {
        return get().items.some(item => item.productId === productId);
      },

      getItemByProductId: (productId: string) => {
        return get().items.find(item => item.productId === productId);
      },
    }),
    {
      name: WISHLIST_STORAGE_KEY,
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
export const useWishlistItems = () => useWishlistStore((state) => state.items);
export const useWishlistLoading = () => useWishlistStore((state) => state.isLoading);
export const useWishlistTotalItems = () => useWishlistStore((state) => state.totalItems);
export const useIsInWishlist = (productId: string) => 
  useWishlistStore((state) => state.isItemInWishlist(productId));

// Helper functions
export const isItemInWishlist = (productId: string): boolean => {
  return useWishlistStore.getState().isItemInWishlist(productId);
};

export const getWishlistItemsCount = (): number => {
  return useWishlistStore.getState().totalItems;
};

export const toggleWishlistItem = (product: Product): void => {
  useWishlistStore.getState().toggleItem(product);
};