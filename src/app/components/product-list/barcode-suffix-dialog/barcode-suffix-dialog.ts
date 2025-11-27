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
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

export const BARCODE_SUFFIXES = [
  { value: 'H', label: 'H - Hombre' },
  { value: 'M', label: 'M - Mujer' },
  { value: 'MIX', label: 'MIX - Unisex' },
  { value: 'NA', label: 'NA - No Aplica' },
  { value: 'GEN', label: 'GEN - Genérico' },
];

@Component({
  selector: 'app-barcode-suffix-dialog',
  imports: [CommonModule, HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX })],
  templateUrl: './barcode-suffix-dialog.html',
  styleUrl: './barcode-suffix-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeSuffixDialogComponent implements OnInit {
  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ codigoBarras: string }>();

  selectedSuffix = signal<string>('GEN');
  readonly suffixes = BARCODE_SUFFIXES;

  barcodeBase = computed(() => {
    const barcode = this.product().codigoBarras;
    const dashIndex = barcode.lastIndexOf('-');
    if (dashIndex === -1) return barcode;
    return barcode.substring(0, dashIndex);
  });

  currentSuffix = computed(() => {
    const barcode = this.product().codigoBarras;
    const dashIndex = barcode.lastIndexOf('-');
    if (dashIndex === -1) return 'GEN';
    return barcode.substring(dashIndex + 1);
  });

  newBarcode = computed(() => {
    return `${ this.barcodeBase() }-${ this.selectedSuffix() }`;
  });

  ngOnInit() {
    this.selectedSuffix.set(this.currentSuffix());
  }

  updateSuffix(value: string) {
    this.selectedSuffix.set(value);
  }

  onApply() {
    this.apply.emit({
      codigoBarras: this.newBarcode(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
