-- =====================================================
-- ADD BARCODE_PRINTED FIELD TO PRODUCTS TABLE
-- =====================================================

ALTER TABLE products
ADD COLUMN IF NOT EXISTS barcode_printed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_barcode_printed ON products (barcode_printed);
