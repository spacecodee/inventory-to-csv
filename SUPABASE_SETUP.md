# Configuración de Supabase para Inventory to CSV

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales:

- Project URL
- Anon/Public Key

### 2. Ejecutar el Schema SQL

# Supabase Configuration for Inventory to CSV

## 📋 Setup Steps

### 1. Create a Project in Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create an account or sign in
3. Create a new project
4. Save the credentials:

- Project URL
- Anon/Public Key

### 2. Run the Schema SQL

1. In your Supabase project, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of the `supabase-schema.sql` file
4. Run the query
5. Verify that the following tables were created:

- `categories`
- `products`
- `product_images`

### 3. Configure Storage for Images

1. Go to **Storage** in the Supabase dashboard
2. Create a new bucket named `product-images`
3. Set the bucket to **Public**
4. Apply the following Storage policies:

```sql
-- Public read access policy
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Upload policy for authenticated users
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Deletion policy for authenticated users
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 4. Configure Environment Variables

1. Open the file `src/environments/environment.development.ts`
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your Anon Key

```typescript
export const environment = {
  production: false,
  googleGeminiApiKey: 'YOUR_API_KEY',
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here',
  },
};
```

4. Do the same for `src/environments/environment.ts` (production)

### 5. Configure Authentication (Optional)

If you want to implement user authentication:

1. Go to **Authentication** in Supabase
2. Enable the desired providers (Email, Google, GitHub, etc.)
3. Configure the redirect URLs
4. Implement the authentication flow in your application

## 🗃️ Database Structure

### `categories` table

- `id` (UUID) - Primary Key
- `name` (VARCHAR) - Unique category name
- `description` (TEXT) - Optional description
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `products` table

- `id` (UUID) - Primary Key
- `nombre` (VARCHAR) - Product name
- `codigo_interno` (VARCHAR) - Internal code
- `modelo` (VARCHAR) - Model
- `codigo_sunat` (VARCHAR) - SUNAT code
- `codigo_tipo_unidad` (VARCHAR)
- `codigo_tipo_moneda` (VARCHAR)
- `precio_unitario_venta` (DECIMAL)
- `codigo_tipo_afectacion_igv_venta` (VARCHAR)
- `tiene_igv` (BOOLEAN)
- `precio_unitario_compra` (DECIMAL)
- `codigo_tipo_afectacion_igv_compra` (VARCHAR)
- `stock` (INTEGER)
- `stock_minimo` (INTEGER)
- `categoria_id` (UUID) - Foreign Key to `categories`
- `marca` (VARCHAR)
- `descripcion` (TEXT)
- `nombre_secundario` (VARCHAR)
- `codigo_lote` (VARCHAR)
- `fecha_vencimiento` (DATE)
- `codigo_barras` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `product_images` table

- `id` (UUID) - Primary Key
- `product_id` (UUID) - Foreign Key to `products`
- `image_url` (TEXT) - URL of the image in Storage
- `filename` (VARCHAR)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)

## 🔐 Row Level Security (RLS)

RLS policies are configured for:

- **Public read**: Anyone can read categories, products, and images
- **Authenticated write**: Only authenticated users can create, update, and delete

For development without authentication, you can temporarily disable RLS:

```sql
ALTER TABLE categories
  DISABLE ROW LEVEL SECURITY;
ALTER TABLE products
  DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images
  DISABLE ROW LEVEL SECURITY;
```

⚠️ **Note**: Do not use this in production without implementing authentication.

## 📦 TypeScript Interfaces

The file `src/app/models/inventory.model.ts` contains:

- **Entity Interfaces**: Map directly to the Supabase tables
  - `CategoryEntity`, `ProductEntity`, `ProductImageEntity`
- **Insert Interfaces**: For creating new records
  - `CategoryInsert`, `ProductInsert`, `ProductImageInsert`
- **Update Interfaces**: For updating existing records

  - `CategoryUpdate`, `ProductUpdate`

- **Legacy Interfaces**: Existing interfaces for compatibility
  - `Category`, `Product`

## 🚀 Next Steps

1. Migrate `CategoryService` to use Supabase
2. Migrate `InventoryService` to use Supabase
3. Implement image uploads to Supabase Storage
4. Remove dependency on `localStorage` and `IndexedDB`
5. Implement error handling and loading states
6. (Optional) Implement user authentication
