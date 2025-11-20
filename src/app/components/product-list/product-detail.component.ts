import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideX })],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      (click)="closeModal.emit()"
    >
      <div
        class="bg-card w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-6 border-b border-border bg-secondary/20">
          <h2 class="text-2xl font-bold text-foreground">Detalle del Producto</h2>
          <button
            (click)="closeModal.emit()"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ng-icon hlm [name]="closeIcon" size="lg"></ng-icon>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto p-6 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Images Section -->
            <div class="col-span-1 md:col-span-2 mb-4">
              <h3 class="text-lg font-semibold mb-3 text-primary">Imágenes</h3>
              <div class="flex gap-4 overflow-x-auto pb-2">
                @if (product().imageFiles && product().imageFiles!.length > 0) {
                  @for (file of
                    product().imageFiles; track $index) {
                    <div
                      class="relative group rounded-lg overflow-hidden border border-border w-48 h-48 flex-shrink-0 bg-secondary/10"
                    >
                      <img
                        [src]="getObjectUrl(file)"
                        class="w-full h-full object-cover"
                        alt="Product Image"
                      />
                      <div
                        class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate text-center"
                      >
                        {{ file.name }}
                      </div>
                    </div>
                  }
                } @else {
                  <div
                    class="p-4 border border-dashed border-border rounded-lg text-muted-foreground w-full text-center"
                  >
                    No hay previsualización de imágenes disponible (recargado desde almacenamiento).
                    <div class="mt-2 text-xs">
                      Archivos originales: {{ product().imagenes.join(', ') }}
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Fields -->
            @for (field of fields; track field.label) {
              <div class="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-border/50">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{{
                  field.label
                }}</span>
                <span class="font-medium text-foreground break-words">{{ getValue(field.key) }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border bg-secondary/20 flex justify-end">
          <button
            (click)="closeModal.emit()"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductDetailComponent {
  product = input.required<Product>();
  closeModal = output<void>();

  protected readonly closeIcon: any = 'lucideX';

  fields = [
    { label: 'Nombre', key: 'nombre' },
    { label: 'Código Interno', key: 'codigoInterno' },
    { label: 'Modelo', key: 'modelo' },
    { label: 'Código Sunat', key: 'codigoSunat' },
    { label: 'Código Tipo de Unidad', key: 'codigoTipoUnidad' },
    { label: 'Código Tipo de Moneda', key: 'codigoTipoMoneda' },
    { label: 'Precio Unitario Venta', key: 'precioUnitarioVenta' },
    { label: 'Codigo Tipo de Afectación del Igv Venta', key: 'codigoTipoAfectacionIgvVenta' },
    { label: 'Tiene Igv', key: 'tieneIgv' },
    { label: 'Precio Unitario Compra', key: 'precioUnitarioCompra' },
    { label: 'Codigo Tipo de Afectación del Igv Compra', key: 'codigoTipoAfectacionIgvCompra' },
    { label: 'Stock', key: 'stock' },
    { label: 'Stock Mínimo', key: 'stockMinimo' },
    { label: 'Categoria', key: 'categoria' },
    { label: 'Marca', key: 'marca' },
    { label: 'Descripcion', key: 'descripcion' },
    { label: 'Nombre secundario', key: 'nombreSecundario' },
    { label: 'Código lote', key: 'codigoLote' },
    { label: 'Fec. Vencimiento', key: 'fechaVencimiento' },
    { label: 'Cód barras', key: 'codigoBarras' },
    { label: 'Nombres de Imágenes', key: 'imagenes' },
  ];

  getValue(key: string): any {
    const val = (this.product() as any)[key];
    if (key === 'imagenes' && Array.isArray(val)) {
      return val.join(', ');
    }
    if (typeof val === 'boolean') {
      return val ? 'Sí' : 'No';
    }
    return val || '-';
  }

  getObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }
}
