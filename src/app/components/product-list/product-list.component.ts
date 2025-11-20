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
  template: `
    <div class="w-full max-w-7xl mx-auto p-6">
      <div class="flex flex-col gap-6 mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-foreground">
            Productos Generados ({{ products().length }})
          </h2>

          <div class="flex gap-3">
            <button
              (click)="clearList()"
              class="px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
              [disabled]="products().length === 0"
            >
              <ng-icon hlm name="lucideTrash2" size="sm"></ng-icon>
              Limpiar
            </button>

            <button
              (click)="downloadExcel()"
              class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
              [disabled]="products().length === 0"
            >
              <ng-icon hlm name="lucideDownload" size="sm"></ng-icon>
              Descargar Excel
            </button>
          </div>
        </div>

        <!-- Filters & Search -->
        <div
          class="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm"
        >
          <!-- Search -->
          <div class="relative w-full md:w-96">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ng-icon hlm name="lucideSearch" size="sm"></ng-icon>
            </div>
            <input
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              type="text"
              placeholder="Buscar por nombre, código o barras..."
              class="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/20 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <!-- Column Toggle -->
          <div class="relative group">
            <button
              class="px-4 py-2 rounded-lg bg-secondary/20 border border-border hover:bg-secondary/40 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ng-icon hlm name="lucideSettings2" size="sm"></ng-icon>
              Columnas
            </button>

            <!-- Dropdown -->
            <div
              class="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg shadow-lg border border-border p-2 z-10 hidden group-hover:block hover:block"
            >
              <div class="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                Mostrar Columnas
              </div>
              @for (col of availableColumns(); track col.key) {
                <button
                  (click)="toggleColumn(col.key)"
                  class="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary/20 text-sm transition-colors"
                  [class.opacity-50]="col.alwaysVisible"
                  [disabled]="col.alwaysVisible"
                >
                  <span>{{ col.label }}</span>
                  @if (col.visible) {
                    <ng-icon hlm name="lucideCheck" size="sm" class="text-primary"></ng-icon>
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      @if (products().length === 0) {
        <div class="text-center py-20 bg-secondary/30 rounded-xl border border-dashed border-border">
          <p class="text-muted-foreground">No hay productos procesados aún.</p>
        </div>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table class="w-full text-sm text-left">
            <thead
              class="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border"
            >
            <tr>
              @if (columnVisibility()['imagen']) {
                <th class="px-6 py-3">Imagen</th>
              }
              @if (columnVisibility()['nombre']) {
                <th class="px-6 py-3">Nombre</th>
              }
              @if (columnVisibility()['categoria']) {
                <th class="px-6 py-3">Categoría</th>
              }
              @if (columnVisibility()['marca']) {
                <th class="px-6 py-3">Marca</th>
              }
              @if (columnVisibility()['descripcion']) {
                <th class="px-6 py-3">Descripción</th>
              }
              @if (columnVisibility()['stock']) {
                <th class="px-6 py-3">Stock</th>
              }
              @if (columnVisibility()['codigoInterno']) {
                <th class="px-6 py-3">Código</th>
              }
              @if (columnVisibility()['codigoBarras']) {
                <th class="px-6 py-3">Código Barras</th>
              }
              @if (columnVisibility()['acciones']) {
                <th class="px-6 py-3">Acciones</th>
              }
            </tr>
            </thead>
            <tbody>
              @for (product of filteredProducts(); track product.id) {
                <tr class="bg-card border-b border-border hover:bg-secondary/20 transition-colors">
                  @if (columnVisibility()['imagen']) {
                    <td class="px-6 py-4">
                      <div
                        class="w-12 h-12 rounded-md bg-secondary overflow-hidden flex items-center justify-center text-xs text-muted-foreground"
                      >
                        IMG
                      </div>
                    </td>
                  }
                  @if (columnVisibility()['nombre']) {
                    <td class="px-6 py-4 font-medium text-foreground">{{ product.nombre }}</td>
                  }
                  @if (columnVisibility()['categoria']) {
                    <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full bg-primary/10 text-primary-foreground text-xs font-medium"
                  style="color: var(--primary)"
                >
                  {{ product.categoria }}
                </span>
                    </td>
                  }
                  @if (columnVisibility()['marca']) {
                    <td class="px-6 py-4 text-muted-foreground">{{ product.marca }}</td>
                  }
                  @if (columnVisibility()['descripcion']) {
                    <td
                      class="px-6 py-4 text-muted-foreground max-w-xs truncate"
                      [title]="product.descripcion"
                    >
                      {{ product.descripcion }}
                    </td>
                  }
                  @if (columnVisibility()['stock']) {
                    <td class="px-6 py-4 text-muted-foreground">{{ product.stock }}</td>
                  }
                  @if (columnVisibility()['codigoInterno']) {
                    <td class="px-6 py-4 text-muted-foreground">{{ product.codigoInterno }}</td>
                  }
                  @if (columnVisibility()['codigoBarras']) {
                    <td class="px-6 py-4 font-mono text-xs">{{ product.codigoBarras }}</td>
                  }
                  @if (columnVisibility()['acciones']) {
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="viewProduct(product)"
                          class="text-primary hover:text-primary/80 transition-colors"
                          title="Ver Detalle"
                        >
                          <ng-icon hlm name="lucideEye" size="sm"></ng-icon>
                        </button>
                        <button
                          (click)="removeProduct(product.id)"
                          class="text-destructive hover:text-destructive/80 transition-colors"
                          title="Eliminar"
                        >
                          <ng-icon hlm name="lucideX" size="sm"></ng-icon>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (activeProduct()) {
      <app-product-detail
        [product]="activeProduct()!"
        (closeModal)="selectedProductId.set(null)"
      ></app-product-detail>
    }
  `,
})
export class ProductListComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);

  products = this.inventoryService.products;

  // Search State
  searchQuery = signal('');

  // Column Configuration
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

  columnVisibility = computed(() => {
    return this.availableColumns().reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Actions
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
