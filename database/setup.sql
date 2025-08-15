-- Complete Database Setup Script
-- E-Commerce Platform Database
-- This script sets up the complete database schema and initial data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Run all migrations in order
\i migrations/001_create_users_table.sql
\i migrations/002_create_categories_table.sql
\i migrations/003_create_products_table.sql
\i migrations/004_create_product_images_table.sql
\i migrations/005_create_orders_tables.sql
\i migrations/006_create_reviews_table.sql
\i migrations/007_create_cart_wishlist_tables.sql
\i migrations/008_create_supporting_tables.sql
\i migrations/009_create_indexes_and_constraints.sql

-- Run seeds
\i seeds/001_seed_initial_data.sql

-- Final verification
SELECT 'Database setup completed successfully!' as status;
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;