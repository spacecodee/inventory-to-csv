import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';
import { SystemConfigService } from '../../../services/system-config.service';

@Component({
  selector: 'app-price-calculator-dialog',
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideX })],
  templateUrl: './price-calculator-dialog.html',
  styleUrl: './price-calculator-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceCalculatorDialogComponent implements OnInit {
  private readonly systemConfig = inject(SystemConfigService);

  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{
    precioUnitarioCompra: number;
    precioUnitarioVenta: number;
    tieneIgv: boolean;
  }>();

  editablePurchasePrice = signal<number>(0);
  profitAmount = signal<number>(0);
  transportCost = signal<number>(0);
  applyIgv = signal<boolean>(true);

  igvPercentage = this.systemConfig.igvPercentage;

  subtotal = computed(() => {
    return this.editablePurchasePrice() + this.profitAmount() + this.transportCost();
  });

  igvAmount = computed(() => {
    if (!this.applyIgv()) return 0;
    return this.subtotal() * (this.igvPercentage() / 100);
  });

  calculatedPrice = computed(() => {
    return this.subtotal() + this.igvAmount();
  });

  ngOnInit() {
    this.editablePurchasePrice.set(this.product().precioUnitarioCompra);
    this.transportCost.set(this.systemConfig.transportCost());
    this.applyIgv.set(this.product().tieneIgv);
  }

  updatePurchasePrice(value: number) {
    this.editablePurchasePrice.set(Number(value) || 0);
  }

  updateProfitAmount(value: number) {
    this.profitAmount.set(Number(value) || 0);
  }

  updateTransportCost(value: number) {
    this.transportCost.set(Number(value) || 0);
  }

  toggleIgv() {
    this.applyIgv.update((v) => !v);
  }

  onApply() {
    this.apply.emit({
      precioUnitarioCompra: this.editablePurchasePrice(),
      precioUnitarioVenta: this.calculatedPrice(),
      tieneIgv: this.applyIgv(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
