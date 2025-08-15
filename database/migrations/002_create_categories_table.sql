-- Migration: Create categories table for product categorization
-- Created: 2025-01-XX
-- Description: Hierarchical category system supporting nested categories

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT categories_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT categories_slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT categories_no_self_parent CHECK (id != parent_id)
);

-- Create indexes for performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get category hierarchy
CREATE OR REPLACE FUNCTION get_category_hierarchy(category_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    slug VARCHAR(100),
    level INTEGER
) AS $$
WITH RECURSIVE category_tree AS (
    -- Base case: start with the given category
    SELECT c.id, c.name, c.slug, c.parent_id, 0 as level
    FROM categories c
    WHERE c.id = category_uuid
    
    UNION ALL
    
    -- Recursive case: get all children
    SELECT c.id, c.name, c.slug, c.parent_id, ct.level + 1
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = TRUE
)
SELECT ct.id, ct.name, ct.slug, ct.level
FROM category_tree ct
ORDER BY ct.level, ct.name;
$$ LANGUAGE sql STABLE;

-- Create function to get category path (breadcrumb)
CREATE OR REPLACE FUNCTION get_category_path(category_uuid UUID)
RETURNS TEXT AS $$
WITH RECURSIVE category_path AS (
    -- Base case: start with the given category
    SELECT c.id, c.name, c.parent_id, c.name as path
    FROM categories c
    WHERE c.id = category_uuid
    
    UNION ALL
    
    -- Recursive case: walk up the tree
    SELECT c.id, c.name, c.parent_id, c.name || ' > ' || cp.path
    FROM categories c
    INNER JOIN category_path cp ON c.id = cp.parent_id
)
SELECT path
FROM category_path
WHERE parent_id IS NULL;
$$ LANGUAGE sql STABLE;

-- Add comments
COMMENT ON TABLE categories IS 'Product categories with hierarchical support';
COMMENT ON COLUMN categories.slug IS 'URL-friendly version of category name';
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category for hierarchy';
COMMENT ON COLUMN categories.sort_order IS 'Display order within same parent level';
COMMENT ON FUNCTION get_category_hierarchy(UUID) IS 'Returns all subcategories for a given category';
COMMENT ON FUNCTION get_category_path(UUID) IS 'Returns breadcrumb path for a category';