-- Migration: Create supporting tables for addresses, sessions, notifications
-- Created: 2025-01-XX
-- Description: Supporting tables for enhanced user experience

-- Create user addresses table
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'shipping',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_addresses_type_valid CHECK (type IN ('shipping', 'billing', 'both')),
    CONSTRAINT user_addresses_country_code CHECK (LENGTH(country) = 2),
    CONSTRAINT user_addresses_names_not_empty CHECK (
        LENGTH(TRIM(first_name)) > 0 AND 
        LENGTH(TRIM(last_name)) > 0
    )
);

-- Create user sessions table for JWT management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT notifications_type_valid CHECK (
        type IN ('order_confirmed', 'order_shipped', 'order_delivered', 
                'payment_received', 'review_received', 'product_low_stock',
                'account_update', 'promotion', 'system_update')
    )
);

-- Create product analytics table
CREATE TABLE product_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views_count INTEGER DEFAULT 0,
    cart_additions INTEGER DEFAULT 0,
    wishlist_additions INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per product per day
    UNIQUE(product_id, date)
);

-- Create search queries table for analytics
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT search_queries_query_not_empty CHECK (LENGTH(TRIM(query)) > 0)
);

-- Create coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT coupons_discount_type_valid CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT coupons_discount_value_positive CHECK (discount_value > 0),
    CONSTRAINT coupons_dates_valid CHECK (valid_until > valid_from),
    CONSTRAINT coupons_usage_limit_positive CHECK (usage_limit IS NULL OR usage_limit > 0)
);

-- Create indexes for performance
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_date ON product_analytics(date DESC);

CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX idx_search_queries_user_id ON search_queries(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until) WHERE is_active = TRUE;

-- Create triggers for updated_at
CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at
    BEFORE UPDATE ON product_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to ensure only one default address per type per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting an address as default, unset all other default addresses of same type for this user
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND type = NEW.type
        AND id != NEW.id 
        AND is_default = TRUE;
    END IF;
    
    -- If no default address exists and this is the first address of this type, make it default
    IF NEW.is_default = FALSE OR NEW.is_default IS NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM user_addresses 
            WHERE user_id = NEW.user_id 
            AND type = NEW.type
            AND is_default = TRUE 
            AND id != NEW.id
        ) THEN
            NEW.is_default = TRUE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default address logic
CREATE TRIGGER trigger_ensure_single_default_address
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to track product view
CREATE OR REPLACE FUNCTION track_product_view(product_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_analytics (product_id, date, views_count)
    VALUES (product_uuid, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET 
        views_count = product_analytics.views_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to track cart addition
CREATE OR REPLACE FUNCTION track_cart_addition(product_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_analytics (product_id, date, cart_additions)
    VALUES (product_uuid, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET 
        cart_additions = product_analytics.cart_additions + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    coupon_code VARCHAR(50),
    order_total DECIMAL(10,2)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_amount DECIMAL(10,2),
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
    calculated_discount DECIMAL(10,2);
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM coupons
    WHERE code = coupon_code AND is_active = TRUE;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0.00, 'Invalid coupon code';
        RETURN;
    END IF;
    
    -- Check validity dates
    IF NOW() < coupon_record.valid_from OR NOW() > coupon_record.valid_until THEN
        RETURN QUERY SELECT FALSE, 0.00, 'Coupon has expired';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF coupon_record.usage_limit IS NOT NULL AND 
       coupon_record.used_count >= coupon_record.usage_limit THEN
        RETURN QUERY SELECT FALSE, 0.00, 'Coupon usage limit exceeded';
        RETURN;
    END IF;
    
    -- Check minimum order amount
    IF coupon_record.minimum_order_amount IS NOT NULL AND 
       order_total < coupon_record.minimum_order_amount THEN
        RETURN QUERY SELECT FALSE, 0.00, 
            'Minimum order amount of $' || coupon_record.minimum_order_amount || ' required';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF coupon_record.discount_type = 'percentage' THEN
        calculated_discount := order_total * (coupon_record.discount_value / 100);
    ELSE
        calculated_discount := coupon_record.discount_value;
    END IF;
    
    -- Apply maximum discount limit
    IF coupon_record.maximum_discount_amount IS NOT NULL AND 
       calculated_discount > coupon_record.maximum_discount_amount THEN
        calculated_discount := coupon_record.maximum_discount_amount;
    END IF;
    
    -- Ensure discount doesn't exceed order total
    IF calculated_discount > order_total THEN
        calculated_discount := order_total;
    END IF;
    
    RETURN QUERY SELECT TRUE, calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE user_addresses IS 'User shipping and billing addresses';
COMMENT ON TABLE user_sessions IS 'Active user sessions for JWT token management';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE product_analytics IS 'Daily analytics data for products';
COMMENT ON TABLE search_queries IS 'Search queries for analytics and improvements';
COMMENT ON TABLE coupons IS 'Discount coupons and promotional codes';
COMMENT ON FUNCTION clean_expired_sessions() IS 'Removes expired and inactive sessions';
COMMENT ON FUNCTION track_product_view(UUID) IS 'Records a product view for analytics';
COMMENT ON FUNCTION validate_coupon(VARCHAR(50), DECIMAL(10,2)) IS 'Validates coupon and calculates discount';