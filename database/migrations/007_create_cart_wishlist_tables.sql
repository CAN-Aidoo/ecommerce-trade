-- Migration: Create shopping cart and wishlist tables
-- Created: 2025-01-XX
-- Description: User shopping cart and wishlist functionality

-- Create shopping cart table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    is_wholesale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0),
    
    -- Ensure user can't have duplicate products in cart
    UNIQUE(user_id, product_id)
);

-- Create wishlist table
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't have duplicate products in wishlist
    UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_created_at ON cart_items(created_at DESC);

CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);
CREATE INDEX idx_wishlist_items_created_at ON wishlist_items(created_at DESC);

-- Create trigger for cart updated_at
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate cart item wholesale pricing
CREATE OR REPLACE FUNCTION validate_cart_wholesale_pricing()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
BEGIN
    -- Get product pricing information
    SELECT wholesale_price, min_wholesale_quantity
    INTO product_record
    FROM products
    WHERE id = NEW.product_id;
    
    -- If is_wholesale is true, validate requirements
    IF NEW.is_wholesale = TRUE THEN
        -- Check if product supports wholesale
        IF product_record.wholesale_price IS NULL THEN
            RAISE EXCEPTION 'Product does not support wholesale pricing';
        END IF;
        
        -- Check minimum quantity requirement
        IF NEW.quantity < product_record.min_wholesale_quantity THEN
            RAISE EXCEPTION 'Quantity % is below minimum wholesale quantity %', 
                NEW.quantity, product_record.min_wholesale_quantity;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate wholesale cart items
CREATE TRIGGER trigger_validate_cart_wholesale_pricing
    BEFORE INSERT OR UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_cart_wholesale_pricing();

-- Create function to get user cart with product details
CREATE OR REPLACE FUNCTION get_user_cart(user_uuid UUID)
RETURNS TABLE (
    cart_item_id UUID,
    product_id UUID,
    product_name VARCHAR(255),
    product_slug VARCHAR(255),
    primary_image_url TEXT,
    base_price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    quantity INTEGER,
    is_wholesale BOOLEAN,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    stock_available INTEGER,
    seller_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id as cart_item_id,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        get_primary_product_image(p.id) as primary_image_url,
        p.base_price,
        p.wholesale_price,
        ci.quantity,
        ci.is_wholesale,
        get_product_price(p.id, ci.quantity) as unit_price,
        get_product_price(p.id, ci.quantity) * ci.quantity as total_price,
        p.stock_quantity as stock_available,
        u.first_name || ' ' || u.last_name as seller_name,
        ci.created_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN users u ON p.seller_id = u.id
    WHERE ci.user_id = user_uuid
    AND p.status = 'active'
    ORDER BY ci.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get cart summary
CREATE OR REPLACE FUNCTION get_cart_summary(user_uuid UUID)
RETURNS TABLE (
    items_count INTEGER,
    total_amount DECIMAL(10,2),
    has_wholesale_items BOOLEAN,
    unique_sellers_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(ci.id)::INTEGER as items_count,
        COALESCE(SUM(get_product_price(p.id, ci.quantity) * ci.quantity), 0) as total_amount,
        BOOL_OR(ci.is_wholesale) as has_wholesale_items,
        COUNT(DISTINCT p.seller_id)::INTEGER as unique_sellers_count
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = user_uuid
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get user wishlist with product details
CREATE OR REPLACE FUNCTION get_user_wishlist(user_uuid UUID)
RETURNS TABLE (
    wishlist_item_id UUID,
    product_id UUID,
    product_name VARCHAR(255),
    product_slug VARCHAR(255),
    primary_image_url TEXT,
    base_price DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    min_wholesale_quantity INTEGER,
    stock_available INTEGER,
    seller_name TEXT,
    is_in_cart BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wi.id as wishlist_item_id,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        get_primary_product_image(p.id) as primary_image_url,
        p.base_price,
        p.wholesale_price,
        p.min_wholesale_quantity,
        p.stock_quantity as stock_available,
        u.first_name || ' ' || u.last_name as seller_name,
        EXISTS(
            SELECT 1 FROM cart_items ci 
            WHERE ci.user_id = user_uuid AND ci.product_id = p.id
        ) as is_in_cart,
        wi.created_at
    FROM wishlist_items wi
    JOIN products p ON wi.product_id = p.id
    JOIN users u ON p.seller_id = u.id
    WHERE wi.user_id = user_uuid
    AND p.status = 'active'
    ORDER BY wi.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to move wishlist item to cart
CREATE OR REPLACE FUNCTION move_wishlist_to_cart(
    user_uuid UUID,
    product_uuid UUID,
    quantity_param INTEGER DEFAULT 1,
    is_wholesale_param BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if item exists in wishlist
    IF NOT EXISTS (
        SELECT 1 FROM wishlist_items 
        WHERE user_id = user_uuid AND product_id = product_uuid
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Add to cart (upsert)
    INSERT INTO cart_items (user_id, product_id, quantity, is_wholesale)
    VALUES (user_uuid, product_uuid, quantity_param, is_wholesale_param)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity,
        is_wholesale = EXCLUDED.is_wholesale,
        updated_at = NOW();
    
    -- Remove from wishlist
    DELETE FROM wishlist_items 
    WHERE user_id = user_uuid AND product_id = product_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to clear user cart
CREATE OR REPLACE FUNCTION clear_user_cart(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cart_items WHERE user_id = user_uuid;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE cart_items IS 'User shopping cart items with wholesale support';
COMMENT ON TABLE wishlist_items IS 'User wishlist for saving products for later';
COMMENT ON COLUMN cart_items.is_wholesale IS 'Whether item is priced at wholesale rate';
COMMENT ON FUNCTION get_user_cart(UUID) IS 'Returns complete cart details with pricing';
COMMENT ON FUNCTION get_cart_summary(UUID) IS 'Returns cart totals and statistics';
COMMENT ON FUNCTION get_user_wishlist(UUID) IS 'Returns wishlist with product details';
COMMENT ON FUNCTION move_wishlist_to_cart(UUID, UUID, INTEGER, BOOLEAN) IS 'Moves item from wishlist to cart';
COMMENT ON FUNCTION clear_user_cart(UUID) IS 'Removes all items from user cart';