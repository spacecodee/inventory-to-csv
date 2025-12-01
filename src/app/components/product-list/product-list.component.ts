import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideArrowUpDown,
  lucideCalculator,
  lucideCalendar,
  lucideCheck,
  lucideDownload,
  lucideEdit,
  lucideEye,
  lucideFileCode,
  lucideFileText,
  lucideFilter,
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
import { PrintService } from '../../services/print.service';
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
      lucideArrowUp,
      lucideArrowDown,
      lucideArrowUpDown,
      lucideFilter,
      lucideCalendar,
    }),
  ],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);
  private readonly systemConfig = inject(SystemConfigService);
  private readonly barcodeService = inject(BarcodeService);
  private readonly notificationService = inject(NotificationService);
  private readonly printService = inject(PrintService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  products = this.inventoryService.products;
  igvPercentage = this.systemConfig.igvPercentage;

  searchQuery = signal('');

  currentPage = signal(1);
  itemsPerPage = signal(10);

  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  showFilters = signal(false);
  columnFilters = signal<Record<string, string>>({
    nombre: '',
    categoria: '',
    marca: '',
    codigoInterno: '',
    codigoBarras: '',
    createdAtFrom: '',
    createdAtTo: '',
    updatedAtFrom: '',
    updatedAtTo: '',
  });

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
    { key: 'createdAt', label: 'Creado', visible: true, alwaysVisible: false },
    { key: 'updatedAt', label: 'Actualizado', visible: true, alwaysVisible: false },
    { key: 'acciones', label: 'Acciones', visible: true, alwaysVisible: true },
  ]);

  private isUpdatingFromUrl = false;

  constructor() {
    effect(() => {
      if (this.isUpdatingFromUrl) return;

      const params: Record<string, string> = {};

      const page = this.currentPage();
      if (page > 1) params['page'] = String(page);

      const perPage = this.itemsPerPage();
      if (perPage !== 10) params['perPage'] = String(perPage);

      const search = this.searchQuery();
      if (search) params['search'] = search;

      const sortCol = this.sortColumn();
      const sortDir = this.sortDirection();
      if (sortCol) {
        params['sort'] = sortCol;
        params['order'] = sortDir;
      }

      const filters = this.columnFilters();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params[`filter_${ key }`] = value;
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'replace',
        replaceUrl: true,
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.isUpdatingFromUrl = true;

      if (params['page']) this.currentPage.set(Number(params['page']));
      if (params['perPage']) this.itemsPerPage.set(Number(params['perPage']));
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['sort']) this.sortColumn.set(params['sort']);
      if (params['order']) this.sortDirection.set(params['order'] as 'asc' | 'desc');

      const filters: Record<string, string> = {
        nombre: '',
        categoria: '',
        marca: '',
        codigoInterno: '',
        codigoBarras: '',
        createdAtFrom: '',
        createdAtTo: '',
        updatedAtFrom: '',
        updatedAtTo: '',
      };

      for (const key of Object.keys(params)) {
        if (key.startsWith('filter_')) {
          const filterKey = key.replace('filter_', '');
          filters[filterKey] = params[key];
        }
      }

      this.columnFilters.set(filters);

      setTimeout(() => {
        this.isUpdatingFromUrl = false;
      }, 0);
    });
  }

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
    const filters = this.columnFilters();
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();
    let products = this.products();

    if (query) {
      products = products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.codigoInterno.toLowerCase().includes(query) ||
          p.codigoBarras.toLowerCase().includes(query) ||
          p.marca.toLowerCase().includes(query)
      );
    }

    if (filters['nombre']) {
      const filterValue = filters['nombre'].toLowerCase();
      products = products.filter((p) => p.nombre.toLowerCase().includes(filterValue));
    }
    if (filters['categoria']) {
      const filterValue = filters['categoria'].toLowerCase();
      products = products.filter((p) => p.categoria.toLowerCase().includes(filterValue));
    }
    if (filters['marca']) {
      const filterValue = filters['marca'].toLowerCase();
      products = products.filter((p) => p.marca.toLowerCase().includes(filterValue));
    }
    if (filters['codigoInterno']) {
      const filterValue = filters['codigoInterno'].toLowerCase();
      products = products.filter((p) => p.codigoInterno.toLowerCase().includes(filterValue));
    }
    if (filters['codigoBarras']) {
      const filterValue = filters['codigoBarras'].toLowerCase();
      products = products.filter((p) => p.codigoBarras.toLowerCase().includes(filterValue));
    }

    if (filters['createdAtFrom']) {
      const fromDate = new Date(filters['createdAtFrom']);
      products = products.filter((p) => new Date(p.createdAt) >= fromDate);
    }
    if (filters['createdAtTo']) {
      const toDate = new Date(filters['createdAtTo']);
      toDate.setHours(23, 59, 59, 999);
      products = products.filter((p) => new Date(p.createdAt) <= toDate);
    }
    if (filters['updatedAtFrom']) {
      const fromDate = new Date(filters['updatedAtFrom']);
      products = products.filter((p) => new Date(p.updatedAt) >= fromDate);
    }
    if (filters['updatedAtTo']) {
      const toDate = new Date(filters['updatedAtTo']);
      toDate.setHours(23, 59, 59, 999);
      products = products.filter((p) => new Date(p.updatedAt) <= toDate);
    }

    if (sortCol) {
      products = [...products].sort((a, b) => {
        const valA = this.getSortValue(a, sortCol);
        const valB = this.getSortValue(b, sortCol);

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        const comparison = strA.localeCompare(strB);
        return sortDir === 'asc' ? comparison : -comparison;
      });
    }

    return products;
  });

  paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return products.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
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

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  updateColumnFilter(column: string, value: string) {
    this.columnFilters.update((filters) => ({ ...filters, [column]: value }));
    this.currentPage.set(1);
  }

  clearFilters() {
    this.columnFilters.set({
      nombre: '',
      categoria: '',
      marca: '',
      codigoInterno: '',
      codigoBarras: '',
      createdAtFrom: '',
      createdAtTo: '',
      updatedAtFrom: '',
      updatedAtTo: '',
    });
    this.currentPage.set(1);
  }

  hasActiveFilters(): boolean {
    const filters = this.columnFilters();
    return Object.values(filters).some((v) => v.trim() !== '');
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleSort(column: string) {
    const currentCol = this.sortColumn();
    const currentDir = this.sortDirection();

    if (currentCol === column) {
      if (currentDir === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortColumn.set(null);
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: string): string {
    const currentCol = this.sortColumn();
    if (currentCol !== column) return 'lucideArrowUpDown';
    return this.sortDirection() === 'asc' ? 'lucideArrowUp' : 'lucideArrowDown';
  }

  private getSortValue(product: Product, column: string): string | number {
    switch (column) {
      case 'nombre':
        return product.nombre;
      case 'categoria':
        return product.categoria;
      case 'marca':
        return product.marca;
      case 'descripcion':
        return product.descripcion;
      case 'stock':
        return product.stock;
      case 'precioCompra':
        return product.precioUnitarioCompra;
      case 'precioVenta':
        return product.precioUnitarioVenta;
      case 'totalCompra':
        return product.stock * product.precioUnitarioCompra;
      case 'totalVenta':
        return product.stock * product.precioUnitarioVenta;
      case 'codigoInterno':
        return product.codigoInterno;
      case 'codigoBarras':
        return product.codigoBarras;
      case 'factura':
        return product.supplierInvoices?.[0]?.numeroFactura ?? '';
      case 'proveedor':
        return product.supplierInvoices?.[0]?.suppliers?.razon_social ?? '';
      case 'createdAt':
        return product.createdAt;
      case 'updatedAt':
        return product.updatedAt;
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    await this.printService.printBarcodesToPdf(this.paginatedProducts());
  }

  async printLabels() {
    await this.printService.printLabels(this.paginatedProducts());
  }

  openPrintQuantityDialog(product: Product, type: 'barcode' | 'label') {
    if (type === 'barcode') {
      this.printProductBarcode(product, 1).then(() => undefined);
    } else {
      this.printProductLabel(product, 1).then(() => undefined);
    }
  }

  async printProductBarcode(product: Product, copies: number) {
    await this.printService.printProductBarcode(product, copies);
  }

  async printProductLabel(product: Product, copies: number) {
    await this.printService.printProductLabel(product, copies);
  }

  async updateAllBarcodesToCompact() {
    const confirmed = globalThis.confirm(
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
