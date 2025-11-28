import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucidePrinter, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-print-quantity-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmIconImports],
  providers: [provideIcons({ lucidePrinter, lucideX })],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">{{ printType() === 'barcode' ? 'Imprimir Códigos' : 'Imprimir Etiquetas' }}</h2>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
            <svg ngIcon="lucideX" class="w-5 h-5"></svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 mb-2">Producto: <span class="font-bold">{{ product()?.nombre }}</span></p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Cantidad a imprimir (Stock disponible)</label>
            <div class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-semibold">
              {{ copies() }} unidades
            </div>
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <button (click)="onCancel()" class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
              Cancelar
            </button>
            <button (click)="onConfirm()" class="px-4 py-2 text-sm bg-slate-700 text-white rounded-md hover:bg-slate-800 flex items-center gap-2">
              <svg ngIcon="lucidePrinter" class="w-4 h-4"></svg>
              Imprimir {{ copies() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintQuantityDialogComponent implements OnInit {
  product = input<Product | null>(null);
  printType = input<'barcode' | 'label'>('barcode');

  confirm = output<{ product: Product; copies: number }>();
  cancel = output<void>();

  copies = signal(0);

  ngOnInit() {
    const stock = this.product()?.stock || 0;
    this.copies.set(stock);
  }

  onConfirm() {
    const product = this.product();
    if (product && this.copies() > 0) {
      this.confirm.emit({ product, copies: this.copies() });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
