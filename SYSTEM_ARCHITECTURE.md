# E-Commerce Marketing Platform - System Architecture & Design

## Overview

This document outlines the comprehensive system architecture for a multi-vendor e-commerce platform supporting both wholesale and retail operations, similar to Alibaba Express and Jumia.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend Web  │    │   Mobile App     │    │   Admin Panel   │
│   (React/Next)  │    │   (React Native) │    │   (React/Next)  │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
          ┌────────────────────────────────────────────┐
          │              API Gateway                   │
          │           (Rate Limiting,                  │
          │            Authentication,                 │
          │             Load Balancing)                │
          └─────────────────┬──────────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
┌───▼────┐           ┌─────▼─────┐           ┌─────▼─────┐
│ Auth   │           │  Product  │           │  Order    │
│Service │           │  Service  │           │  Service  │
└────────┘           └───────────┘           └───────────┘
    │                       │                       │
┌───▼────┐           ┌─────▼─────┐           ┌─────▼─────┐
│Payment │           │  Search   │           │Analytics  │
│Service │           │  Service  │           │ Service   │
└────────┘           └───────────┘           └───────────┘
    │                       │                       │
    └───────────────────────┼───────────────────────┘
                            │
          ┌─────────────────▼──────────────────┐
          │           Database Layer           │
          │  ┌─────────────┐  ┌─────────────┐ │
          │  │ PostgreSQL  │  │    Redis    │ │
          │  │ (Primary)   │  │  (Cache)    │ │
          │  └─────────────┘  └─────────────┘ │
          │  ┌─────────────┐  ┌─────────────┐ │
          │  │Elasticsearch│  │  MinIO/S3   │ │
          │  │  (Search)   │  │  (Storage)  │ │
          │  └─────────────┘  └─────────────┘ │
          └────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for client state, React Query for server state
- **Build Tool**: Turbopack
- **TypeScript**: Full type safety
- **Testing**: Vitest, React Testing Library

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with Helmet for security
- **API**: RESTful APIs with GraphQL for complex queries
- **Authentication**: JWT with refresh tokens, OAuth 2.0
- **Validation**: Zod for schema validation
- **Documentation**: OpenAPI/Swagger

### Database & Storage
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis for sessions and frequent queries
- **Search Engine**: Elasticsearch for product search
- **File Storage**: MinIO (self-hosted) or AWS S3
- **CDN**: CloudFront or CloudFlare for asset delivery

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Database Schema Design

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'super_admin');
```

#### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    base_price DECIMAL(10,2) NOT NULL,
    wholesale_price DECIMAL(10,2),
    min_wholesale_quantity INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    weight DECIMAL(8,2),
    dimensions JSONB,
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(160),
    meta_description VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock');
```

#### Product Images Table
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    billing_address JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    is_wholesale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id, order_item_id)
);
```

#### Shopping Cart Table
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    is_wholesale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

#### Wishlist Table
```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

### Indexes for Performance
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Product indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Order indexes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Review indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Product Endpoints
- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product (sellers only)
- `DELETE /api/products/:id` - Delete product (sellers only)
- `GET /api/products/search` - Search products

### Order Endpoints
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (sellers/admin)
- `POST /api/orders/:id/cancel` - Cancel order

### Cart Endpoints
- `GET /api/cart` - Get cart items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart

### Review Endpoints
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/reviews` - Create review (verified purchases only)
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## User Roles & Permissions

### Buyer
- Browse and search products
- Add products to cart and wishlist
- Place orders and track shipments
- Leave reviews on purchased products
- Manage profile and addresses

### Seller
- Manage product catalog
- View and fulfill orders
- Access sales analytics
- Respond to customer reviews
- Manage inventory and pricing

### Admin
- Manage all users and roles
- Moderate product listings
- Handle disputes and refunds
- Access platform analytics
- Manage categories and featured products

### Super Admin
- All admin permissions
- System configuration
- Security settings
- Platform maintenance

## Security Considerations

### Authentication & Authorization
- JWT tokens with short expiry (15 minutes)
- Refresh tokens with longer expiry (7 days)
- Role-based access control (RBAC)
- Rate limiting on sensitive endpoints
- Password hashing with bcrypt (12 rounds)

### Data Protection
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with Content Security Policy
- HTTPS enforcement
- Secure cookie settings

### API Security
- CORS configuration
- Request size limits
- API versioning
- Audit logging for sensitive operations

## Scalability & Performance

### Database Optimization
- Read replicas for query distribution
- Database partitioning for large tables
- Connection pooling
- Query optimization with EXPLAIN ANALYZE

### Caching Strategy
- Redis for session data and frequent queries
- CDN for static assets
- Application-level caching for product data
- Browser caching with proper headers

### Performance Monitoring
- Application Performance Monitoring (APM)
- Database query monitoring
- Error tracking and alerting
- User experience metrics

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Project setup and infrastructure
- Database schema implementation
- Basic authentication system
- Core API endpoints

### Phase 2: Core Features (Weeks 5-8)
- Product catalog and search
- Shopping cart and checkout
- Order management system
- User dashboards

### Phase 3: Advanced Features (Weeks 9-12)
- Review and rating system
- Seller analytics dashboard
- Admin panel
- Payment integration

### Phase 4: Optimization (Weeks 13-16)
- Performance optimization
- Mobile responsiveness
- Real-time notifications
- Advanced search features

### Phase 5: Enhancement (Weeks 17-20)
- Recommendation engine
- Multi-language support
- Advanced analytics
- Third-party integrations

## Deployment Strategy

### Development Environment
- Docker Compose for local development
- Hot reloading for frontend and backend
- Automated testing pipeline

### Staging Environment
- Kubernetes cluster
- Automated deployments from develop branch
- Load testing and performance benchmarking

### Production Environment
- Multi-region deployment
- Auto-scaling based on traffic
- Database backups and disaster recovery
- Blue-green deployment strategy

## Monitoring & Maintenance

### Health Checks
- Application health endpoints
- Database connection monitoring
- External service availability
- Automated alerting

### Backup Strategy
- Daily database backups
- File storage replication
- Point-in-time recovery capability
- Regular disaster recovery testing

## Cost Optimization

### Infrastructure Costs
- Right-sizing compute resources
- Reserved instances for predictable workloads
- Automated scaling policies
- CDN optimization for bandwidth costs

### Development Efficiency
- Code reusability and modularity
- Automated testing and deployment
- Performance monitoring and optimization
- Technical debt management

This architecture provides a solid foundation for building a scalable, secure, and maintainable e-commerce platform that can handle both B2B and B2C transactions efficiently.