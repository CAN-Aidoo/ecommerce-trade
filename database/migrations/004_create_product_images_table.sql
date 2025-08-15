-- Migration: Create product_images table for product media
-- Created: 2025-01-XX
-- Description: Stores multiple images per product with ordering and primary image support

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT product_images_url_not_empty CHECK (LENGTH(TRIM(image_url)) > 0),
    CONSTRAINT product_images_sort_order_non_negative CHECK (sort_order >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(product_id, sort_order);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;

-- Create unique constraint to ensure only one primary image per product
CREATE UNIQUE INDEX idx_product_images_unique_primary 
ON product_images(product_id) 
WHERE is_primary = TRUE;

-- Create function to ensure only one primary image per product
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting an image as primary, unset all other primary images for this product
    IF NEW.is_primary = TRUE THEN
        UPDATE product_images 
        SET is_primary = FALSE 
        WHERE product_id = NEW.product_id 
        AND id != NEW.id 
        AND is_primary = TRUE;
    END IF;
    
    -- If no primary image exists and this is the first image, make it primary
    IF NEW.is_primary = FALSE OR NEW.is_primary IS NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM product_images 
            WHERE product_id = NEW.product_id 
            AND is_primary = TRUE 
            AND id != NEW.id
        ) THEN
            NEW.is_primary = TRUE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce primary image logic
CREATE TRIGGER trigger_ensure_single_primary_image
    BEFORE INSERT OR UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- Create function to get ordered product images
CREATE OR REPLACE FUNCTION get_product_images(product_uuid UUID)
RETURNS TABLE (
    id UUID,
    image_url TEXT,
    alt_text VARCHAR(255),
    is_primary BOOLEAN,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT pi.id, pi.image_url, pi.alt_text, pi.is_primary, pi.sort_order
    FROM product_images pi
    WHERE pi.product_id = product_uuid
    ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get primary product image
CREATE OR REPLACE FUNCTION get_primary_product_image(product_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    SELECT image_url
    INTO primary_image_url
    FROM product_images
    WHERE product_id = product_uuid AND is_primary = TRUE
    LIMIT 1;
    
    -- If no primary image, get the first available image
    IF primary_image_url IS NULL THEN
        SELECT image_url
        INTO primary_image_url
        FROM product_images
        WHERE product_id = product_uuid
        ORDER BY sort_order ASC, created_at ASC
        LIMIT 1;
    END IF;
    
    RETURN primary_image_url;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON TABLE product_images IS 'Stores multiple images per product with ordering support';
COMMENT ON COLUMN product_images.is_primary IS 'Indicates the main image for product display';
COMMENT ON COLUMN product_images.sort_order IS 'Display order of images in gallery';
COMMENT ON COLUMN product_images.alt_text IS 'Alternative text for accessibility and SEO';
COMMENT ON FUNCTION get_product_images(UUID) IS 'Returns all images for a product in display order';
COMMENT ON FUNCTION get_primary_product_image(UUID) IS 'Returns the primary image URL for a product';