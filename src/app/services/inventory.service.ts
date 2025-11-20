import { inject, Injectable, signal } from '@angular/core';
import {
  Product,
  ProductImageEntity,
  ProductImageInsert,
  ProductInsert,
} from '../models/inventory.model';
import { CategoryService } from './category.service';
import { ImageOptimizationService } from './image-optimization.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly supabase = inject(SupabaseService);
  private readonly categoryService = inject(CategoryService);
  private readonly imageOptimization = inject(ImageOptimizationService);
  private readonly productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    this.loadProducts().catch((error) => {
      console.error('Failed to initialize products:', error);
    });
  }

  private async loadProducts(): Promise<void> {
    const { data, error } = await this.supabase.client
    .from('products')
    .select(
      `
        *,
        categories!categoria_id(id, name),
        product_images(*)
      `
    )
    .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      throw error;
    }

    const products = data.map((entity: any) => this.mapEntityToProduct(entity));
    this.productsSignal.set(products);
  }

  async addProduct(product: Product): Promise<void> {
    const categoryId = await this.getCategoryIdByName(product.categoria);

    const productInsert: ProductInsert = {
      nombre: product.nombre,
      codigo_interno: product.codigoInterno || null,
      modelo: product.modelo || null,
      codigo_sunat: product.codigoSunat || null,
      codigo_tipo_unidad: product.codigoTipoUnidad || null,
      codigo_tipo_moneda: product.codigoTipoMoneda || null,
      precio_unitario_venta: product.precioUnitarioVenta,
      codigo_tipo_afectacion_igv_venta: product.codigoTipoAfectacionIgvVenta || null,
      tiene_igv: product.tieneIgv,
      precio_unitario_compra: product.precioUnitarioCompra || 0,
      codigo_tipo_afectacion_igv_compra: product.codigoTipoAfectacionIgvCompra || null,
      stock: product.stock,
      stock_minimo: product.stockMinimo || 0,
      categoria_id: categoryId,
      marca: product.marca || null,
      descripcion: product.descripcion || null,
      nombre_secundario: product.nombreSecundario || null,
      codigo_lote: product.codigoLote || null,
      fecha_vencimiento: product.fechaVencimiento || null,
      codigo_barras: product.codigoBarras || null,
    };

    const { data, error } = await this.supabase.client
    .from('products')
    .insert(productInsert)
    .select()
    .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    const productId = data.id;

    if (product.imageFiles && product.imageFiles.length > 0) {
      await this.uploadProductImages(productId, product.imageFiles);
    }

    await this.loadProducts();
  }

  async updateProduct(updatedProduct: Product): Promise<void> {
    const categoryId = await this.getCategoryIdByName(updatedProduct.categoria);

    const productUpdate = {
      nombre: updatedProduct.nombre,
      codigo_interno: updatedProduct.codigoInterno || null,
      modelo: updatedProduct.modelo || null,
      codigo_sunat: updatedProduct.codigoSunat || null,
      codigo_tipo_unidad: updatedProduct.codigoTipoUnidad || null,
      codigo_tipo_moneda: updatedProduct.codigoTipoMoneda || null,
      precio_unitario_venta: updatedProduct.precioUnitarioVenta,
      codigo_tipo_afectacion_igv_venta: updatedProduct.codigoTipoAfectacionIgvVenta || null,
      tiene_igv: updatedProduct.tieneIgv,
      precio_unitario_compra: updatedProduct.precioUnitarioCompra || 0,
      codigo_tipo_afectacion_igv_compra: updatedProduct.codigoTipoAfectacionIgvCompra || null,
      stock: updatedProduct.stock,
      stock_minimo: updatedProduct.stockMinimo || 0,
      categoria_id: categoryId,
      marca: updatedProduct.marca || null,
      descripcion: updatedProduct.descripcion || null,
      nombre_secundario: updatedProduct.nombreSecundario || null,
      codigo_lote: updatedProduct.codigoLote || null,
      fecha_vencimiento: updatedProduct.fechaVencimiento || null,
      codigo_barras: updatedProduct.codigoBarras || null,
    };

    const { error } = await this.supabase.client
    .from('products')
    .update(productUpdate)
    .eq('id', updatedProduct.id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    await this.loadProducts();
  }

  async removeProduct(id: string): Promise<void> {
    await this.deleteProductImages(id);

    const { error } = await this.supabase.client.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error removing product:', error);
      throw error;
    }

    this.productsSignal.update((products) => products.filter((p) => p.id !== id));
  }

  async clearProducts(): Promise<void> {
    const products = this.productsSignal();

    for (const product of products) {
      await this.deleteProductImages(product.id);
    }

    const { error } = await this.supabase.client
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing products:', error);
      throw error;
    }

    this.productsSignal.set([]);
  }

  async getProductImages(id: string): Promise<File[]> {
    const { data, error } = await this.supabase.client
    .from('product_images')
    .select('*')
    .eq('product_id', id)
    .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading product images:', error);
      return [];
    }

    const files: File[] = [];
    for (const img of data) {
      const { data: fileData } = await this.supabase.client.storage
      .from('product-images')
      .download(img.image_url);

      if (fileData) {
        const file = new File([fileData], img.filename, { type: 'image/webp' });
        files.push(file);
      }
    }

    return files;
  }

  private async uploadProductImages(productId: string, files: File[]): Promise<void> {
    const optimizedFiles = await this.imageOptimization.optimizeImages(files);

    for (let i = 0; i < optimizedFiles.length; i++) {
      const file = optimizedFiles[i];
      const fileName = `${ productId }/${ crypto.randomUUID() }.webp`;

      const { error: uploadError } = await this.supabase.client.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const imageInsert: ProductImageInsert = {
        product_id: productId,
        image_url: fileName,
        filename: file.name,
        file_size: file.size,
        mime_type: 'image/webp',
        display_order: i,
      };

      const { error: dbError } = await this.supabase.client
      .from('product_images')
      .insert(imageInsert);

      if (dbError) {
        console.error('Error saving image metadata:', dbError);
      }
    }
  }

  private async deleteProductImages(productId: string): Promise<void> {
    const { data: images } = await this.supabase.client
    .from('product_images')
    .select('image_url')
    .eq('product_id', productId);

    if (images && images.length > 0) {
      const filePaths = images.map((img) => img.image_url);
      await this.supabase.client.storage.from('product-images').remove(filePaths);
    }

    await this.supabase.client.from('product_images').delete().eq('product_id', productId);
  }

  private async getCategoryIdByName(categoryName: string): Promise<string | null> {
    const categories = this.categoryService.categories();
    const category = categories.find((c) => c.name === categoryName);
    return category?.id || null;
  }

  private mapEntityToProduct(entity: any): Product {
    const categoryName = entity.categories?.name || '';
    const images: string[] =
      entity.product_images?.map((img: ProductImageEntity) => img.filename) || [];

    return {
      id: entity.id,
      nombre: entity.nombre,
      codigoInterno: entity.codigo_interno || '',
      modelo: entity.modelo || '',
      codigoSunat: entity.codigo_sunat || '',
      codigoTipoUnidad: entity.codigo_tipo_unidad || '',
      codigoTipoMoneda: entity.codigo_tipo_moneda || '',
      precioUnitarioVenta: entity.precio_unitario_venta,
      codigoTipoAfectacionIgvVenta: entity.codigo_tipo_afectacion_igv_venta || '',
      tieneIgv: entity.tiene_igv,
      precioUnitarioCompra: entity.precio_unitario_compra,
      codigoTipoAfectacionIgvCompra: entity.codigo_tipo_afectacion_igv_compra || '',
      stock: entity.stock,
      stockMinimo: entity.stock_minimo,
      categoria: categoryName,
      marca: entity.marca || '',
      descripcion: entity.descripcion || '',
      nombreSecundario: entity.nombre_secundario || '',
      codigoLote: entity.codigo_lote || '',
      fechaVencimiento: entity.fecha_vencimiento || '',
      codigoBarras: entity.codigo_barras || '',
      imagenes: images,
    };
  }
}
