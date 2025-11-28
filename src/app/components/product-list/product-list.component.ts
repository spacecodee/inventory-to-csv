import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalculator,
  lucideCheck,
  lucideDownload,
  lucideEdit,
  lucideEye,
  lucideFileCode,
  lucideFileText,
  lucideFolderOpen,
  lucideImage,
  lucideLoader,
  lucidePackage,
  lucidePercent,
  lucidePrinter,
  lucideScanBarcode,
  lucideSearch,
  lucideSettings2,
  lucideTag,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { BarcodeService } from '../../services/barcode.service';
import { ExcelService } from '../../services/excel.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { SystemConfigService } from '../../services/system-config.service';
import { BarcodeSuffixDialogComponent } from './barcode-suffix-dialog/barcode-suffix-dialog';
import { CategoryEditorDialogComponent } from './category-editor-dialog/category-editor-dialog';
import { ImageViewerDialogComponent } from './image-viewer-dialog/image-viewer-dialog';
import { PriceCalculatorDialogComponent } from './price-calculator-dialog/price-calculator-dialog';
import { ProductDetailComponent } from './product-detail.component';
import { ProductNameDialogComponent } from './product-name-dialog/product-name-dialog';
import { StockEditorDialogComponent } from './stock-editor-dialog/stock-editor-dialog';
import { SunatCodeDialogComponent } from './sunat-code-dialog/sunat-code-dialog';
import { SupplierInvoiceDialogComponent } from './supplier-invoice-dialog/supplier-invoice-dialog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    HlmIconImports,
    ProductDetailComponent,
    FormsModule,
    PriceCalculatorDialogComponent,
    StockEditorDialogComponent,
    BarcodeSuffixDialogComponent,
    SunatCodeDialogComponent,
    CategoryEditorDialogComponent,
    SupplierInvoiceDialogComponent,
    ProductNameDialogComponent,
    ImageViewerDialogComponent,
  ],
  providers: [
    provideIcons({
      lucideTrash2,
      lucideDownload,
      lucideX,
      lucideEye,
      lucideSearch,
      lucideSettings2,
      lucideCheck,
      lucideScanBarcode,
      lucideCalculator,
      lucidePackage,
      lucideTag,
      lucideFileCode,
      lucideFolderOpen,
      lucidePercent,
      lucideFileText,
      lucideEdit,
      lucideImage,
      lucideLoader,
      lucidePrinter,
    }),
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);
  private readonly systemConfig = inject(SystemConfigService);
  private readonly barcodeService = inject(BarcodeService);
  private readonly notificationService = inject(NotificationService);

  products = this.inventoryService.products;
  igvPercentage = this.systemConfig.igvPercentage;

  // Search State
  searchQuery = signal('');

  // Pagination State
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Column Configuration
  isDropdownOpen = signal(false);
  availableColumns = signal([
    { key: 'imagen', label: 'Imagen', visible: true, alwaysVisible: true },
    { key: 'nombre', label: 'Nombre', visible: true, alwaysVisible: true },
    { key: 'categoria', label: 'Categoría', visible: true, alwaysVisible: false },
    { key: 'marca', label: 'Marca', visible: true, alwaysVisible: false },
    { key: 'descripcion', label: 'Descripción', visible: false, alwaysVisible: false },
    { key: 'stock', label: 'Stock', visible: true, alwaysVisible: false },
    { key: 'precioCompra', label: 'P. Compra', visible: true, alwaysVisible: false },
    { key: 'precioVenta', label: 'P. Venta', visible: true, alwaysVisible: false },
    { key: 'totalCompra', label: 'Total Compra', visible: true, alwaysVisible: false },
    { key: 'totalVenta', label: 'Total Venta', visible: true, alwaysVisible: false },
    { key: 'codigoInterno', label: 'Código', visible: true, alwaysVisible: false },
    { key: 'codigoBarras', label: 'Código Barras', visible: true, alwaysVisible: false },
    { key: 'factura', label: 'Factura', visible: true, alwaysVisible: false },
    { key: 'proveedor', label: 'Proveedor', visible: true, alwaysVisible: false },
    { key: 'acciones', label: 'Acciones', visible: true, alwaysVisible: true },
  ]);

  // Price Calculator State
  priceCalcProductId = signal<string | null>(null);

  priceCalcProduct = computed(() => {
    const id = this.priceCalcProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Stock Editor State
  stockEditorProductId = signal<string | null>(null);

  stockEditorProduct = computed(() => {
    const id = this.stockEditorProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Barcode Suffix Editor State
  barcodeSuffixProductId = signal<string | null>(null);

  barcodeSuffixProduct = computed(() => {
    const id = this.barcodeSuffixProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // SUNAT Code Editor State
  sunatCodeProductId = signal<string | null>(null);

  sunatCodeProduct = computed(() => {
    const id = this.sunatCodeProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Category Editor State
  categoryEditorProductId = signal<string | null>(null);

  categoryEditorProduct = computed(() => {
    const id = this.categoryEditorProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Supplier Invoice State
  supplierInvoiceProductId = signal<string | null>(null);

  supplierInvoiceProduct = computed(() => {
    const id = this.supplierInvoiceProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Product Name Editor State
  productNameEditorProductId = signal<string | null>(null);

  productNameEditorProduct = computed(() => {
    const id = this.productNameEditorProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Image Viewer State
  imageViewerProductId = signal<string | null>(null);

  imageViewerProduct = computed(() => {
    const id = this.imageViewerProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  // Selection State (ID based for reactivity)
  selectedProductId = signal<string | null>(null);

  protected readonly Math = Math;

  // Computed States
  activeProduct = computed(() => {
    const id = this.selectedProductId();
    if (!id) return null;
    return this.products().find((p) => p.id === id) || null;
  });

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const products = this.products();

    if (!query) return products;

    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        p.codigoInterno.toLowerCase().includes(query) ||
        p.codigoBarras.toLowerCase().includes(query) ||
        p.marca.toLowerCase().includes(query)
    );
  });

  paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return products.slice(start, end);
  });

  columnVisibility = computed(() => {
    return this.availableColumns().reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Actions
  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }

  toggleColumn(key: string) {
    this.availableColumns.update((cols) =>
      cols.map((col) => {
        if (col.key === key && !col.alwaysVisible) {
          return { ...col, visible: !col.visible };
        }
        return col;
      })
    );
  }

  updateItemsPerPage(count: number) {
    this.itemsPerPage.set(Number(count));
    this.currentPage.set(1); // Reset to first page
  }

  nextPage() {
    if (this.currentPage() * this.itemsPerPage() < this.filteredProducts().length) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  removeProduct(id: string) {
    this.inventoryService.removeProduct(id).then(() => undefined);
  }

  clearList() {
    this.inventoryService.clearProducts().then(() => undefined);
  }

  // Barcode Update State
  barcodeUpdating = signal(false);
  barcodeUpdateProgress = signal(0);

  downloadExcel() {
    this.excelService.exportToExcel(this.products());
  }

  async printBarcodesToPdf() {
    const products = this.paginatedProducts();
    if (!products || products.length === 0) return;

    this.notificationService.info('Preparing printable document...');

    try {
      const JsBarcodeModule = await import('jsbarcode');
      const JsBarcode = (JsBarcodeModule as any).default || JsBarcodeModule;

      const images: string[] = [];
      for (const p of products) {
        const code = String(p.codigoBarras || p.codigoInterno || p.id || '');
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, code, {
          format: 'CODE128',
          displayValue: false,
          fontSize: 10,
          height: 25,
          margin: 0,
        });
        const dataUrl = canvas.toDataURL('image/png');
        images.push(dataUrl);
      }

      const win = window.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = `
        <style>
          @page { size: 40mm 60mm; margin: 0; }
          @page { margin: 0; }
          html, body { margin: 0; padding: 2mm; font-family: Arial, Helvetica, sans-serif; }
          .label { width: 40mm; height: 60mm; page-break-after: always; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
          img.bar { width: 38mm; height: 10mm; display:block; }
          .code-text { font-size: 8px; font-family: monospace; text-align: center; word-break: break-all; width: 38mm; }
        </style>
        <style media="print">
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
          html { margin: 0; padding: 0; }
        </style>
      `;

      let bodyHtml = '';
      for (let i = 0; i < images.length; i++) {
        const p = products[i];
        const code = String(p.codigoBarras || p.codigoInterno || p.id || '');
        bodyHtml += `<div class="label"><img class="bar" src="${images[i]}" /><div class="code-text">${code}</div></div>`;
      }

      win.document.open();
      win.document.write(`<html><head><title>Print Barcodes</title>${style}</head><body>${bodyHtml}</body></html>`);
      win.document.close();

      setTimeout(() => {
        try {
          win.focus();
          const printSettings = { margins: { top: 0, bottom: 0, left: 0, right: 0 }, headerFooterEnabled: false };
          if ((win as any).print) {
            (win as any).print();
          } else {
            win.print();
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);

    } catch (err: any) {
      console.error('Print generation error', err);
      this.notificationService.error('Error preparing print', err?.message || String(err));
    }
  }

  async printLabels() {
    const products = this.paginatedProducts();
    if (!products || products.length === 0) return;

    this.notificationService.info('Preparing labels...');

    try {
      const win = window.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = `
        <style>
          @page { size: 40mm 60mm; margin: 0; }
          @page { margin: 0; }
          html, body { margin: 0; padding: 2mm; font-family: Arial, Helvetica, sans-serif; }
          .label { width: 40mm; height: 60mm; page-break-after: always; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
          .label-name { font-size: 11px; font-weight: bold; width: 38mm; word-break: break-word; }
          .label-price { font-size: 14px; font-weight: bold; color: #000; }
        </style>
        <style media="print">
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
          html { margin: 0; padding: 0; }
        </style>
      `;

      let bodyHtml = '';
      for (const p of products) {
        const nombre = (p.nombre || '').toString();
        const precio = (p.precioUnitarioVenta || 0).toFixed(2);
        bodyHtml += `<div class="label"><div class="label-name">${nombre}</div><div class="label-price">S/. ${precio}</div></div>`;
      }

      win.document.open();
      win.document.write(`<html><head><title>Print Labels</title>${style}</head><body>${bodyHtml}</body></html>`);
      win.document.close();

      setTimeout(() => {
        try {
          win.focus();
          if ((win as any).print) {
            (win as any).print();
          } else {
            win.print();
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);

    } catch (err: any) {
      console.error('Print labels error', err);
      this.notificationService.error('Error preparing labels', err?.message || String(err));
    }
  }

  openPrintQuantityDialog(product: Product, type: 'barcode' | 'label') {
    if (type === 'barcode') {
      this.printProductBarcode(product, 1);
    } else {
      this.printProductLabel(product, 1);
    }
  }

  async printProductBarcode(product: Product, copies: number) {
    if (copies <= 0) return;

    this.notificationService.info(`Preparing ${copies} barcode(s)...`);

    try {
      const JsBarcodeModule = await import('jsbarcode');
      const JsBarcode = (JsBarcodeModule as any).default || JsBarcodeModule;

      const win = window.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = `
        <style>
          @page { size: 40mm 60mm; margin: 0; }
          html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
          .label { width: 40mm; height: 60mm; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
          .label:not(:last-child) { page-break-after: always; }
          img.bar { width: 38mm; height: 10mm; display:block; }
          .code-text { font-size: 8px; font-family: monospace; text-align: center; word-break: break-all; width: 38mm; }
        </style>
        <style media="print">
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
          html { margin: 0; padding: 0; }
        </style>
      `;

      const code = String(product.codigoBarras || product.codigoInterno || product.id || '');
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code, {
        format: 'CODE128',
        displayValue: false,
        fontSize: 10,
        height: 25,
        margin: 0,
      });
      const dataUrl = canvas.toDataURL('image/png');

      let bodyHtml = '';
      for (let i = 0; i < copies; i++) {
        bodyHtml += `<div class="label"><img class="bar" src="${dataUrl}" /><div class="code-text">${code}</div></div>`;
      }

      win.document.open();
      win.document.write(`<html><head><title>Print Barcode</title>${style}</head><body>${bodyHtml}</body></html>`);
      win.document.close();

      setTimeout(() => {
        try {
          win.focus();
          if ((win as any).print) {
            (win as any).print();
          } else {
            win.print();
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);

    } catch (err: any) {
      console.error('Print barcode error', err);
      this.notificationService.error('Error preparing barcode', err?.message || String(err));
    }
  }

  async printProductLabel(product: Product, copies: number) {
    if (copies <= 0) return;

    this.notificationService.info(`Preparing ${copies} label(s)...`);

    try {
      const win = window.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = `
        <style>
          @page { size: 40mm 60mm; margin: 0; }
          html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
          .label { width: 40mm; height: 60mm; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
          .label:not(:last-child) { page-break-after: always; }
          .label-name { font-size: 11px; font-weight: bold; width: 38mm; word-break: break-word; }
          .label-price { font-size: 14px; font-weight: bold; color: #000; }
        </style>
        <style media="print">
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
          html { margin: 0; padding: 0; }
        </style>
      `;

      const nombre = (product.nombre || '').toString();
      const precio = (product.precioUnitarioVenta || 0).toFixed(2);

      let bodyHtml = '';
      for (let i = 0; i < copies; i++) {
        bodyHtml += `<div class="label"><div class="label-name">${nombre}</div><div class="label-price">S/. ${precio}</div></div>`;
      }

      win.document.open();
      win.document.write(`<html><head><title>Print Label</title>${style}</head><body>${bodyHtml}</body></html>`);
      win.document.close();

      setTimeout(() => {
        try {
          win.focus();
          if ((win as any).print) {
            (win as any).print();
          } else {
            win.print();
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);

    } catch (err: any) {
      console.error('Print label error', err);
      this.notificationService.error('Error preparing label', err?.message || String(err));
    }
  }


  async updateAllBarcodesToCompact() {
    const confirmed = window.confirm(
      'Esta acción convertirá todos los códigos de barras al formato compacto. ¿Estás seguro?'
    );
    if (!confirmed) return;

    this.barcodeUpdating.set(true);
    this.barcodeUpdateProgress.set(0);

    try {
      await this.inventoryService.updateAllBarcodesToCompactFormat();
      this.notificationService.success(
        'Códigos de barras actualizados',
        'Todos los códigos han sido convertidos al formato compacto'
      );
    } catch (error) {
      console.error('Error updating barcodes:', error);
      this.notificationService.error(
        'Error al actualizar códigos',
        'Ocurrió un error durante la actualización'
      );
    } finally {
      this.barcodeUpdating.set(false);
      this.barcodeUpdateProgress.set(0);
    }
  }

  viewProduct(product: Product) {
    this.selectedProductId.set(product.id);
  }

  openPriceCalculator(product: Product) {
    this.priceCalcProductId.set(product.id);
  }

  closePriceCalculator() {
    this.priceCalcProductId.set(null);
  }

  async applyCalculatedPrice(data: {
    precioUnitarioCompra: number;
    precioUnitarioVenta: number;
    tieneIgv: boolean;
  }) {
    const product = this.priceCalcProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      precioUnitarioCompra: data.precioUnitarioCompra,
      precioUnitarioVenta: data.precioUnitarioVenta,
      tieneIgv: data.tieneIgv,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closePriceCalculator();
  }

  // IGV Bulk Update State
  showIgvDialog = signal(false);
  igvUpdating = signal(false);

  openIgvDialog() {
    this.showIgvDialog.set(true);
  }

  closeIgvDialog() {
    this.showIgvDialog.set(false);
  }

  async applyIgvToAllProducts() {
    this.igvUpdating.set(true);
    try {
      const products = this.products();
      for (const product of products) {
        if (!product.tieneIgv) {
          const updatedProduct: Product = {
            ...product,
            tieneIgv: true,
          };
          await this.inventoryService.updateProduct(updatedProduct);
        }
      }
    } finally {
      this.igvUpdating.set(false);
      this.closeIgvDialog();
    }
  }

  async removeIgvFromAllProducts() {
    this.igvUpdating.set(true);
    try {
      const products = this.products();
      for (const product of products) {
        if (product.tieneIgv) {
          const updatedProduct: Product = {
            ...product,
            tieneIgv: false,
          };
          await this.inventoryService.updateProduct(updatedProduct);
        }
      }
    } finally {
      this.igvUpdating.set(false);
      this.closeIgvDialog();
    }
  }

  openStockEditor(product: Product) {
    this.stockEditorProductId.set(product.id);
  }

  closeStockEditor() {
    this.stockEditorProductId.set(null);
  }

  async applyStockChanges(data: { stock: number; stockMinimo: number }) {
    const product = this.stockEditorProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      stock: data.stock,
      stockMinimo: data.stockMinimo,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closeStockEditor();
  }

  openBarcodeSuffixEditor(product: Product) {
    this.barcodeSuffixProductId.set(product.id);
  }

  closeBarcodeSuffixEditor() {
    this.barcodeSuffixProductId.set(null);
  }

  async applyBarcodeSuffix(data: { codigoBarras: string }) {
    const product = this.barcodeSuffixProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      codigoBarras: data.codigoBarras,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closeBarcodeSuffixEditor();
  }

  openSunatCodeEditor(product: Product) {
    this.sunatCodeProductId.set(product.id);
  }

  closeSunatCodeEditor() {
    this.sunatCodeProductId.set(null);
  }

  async applySunatCode(data: {
    codigoSunat: string;
    codigoTipoAfectacionIgvVenta: string;
    codigoTipoAfectacionIgvCompra: string;
  }) {
    const product = this.sunatCodeProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      codigoSunat: data.codigoSunat,
      codigoTipoAfectacionIgvVenta: data.codigoTipoAfectacionIgvVenta,
      codigoTipoAfectacionIgvCompra: data.codigoTipoAfectacionIgvCompra,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closeSunatCodeEditor();
  }

  openCategoryEditor(product: Product) {
    this.categoryEditorProductId.set(product.id);
  }

  closeCategoryEditor() {
    this.categoryEditorProductId.set(null);
  }

  async applyCategory(data: { categoria: string }) {
    const product = this.categoryEditorProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      categoria: data.categoria,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closeCategoryEditor();
  }

  openSupplierInvoiceDialog(product: Product) {
    this.supplierInvoiceProductId.set(product.id);
  }

  closeSupplierInvoiceDialog() {
    this.supplierInvoiceProductId.set(null);
  }

  openProductNameEditor(product: Product) {
    this.productNameEditorProductId.set(product.id);
  }

  closeProductNameEditor() {
    this.productNameEditorProductId.set(null);
  }

  async applyProductName(data: { nombre: string; descripcion: string }) {
    const product = this.productNameEditorProduct();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      nombre: data.nombre,
      descripcion: data.descripcion,
    };

    await this.inventoryService.updateProduct(updatedProduct);
    this.closeProductNameEditor();
  }

  openImageViewer(product: Product) {
    this.imageViewerProductId.set(product.id);
  }

  closeImageViewer() {
    this.imageViewerProductId.set(null);
  }

  async downloadBarcodes() {
    const products = this.paginatedProducts();
    await this.barcodeService.downloadBarcodesAsZip(products, this.currentPage());
  }

  async downloadBarcodesWithInfo() {
    const products = this.paginatedProducts();
    await this.barcodeService.downloadBarcodesWithInfoAsZip(products, this.currentPage());
  }

  async downloadPriceLabels() {
    const products = this.paginatedProducts();
    await this.barcodeService.downloadPriceLabelsAsZip(products, this.currentPage());
  }
}
