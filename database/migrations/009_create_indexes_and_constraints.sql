-- Migration: Create additional indexes, constraints, and optimization features
-- Created: 2025-01-XX
-- Description: Performance optimizations and data integrity enhancements

-- Create composite indexes for common query patterns
CREATE INDEX idx_products_category_status_featured ON products(category_id, status, is_featured);
CREATE INDEX idx_products_seller_status_created ON products(seller_id, status, created_at DESC);
CREATE INDEX idx_products_price_range ON products(base_price) WHERE status = 'active';

CREATE INDEX idx_orders_buyer_status_date ON orders(buyer_id, status, created_at DESC);
CREATE INDEX idx_order_items_seller_status ON order_items(seller_id, order_id);

CREATE INDEX idx_reviews_product_approved_rating ON reviews(product_id, is_approved, rating DESC);
CREATE INDEX idx_reviews_user_created ON reviews(user_id, created_at DESC);

-- Create partial indexes for better performance
CREATE INDEX idx_active_products ON products(created_at DESC) WHERE status = 'active';
CREATE INDEX idx_featured_products ON products(created_at DESC) WHERE is_featured = TRUE AND status = 'active';
CREATE INDEX idx_low_stock_products ON products(stock_quantity) WHERE stock_quantity > 0 AND stock_quantity <= 10;

-- Create indexes for full-text search optimization
CREATE INDEX idx_categories_search ON categories 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, ''))) 
WHERE is_active = TRUE;

-- Create expression indexes for case-insensitive searches
CREATE INDEX idx_users_email_lower ON users(lower(email));
CREATE INDEX idx_products_name_lower ON products(lower(name)) WHERE status = 'active';

-- Create function to update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- This could be used for more sophisticated search indexing
    -- For now, we rely on the GIN index created earlier
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for product catalog with all related data
CREATE MATERIALIZED VIEW product_catalog AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.short_description,
    p.base_price,
    p.wholesale_price,
    p.min_wholesale_quantity,
    p.stock_quantity,
    p.status,
    p.is_featured,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    u.first_name || ' ' || u.last_name as seller_name,
    get_primary_product_image(p.id) as primary_image_url,
    COALESCE(rs.average_rating, 0) as average_rating,
    COALESCE(rs.total_reviews, 0) as total_reviews
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN users u ON p.seller_id = u.id
LEFT JOIN LATERAL get_product_rating_summary(p.id) rs ON TRUE
WHERE p.status = 'active' AND c.is_active = TRUE;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_product_catalog_id ON product_catalog(id);
CREATE INDEX idx_product_catalog_category ON product_catalog(category_slug);
CREATE INDEX idx_product_catalog_seller ON product_catalog(seller_name);
CREATE INDEX idx_product_catalog_featured ON product_catalog(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_product_catalog_rating ON product_catalog(average_rating DESC);
CREATE INDEX idx_product_catalog_created ON product_catalog(created_at DESC);
CREATE INDEX idx_product_catalog_price ON product_catalog(base_price);

-- Create function to refresh product catalog
CREATE OR REPLACE FUNCTION refresh_product_catalog()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_catalog;
END;
$$ LANGUAGE plpgsql;

-- Create view for seller dashboard statistics
CREATE VIEW seller_dashboard_stats AS
SELECT 
    p.seller_id,
    COUNT(p.id) as total_products,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products,
    COUNT(CASE WHEN p.stock_quantity <= 10 AND p.stock_quantity > 0 THEN 1 END) as low_stock_products,
    COUNT(CASE WHEN p.stock_quantity = 0 THEN 1 END) as out_of_stock_products,
    COALESCE(AVG(rs.average_rating), 0) as average_product_rating,
    COALESCE(SUM(rs.total_reviews), 0) as total_reviews_received
FROM products p
LEFT JOIN LATERAL get_product_rating_summary(p.id) rs ON TRUE
GROUP BY p.seller_id;

-- Create view for admin analytics
CREATE VIEW admin_analytics_summary AS
SELECT 
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'buyer') as total_buyers,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'seller') as total_sellers,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_products,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as completed_orders,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) as total_revenue,
    COUNT(DISTINCT r.id) as total_reviews,
    COALESCE(AVG(r.rating) FILTER (WHERE r.is_approved = TRUE), 0) as average_rating
FROM users u
FULL OUTER JOIN products p ON u.id = p.seller_id
FULL OUTER JOIN orders o ON u.id = o.buyer_id
FULL OUTER JOIN reviews r ON p.id = r.product_id;

-- Create function for database maintenance
CREATE OR REPLACE FUNCTION perform_database_maintenance()
RETURNS TEXT AS $$
DECLARE
    maintenance_log TEXT := '';
    deleted_sessions INTEGER;
    deleted_notifications INTEGER;
BEGIN
    -- Clean expired sessions
    SELECT clean_expired_sessions() INTO deleted_sessions;
    maintenance_log := maintenance_log || 'Deleted ' || deleted_sessions || ' expired sessions. ';
    
    -- Clean old notifications (older than 30 days)
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = TRUE;
    GET DIAGNOSTICS deleted_notifications = ROW_COUNT;
    maintenance_log := maintenance_log || 'Deleted ' || deleted_notifications || ' old notifications. ';
    
    -- Update statistics
    ANALYZE;
    maintenance_log := maintenance_log || 'Updated table statistics. ';
    
    -- Refresh materialized view
    PERFORM refresh_product_catalog();
    maintenance_log := maintenance_log || 'Refreshed product catalog. ';
    
    RETURN maintenance_log;
