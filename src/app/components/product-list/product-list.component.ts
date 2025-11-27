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
  lucidePackage,
  lucidePercent,
  lucideScanBarcode,
  lucideSearch,
  lucideSettings2,
  lucideTag,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { ExcelService } from '../../services/excel.service';
import { InventoryService } from '../../services/inventory.service';
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
    }),
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);
  private readonly systemConfig = inject(SystemConfigService);

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

  downloadExcel() {
    this.excelService.exportToExcel(this.products());
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
    if (products.length === 0) return;

    try {
      const JSZip = (await import('jszip')).default;
      const JsBarcode = (await import('jsbarcode')).default;
      const zip = new JSZip();

      const pageNumber = this.currentPage();
      const folderName = `barcodes-page-${ pageNumber }`;
      const folder = zip.folder(folderName);

      if (!folder) return;

      for (const product of products) {
        if (!product.codigoBarras) continue;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svg, String(product.codigoBarras), {
          format: 'CODE128',
          displayValue: true,
          fontSize: 14,
          height: 60,
          width: 2,
        });

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const img = new Image();
        const imgPromise = new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width || 600;
            canvas.height = img.height || 200;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve();
          };
          img.onerror = reject;
        });

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.src = url;

        await imgPromise;
        URL.revokeObjectURL(url);

        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (pngBlob) {
          const fileName = `${ product.codigoBarras }.png`;
          folder.file(fileName, pngBlob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      const zipUrl = URL.createObjectURL(content);
      a.href = zipUrl;
      a.download = `${ folderName }.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Error generating barcodes:', error);
    }
  }
}
