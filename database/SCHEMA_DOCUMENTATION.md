# Database Schema Documentation

## Overview
This document provides comprehensive documentation for the e-commerce platform database schema. The database is designed to support a multi-vendor marketplace with both B2B and B2C capabilities.

## Core Tables

### Users Table
**Purpose**: Stores user accounts for buyers, sellers, and administrators

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| phone | VARCHAR(20) | Phone number |
| role | user_role | User role enum |
| avatar_url | TEXT | Profile picture URL |
| email_verified | BOOLEAN | Email verification status |
| is_active | BOOLEAN | Account status |
| last_login | TIMESTAMP | Last login time |

**Key Features**:
- Role-based access control (buyer, seller, admin, super_admin)
- Email verification system
- Account activation/deactivation
- Automatic updated_at timestamps

### Categories Table
**Purpose**: Hierarchical product categorization system

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Category name |
| slug | VARCHAR(100) | URL-friendly identifier |
| description | TEXT | Category description |
| parent_id | UUID | Parent category reference |
| image_url | TEXT | Category image |
| is_active | BOOLEAN | Category status |
| sort_order | INTEGER | Display order |

**Key Features**:
- Unlimited nesting levels
- SEO-friendly URLs
- Built-in functions for hierarchy traversal
- Category path breadcrumb generation

### Products Table
**Purpose**: Main product catalog with wholesale support

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| seller_id | UUID | Seller reference |
| category_id | UUID | Category reference |
| name | VARCHAR(255) | Product name |
| slug | VARCHAR(255) | URL-friendly identifier |
| description | TEXT | Full product description |
| short_description | VARCHAR(500) | Brief description |
| sku | VARCHAR(100) | Stock keeping unit |
| base_price | DECIMAL(10,2) | Retail price |
| wholesale_price | DECIMAL(10,2) | Wholesale price |
| min_wholesale_quantity | INTEGER | Minimum quantity for wholesale |
| stock_quantity | INTEGER | Available inventory |
| weight | DECIMAL(8,2) | Product weight |
| dimensions | JSONB | Product dimensions |
| status | product_status | Product status |
| is_featured | BOOLEAN | Featured product flag |
| meta_title | VARCHAR(160) | SEO title |
| meta_description | VARCHAR(300) | SEO description |

**Key Features**:
- Dual pricing (retail/wholesale)
- Dynamic price calculation based on quantity
- Stock management with automatic status updates
- Full-text search support
- SEO optimization

### Product Images Table
**Purpose**: Multiple images per product with ordering

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Product reference |
| image_url | TEXT | Image URL |
| alt_text | VARCHAR(255) | Alternative text |
| sort_order | INTEGER | Display order |
| is_primary | BOOLEAN | Primary image flag |

**Key Features**:
- Multiple images per product
- Automatic primary image selection
- Ordered image galleries
- Accessibility support

### Orders Table
**Purpose**: Order management and tracking

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| buyer_id | UUID | Buyer reference |
| order_number | VARCHAR(50) | Human-readable order number |
| status | order_status | Order status |
| payment_status | payment_status | Payment status |
| total_amount | DECIMAL(10,2) | Order total |
| shipping_amount | DECIMAL(10,2) | Shipping cost |
| tax_amount | DECIMAL(10,2) | Tax amount |
| discount_amount | DECIMAL(10,2) | Discount applied |
| billing_address | JSONB | Billing address |
| shipping_address | JSONB | Shipping address |
| payment_method | VARCHAR(50) | Payment method |
| payment_reference | VARCHAR(100) | Payment reference |
| tracking_number | VARCHAR(100) | Shipment tracking |
| notes | TEXT | Order notes |

**Key Features**:
- Automatic order number generation
- Multi-seller order support
- Complete order lifecycle tracking
- Flexible address storage
- Order history and analytics

### Order Items Table
**Purpose**: Individual items within orders

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Order reference |
| product_id | UUID | Product reference |
| seller_id | UUID | Seller reference |
| quantity | INTEGER | Item quantity |
| unit_price | DECIMAL(10,2) | Price per unit |
| total_price | DECIMAL(10,2) | Line total |
| is_wholesale | BOOLEAN | Wholesale pricing flag |

**Key Features**:
- Multi-vendor order support
- Wholesale pricing tracking
- Price consistency validation
- Seller-specific order views

### Reviews Table
**Purpose**: Product reviews and ratings

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Product reference |
| user_id | UUID | Reviewer reference |
| order_item_id | UUID | Purchase verification |
| rating | INTEGER | Rating (1-5) |
| title | VARCHAR(200) | Review title |
| comment | TEXT | Review content |
| is_verified | BOOLEAN | Verified purchase flag |
| is_approved | BOOLEAN | Moderation status |
| helpful_count | INTEGER | Helpfulness votes |

