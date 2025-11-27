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
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-price-calculator-dialog',
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideX })],
  templateUrl: './price-calculator-dialog.html',
  styleUrl: './price-calculator-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceCalculatorDialogComponent implements OnInit {
  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ precioUnitarioCompra: number; precioUnitarioVenta: number }>();

  editablePurchasePrice = signal<number>(0);
  profitAmount = signal<number>(0);

  calculatedPrice = computed(() => {
    return this.editablePurchasePrice() + this.profitAmount();
  });

  ngOnInit() {
    this.editablePurchasePrice.set(this.product().precioUnitarioCompra);
  }

  updatePurchasePrice(value: number) {
    this.editablePurchasePrice.set(Number(value) || 0);
  }

  updateProfitAmount(value: number) {
    this.profitAmount.set(Number(value) || 0);
  }

  onApply() {
    this.apply.emit({
      precioUnitarioCompra: this.editablePurchasePrice(),
      precioUnitarioVenta: this.calculatedPrice(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
