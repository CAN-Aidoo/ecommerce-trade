-- Seed Data: Initial data for development and testing
-- Created: 2025-01-XX
-- Description: Populate database with sample data for testing

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, parent_id, is_active, sort_order) VALUES
-- Top-level categories
('550e8400-e29b-41d4-a716-446655440001', 'Electronics', 'electronics', 'Electronic devices and accessories', NULL, TRUE, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Clothing', 'clothing', 'Fashion and apparel', NULL, TRUE, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL, TRUE, 3),
('550e8400-e29b-41d4-a716-446655440004', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL, TRUE, 4),
('550e8400-e29b-41d4-a716-446655440005', 'Health & Beauty', 'health-beauty', 'Health, beauty, and personal care products', NULL, TRUE, 5),

-- Electronics subcategories
('550e8400-e29b-41d4-a716-446655440011', 'Smartphones', 'smartphones', 'Mobile phones and accessories', '550e8400-e29b-41d4-a716-446655440001', TRUE, 1),
('550e8400-e29b-41d4-a716-446655440012', 'Laptops', 'laptops', 'Laptop computers and accessories', '550e8400-e29b-41d4-a716-446655440001', TRUE, 2),
('550e8400-e29b-41d4-a716-446655440013', 'Audio & Video', 'audio-video', 'Audio and video equipment', '550e8400-e29b-41d4-a716-446655440001', TRUE, 3),

-- Clothing subcategories
('550e8400-e29b-41d4-a716-446655440021', 'Men''s Clothing', 'mens-clothing', 'Clothing for men', '550e8400-e29b-41d4-a716-446655440002', TRUE, 1),
('550e8400-e29b-41d4-a716-446655440022', 'Women''s Clothing', 'womens-clothing', 'Clothing for women', '550e8400-e29b-41d4-a716-446655440002', TRUE, 2),
('550e8400-e29b-41d4-a716-446655440023', 'Shoes', 'shoes', 'Footwear for all', '550e8400-e29b-41d4-a716-446655440002', TRUE, 3),

-- Home & Garden subcategories
('550e8400-e29b-41d4-a716-446655440031', 'Furniture', 'furniture', 'Home and office furniture', '550e8400-e29b-41d4-a716-446655440003', TRUE, 1),
('550e8400-e29b-41d4-a716-446655440032', 'Kitchen & Dining', 'kitchen-dining', 'Kitchen appliances and dining accessories', '550e8400-e29b-41d4-a716-446655440003', TRUE, 2),
('550e8400-e29b-41d4-a716-446655440033', 'Garden Tools', 'garden-tools', 'Tools and equipment for gardening', '550e8400-e29b-41d4-a716-446655440003', TRUE, 3);

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, email_verified, is_active) VALUES
-- Admin users
('660e8400-e29b-41d4-a716-446655440001', 'admin@ecommerce.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'Admin', 'User', '+1234567890', 'admin', TRUE, TRUE),

-- Seller users
('660e8400-e29b-41d4-a716-446655440011', 'seller1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'TechStore', 'Electronics', '+1234567891', 'seller', TRUE, TRUE),
('660e8400-e29b-41d4-a716-446655440012', 'seller2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'Fashion', 'World', '+1234567892', 'seller', TRUE, TRUE),
('660e8400-e29b-41d4-a716-446655440013', 'seller3@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'Home', 'Solutions', '+1234567893', 'seller', TRUE, TRUE),

-- Buyer users
('660e8400-e29b-41d4-a716-446655440021', 'buyer1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'John', 'Doe', '+1234567894', 'buyer', TRUE, TRUE),
('660e8400-e29b-41d4-a716-446655440022', 'buyer2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'Jane', 'Smith', '+1234567895', 'buyer', TRUE, TRUE),
('660e8400-e29b-41d4-a716-446655440023', 'buyer3@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewR8Y/6x2/2XK2Z.', 'Bob', 'Johnson', '+1234567896', 'buyer', TRUE, TRUE);

-- Insert sample products
INSERT INTO products (id, seller_id, category_id, name, slug, description, short_description, sku, base_price, wholesale_price, min_wholesale_quantity, stock_quantity, status, is_featured, meta_title, meta_description) VALUES
-- Electronics products
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Latest iPhone with Pro camera system and titanium design. Features A17 Pro chip, action button, and USB-C connectivity.', 'Latest iPhone with Pro camera and titanium design', 'IP15PM-256-TIT', 1199.00, 1050.00, 10, 50, 'active', TRUE, 'iPhone 15 Pro Max - Latest Apple Smartphone', 'Buy the latest iPhone 15 Pro Max with Pro camera system, A17 Pro chip, and titanium design'),

('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', 'MacBook Pro 14-inch', 'macbook-pro-14-inch', 'Powerful MacBook Pro with M3 chip, 14-inch Liquid Retina XDR display, and all-day battery life. Perfect for creative professionals.', 'MacBook Pro with M3 chip and XDR display', 'MBP14-M3-512-SG', 1999.00, 1800.00, 5, 25, 'active', TRUE, 'MacBook Pro 14-inch with M3 Chip', 'Professional laptop with M3 chip, XDR display, and all-day battery life'),

('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440013', 'AirPods Pro 2nd Generation', 'airpods-pro-2nd-generation', 'Premium wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case. Up to 6 hours of listening time.', 'Premium wireless earbuds with noise cancellation', 'APP2-USB-C-WHT', 249.00, 220.00, 20, 100, 'active', FALSE, 'AirPods Pro 2nd Generation - Premium Earbuds', 'Wireless earbuds with active noise cancellation and spatial audio'),

-- Fashion products
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440021', 'Premium Cotton T-Shirt', 'premium-cotton-t-shirt', 'High-quality 100% organic cotton t-shirt with comfortable fit. Available in multiple colors and sizes. Perfect for casual wear.', '100% organic cotton t-shirt, comfortable fit', 'TSHIRT-ORG-CTN-M', 29.99, 24.99, 50, 200, 'active', FALSE, 'Premium Organic Cotton T-Shirt', 'Comfortable organic cotton t-shirt in various colors and sizes'),

('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440022', 'Designer Summer Dress', 'designer-summer-dress', 'Elegant summer dress made from breathable fabric. Features floral print, midi length, and comfortable fit. Perfect for summer occasions.', 'Elegant floral summer dress, midi length', 'DRESS-SUM-FLR-M', 89.99, 75.99, 25, 75, 'active', TRUE, 'Designer Summer Dress - Elegant Floral Print', 'Beautiful summer dress with floral print, perfect for summer occasions'),

('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440023', 'Running Shoes Pro', 'running-shoes-pro', 'Professional running shoes with advanced cushioning technology. Lightweight, breathable, and durable for long-distance running.', 'Professional running shoes with advanced cushioning', 'SHOES-RUN-PRO-42', 149.99, 129.99, 15, 60, 'active', FALSE, 'Professional Running Shoes with Advanced Cushioning', 'High-performance running shoes for serious runners'),

-- Home & Garden products
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440031', 'Ergonomic Office Chair', 'ergonomic-office-chair', 'Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Designed for all-day comfort.', 'Premium ergonomic chair with lumbar support', 'CHAIR-ERG-MESH-BLK', 299.99, 259.99, 10, 30, 'active', TRUE, 'Ergonomic Office Chair with Lumbar Support', 'Comfortable office chair with ergonomic design and lumbar support'),

('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440032', 'Stainless Steel Cookware Set', 'stainless-steel-cookware-set', 'Professional 12-piece stainless steel cookware set. Includes pots, pans, and lids. Dishwasher safe and compatible with all cooktops.', '12-piece professional cookware set', 'COOKWARE-12PC-SS', 199.99, 169.99, 8, 20, 'active', FALSE, 'Professional Stainless Steel Cookware Set', '12-piece stainless steel cookware set for professional cooking'),

('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440033', 'Electric Lawn Mower', 'electric-lawn-mower', 'Eco-friendly electric lawn mower with 40cm cutting width. Lightweight, quiet operation, and easy to maneuver. Perfect for small to medium lawns.', 'Eco-friendly electric mower, 40cm cutting width', 'MOWER-ELEC-40CM', 299.99, 269.99, 5, 15, 'active', FALSE, 'Electric Lawn Mower - Eco-Friendly 40cm', 'Lightweight electric lawn mower perfect for small to medium lawns');

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
-- iPhone images
('770e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/iphone-15-pro-max-1.jpg', 'iPhone 15 Pro Max front view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/iphone-15-pro-max-2.jpg', 'iPhone 15 Pro Max back view', 1, FALSE),
('770e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/iphone-15-pro-max-3.jpg', 'iPhone 15 Pro Max side view', 2, FALSE),

-- MacBook images
('770e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/macbook-pro-14-1.jpg', 'MacBook Pro 14-inch open view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/macbook-pro-14-2.jpg', 'MacBook Pro 14-inch closed view', 1, FALSE),

-- Add images for other products
('770e8400-e29b-41d4-a716-446655440003', 'https://example.com/images/airpods-pro-2-1.jpg', 'AirPods Pro 2nd generation with case', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440011', 'https://example.com/images/cotton-tshirt-1.jpg', 'Premium cotton t-shirt front view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440012', 'https://example.com/images/summer-dress-1.jpg', 'Designer summer dress full view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440013', 'https://example.com/images/running-shoes-1.jpg', 'Running shoes side view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440021', 'https://example.com/images/office-chair-1.jpg', 'Ergonomic office chair front view', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440022', 'https://example.com/images/cookware-set-1.jpg', 'Stainless steel cookware set', 0, TRUE),
('770e8400-e29b-41d4-a716-446655440023', 'https://example.com/images/lawn-mower-1.jpg', 'Electric lawn mower side view', 0, TRUE);

-- Insert sample addresses for users
INSERT INTO user_addresses (user_id, type, first_name, last_name, address_line_1, city, state_province, postal_code, country, is_default) VALUES
('660e8400-e29b-41d4-a716-446655440021', 'both', 'John', 'Doe', '123 Main Street', 'New York', 'NY', '10001', 'US', TRUE),
('660e8400-e29b-41d4-a716-446655440022', 'shipping', 'Jane', 'Smith', '456 Oak Avenue', 'Los Angeles', 'CA', '90210', 'US', TRUE),
('660e8400-e29b-41d4-a716-446655440023', 'shipping', 'Bob', 'Johnson', '789 Pine Road', 'Chicago', 'IL', '60601', 'US', TRUE);

-- Insert sample orders
INSERT INTO orders (id, buyer_id, order_number, status, payment_status, total_amount, shipping_amount, tax_amount, billing_address, shipping_address, payment_method) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440021', '2024-000001', 'delivered', 'paid', 1448.99, 19.99, 129.00, 
 '{"first_name": "John", "last_name": "Doe", "address_line_1": "123 Main Street", "city": "New York", "state": "NY", "postal_code": "10001", "country": "US"}',
 '{"first_name": "John", "last_name": "Doe", "address_line_1": "123 Main Street", "city": "New York", "state": "NY", "postal_code": "10001", "country": "US"}',
 'credit_card'),

('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440022', '2024-000002', 'shipped', 'paid', 239.98, 9.99, 22.00,
 '{"first_name": "Jane", "last_name": "Smith", "address_line_1": "456 Oak Avenue", "city": "Los Angeles", "state": "CA", "postal_code": "90210", "country": "US"}',
 '{"first_name": "Jane", "last_name": "Smith", "address_line_1": "456 Oak Avenue", "city": "Los Angeles", "state": "CA", "postal_code": "90210", "country": "US"}',
 'paypal');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, total_price, is_wholesale) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011', 1, 1199.00, 1199.00, FALSE),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440011', 1, 249.00, 249.00, FALSE),

('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', 2, 29.99, 59.98, FALSE),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440012', 1, 149.99, 149.99, FALSE);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, order_item_id, rating, title, comment, is_verified, is_approved) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440021', 
 (SELECT id FROM order_items WHERE order_id = '880e8400-e29b-41d4-a716-446655440001' AND product_id = '770e8400-e29b-41d4-a716-446655440001'),
 5, 'Excellent phone!', 'The iPhone 15 Pro Max exceeded my expectations. The camera quality is amazing and the titanium design feels premium.', TRUE, TRUE),

('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440021',
 (SELECT id FROM order_items WHERE order_id = '880e8400-e29b-41d4-a716-446655440001' AND product_id = '770e8400-e29b-41d4-a716-446655440003'),
 4, 'Great sound quality', 'AirPods Pro 2nd gen have excellent noise cancellation. Battery life is good too.', TRUE, TRUE),

('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440022', 
 (SELECT id FROM order_items WHERE order_id = '880e8400-e29b-41d4-a716-446655440002' AND product_id = '770e8400-e29b-41d4-a716-446655440011'),
 5, 'Perfect fit and quality', 'Love these organic cotton t-shirts. They are soft, comfortable, and wash well.', TRUE, TRUE);

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 50.00, 1000, NOW(), NOW() + INTERVAL '30 days'),
('BULK20', 'Bulk order discount', 'percentage', 20.00, 500.00, 100, NOW(), NOW() + INTERVAL '60 days'),
('SAVE50', 'Fixed discount for large orders', 'fixed', 50.00, 300.00, 200, NOW(), NOW() + INTERVAL '45 days');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
('660e8400-e29b-41d4-a716-446655440021', 'order_delivered', 'Order Delivered', 'Your order #2024-000001 has been delivered successfully.'),
('660e8400-e29b-41d4-a716-446655440022', 'order_shipped', 'Order Shipped', 'Your order #2024-000002 has been shipped and is on its way.'),
('660e8400-e29b-41d4-a716-446655440011', 'payment_received', 'Payment Received', 'Payment of $1448.99 has been received for order #2024-000001.');

-- Update materialized view
REFRESH MATERIALIZED VIEW product_catalog;

-- Insert sample search queries for analytics
INSERT INTO search_queries (query, user_id, results_count) VALUES
('iphone', '660e8400-e29b-41d4-a716-446655440021', 1),
('macbook', '660e8400-e29b-41d4-a716-446655440022', 1),
('t-shirt', '660e8400-e29b-41d4-a716-446655440023', 1),
('office chair', NULL, 1),
('running shoes', '660e8400-e29b-41d4-a716-446655440021', 1);

-- Insert sample product analytics
INSERT INTO product_analytics (product_id, date, views_count, cart_additions, orders_count, revenue) VALUES
('770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 45, 8, 1, 1199.00),
('770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 32, 5, 0, 0.00),
('770e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', 28, 6, 1, 249.00),
('770e8400-e29b-41d4-a716-446655440011', CURRENT_DATE - INTERVAL '1 day', 56, 12, 2, 59.98),
('770e8400-e29b-41d4-a716-446655440013', CURRENT_DATE - INTERVAL '1 day', 23, 4, 1, 149.99);

-- Final message
SELECT 'Database seeded successfully with sample data!' as message;