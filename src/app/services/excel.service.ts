import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Product } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  exportToExcel(products: Product[], fileName: string = 'inventario.xlsx') {
    const headers = [
      'Nombre',
      'Código Interno',
      'Modelo',
      'Código Sunat',
      'Código Tipo de Unidad',
      'Código Tipo de Moneda',
      'Precio Unitario Venta',
      'Codigo Tipo de Afectación del Igv Venta',
      'Tiene Igv',
      'Precio Unitario Compra',
      'Codigo Tipo de Afectación del Igv Compra',
      'Stock',
      'Stock Mínimo',
      'Categoria',
      'Marca',
      'Descripcion',
      'Nombre secundario',
      'Código lote',
      'Fec. Vencimiento',
      'Cód barras',
      'Imágenes',
    ];

    const data = products.map((p) => [
      p.nombre,
      p.codigoInterno,
      p.modelo,
      p.codigoSunat,
      p.codigoTipoUnidad,
      p.codigoTipoMoneda,
      p.precioUnitarioVenta,
      p.codigoTipoAfectacionIgvVenta,
      p.tieneIgv ? 'SI' : 'NO',
      p.precioUnitarioCompra,
      p.codigoTipoAfectacionIgvCompra,
      p.stock,
      p.stockMinimo,
      p.categoria,
      p.marca,
      p.descripcion,
      p.nombreSecundario,
      p.codigoLote,
      p.fechaVencimiento,
      p.codigoBarras,
      p.imagenes.join(', '),
    ]);

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, fileName);
  }
}
