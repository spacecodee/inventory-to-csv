import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideEdit, lucideSave, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, HlmIconImports, ReactiveFormsModule],
  providers: [provideIcons({ lucideX, lucideEdit, lucideSave })],
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
          <h2 class="text-2xl font-bold text-foreground">
            {{ isEditing() ? 'Editar Producto' : 'Detalle del Producto' }}
          </h2>
          <div class="flex items-center gap-2">
            @if (!isEditing()) {
              <button
                (click)="enableEdit()"
                class="text-muted-foreground hover:text-primary transition-colors p-2"
                title="Editar"
              >
                <ng-icon hlm [name]="editIcon" size="lg"></ng-icon>
              </button>
            }
            <button
              (click)="closeModal.emit()"
              class="text-muted-foreground hover:text-foreground transition-colors p-2"
              title="Cerrar"
            >
              <ng-icon hlm [name]="closeIcon" size="lg"></ng-icon>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto p-6 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Images Section (Always Read-Only) -->
            <div class="col-span-1 md:col-span-2 mb-4">
              <h3 class="text-lg font-semibold mb-3 text-primary">Imágenes</h3>
              <div class="flex gap-4 overflow-x-auto pb-2">
                @if (imageUrls().length > 0) {
                  @for (item of imageUrls(); track $index) {
                    <div
                      class="relative group rounded-lg overflow-hidden border border-border w-48 h-48 flex-shrink-0 bg-secondary/10"
                    >
                      <img [src]="item.url" class="w-full h-full object-cover" alt="Product Image"/>
                      <div
                        class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate text-center"
                      >
                        {{ item.name }}
                      </div>
                    </div>
                  }
                } @else {
                  <div
                    class="p-4 border border-dashed border-border rounded-lg text-muted-foreground w-full text-center"
                  >
                    No hay previsualización de imágenes disponible.
                    <div class="mt-2 text-xs">
                      Archivos originales: {{ product().imagenes.join(', ') }}
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Fields -->
            @if (isEditing()) {
              <form [formGroup]="form" class="contents">
                @for (field of fields; track field.key) {
                  @if (field.key !== 'imagenes') {
                    <div class="flex flex-col gap-1">
                      <label
                        [for]="field.key"
                        class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {{ field.label }}
                      </label>
                      @if (field.type === 'boolean') {
                        <select
                          [id]="field.key"
                          [formControlName]="field.key"
                          class="p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-ring"
                        >
                          <option [ngValue]="true">Sí</option>
                          <option [ngValue]="false">No</option>
                        </select>
                      } @else {
                        <input
                          [id]="field.key"
                          [type]="field.type || 'text'"
                          [formControlName]="field.key"
                          class="p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-ring"
                        />
                      }
                    </div>
                  }
                }
              </form>
            } @else {
              @for (field of fields; track field.label) {
                <div class="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-border/50">
              <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{{
                  field.label
                }}</span>
                  <span class="font-medium text-foreground break-words">{{ getValue(field.key) }}</span>
                </div>
              }
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border bg-secondary/20 flex justify-end gap-3">
          @if (isEditing()) {
            <button
              (click)="cancelEdit()"
              class="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="saveEdit()"
              [disabled]="form.invalid"
              class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <ng-icon hlm [name]="saveIcon" size="sm"></ng-icon>
              Guardar
            </button>
          } @else {
            <button
              (click)="closeModal.emit()"
              class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cerrar
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProductDetailComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);

  product = input.required<Product>();
  closeModal = output<void>();

  isEditing = signal(false);
  form!: FormGroup;

  protected readonly closeIcon = 'lucideX';
  protected readonly editIcon = 'lucideEdit';
  protected readonly saveIcon = 'lucideSave';

  private readonly localFiles = signal<File[]>([]);

  fields = [
    { label: 'Nombre', key: 'nombre', type: 'text' },
    { label: 'Código Interno', key: 'codigoInterno', type: 'text' },
    { label: 'Modelo', key: 'modelo', type: 'text' },
    { label: 'Código Sunat', key: 'codigoSunat', type: 'text' },
    { label: 'Código Tipo de Unidad', key: 'codigoTipoUnidad', type: 'text' },
    { label: 'Código Tipo de Moneda', key: 'codigoTipoMoneda', type: 'text' },
    { label: 'Precio Unitario Venta', key: 'precioUnitarioVenta', type: 'number' },
    {
      label: 'Codigo Tipo de Afectación del Igv Venta',
      key: 'codigoTipoAfectacionIgvVenta',
      type: 'text',
    },
    { label: 'Tiene Igv', key: 'tieneIgv', type: 'boolean' },
    { label: 'Precio Unitario Compra', key: 'precioUnitarioCompra', type: 'number' },
    {
      label: 'Codigo Tipo de Afectación del Igv Compra',
      key: 'codigoTipoAfectacionIgvCompra',
      type: 'text',
    },
    { label: 'Stock', key: 'stock', type: 'number' },
    { label: 'Stock Mínimo', key: 'stockMinimo', type: 'number' },
    { label: 'Categoria', key: 'categoria', type: 'text' },
    { label: 'Marca', key: 'marca', type: 'text' },
    { label: 'Descripcion', key: 'descripcion', type: 'text' },
    { label: 'Nombre secundario', key: 'nombreSecundario', type: 'text' },
    { label: 'Código lote', key: 'codigoLote', type: 'text' },
    { label: 'Fec. Vencimiento', key: 'fechaVencimiento', type: 'date' },
    { label: 'Cód barras', key: 'codigoBarras', type: 'text' },
    { label: 'Nombres de Imágenes', key: 'imagenes', type: 'text' },
  ];

  constructor() {
    effect(() => {
      const p = this.product();
      this.localFiles.set([]);

      if (p.imageFiles && p.imageFiles.length > 0) {
        this.localFiles.set(p.imageFiles);
      } else {
        this.inventoryService.getProductImages(p.id).then((files) => {
          if (files.length > 0) {
            this.localFiles.set(files);
          }
        });
      }
    });
  }

  // Computed signal to generate stable URLs for images
  imageUrls = computed(() => {
    const files = this.localFiles();
    return files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  });

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

  enableEdit() {
    const p = this.product();
    this.form = this.fb.group({
      nombre: [p.nombre, Validators.required],
      codigoInterno: [p.codigoInterno],
      modelo: [p.modelo],
      codigoSunat: [p.codigoSunat],
      codigoTipoUnidad: [p.codigoTipoUnidad],
      codigoTipoMoneda: [p.codigoTipoMoneda],
      precioUnitarioVenta: [p.precioUnitarioVenta],
      codigoTipoAfectacionIgvVenta: [p.codigoTipoAfectacionIgvVenta],
      tieneIgv: [p.tieneIgv],
      precioUnitarioCompra: [p.precioUnitarioCompra],
      codigoTipoAfectacionIgvCompra: [p.codigoTipoAfectacionIgvCompra],
      stock: [p.stock],
      stockMinimo: [p.stockMinimo],
      categoria: [p.categoria],
      marca: [p.marca],
      descripcion: [p.descripcion],
      nombreSecundario: [p.nombreSecundario],
      codigoLote: [p.codigoLote],
      fechaVencimiento: [p.fechaVencimiento],
      codigoBarras: [p.codigoBarras],
      // Images are not editable
    });
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    if (this.form.valid) {
      const updatedValues = this.form.value;
      const updatedProduct: Product = {
        ...this.product(),
        ...updatedValues,
      };
      this.inventoryService.updateProduct(updatedProduct);
      this.isEditing.set(false);
    }
  }
}
