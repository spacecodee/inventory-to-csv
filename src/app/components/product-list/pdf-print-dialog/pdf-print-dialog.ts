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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';
import { PrintOptions } from '../../../services/pdf-print.service';

@Component({
  selector: 'app-pdf-print-dialog',
  imports: [CommonModule, ReactiveFormsModule, HlmIconImports],
  providers: [provideIcons({ lucideX })],
  templateUrl: './pdf-print-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPrintDialogComponent implements OnInit {
  products = input.required<Product[]>();
  printPdf = output<PrintOptions>();
  closeDialog = output<void>();

  private readonly fb = inject(FormBuilder);

  form!: FormGroup;
  totalProducts = computed(() => this.products().length);
  filteredProductCount = signal(0);
  estimatedPages = signal(1);
  canPrint = computed(() => this.filteredProductCount() > 0);

  ngOnInit(): void {
    this.form = this.fb.group({
      startDate: [''],
      endDate: [''],
      sortBy: ['name', Validators.required],
      sortOrder: ['asc', Validators.required],
      barcodeSize: ['medium', Validators.required],
      includeProductName: [true],
      includeProductCode: [true],
    });

    this.updateFilteredCount();
    this.form.valueChanges.subscribe(() => this.updateFilteredCount());
  }

  private updateFilteredCount(): void {
    const startDate = this.form.get('startDate')?.value
      ? new Date(this.form.get('startDate')?.value)
      : null;
    const endDate = this.form.get('endDate')?.value
      ? new Date(this.form.get('endDate')?.value)
      : null;

    let count = this.products().length;

    if (startDate || endDate) {
      count = this.products().filter((p) => {
        const createdDate = new Date(p.createdAt);
        if (startDate && createdDate < startDate) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (createdDate > end) return false;
        }
        return true;
      }).length;
    }

    this.filteredProductCount.set(count);
  }

  onPrint(): void {
    if (this.form.invalid || this.filteredProductCount() === 0) return;

    const values = this.form.value;
    const options: PrintOptions = {
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      selectedProducts: this.products(),
      sortBy: values.sortBy,
      sortOrder: values.sortOrder,
      barcodeSize: values.barcodeSize,
      includeProductName: values.includeProductName,
      includeProductCode: values.includeProductCode,
    };

    this.printPdf.emit(options);
  }

  onCancel(): void {
    this.closeDialog.emit();
  }
}
