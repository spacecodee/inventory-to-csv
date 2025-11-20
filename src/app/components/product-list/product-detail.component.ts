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
  templateUrl: './product-detail.component.html',
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