END;
$$ LANGUAGE plpgsql;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (suggestion TEXT, type TEXT, relevance INTEGER) AS $$
BEGIN
    RETURN QUERY
    -- Product name suggestions
    SELECT DISTINCT p.name as suggestion, 'product'::TEXT as type, 3 as relevance
    FROM products p
    WHERE p.status = 'active' 
    AND lower(p.name) LIKE lower('%' || search_term || '%')
    
    UNION ALL
    
    -- Category suggestions
    SELECT DISTINCT c.name as suggestion, 'category'::TEXT as type, 2 as relevance
    FROM categories c
    WHERE c.is_active = TRUE 
    AND lower(c.name) LIKE lower('%' || search_term || '%')
    
    UNION ALL
    
    -- Popular search queries
    SELECT DISTINCT sq.query as suggestion, 'query'::TEXT as type, 1 as relevance
    FROM search_queries sq
    WHERE lower(sq.query) LIKE lower('%' || search_term || '%')
    AND sq.results_count > 0
    
    ORDER BY relevance DESC, suggestion ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function for advanced product search
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT DEFAULT NULL,
    category_ids UUID[] DEFAULT NULL,
    min_price DECIMAL(10,2) DEFAULT NULL,
    max_price DECIMAL(10,2) DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT NULL,
    in_stock_only BOOLEAN DEFAULT TRUE,
    featured_only BOOLEAN DEFAULT FALSE,
    sort_by VARCHAR(20) DEFAULT 'relevance',
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    slug VARCHAR(255),
    short_description VARCHAR(500),
    base_price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    primary_image_url TEXT,
    category_name TEXT,
    seller_name TEXT,
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    stock_quantity INTEGER,
    relevance_score FLOAT
) AS $$
DECLARE
    sort_clause TEXT;
BEGIN
    -- Build sort clause
    CASE sort_by
        WHEN 'price_low' THEN sort_clause := 'pc.base_price ASC';
        WHEN 'price_high' THEN sort_clause := 'pc.base_price DESC';
        WHEN 'rating' THEN sort_clause := 'pc.average_rating DESC';
        WHEN 'newest' THEN sort_clause := 'pc.created_at DESC';
        WHEN 'name' THEN sort_clause := 'pc.name ASC';
        ELSE sort_clause := 'ts_rank_cd(search_vector, query) DESC, pc.is_featured DESC, pc.created_at DESC';
    END CASE;
    
    RETURN QUERY EXECUTE format('
        WITH search_base AS (
            SELECT pc.*,
                   CASE 
                       WHEN $1 IS NOT NULL THEN 
                           to_tsvector(''english'', pc.name || '' '' || COALESCE(pc.description, ''''))
                       ELSE NULL
                   END as search_vector,
                   CASE 
                       WHEN $1 IS NOT NULL THEN 
                           plainto_tsquery(''english'', $1)
                       ELSE NULL
                   END as query
            FROM product_catalog pc
            WHERE 1=1
              AND ($2 IS NULL OR pc.category_slug = ANY(
                  SELECT c.slug FROM categories c WHERE c.id = ANY($2)
              ))
              AND ($3 IS NULL OR pc.base_price >= $3)
              AND ($4 IS NULL OR pc.base_price <= $4)
              AND ($5 IS NULL OR pc.average_rating >= $5)
              AND (NOT $6 OR pc.stock_quantity > 0)
              AND (NOT $7 OR pc.is_featured = TRUE)
              AND ($1 IS NULL OR to_tsvector(''english'', pc.name || '' '' || COALESCE(pc.description, '''')) @@ plainto_tsquery(''english'', $1))
        )
        SELECT sb.id, sb.name, sb.slug, sb.short_description, sb.base_price, sb.wholesale_price,
               sb.primary_image_url, sb.category_name, sb.seller_name, 
               sb.average_rating, sb.total_reviews, sb.stock_quantity,
               CASE 
                   WHEN sb.search_vector IS NOT NULL AND sb.query IS NOT NULL THEN
                       ts_rank_cd(sb.search_vector, sb.query)::FLOAT
                   ELSE 1.0
               END as relevance_score
        FROM search_base sb
        ORDER BY %s
        LIMIT $8 OFFSET $9
    ', sort_clause)
    USING search_query, category_ids, min_price, max_price, min_rating, 
          in_stock_only, featured_only, page_size, page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add constraints for data integrity
ALTER TABLE products ADD CONSTRAINT products_sku_not_empty 
CHECK (sku IS NULL OR LENGTH(TRIM(sku)) > 0);

ALTER TABLE orders ADD CONSTRAINT orders_amounts_consistent 
CHECK (total_amount = (total_amount - shipping_amount - tax_amount + discount_amount));

-- Add comments for new objects
COMMENT ON MATERIALIZED VIEW product_catalog IS 'Optimized view of products with related data for fast queries';
COMMENT ON VIEW seller_dashboard_stats IS 'Statistics for seller dashboard';
COMMENT ON VIEW admin_analytics_summary IS 'High-level analytics for admin dashboard';
COMMENT ON FUNCTION perform_database_maintenance() IS 'Performs routine database maintenance tasks';
COMMENT ON FUNCTION get_search_suggestions(TEXT, INTEGER) IS 'Returns search suggestions based on input';
COMMENT ON FUNCTION search_products(TEXT, UUID[], DECIMAL, DECIMAL, DECIMAL, BOOLEAN, BOOLEAN, VARCHAR, INTEGER, INTEGER) IS 'Advanced product search with filtering and sorting';