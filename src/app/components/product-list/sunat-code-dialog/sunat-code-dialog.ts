import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-sunat-code-dialog',
  imports: [CommonModule, HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX })],
  templateUrl: './sunat-code-dialog.html',
  styleUrl: './sunat-code-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunatCodeDialogComponent implements OnInit {
  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ codigoSunat: string }>();

  editableCodigoSunat = signal<string>('');

  ngOnInit() {
    this.editableCodigoSunat.set(this.product().codigoSunat);
  }

  updateCodigoSunat(value: string) {
    this.editableCodigoSunat.set(value);
  }

  onApply() {
    this.apply.emit({
      codigoSunat: this.editableCodigoSunat(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
