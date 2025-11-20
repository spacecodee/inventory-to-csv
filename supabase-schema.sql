-- =====================================================
-- INVENTORY TO CSV - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories
(
  id          UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster category lookups
CREATE INDEX idx_categories_name ON categories (name);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products
(
  id                                UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
  nombre                            VARCHAR(500)   NOT NULL,
  codigo_interno                    VARCHAR(100),
  modelo                            VARCHAR(200),
  codigo_sunat                      VARCHAR(50),
  codigo_tipo_unidad                VARCHAR(10),
  codigo_tipo_moneda                VARCHAR(10),
  precio_unitario_venta             DECIMAL(12, 2) NOT NULL  DEFAULT 0,
  codigo_tipo_afectacion_igv_venta  VARCHAR(10),
  tiene_igv                         BOOLEAN                  DEFAULT true,
  precio_unitario_compra            DECIMAL(12, 2)           DEFAULT 0,
  codigo_tipo_afectacion_igv_compra VARCHAR(10),
  stock                             INTEGER        NOT NULL  DEFAULT 0,
  stock_minimo                      INTEGER                  DEFAULT 0,
  categoria_id                      UUID           REFERENCES categories (id) ON DELETE SET NULL,
  marca                             VARCHAR(200),
  descripcion                       TEXT,
  nombre_secundario                 VARCHAR(500),
  codigo_lote                       VARCHAR(100),
  fecha_vencimiento                 DATE,
  codigo_barras                     VARCHAR(100),
  created_at                        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_products_categoria_id ON products (categoria_id);
CREATE INDEX idx_products_codigo_interno ON products (codigo_interno);
CREATE INDEX idx_products_codigo_barras ON products (codigo_barras);
CREATE INDEX idx_products_nombre ON products (nombre);

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images
(
  id            UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
  product_id    UUID         NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  image_url     TEXT         NOT NULL,
  filename      VARCHAR(500) NOT NULL,
  file_size     INTEGER,
  mime_type     VARCHAR(100),
  display_order INTEGER                  DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster image lookups by product
CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_display_order ON product_images (product_id, display_order);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS
$$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply triggers to tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE
  ON categories
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE
  ON products
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images
  ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Public read access for categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Products policies (public read, authenticated write)
CREATE POLICY "Public read access for products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Product images policies (public read, authenticated write)
CREATE POLICY "Public read access for product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert product_images" ON product_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product_images" ON product_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product_images" ON product_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- INITIAL DATA - DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name, description)
VALUES ('Vehículos y Maquinaria', 'Autos RC, Drones, Aviones, Robots, Construcción, etc.'),
       ('Juegos de Rol e Imitación', 'Cocinas, Batidoras, Sets de Picnic'),
       ('Artículos de Fiesta', 'Árboles de Navidad, Adornos, Platos, Vasos, Bolsas de regalo'),
       ('Juguetes Educativos', 'Instrumentos musicales, Bloques, Juguetes para bebés'),
       ('Muñecas y Accesorios', 'Muñecas, Castillos, Autos de muñecas'),
       ('Acción y Puntería', 'Pistolas lanza dardos/agua'),
       ('Pistas y Garajes', 'Pistas de carreras, Estacionamientos'),
       ('Accesorios y Varios', 'Estuches, Organizadores')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- =====================================================
-- Note: This needs to be executed from the Supabase Dashboard
-- or via the Storage API, not through SQL directly.
--
-- Bucket name: product-images
-- Public: true
-- Allowed mime types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 5MB
--
-- Storage policies:
-- 1. Public read access (allow anyone to view images)
-- 2. Authenticated users can upload images
-- 3. Authenticated users can delete their own images
