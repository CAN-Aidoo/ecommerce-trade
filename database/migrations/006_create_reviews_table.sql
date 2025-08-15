-- Migration: Create reviews table for product ratings and feedback
-- Created: 2025-01-XX
-- Description: Product review system with verified purchase support

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT reviews_rating_valid CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT reviews_helpful_count_non_negative CHECK (helpful_count >= 0),
    CONSTRAINT reviews_title_not_empty CHECK (title IS NULL OR LENGTH(TRIM(title)) > 0),
    
    -- Ensure user can only review a product once per purchase
    UNIQUE(product_id, user_id, order_item_id)
);

-- Create table for review helpfulness votes
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can only vote once per review
    UNIQUE(review_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_verified ON reviews(is_verified);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if review is from verified purchase
CREATE OR REPLACE FUNCTION set_review_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If order_item_id is provided, mark as verified
    IF NEW.order_item_id IS NOT NULL THEN
        -- Verify that the order item belongs to the reviewer and product
        IF EXISTS (
            SELECT 1 FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.id = NEW.order_item_id
            AND oi.product_id = NEW.product_id
            AND o.buyer_id = NEW.user_id
            AND o.status IN ('delivered', 'completed')
        ) THEN
            NEW.is_verified := TRUE;
        ELSE
            -- Invalid order item reference
            RAISE EXCEPTION 'Invalid order item reference for review verification';
        END IF;
    ELSE
        NEW.is_verified := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set verification status
CREATE TRIGGER trigger_set_review_verification
    BEFORE INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_review_verification();

-- Create function to update helpful count when votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment or decrement based on vote
        UPDATE reviews 
        SET helpful_count = helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust count based on vote change
        UPDATE reviews 
        SET helpful_count = helpful_count + 
            CASE 
                WHEN NEW.is_helpful AND NOT OLD.is_helpful THEN 2
                WHEN NOT NEW.is_helpful AND OLD.is_helpful THEN -2
                ELSE 0
            END
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement or increment based on removed vote
        UPDATE reviews 
        SET helpful_count = helpful_count + CASE WHEN OLD.is_helpful THEN -1 ELSE 1 END
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain helpful count
CREATE TRIGGER trigger_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

-- Create function to get product rating summary
CREATE OR REPLACE FUNCTION get_product_rating_summary(product_uuid UUID)
RETURNS TABLE (
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    rating_distribution JSONB
) AS $$
DECLARE
    rating_dist JSONB;
BEGIN
    -- Calculate rating distribution
    SELECT jsonb_object_agg(rating::TEXT, count)
    INTO rating_dist
    FROM (
        SELECT rating, COUNT(*) as count
        FROM reviews
        WHERE product_id = product_uuid AND is_approved = TRUE
        GROUP BY rating
    ) r;
    
    -- Return summary
    RETURN QUERY
    SELECT 
        COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0) as average_rating,
        COUNT(r.id)::INTEGER as total_reviews,
        COALESCE(rating_dist, '{}'::JSONB) as rating_distribution
    FROM reviews r
    WHERE r.product_id = product_uuid AND r.is_approved = TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get product reviews with pagination
CREATE OR REPLACE FUNCTION get_product_reviews(
    product_uuid UUID,
    page_size INTEGER DEFAULT 10,
    page_offset INTEGER DEFAULT 0,
    rating_filter INTEGER DEFAULT NULL,
    verified_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    user_name TEXT,
    rating INTEGER,
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN,
    helpful_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    user_voted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        u.first_name || ' ' || SUBSTRING(u.last_name FROM 1 FOR 1) || '.' as user_name,
        r.rating,
        r.title,
        r.comment,
        r.is_verified,
        r.helpful_count,
        r.created_at,
        FALSE as user_voted -- TODO: Add user context for vote status
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = product_uuid
    AND r.is_approved = TRUE
    AND (rating_filter IS NULL OR r.rating = rating_filter)
    AND (NOT verified_only OR r.is_verified = TRUE)
    ORDER BY r.helpful_count DESC, r.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check if user can review product
CREATE OR REPLACE FUNCTION can_user_review_product(
    user_uuid UUID,
    product_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has purchased the product and hasn't already reviewed it
    RETURN EXISTS (
        SELECT 1 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.buyer_id = user_uuid
        AND oi.product_id = product_uuid
        AND o.status IN ('delivered', 'completed')
        AND NOT EXISTS (
            SELECT 1 FROM reviews r
            WHERE r.user_id = user_uuid 
            AND r.product_id = product_uuid
            AND r.order_item_id = oi.id
        )
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE reviews IS 'Product reviews and ratings with verification support';
COMMENT ON TABLE review_votes IS 'User votes on review helpfulness';
COMMENT ON COLUMN reviews.is_verified IS 'Whether review is from verified purchase';
COMMENT ON COLUMN reviews.is_approved IS 'Whether review has been approved by moderation';
COMMENT ON COLUMN reviews.order_item_id IS 'Links review to specific purchase for verification';
COMMENT ON FUNCTION get_product_rating_summary(UUID) IS 'Returns rating statistics for a product';
COMMENT ON FUNCTION get_product_reviews(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN) IS 'Returns paginated product reviews';
COMMENT ON FUNCTION can_user_review_product(UUID, UUID) IS 'Checks if user is eligible to review a product';