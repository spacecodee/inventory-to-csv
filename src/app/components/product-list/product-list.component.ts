import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideEye, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { ExcelService } from '../../services/excel.service';
import { InventoryService } from '../../services/inventory.service';
import { ProductDetailComponent } from './product-detail.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, HlmIconImports, ProductDetailComponent],
  providers: [provideIcons({ lucideTrash2, lucideDownload, lucideX, lucideEye })],
  template: `
    <div class="w-full max-w-7xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
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
              <th class="px-6 py-3">Imagen</th>
              <th class="px-6 py-3">Nombre</th>
              <th class="px-6 py-3">Categoría</th>
              <th class="px-6 py-3">Código</th>
              <th class="px-6 py-3">Código Barras</th>
              <th class="px-6 py-3">Acciones</th>
            </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr class="bg-card border-b border-border hover:bg-secondary/20 transition-colors">
                  <td class="px-6 py-4">
                    <div
                      class="w-12 h-12 rounded-md bg-secondary overflow-hidden flex items-center justify-center text-xs text-muted-foreground"
                    >
                      IMG
                    </div>
                  </td>
                  <td class="px-6 py-4 font-medium text-foreground">{{ product.nombre }}</td>
                  <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-full bg-primary/10 text-primary-foreground text-xs font-medium"
                  style="color: var(--primary)"
                >
                  {{ product.categoria }}
                </span>
                  </td>
                  <td class="px-6 py-4 text-muted-foreground">{{ product.codigoInterno }}</td>
                  <td class="px-6 py-4 font-mono text-xs">{{ product.codigoBarras }}</td>
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
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (selectedProduct()) {
      <app-product-detail
        [product]="selectedProduct()!"
        (closeModal)="selectedProduct.set(null)"
      ></app-product-detail>
    }
  `,
})
export class ProductListComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly excelService = inject(ExcelService);

  products = this.inventoryService.products;
  selectedProduct = signal<Product | null>(null);

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
    this.selectedProduct.set(product);
  }
}
