export interface CategoryEntity {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  name: string;
  description?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface ProductEntity {
  id: string;
  nombre: string;
  codigo_interno: string | null;
  modelo: string | null;
  codigo_sunat: string | null;
  codigo_tipo_unidad: string | null;
  codigo_tipo_moneda: string | null;
  precio_unitario_venta: number;
  codigo_tipo_afectacion_igv_venta: string | null;
  tiene_igv: boolean;
  precio_unitario_compra: number;
  codigo_tipo_afectacion_igv_compra: string | null;
  stock: number;
  stock_minimo: number;
  categoria_id: string | null;
  marca: string | null;
  descripcion: string | null;
  nombre_secundario: string | null;
  codigo_lote: string | null;
  fecha_vencimiento: string | null;
  codigo_barras: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  nombre: string;
  codigo_interno?: string | null;
  modelo?: string | null;
  codigo_sunat?: string | null;
  codigo_tipo_unidad?: string | null;
  codigo_tipo_moneda?: string | null;
  precio_unitario_venta: number;
  codigo_tipo_afectacion_igv_venta?: string | null;
  tiene_igv?: boolean;
  precio_unitario_compra?: number;
  codigo_tipo_afectacion_igv_compra?: string | null;
  stock: number;
  stock_minimo?: number;
  categoria_id?: string | null;
  marca?: string | null;
  descripcion?: string | null;
  nombre_secundario?: string | null;
  codigo_lote?: string | null;
  fecha_vencimiento?: string | null;
  codigo_barras?: string | null;
}

export interface ProductUpdate {
  nombre?: string;
  codigo_interno?: string | null;
  modelo?: string | null;
  codigo_sunat?: string | null;
  codigo_tipo_unidad?: string | null;
  codigo_tipo_moneda?: string | null;
  precio_unitario_venta?: number;
  codigo_tipo_afectacion_igv_venta?: string | null;
  tiene_igv?: boolean;
  precio_unitario_compra?: number;
  codigo_tipo_afectacion_igv_compra?: string | null;
  stock?: number;
  stock_minimo?: number;
  categoria_id?: string | null;
  marca?: string | null;
  descripcion?: string | null;
  nombre_secundario?: string | null;
  codigo_lote?: string | null;
  fecha_vencimiento?: string | null;
  codigo_barras?: string | null;
}

export interface ProductImageEntity {
  id: string;
  product_id: string;
  image_url: string;
  filename: string;
  file_size: number | null;
  mime_type: string | null;
  display_order: number;
  created_at: string;
}

export interface ProductImageInsert {
  product_id: string;
  image_url: string;
  filename: string;
  file_size?: number | null;
  mime_type?: string | null;
  display_order?: number;
}

export interface ProductImage {
  url: string;
  filename: string;
}

export interface Product {
  id: string;
  nombre: string;
  codigoInterno: string;
  modelo: string;
  codigoSunat: string;
  codigoTipoUnidad: string;
  codigoTipoMoneda: string;
  precioUnitarioVenta: number;
  codigoTipoAfectacionIgvVenta: string;
  tieneIgv: boolean;
  precioUnitarioCompra: number;
  codigoTipoAfectacionIgvCompra: string;
  stock: number;
  stockMinimo: number;
  categoria: string;
  marca: string;
  descripcion: string;
  nombreSecundario: string;
  codigoLote: string;
  fechaVencimiento: string;
  codigoBarras: string;
  imagenes: ProductImage[];
  supplierInvoices?: SupplierInvoice[];
  imageFiles?: File[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Vehículos y Maquinaria',
    description: 'Autos RC, Drones, Aviones, Robots, Construcción, etc.',
  },
  { id: '2', name: 'Juegos de Rol e Imitación', description: 'Cocinas, Batidoras, Sets de Picnic' },
  {
    id: '3',
    name: 'Artículos de Fiesta',
    description: 'Árboles de Navidad, Adornos, Platos, Vasos, Bolsas de regalo',
  },
  {
    id: '4',
    name: 'Juguetes Educativos',
    description: 'Instrumentos musicales, Bloques, Juguetes para bebés',
  },
  { id: '5', name: 'Muñecas y Accesorios', description: 'Muñecas, Castillos, Autos de muñecas' },
  { id: '6', name: 'Acción y Puntería', description: 'Pistolas lanza dardos/agua' },
  { id: '7', name: 'Pistas y Garajes', description: 'Pistas de carreras, Estacionamientos' },
  { id: '8', name: 'Accesorios y Varios', description: 'Estuches, Organizadores' },
];

export interface Supplier {
  id: string;
  razonSocial: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface SupplierEntity {
  id: string;
  razon_social: string;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierInsert {
  razon_social: string;
  ruc?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  numeroFactura: string;
  fechaFactura?: string;
  montoTotal?: number;
  notas?: string;
  supplier?: Supplier;
  suppliers?: SupplierEntity;
}

export interface SupplierInvoiceEntity {
  id: string;
  supplier_id: string;
  numero_factura: string;
  fecha_factura: string | null;
  monto_total: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: SupplierEntity;
}

export interface SupplierInvoiceInsert {
  supplier_id: string;
  numero_factura: string;
  fecha_factura?: string | null;
  monto_total?: number | null;
  notas?: string | null;
}

export interface ProductSupplierInvoice {
  productId: string;
  invoiceId: string;
  invoice?: SupplierInvoice;
}

export interface ProductSupplierInvoiceEntity {
  id: string;
  product_id: string;
  invoice_id: string;
  created_at: string;
  supplier_invoices?: SupplierInvoiceEntity;
}
