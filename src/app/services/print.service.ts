import { inject, Injectable } from '@angular/core';
import { Product } from '../models/inventory.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private readonly notificationService = inject(NotificationService);

  async printBarcodesToPdf(products: Product[]): Promise<void> {
    if (!products || products.length === 0) return;

    this.notificationService.info('Preparing printable document...');

    try {
      const JsBarcodeModule = await import('jsbarcode');
      const JsBarcode = (JsBarcodeModule as { default?: unknown }).default || JsBarcodeModule;

      const images: string[] = [];
      for (const p of products) {
        const code = String(p.codigoBarras || p.codigoInterno || p.id || '');
        const canvas = document.createElement('canvas');
        (JsBarcode as (element: HTMLCanvasElement, data: string, options: object) => void)(
          canvas,
          code,
          {
            format: 'CODE128',
            displayValue: false,
            fontSize: 10,
            height: 25,
            margin: 0,
          }
        );
        const dataUrl = canvas.toDataURL('image/png');
        images.push(dataUrl);
      }

      const win = globalThis.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = this.getBarcodePrintStyles();

      let bodyHtml = '';
      for (let i = 0; i < images.length; i++) {
        const p = products[i];
        const code = String(p.codigoBarras || p.codigoInterno || p.id || '');
        bodyHtml += `<div class="label"><img class="bar" src="${ images[i] }" alt="barcode"/><div class="code-text">${ code }</div></div>`;
      }

      this.writeToPrintWindow(win, 'Print Barcodes', style, bodyHtml);
      this.triggerPrint(win);
    } catch (err: unknown) {
      console.error('Print generation error', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.notificationService.error('Error preparing print', errorMessage);
    }
  }

  async printLabels(products: Product[]): Promise<void> {
    if (!products || products.length === 0) return;

    this.notificationService.info('Preparing labels...');

    try {
      const win = globalThis.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = this.getLabelPrintStyles();

      let bodyHtml = '';
      for (const p of products) {
        const nombre = (p.nombre || '').toString();
        const precio = (p.precioUnitarioVenta || 0).toFixed(2);
        bodyHtml += `<div class="label"><div class="label-name">${ nombre }</div><div class="label-price">S/. ${ precio }</div></div>`;
      }

      this.writeToPrintWindow(win, 'Print Labels', style, bodyHtml);
      this.triggerPrint(win);
    } catch (err: unknown) {
      console.error('Print labels error', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.notificationService.error('Error preparing labels', errorMessage);
    }
  }

  async printProductBarcode(product: Product, copies: number): Promise<void> {
    if (copies <= 0) return;

    this.notificationService.info(`Preparing ${ copies } barcode(s)...`);

    try {
      const JsBarcodeModule = await import('jsbarcode');
      const JsBarcode = (JsBarcodeModule as { default?: unknown }).default || JsBarcodeModule;

      const win = globalThis.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = this.getSingleBarcodePrintStyles();

      const code = String(product.codigoBarras || product.codigoInterno || product.id || '');
      const canvas = document.createElement('canvas');
      (JsBarcode as (element: HTMLCanvasElement, data: string, options: object) => void)(
        canvas,
        code,
        {
          format: 'CODE128',
          displayValue: false,
          fontSize: 10,
          height: 25,
          margin: 0,
        }
      );
      const dataUrl = canvas.toDataURL('image/png');

      let bodyHtml = '';
      for (let i = 0; i < copies; i++) {
        bodyHtml += `<div class="label"><img class="bar" src="${ dataUrl }" alt="barcode"/><div class="code-text">${ code }</div></div>`;
      }

      this.writeToPrintWindow(win, 'Print Barcode', style, bodyHtml);
      this.triggerPrint(win);
    } catch (err: unknown) {
      console.error('Print barcode error', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.notificationService.error('Error preparing barcode', errorMessage);
    }
  }

  async printProductLabel(product: Product, copies: number): Promise<void> {
    if (copies <= 0) return;

    this.notificationService.info(`Preparing ${ copies } label(s)...`);

    try {
      const win = globalThis.open('', '_blank');
      if (!win) {
        this.notificationService.error('Unable to open print window');
        return;
      }

      const style = this.getSingleLabelPrintStyles();

      const nombre = (product.nombre || '').toString();
      const precio = (product.precioUnitarioVenta || 0).toFixed(2);

      let bodyHtml = '';
      for (let i = 0; i < copies; i++) {
        bodyHtml += `<div class="label"><div class="label-name">${ nombre }</div><div class="label-price">S/. ${ precio }</div></div>`;
      }

      this.writeToPrintWindow(win, 'Print Label', style, bodyHtml);
      this.triggerPrint(win);
    } catch (err: unknown) {
      console.error('Print label error', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.notificationService.error('Error preparing label', errorMessage);
    }
  }

  private writeToPrintWindow(win: Window, title: string, style: string, bodyHtml: string): void {
    const htmlContent = `<!DOCTYPE html><html lang="es"><head><title>${ title }</title>${ style }</head><body>${ bodyHtml }</body></html>`;
    win.document.open();
    win.document.writeln(htmlContent);
    win.document.close();
  }

  private triggerPrint(win: Window): void {
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch (e) {
        console.error(e);
      }
    }, 600);
  }

  private getBarcodePrintStyles(): string {
    return `
      <style>
        @page { size: 40mm 60mm; margin: 0; }
        html, body { margin: 0; padding: 2mm; font-family: Arial, Helvetica, sans-serif; }
        .label { width: 40mm; height: 60mm; page-break-after: always; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
        img.bar { width: 38mm; height: 10mm; display:block; }
        .code-text { font-size: 8px; font-family: monospace; text-align: center; word-break: break-all; width: 38mm; }
      </style>
      <style media="print">
        @page { margin: 0; }
        body { margin: 0; padding: 0; }
        html { margin: 0; padding: 0; }
      </style>
    `;
  }

  private getLabelPrintStyles(): string {
    return `
      <style>
        @page { size: 40mm 60mm; margin: 0; }
        html, body { margin: 0; padding: 2mm; font-family: Arial, Helvetica, sans-serif; }
        .label { width: 40mm; height: 60mm; page-break-after: always; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
        .label-name { font-size: 11px; font-weight: bold; width: 38mm; word-break: break-word; }
        .label-price { font-size: 14px; font-weight: bold; color: #000; }
      </style>
      <style media="print">
        @page { margin: 0; }
        body { margin: 0; padding: 0; }
        html { margin: 0; padding: 0; }
      </style>
    `;
  }

  private getSingleBarcodePrintStyles(): string {
    return `
      <style>
        @page { size: 40mm 60mm; margin: 0; }
        html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
        .label { width: 40mm; height: 60mm; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
        .label:not(:last-child) { page-break-after: always; }
        img.bar { width: 38mm; height: 10mm; display:block; }
        .code-text { font-size: 8px; font-family: monospace; text-align: center; word-break: break-all; width: 38mm; }
      </style>
      <style media="print">
        @page { margin: 0; }
        body { margin: 0; padding: 0; }
        html { margin: 0; padding: 0; }
      </style>
    `;
  }

  private getSingleLabelPrintStyles(): string {
    return `
      <style>
        @page { size: 40mm 60mm; margin: 0; }
        html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
        .label { width: 40mm; height: 60mm; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; padding-top: 3mm; padding-left: 1mm; gap: 1mm; }
        .label:not(:last-child) { page-break-after: always; }
        .label-name { font-size: 11px; font-weight: bold; width: 38mm; word-break: break-word; }
        .label-price { font-size: 14px; font-weight: bold; color: #000; }
      </style>
      <style media="print">
        @page { margin: 0; }
        body { margin: 0; padding: 0; }
        html { margin: 0; padding: 0; }
      </style>
    `;
  }
}
