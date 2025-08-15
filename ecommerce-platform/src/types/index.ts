// Shared TypeScript types for the e-commerce platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'buyer' | 'seller' | 'admin' | 'super_admin';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  basePrice: number;
  wholesalePrice?: number;
  minWholesaleQuantity: number;
  stockQuantity: number;
  weight?: number;
  dimensions?: ProductDimensions;
  status: ProductStatus;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images: ProductImage[];
  category?: Category;
  seller?: User;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'out_of_stock';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod?: string;
  paymentReference?: string;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
  buyer?: User;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isWholesale: boolean;
  product?: Product;
  seller?: User;
  createdAt: Date;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UserAddress extends Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing' | 'both';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  user?: User;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  isWholesale: boolean;
  product?: Product;
  unitPrice?: number;
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  | 'review_received'
  | 'product_low_stock'
  | 'account_update'
  | 'promotion'
  | 'system_update';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and Filter Types
export interface ProductSearchParams {
  query?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  categories: Category[];
  priceRange: {
    min: number;
    max: number;
  };
  ratings: number[];
  availability: {
    inStock: number;
    outOfStock: number;
  };
}

// Dashboard Types
export interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface AdminStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form Types
export interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  shortDescription?: string;
  sku?: string;
  basePrice: number;
  wholesalePrice?: number;
  minWholesaleQuantity?: number;
  stockQuantity: number;
  weight?: number;
  dimensions?: ProductDimensions;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: File[];
}

export interface CheckoutData {
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

// State Management Types
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
}

export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  totalItems: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;