// Application constants and configuration

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const API_VERSION = 'v1';

// Authentication
export const TOKEN_STORAGE_KEY = 'auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
export const USER_STORAGE_KEY = 'user_data';
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PRODUCTS_PER_PAGE = 24;
export const REVIEWS_PER_PAGE = 10;
export const ORDERS_PER_PAGE = 15;

// Product Configuration
export const MAX_PRODUCT_IMAGES = 8;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MIN_PRODUCT_PRICE = 0.01;
export const MAX_PRODUCT_PRICE = 999999.99;
export const MIN_WHOLESALE_QUANTITY = 1;
export const MAX_WHOLESALE_QUANTITY = 10000;

// Search Configuration
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const MAX_SEARCH_SUGGESTIONS = 8;
export const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

// Cart Configuration
export const MAX_CART_ITEMS = 100;
export const CART_STORAGE_KEY = 'cart_items';
export const WISHLIST_STORAGE_KEY = 'wishlist_items';

// Order Configuration
export const ORDER_NUMBER_PREFIX = new Date().getFullYear().toString();
export const MAX_ORDER_NOTES_LENGTH = 500;

// Rating Configuration
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_REVIEW_TITLE_LENGTH = 200;
export const MAX_REVIEW_COMMENT_LENGTH = 2000;

// User Roles
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// Product Status
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_RECEIVED: 'review_received',
  PRODUCT_LOW_STOCK: 'product_low_stock',
  ACCOUNT_UPDATE: 'account_update',
  PROMOTION: 'promotion',
  SYSTEM_UPDATE: 'system_update'
} as const;

// Address Types
export const ADDRESS_TYPES = {
  SHIPPING: 'shipping',
  BILLING: 'billing',
  BOTH: 'both'
} as const;

// Currency Configuration
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';
export const CURRENCY_DECIMAL_PLACES = 2;

// Countries (commonly used)
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' }
];

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'debit_card', name: 'Debit Card', icon: 'CreditCard' },
  { id: 'paypal', name: 'PayPal', icon: 'Wallet' },
  { id: 'apple_pay', name: 'Apple Pay', icon: 'Smartphone' },
  { id: 'google_pay', name: 'Google Pay', icon: 'Smartphone' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'Building2' }
];

// Shipping Methods
export const SHIPPING_METHODS = [
  { 
    id: 'standard', 
    name: 'Standard Shipping', 
    description: '5-7 business days',
    basePrice: 9.99 
  },
  { 
    id: 'express', 
    name: 'Express Shipping', 
    description: '2-3 business days',
    basePrice: 19.99 
  },
  { 
    id: 'overnight', 
    name: 'Overnight Shipping', 
    description: 'Next business day',
    basePrice: 39.99 
  },
  { 
    id: 'free', 
    name: 'Free Shipping', 
    description: '7-10 business days',
    basePrice: 0,
    minimumAmount: 75 
  }
];

// Sort Options
export const PRODUCT_SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name: A to Z' }
];

// Filter Options
export const RATING_FILTERS = [
  { value: 5, label: '5 stars', count: 0 },
  { value: 4, label: '4 stars & up', count: 0 },
  { value: 3, label: '3 stars & up', count: 0 },
  { value: 2, label: '2 stars & up', count: 0 },
  { value: 1, label: '1 star & up', count: 0 }
];

// UI Configuration
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;
export const DESKTOP_BREAKPOINT = 1280;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Theme Configuration
export const THEME_STORAGE_KEY = 'theme-preference';
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED: 'Product added successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ADDRESS_SAVED: 'Address saved successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  ITEM_ADDED_TO_WISHLIST: 'Item added to wishlist!',
  COUPON_APPLIED: 'Coupon applied successfully!',
  EMAIL_SENT: 'Email sent successfully!'
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 5000,
  SKU_MAX_LENGTH: 100,
  POSTAL_CODE_REGEX: /^[A-Za-z0-9\s-]+$/
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_WISHLIST: true,
  ENABLE_REVIEWS: true,
  ENABLE_WHOLESALE: true,
  ENABLE_COUPONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_MULTI_CURRENCY: false,
  ENABLE_LIVE_CHAT: false
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/ecommerce-platform',
  TWITTER: 'https://twitter.com/ecommerce-platform',
  INSTAGRAM: 'https://instagram.com/ecommerce-platform',
  LINKEDIN: 'https://linkedin.com/company/ecommerce-platform'
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'support@ecommerce-platform.com',
  PHONE: '+1 (555) 123-4567',
  ADDRESS: '123 Commerce Street, Business City, BC 12345, Country'
};

// SEO Configuration
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'E-Commerce Platform - Buy & Sell Wholesale & Retail',
  DEFAULT_DESCRIPTION: 'Multi-vendor e-commerce platform supporting both wholesale and retail operations',
  DEFAULT_KEYWORDS: 'e-commerce, wholesale, retail, marketplace, buy, sell, products',
  SITE_NAME: 'E-Commerce Platform',
  TWITTER_HANDLE: '@ecommerce-platform'
};