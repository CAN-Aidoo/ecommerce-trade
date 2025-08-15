-- Migration: Create products table for product catalog
-- Created: 2025-01-XX
-- Description: Main products table supporting both retail and wholesale

-- Create product status enum
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'out_of_stock');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
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
    dimensions JSONB, -- {length, width, height, unit}
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(160),
    meta_description VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT products_slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT products_base_price_positive CHECK (base_price > 0),
    CONSTRAINT products_wholesale_price_valid CHECK (
        wholesale_price IS NULL OR 
        (wholesale_price > 0 AND wholesale_price <= base_price)
    ),
    CONSTRAINT products_min_wholesale_quantity_valid CHECK (min_wholesale_quantity > 0),
    CONSTRAINT products_stock_quantity_non_negative CHECK (stock_quantity >= 0),
    CONSTRAINT products_weight_positive CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT products_dimensions_valid CHECK (
        dimensions IS NULL OR 
        (jsonb_typeof(dimensions) = 'object' AND 
         dimensions ? 'length' AND 
         dimensions ? 'width' AND 
         dimensions ? 'height' AND 
         dimensions ? 'unit')
    )
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_stock ON products(stock_quantity) WHERE stock_quantity > 0;

-- Full-text search index
CREATE INDEX idx_products_search ON products 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, '')));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate effective price based on quantity
CREATE OR REPLACE FUNCTION get_product_price(
    product_uuid UUID,
    quantity INTEGER DEFAULT 1
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    product_record RECORD;
BEGIN
    SELECT base_price, wholesale_price, min_wholesale_quantity
    INTO product_record
    FROM products
    WHERE id = product_uuid AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Return wholesale price if quantity meets minimum and wholesale price is set
    IF product_record.wholesale_price IS NOT NULL 
       AND quantity >= product_record.min_wholesale_quantity THEN
        RETURN product_record.wholesale_price;
    ELSE
        RETURN product_record.base_price;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check stock availability
CREATE OR REPLACE FUNCTION check_stock_availability(
    product_uuid UUID,
    requested_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    available_stock INTEGER;
BEGIN
    SELECT stock_quantity
    INTO available_stock
    FROM products
    WHERE id = product_uuid AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN available_stock >= requested_quantity;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to update stock quantity
CREATE OR REPLACE FUNCTION update_product_stock(
    product_uuid UUID,
    quantity_change INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    new_stock INTEGER;
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity + quantity_change,
        status = CASE 
            WHEN stock_quantity + quantity_change <= 0 THEN 'out_of_stock'::product_status
            WHEN status = 'out_of_stock' AND stock_quantity + quantity_change > 0 THEN 'active'::product_status
            ELSE status
        END
    WHERE id = product_uuid
    RETURNING stock_quantity INTO new_stock;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE products IS 'Main product catalog supporting retail and wholesale pricing';
COMMENT ON COLUMN products.wholesale_price IS 'Special price for wholesale quantities';
COMMENT ON COLUMN products.min_wholesale_quantity IS 'Minimum quantity required for wholesale pricing';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions in JSON format: {length, width, height, unit}';
COMMENT ON COLUMN products.meta_title IS 'SEO meta title for search engines';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description for search engines';
COMMENT ON FUNCTION get_product_price(UUID, INTEGER) IS 'Returns effective price based on quantity (retail vs wholesale)';
COMMENT ON FUNCTION check_stock_availability(UUID, INTEGER) IS 'Checks if requested quantity is available in stock';
COMMENT ON FUNCTION update_product_stock(UUID, INTEGER) IS 'Updates product stock quantity and status';