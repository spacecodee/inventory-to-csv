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
  { value: 'X', label: 'X - Unisex' },
  { value: 'N', label: 'N - No Aplica' },
  { value: 'G', label: 'G - Genérico' },
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
    if (barcode.length <= 2) return barcode;
    return barcode.substring(0, barcode.length - 2);
  });

  currentSuffix = computed(() => {
    const barcode = this.product().codigoBarras;
    if (barcode.length <= 2) return 'G';
    return barcode[barcode.length - 2];
  });

  newBarcode = computed(() => {
    const checkDigit = Math.floor(Math.random() * 10);
    return `${ this.barcodeBase() }${ this.selectedSuffix() }${ checkDigit }`;
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