**Key Features**:
- Verified purchase reviews
- Rating aggregation
- Review moderation
- Helpfulness voting system
- Review analytics

### Cart Items Table
**Purpose**: Shopping cart functionality

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| product_id | UUID | Product reference |
| quantity | INTEGER | Item quantity |
| is_wholesale | BOOLEAN | Wholesale pricing flag |

**Key Features**:
- Persistent cart storage
- Wholesale pricing support
- Cart total calculations
- Stock availability checking

### Wishlist Items Table
**Purpose**: User wishlist functionality

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| product_id | UUID | Product reference |

**Key Features**:
- Save products for later
- Move to cart functionality
- Wishlist sharing (future)

## Supporting Tables

### User Addresses
- Multiple addresses per user
- Shipping and billing types
- Default address management

### User Sessions
- JWT token management
- Device tracking
- Session expiration

### Notifications
- System notifications
- Read/unread status
- Multiple notification types

### Product Analytics
- Daily product metrics
- View tracking
- Conversion analytics

### Search Queries
- Search analytics
- Query optimization
- Result tracking

### Coupons
- Discount management
- Usage tracking
- Expiration handling

### Review Votes
- Review helpfulness
- Vote tracking
- Helpful count maintenance

## Enums

### user_role
- `buyer`: Regular customers
- `seller`: Product vendors
- `admin`: Platform administrators
- `super_admin`: System administrators

### product_status
- `draft`: Unpublished products
- `active`: Available for purchase
- `inactive`: Temporarily unavailable
- `out_of_stock`: No inventory available

### order_status
- `pending`: Order placed, awaiting confirmation
- `confirmed`: Order confirmed by seller
- `processing`: Order being prepared
- `shipped`: Order dispatched
- `delivered`: Order received by customer
- `cancelled`: Order cancelled
- `refunded`: Order refunded

### payment_status
- `pending`: Payment not yet processed
- `paid`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded
- `partially_refunded`: Partial refund issued

## Key Functions

### Price Management
- `get_product_price(UUID, INTEGER)`: Calculate price based on quantity
- `validate_coupon(VARCHAR, DECIMAL)`: Validate and calculate discount

### Inventory Management
- `check_stock_availability(UUID, INTEGER)`: Check stock availability
- `update_product_stock(UUID, INTEGER)`: Update stock levels

### Search & Analytics
- `search_products()`: Advanced product search with filters
- `get_search_suggestions()`: Search autocomplete
- `track_product_view()`: Analytics tracking

### Order Management
- `generate_order_number()`: Unique order number generation
- `calculate_order_totals()`: Order total calculations
- `get_seller_orders()`: Seller-specific order views

### Category Management
- `get_category_hierarchy()`: Category tree traversal
- `get_category_path()`: Breadcrumb generation

## Indexes and Performance

### Primary Indexes
- All primary keys (UUID)
- Foreign key relationships
- Unique constraints

### Search Indexes
- Full-text search on products and categories
- GIN indexes for JSONB columns
- Partial indexes for active records

### Performance Indexes
- Composite indexes for common queries
- Expression indexes for case-insensitive searches
- Date-based indexes for analytics

## Views and Materialized Views

### Product Catalog (Materialized)
- Optimized product listings
- Pre-calculated ratings and reviews
- Fast search and filtering

### Seller Dashboard Stats
- Product statistics per seller
- Rating summaries
- Stock alerts

### Admin Analytics Summary
- Platform-wide statistics
- Revenue tracking
- User metrics

## Security Features

### Data Protection
- Password hashing with bcrypt
- Email format validation
- Phone number validation
- Address validation

### Access Control
- Role-based permissions
- User session management
- Account activation controls

### Data Integrity
- Foreign key constraints
- Check constraints for business rules
- Trigger-based validation

## Maintenance

### Automated Cleanup
- `clean_expired_sessions()`: Remove expired sessions
- `perform_database_maintenance()`: Complete maintenance routine

### Analytics Updates
- Daily analytics aggregation
- Materialized view refreshing
- Search index optimization

## Scaling Considerations

### Horizontal Scaling
- Read replicas for query distribution
- Database sharding strategies
- Connection pooling

### Performance Optimization
- Query optimization with EXPLAIN ANALYZE
- Index maintenance
- Table partitioning for large datasets

### Caching Strategy
- Redis for session data
- Application-level caching
- CDN for static assets

This schema provides a solid foundation for a scalable e-commerce platform supporting both B2B and B2C operations with comprehensive features for product management, order processing, user management, and analytics.