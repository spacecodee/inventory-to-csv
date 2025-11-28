import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
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
  templateUrl: './print-quantity-dialog.html',
  styleUrl: './print-quantity-dialog.css',
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

  updateCopies(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      const max = this.product()?.stock || 1;
      this.copies.set(Math.min(value, max));
    }
  }

  onConfirm() {
    const product = this.product();
    if (product && this.copies() > 0) {
      this.confirm.emit({ product, copies: this.copies() });
    }
  }

  onClose() {
    this.cancel.emit();
  }
}
