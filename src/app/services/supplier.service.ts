import { inject, Injectable, signal } from '@angular/core';
import {
  ProductSupplierInvoice,
  ProductSupplierInvoiceEntity,
  Supplier,
  SupplierEntity,
  SupplierInsert,
  SupplierInvoice,
  SupplierInvoiceEntity,
  SupplierInvoiceInsert,
} from '../models/inventory.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly supabase = inject(SupabaseService);

  private readonly suppliersSignal = signal<Supplier[]>([]);
  private readonly invoicesSignal = signal<SupplierInvoice[]>([]);

  private initialized = false;

  readonly suppliers = this.suppliersSignal.asReadonly();
  readonly invoices = this.invoicesSignal.asReadonly();

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    await Promise.all([this.loadSuppliers(), this.loadInvoices()]);
  }

  async loadSuppliers(): Promise<void> {
    const { data, error } = await this.supabase.client
    .from('suppliers')
    .select('*')
    .order('razon_social', { ascending: true });

    if (error) {
      console.error('Error loading suppliers:', error);
      return;
    }

    const suppliers = data.map((entity: SupplierEntity) => this.mapSupplierEntity(entity));
    this.suppliersSignal.set(suppliers);
  }

  async loadInvoices(): Promise<void> {
    const { data, error } = await this.supabase.client
    .from('supplier_invoices')
    .select('*, suppliers(*)')
    .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading invoices:', error);
      return;
    }

    const invoices = data.map((entity: SupplierInvoiceEntity) => this.mapInvoiceEntity(entity));
    this.invoicesSignal.set(invoices);
  }

  async addSupplier(supplier: SupplierInsert): Promise<Supplier | null> {
    const { data, error } = await this.supabase.client
    .from('suppliers')
    .insert(supplier)
    .select()
    .single();

    if (error) {
      console.error('Error adding supplier:', error);
      return null;
    }

    await this.loadSuppliers();
    return this.mapSupplierEntity(data);
  }

  async addInvoice(invoice: SupplierInvoiceInsert): Promise<SupplierInvoice | null> {
    const { data, error } = await this.supabase.client
    .from('supplier_invoices')
    .insert(invoice)
    .select('*, suppliers(*)')
    .single();

    if (error) {
      console.error('Error adding invoice:', error);
      return null;
    }

    await this.loadInvoices();
    return this.mapInvoiceEntity(data);
  }

  async getProductInvoices(productId: string): Promise<ProductSupplierInvoice[]> {
    const { data, error } = await this.supabase.client
    .from('product_supplier_invoices')
    .select('*, supplier_invoices(*, suppliers(*))')
    .eq('product_id', productId);

    if (error) {
      console.error('Error loading product invoices:', error);
      return [];
    }

    return data.map((entity: ProductSupplierInvoiceEntity) => ({
      productId: entity.product_id,
      invoiceId: entity.invoice_id,
      invoice: entity.supplier_invoices
        ? this.mapInvoiceEntity(entity.supplier_invoices)
        : undefined,
    }));
  }

  async assignInvoiceToProduct(productId: string, invoiceId: string): Promise<boolean> {
    const { error } = await this.supabase.client.from('product_supplier_invoices').insert({
      product_id: productId,
      invoice_id: invoiceId,
    });

    if (error) {
      if (error.code === '23505') {
        return true;
      }
      console.error('Error assigning invoice to product:', error);
      return false;
    }

    return true;
  }

  async removeInvoiceFromProduct(productId: string, invoiceId: string): Promise<boolean> {
    const { error } = await this.supabase.client
    .from('product_supplier_invoices')
    .delete()
    .eq('product_id', productId)
    .eq('invoice_id', invoiceId);

    if (error) {
      console.error('Error removing invoice from product:', error);
      return false;
    }

    return true;
  }

  private mapSupplierEntity(entity: SupplierEntity): Supplier {
    return {
      id: entity.id,
      razonSocial: entity.razon_social,
      ruc: entity.ruc || undefined,
      direccion: entity.direccion || undefined,
      telefono: entity.telefono || undefined,
      email: entity.email || undefined,
    };
  }

  private mapInvoiceEntity(entity: SupplierInvoiceEntity): SupplierInvoice {
    return {
      id: entity.id,
      supplierId: entity.supplier_id,
      numeroFactura: entity.numero_factura,
      fechaFactura: entity.fecha_factura || undefined,
      montoTotal: entity.monto_total || undefined,
      notas: entity.notas || undefined,
      supplier: entity.suppliers ? this.mapSupplierEntity(entity.suppliers) : undefined,
    };
  }
}
