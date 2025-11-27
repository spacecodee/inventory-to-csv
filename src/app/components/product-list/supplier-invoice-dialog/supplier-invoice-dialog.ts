import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product, ProductSupplierInvoice, SupplierInvoice } from '../../../models/inventory.model';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-invoice-dialog',
  imports: [CommonModule, HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX, lucidePlus, lucideTrash2 })],
  templateUrl: './supplier-invoice-dialog.html',
  styleUrl: './supplier-invoice-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierInvoiceDialogComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);

  product = input.required<Product>();
  closeDialog = output<void>();

  suppliers = this.supplierService.suppliers;
  invoices = this.supplierService.invoices;

  productInvoices = signal<ProductSupplierInvoice[]>([]);
  selectedInvoiceId = signal<string>('');
  isLoading = signal(false);

  showNewSupplierForm = signal(false);
  showNewInvoiceForm = signal(false);

  newSupplierRazonSocial = signal('');
  newSupplierRuc = signal('');

  newInvoiceSupplierId = signal('');
  newInvoiceNumero = signal('');
  newInvoiceFecha = signal('');

  ngOnInit() {
    this.initializeData().then(() => undefined);
  }

  private async initializeData() {
    this.isLoading.set(true);
    await this.supplierService.initialize();
    await this.loadProductInvoices();
  }

  async loadProductInvoices() {
    this.isLoading.set(true);
    const invoices = await this.supplierService.getProductInvoices(this.product().id);
    this.productInvoices.set(invoices);
    this.isLoading.set(false);
  }

  async assignInvoice() {
    const invoiceId = this.selectedInvoiceId();
    if (!invoiceId) return;

    this.isLoading.set(true);
    await this.supplierService.assignInvoiceToProduct(this.product().id, invoiceId);
    await this.loadProductInvoices();
    this.selectedInvoiceId.set('');
    this.isLoading.set(false);
  }

  async removeInvoice(invoiceId: string) {
    this.isLoading.set(true);
    await this.supplierService.removeInvoiceFromProduct(this.product().id, invoiceId);
    await this.loadProductInvoices();
    this.isLoading.set(false);
  }

  async createSupplier() {
    const razonSocial = this.newSupplierRazonSocial().trim();
    if (!razonSocial) return;

    this.isLoading.set(true);
    await this.supplierService.addSupplier({
      razon_social: razonSocial,
      ruc: this.newSupplierRuc().trim() || null,
    });
    this.newSupplierRazonSocial.set('');
    this.newSupplierRuc.set('');
    this.showNewSupplierForm.set(false);
    this.isLoading.set(false);
  }

  async createInvoice() {
    const supplierId = this.newInvoiceSupplierId();
    const numero = this.newInvoiceNumero().trim();
    if (!supplierId || !numero) return;

    this.isLoading.set(true);
    await this.supplierService.addInvoice({
      supplier_id: supplierId,
      numero_factura: numero,
      fecha_factura: this.newInvoiceFecha() || null,
    });
    this.newInvoiceSupplierId.set('');
    this.newInvoiceNumero.set('');
    this.newInvoiceFecha.set('');
    this.showNewInvoiceForm.set(false);
    this.isLoading.set(false);
  }

  getInvoiceDisplay(invoice: SupplierInvoice): string {
    const supplier = invoice.supplier?.razonSocial || 'Sin proveedor';
    return `${ invoice.numeroFactura } - ${ supplier }`;
  }

  onClose() {
    this.closeDialog.emit();
  }
}
