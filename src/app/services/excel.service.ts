import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Product } from '../models/inventory.model';

export interface ExcelImportResult {
  updated: number;
  notFound: number;
  errors: string[];
  details: {
    identifier: string;
    status: 'updated' | 'not_found' | 'error';
    message?: string;
  }[];
}

export interface ExcelProductRow {
  nombre?: string;
  codigoInterno?: string;
  modelo?: string;
  codigoSunat?: string;
  codigoTipoUnidad?: string;
  codigoTipoMoneda?: string;
  precioUnitarioVenta?: number;
  codigoTipoAfectacionIgvVenta?: string;
  tieneIgv?: boolean;
  precioUnitarioCompra?: number;
  codigoTipoAfectacionIgvCompra?: string;
  stock?: number;
  stockMinimo?: number;
  categoria?: string;
  marca?: string;
  descripcion?: string;
  nombreSecundario?: string;
  codigoLote?: string;
  fechaVencimiento?: string;
  codigoBarras?: string;
}

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
    ]);

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, fileName);
  }

  async parseExcelFile(file: File): Promise<ExcelProductRow[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      return jsonData.map((row) => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Error al leer el archivo: ${ error }`);
    }
  }

  private mapRowToProduct(row: Record<string, unknown>): ExcelProductRow {
    const getString = (value: unknown): string => {
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'number') return String(value);
      return '';
    };

    const getNumber = (value: unknown): number => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    };

    const getBoolean = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        return (
          lower === 'si' || lower === 'sí' || lower === 'yes' || lower === 'true' || lower === '1'
        );
      }
      return Boolean(value);
    };

    return {
      nombre: getString(row['Nombre']),
      codigoInterno: getString(row['C' + 'ódigo Interno']),
      modelo: getString(row['Modelo']),
      codigoSunat: getString(row['C' + 'ódigo Sunat']),
      codigoTipoUnidad: getString(row['C' + 'ódigo Tipo de Unidad']),
      codigoTipoMoneda: getString(row['C' + 'ódigo Tipo de Moneda']),
      precioUnitarioVenta: getNumber(row['Precio Unitario Venta']),
      codigoTipoAfectacionIgvVenta: getString(row['Codigo Tipo de Afecci' + 'ón del Igv Venta']),
      tieneIgv: getBoolean(row['Tiene Igv']),
      precioUnitarioCompra: getNumber(row['Precio Unitario Compra']),
      codigoTipoAfectacionIgvCompra: getString(row['Codigo Tipo de Afecci' + 'ón del Igv Compra']),
      stock: getNumber(row['Stock']),
      stockMinimo: getNumber(row['Stock M' + 'ínimo']),
      categoria: getString(row['Categoria']),
      marca: getString(row['Marca']),
      descripcion: getString(row['Descripcion']),
      nombreSecundario: getString(row['Nombre secundario']),
      codigoLote: getString(row['C' + 'ódigo lote']),
      fechaVencimiento: getString(row['Fec. Vencimiento']),
      codigoBarras: getString(row['C' + 'ód barras']),
    };
  }

  findMatchingProduct(row: ExcelProductRow, products: Product[]): Product | null {
    if (row.codigoBarras) {
      const byBarcode = products.find((p) => p.codigoBarras && p.codigoBarras === row.codigoBarras);
      if (byBarcode) return byBarcode;
    }

    if (row.codigoInterno) {
      const byInternal = products.find(
        (p) => p.codigoInterno && p.codigoInterno === row.codigoInterno
      );
      if (byInternal) return byInternal;
    }

    return null;
  }

  mergeProductData(existing: Product, row: ExcelProductRow): Product {
    return {
      ...existing,
      nombre: row.nombre || existing.nombre,
      codigoInterno: row.codigoInterno || existing.codigoInterno,
      modelo: row.modelo || existing.modelo,
      codigoSunat: row.codigoSunat || existing.codigoSunat,
      codigoTipoUnidad: row.codigoTipoUnidad || existing.codigoTipoUnidad,
      codigoTipoMoneda: row.codigoTipoMoneda || existing.codigoTipoMoneda,
      precioUnitarioVenta: row.precioUnitarioVenta || existing.precioUnitarioVenta,
      codigoTipoAfectacionIgvVenta:
        row.codigoTipoAfectacionIgvVenta || existing.codigoTipoAfectacionIgvVenta,
      tieneIgv: row.tieneIgv ?? existing.tieneIgv,
      precioUnitarioCompra: row.precioUnitarioCompra || existing.precioUnitarioCompra,
      codigoTipoAfectacionIgvCompra:
        row.codigoTipoAfectacionIgvCompra || existing.codigoTipoAfectacionIgvCompra,
      stock: row.stock ?? existing.stock,
      stockMinimo: row.stockMinimo ?? existing.stockMinimo,
      categoria: row.categoria || existing.categoria,
      marca: row.marca || existing.marca,
      descripcion: row.descripcion || existing.descripcion,
      nombreSecundario: row.nombreSecundario || existing.nombreSecundario,
      codigoLote: row.codigoLote || existing.codigoLote,
      fechaVencimiento: row.fechaVencimiento || existing.fechaVencimiento,
      codigoBarras: row.codigoBarras || existing.codigoBarras,
    };
  }
}
