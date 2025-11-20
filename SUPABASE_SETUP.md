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

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Ejecuta la query
5. Verifica que se hayan creado las tablas:
  - `categories`
  - `products`
  - `product_images`

### 3. Configurar Storage para Imágenes

1. Ve a **Storage** en el panel de Supabase
2. Crea un nuevo bucket llamado `product-images`
3. Configura el bucket como **Public**
4. Establece las siguientes políticas de Storage:

```sql
-- Política de lectura pública
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política de subida para usuarios autenticados
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Política de eliminación para usuarios autenticados
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 4. Configurar Variables de Entorno

1. Abre el archivo `src/environments/environment.development.ts`
2. Reemplaza `YOUR_SUPABASE_URL` con tu Project URL
3. Reemplaza `YOUR_SUPABASE_ANON_KEY` con tu Anon Key

```typescript
export const environment = {
  production: false,
  googleGeminiApiKey: 'YOUR_API_KEY',
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui',
  },
};
```

4. Haz lo mismo para `src/environments/environment.ts` (producción)

### 5. Configurar Autenticación (Opcional)

Si deseas implementar autenticación de usuarios:

1. Ve a **Authentication** en Supabase
2. Habilita los providers deseados (Email, Google, GitHub, etc.)
3. Configura las URLs de redirección
4. Implementa el flujo de autenticación en tu aplicación

## 🗃️ Estructura de la Base de Datos

### Tabla `categories`

- `id` (UUID) - Primary Key
- `name` (VARCHAR) - Nombre único de la categoría
- `description` (TEXT) - Descripción opcional
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla `products`

- `id` (UUID) - Primary Key
- `nombre` (VARCHAR) - Nombre del producto
- `codigo_interno` (VARCHAR) - Código interno
- `modelo` (VARCHAR) - Modelo
- `codigo_sunat` (VARCHAR) - Código SUNAT
- `codigo_tipo_unidad` (VARCHAR)
- `codigo_tipo_moneda` (VARCHAR)
- `precio_unitario_venta` (DECIMAL)
- `codigo_tipo_afectacion_igv_venta` (VARCHAR)
- `tiene_igv` (BOOLEAN)
- `precio_unitario_compra` (DECIMAL)
- `codigo_tipo_afectacion_igv_compra` (VARCHAR)
- `stock` (INTEGER)
- `stock_minimo` (INTEGER)
- `categoria_id` (UUID) - Foreign Key a `categories`
- `marca` (VARCHAR)
- `descripcion` (TEXT)
- `nombre_secundario` (VARCHAR)
- `codigo_lote` (VARCHAR)
- `fecha_vencimiento` (DATE)
- `codigo_barras` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla `product_images`

- `id` (UUID) - Primary Key
- `product_id` (UUID) - Foreign Key a `products`
- `image_url` (TEXT) - URL de la imagen en Storage
- `filename` (VARCHAR)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)

## 🔐 Row Level Security (RLS)

Las políticas RLS están configuradas para:

- **Lectura pública**: Cualquiera puede leer categorías, productos e imágenes
- **Escritura autenticada**: Solo usuarios autenticados pueden crear, actualizar y eliminar

Para desarrollo sin autenticación, puedes deshabilitar temporalmente RLS:

```sql
ALTER TABLE categories
  DISABLE ROW LEVEL SECURITY;
ALTER TABLE products
  DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images
  DISABLE ROW LEVEL SECURITY;
```

⚠️ **Nota**: No uses esto en producción sin implementar autenticación.

## 📦 Interfaces TypeScript

El archivo `src/app/models/inventory.model.ts` contiene:

- **Entity Interfaces**: Mapean directamente a las tablas de Supabase
  - `CategoryEntity`, `ProductEntity`, `ProductImageEntity`
- **Insert Interfaces**: Para crear nuevos registros
  - `CategoryInsert`, `ProductInsert`, `ProductImageInsert`
- **Update Interfaces**: Para actualizar registros existentes

  - `CategoryUpdate`, `ProductUpdate`

- **Legacy Interfaces**: Interfaces existentes para compatibilidad
  - `Category`, `Product`

## 🚀 Próximos Pasos

1. Migrar `CategoryService` para usar Supabase
2. Migrar `InventoryService` para usar Supabase
3. Implementar subida de imágenes a Supabase Storage
4. Eliminar dependencia de `localStorage` e `IndexedDB`
5. Implementar manejo de errores y estados de carga
6. (Opcional) Implementar autenticación de usuarios
