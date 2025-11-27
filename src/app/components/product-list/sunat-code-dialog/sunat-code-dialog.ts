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
  apply = output<{
    codigoSunat: string;
    codigoTipoAfectacionIgvVenta: string;
    codigoTipoAfectacionIgvCompra: string;
  }>();

  editableCodigoSunat = signal<string>('');
  editableCodigoAfectacionIgvVenta = signal<string>('');
  editableCodigoAfectacionIgvCompra = signal<string>('');

  readonly afectacionOptions = [
    { value: '10', label: '10 - Gravado - Operacion Onerosa' },
    { value: '11', label: '11 - Gravado - Retiro por premio' },
    { value: '12', label: '12 - Gravado - Retiro por donacion' },
    { value: '13', label: '13 - Gravado - Retiro' },
    { value: '14', label: '14 - Gravado - Retiro por publicidad' },
    { value: '15', label: '15 - Gravado - Bonificaciones' },
    { value: '16', label: '16 - Gravado - Retiro por entrega a trabajadores' },
    { value: '17', label: '17 - Gravado - IVAP' },
    { value: '20', label: '20 - Exonerado - Operacion Onerosa' },
    { value: '21', label: '21 - Exonerado - Transferencia gratuita' },
    { value: '30', label: '30 - Inafecto - Operacion Onerosa' },
    { value: '31', label: '31 - Inafecto - Retiro por bonificacion' },
    { value: '32', label: '32 - Inafecto - Retiro' },
    { value: '33', label: '33 - Inafecto - Retiro por muestras medicas' },
    { value: '34', label: '34 - Inafecto - Retiro por convenio colectivo' },
    { value: '35', label: '35 - Inafecto - Retiro por premio' },
    { value: '36', label: '36 - Inafecto - Retiro por publicidad' },
    { value: '40', label: '40 - Exportacion de bienes o servicios' },
  ];

  ngOnInit() {
    this.editableCodigoSunat.set(this.product().codigoSunat);
    this.editableCodigoAfectacionIgvVenta.set(this.product().codigoTipoAfectacionIgvVenta || '10');
    this.editableCodigoAfectacionIgvCompra.set(
      this.product().codigoTipoAfectacionIgvCompra || '10'
    );
  }

  updateCodigoSunat(value: string) {
    this.editableCodigoSunat.set(value);
  }

  updateCodigoAfectacionVenta(value: string) {
    this.editableCodigoAfectacionIgvVenta.set(value);
  }

  updateCodigoAfectacionCompra(value: string) {
    this.editableCodigoAfectacionIgvCompra.set(value);
  }

  onApply() {
    this.apply.emit({
      codigoSunat: this.editableCodigoSunat(),
      codigoTipoAfectacionIgvVenta: this.editableCodigoAfectacionIgvVenta(),
      codigoTipoAfectacionIgvCompra: this.editableCodigoAfectacionIgvCompra(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
