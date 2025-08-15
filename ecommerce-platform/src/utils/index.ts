// Utility functions for the e-commerce platform

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CURRENCY_SYMBOL,
  CURRENCY_DECIMAL_PLACES,
  VALIDATION_RULES,
  DEFAULT_CURRENCY
} from "@/constants";
import type { Product, CartItem, Address } from "@/types";

// Class name utility (from shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: CURRENCY_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_DECIMAL_PLACES
  }).format(amount);
}

// Simple currency formatting with symbol
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(CURRENCY_DECIMAL_PLACES)}`;
}

// Number formatting
export function formatNumber(
  num: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', options).format(num);
}

// Date formatting
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    }
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateObj, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSKU(productName: string, category?: string): string {
  const nameAbbr = productName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  const categoryAbbr = category 
    ? category.substring(0, 3).toUpperCase()
    : 'GEN';
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${categoryAbbr}-${nameAbbr}-${randomNum}`;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
}

export function isValidPostalCode(postalCode: string): boolean {
  return VALIDATION_RULES.POSTAL_CODE_REGEX.test(postalCode);
}

// Product utilities
export function getProductPrice(product: Product, quantity: number = 1): number {
  if (product.wholesalePrice && quantity >= product.minWholesaleQuantity) {
    return product.wholesalePrice;
  }
  return product.basePrice;
}

export function calculateProductTotal(product: Product, quantity: number): number {
  return getProductPrice(product, quantity) * quantity;
}

export function isProductInStock(product: Product, quantity: number = 1): boolean {
  return product.stockQuantity >= quantity;
}

export function getProductAvailabilityText(product: Product): string {
  if (product.status !== 'active') {
    return 'Unavailable';
  }
  
  if (product.stockQuantity === 0) {
    return 'Out of stock';
  }
  
  if (product.stockQuantity <= 10) {
    return `Only ${product.stockQuantity} left`;
  }
  
  return 'In stock';
}

export function getProductDiscountPercentage(product: Product, quantity: number = 1): number {
  if (!product.wholesalePrice || quantity < product.minWholesaleQuantity) {
    return 0;
  }
  
  const discount = ((product.basePrice - product.wholesalePrice) / product.basePrice) * 100;
  return Math.round(discount);
}

// Cart utilities
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.product ? getProductPrice(item.product, item.quantity) : 0;
    return total + (price * item.quantity);
  }, 0);
}

export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function groupCartItemsBySeller(items: CartItem[]): Record<string, CartItem[]> {
  return items.reduce((groups, item) => {
    if (!item.product?.sellerId) return groups;
    
    const sellerId = item.product.sellerId;
    if (!groups[sellerId]) {
      groups[sellerId] = [];
    }
    groups[sellerId].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);
}

// Address utilities
export function formatAddress(address: Address): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.stateProvince,
    address.postalCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
}

export function isSameAddress(addr1: Address, addr2: Address): boolean {
  return (
    addr1.firstName === addr2.firstName &&
    addr1.lastName === addr2.lastName &&
    addr1.addressLine1 === addr2.addressLine1 &&
    addr1.addressLine2 === addr2.addressLine2 &&
    addr1.city === addr2.city &&
    addr1.stateProvince === addr2.stateProvince &&
    addr1.postalCode === addr2.postalCode &&
    addr1.country === addr2.country
  );
}

// Rating utilities
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
}

export function getRatingDistribution(ratings: number[]): Record<number, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution]++;
    }
  });
  return distribution;
}

export function generateStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}

// URL utilities
export function buildProductUrl(slug: string): string {
  return `/products/${slug}`;
}

export function buildCategoryUrl(slug: string): string {
  return `/categories/${slug}`;
}

export function buildSearchUrl(query: string, filters?: Record<string, any>): string {
  const params = new URLSearchParams({ q: query });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  return `/search?${params.toString()}`;
}

// File utilities
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth / aspectRatio;
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

// Local storage utilities
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Color utilities
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Network Error') ||
    error.message.includes('fetch')
  );
}

// Random utilities
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${year}-${randomNum}`;
}

// Platform detection
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop(): boolean {
  return window.innerWidth >= 1024;
}