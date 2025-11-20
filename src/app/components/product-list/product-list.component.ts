import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideDownload,
  lucideEye,
  lucideSearch,
  lucideSettings2,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { ExcelService } from '../../services/excel.service';
import { InventoryService } from '../../services/inventory.service';
import { ProductDetailComponent } from './product-detail.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, HlmIconImports, ProductDetailComponent, FormsModule],
  providers: [
    provideIcons({
      lucideTrash2,
      lucideDownload,
      lucideX,
      lucideEye,
      lucideSearch,
      lucideSettings2,
      lucideCheck,
    }),
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);

  products = this.inventoryService.products;

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
    { key: 'codigoInterno', label: 'Código', visible: true, alwaysVisible: false },
    { key: 'codigoBarras', label: 'Código Barras', visible: true, alwaysVisible: false },
    { key: 'acciones', label: 'Acciones', visible: true, alwaysVisible: true },
  ]);

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
    this.inventoryService.removeProduct(id);
  }

  clearList() {
    this.inventoryService.clearProducts();
  }

  downloadExcel() {
    this.excelService.exportToExcel(this.products());
  }

  viewProduct(product: Product) {
    this.selectedProductId.set(product.id);
  }
}
