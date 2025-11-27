import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucidePackage, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-stock-editor-dialog',
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideX, lucidePackage })],
  templateUrl: './stock-editor-dialog.html',
  styleUrl: './stock-editor-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockEditorDialogComponent implements OnInit {
  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ stock: number; stockMinimo: number }>();

  editableStock = signal<number>(0);
  editableStockMinimo = signal<number>(0);

  isStockLow = computed(() => {
    return this.editableStock() <= this.editableStockMinimo() && this.editableStockMinimo() > 0;
  });

  ngOnInit() {
    this.editableStock.set(this.product().stock);
    this.editableStockMinimo.set(this.product().stockMinimo);
  }

  updateStock(value: number) {
    this.editableStock.set(Number(value) || 0);
  }

  updateStockMinimo(value: number) {
    this.editableStockMinimo.set(Number(value) || 0);
  }

  onApply() {
    this.apply.emit({
      stock: this.editableStock(),
      stockMinimo: this.editableStockMinimo(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
