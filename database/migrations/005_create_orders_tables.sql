-- Migration: Create orders and order_items tables
-- Created: 2025-01-XX
-- Description: Order management system supporting multi-seller orders

-- Create order status enums
CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT orders_total_amount_positive CHECK (total_amount >= 0),
    CONSTRAINT orders_shipping_amount_non_negative CHECK (shipping_amount >= 0),
    CONSTRAINT orders_tax_amount_non_negative CHECK (tax_amount >= 0),
    CONSTRAINT orders_discount_amount_non_negative CHECK (discount_amount >= 0),
    CONSTRAINT orders_billing_address_valid CHECK (
        jsonb_typeof(billing_address) = 'object' AND
        billing_address ? 'first_name' AND
        billing_address ? 'last_name' AND
        billing_address ? 'address_line_1' AND
        billing_address ? 'city' AND
        billing_address ? 'postal_code' AND
        billing_address ? 'country'
    ),
    CONSTRAINT orders_shipping_address_valid CHECK (
        jsonb_typeof(shipping_address) = 'object' AND
        shipping_address ? 'first_name' AND
        shipping_address ? 'last_name' AND
        shipping_address ? 'address_line_1' AND
        shipping_address ? 'city' AND
        shipping_address ? 'postal_code' AND
        shipping_address ? 'country'
    )
);

-- Create order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    is_wholesale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT order_items_unit_price_positive CHECK (unit_price > 0),
    CONSTRAINT order_items_total_price_positive CHECK (total_price > 0),
    CONSTRAINT order_items_total_price_consistent CHECK (total_price = unit_price * quantity)
);

-- Create indexes for performance
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number ~ ('^' || year_part || '-[0-9]+$') 
            THEN CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE year_part || '-%';
    
    order_num := year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Create function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals(order_uuid UUID)
RETURNS TABLE (
    items_total DECIMAL(10,2),
    items_count INTEGER,
    sellers_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(oi.total_price), 0) as items_total,
        COALESCE(COUNT(oi.id)::INTEGER, 0) as items_count,
        COALESCE(COUNT(DISTINCT oi.seller_id)::INTEGER, 0) as sellers_count
    FROM order_items oi
    WHERE oi.order_id = order_uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get order summary
CREATE OR REPLACE FUNCTION get_order_summary(order_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR(50),
    buyer_name TEXT,
    status order_status,
    payment_status payment_status,
    total_amount DECIMAL(10,2),
    items_count INTEGER,
    sellers_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        u.first_name || ' ' || u.last_name as buyer_name,
        o.status,
        o.payment_status,
        o.total_amount,
        COUNT(oi.id)::INTEGER as items_count,
        COUNT(DISTINCT oi.seller_id)::INTEGER as sellers_count,
        o.created_at
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = order_uuid
    GROUP BY o.id, o.order_number, u.first_name, u.last_name, o.status, 
             o.payment_status, o.total_amount, o.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get seller orders
CREATE OR REPLACE FUNCTION get_seller_orders(seller_uuid UUID, order_status_filter order_status DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR(50),
    buyer_name TEXT,
    status order_status,
    payment_status payment_status,
    seller_total DECIMAL(10,2),
    items_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        u.first_name || ' ' || u.last_name as buyer_name,
        o.status,
        o.payment_status,
        SUM(oi.total_price) as seller_total,
        COUNT(oi.id)::INTEGER as items_count,
        o.created_at
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    INNER JOIN order_items oi ON o.id = oi.order_id
    WHERE oi.seller_id = seller_uuid
    AND (order_status_filter IS NULL OR o.status = order_status_filter)
    GROUP BY o.id, o.order_number, u.first_name, u.last_name, o.status, 
             o.payment_status, o.created_at
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE orders IS 'Main orders table storing order information and status';
COMMENT ON TABLE order_items IS 'Individual items within an order, supporting multi-seller orders';
COMMENT ON COLUMN orders.billing_address IS 'JSON object containing billing address details';
COMMENT ON COLUMN orders.shipping_address IS 'JSON object containing shipping address details';
COMMENT ON COLUMN order_items.is_wholesale IS 'Whether item was purchased at wholesale price';
COMMENT ON FUNCTION generate_order_number() IS 'Generates unique order numbers in format YYYY-XXXXXX';
COMMENT ON FUNCTION calculate_order_totals(UUID) IS 'Calculates totals for an order';
COMMENT ON FUNCTION get_order_summary(UUID) IS 'Returns complete order summary with buyer info';
COMMENT ON FUNCTION get_seller_orders(UUID, order_status) IS 'Returns orders containing items from specific seller';