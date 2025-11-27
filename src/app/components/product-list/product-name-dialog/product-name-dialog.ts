import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-product-name-dialog',
  imports: [HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX })],
  templateUrl: './product-name-dialog.html',
  styleUrl: './product-name-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductNameDialogComponent implements OnInit {
  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ nombre: string; descripcion: string }>();

  nombre = signal('');
  descripcion = signal('');

  ngOnInit() {
    this.nombre.set(this.product().nombre);
    this.descripcion.set(this.product().descripcion);
  }

  onApply() {
    const nombre = this.nombre().trim();
    if (!nombre) return;

    this.apply.emit({
      nombre,
      descripcion: this.descripcion().trim(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
