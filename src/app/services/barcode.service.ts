import { Injectable } from '@angular/core';
import { Product } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class BarcodeService {
  convertLegacyBarcodeToCompact(legacyBarcode: string): string {
    const dashIndex = legacyBarcode.lastIndexOf('-');
    if (dashIndex === -1) return legacyBarcode;

    const suffixMap: { [key: string]: string } = {
      'H': 'H',
      'M': 'M',
      'MIX': 'X',
      'NA': 'N',
      'GEN': 'G',
    };

    const oldSuffix = legacyBarcode.substring(dashIndex + 1).toUpperCase();
    const newSuffix = suffixMap[oldSuffix] || 'G';
    const randomPart = legacyBarcode.substring(0, dashIndex).replace('750000', '');
    const checkDigit = Math.floor(Math.random() * 10);

    return `${ randomPart }${ newSuffix }${ checkDigit }`;
  }
  async renderBarcodeToSvg(element: SVGElement, value: string): Promise<void> {
    const JsBarcode = (await import('jsbarcode')).default || (await import('jsbarcode'));
    while (element.firstChild) element.firstChild.remove();
    JsBarcode(element, String(value), {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,
      height: 60,
    });
  }

  async downloadBarcode(svgElement: SVGSVGElement, filename: string): Promise<void> {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 600;
        canvas.height = img.height || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          this.triggerDownload(pngBlob, `${ filename }.png`);
        }, 'image/png');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  async downloadBarcodeWithInfo(svgElement: SVGSVGElement, product: Product): Promise<void> {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = this.createBarcodeWithInfoCanvas(img, product);
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const filename = product.codigoBarras || 'barcode';
          this.triggerDownload(pngBlob, `${ filename }-info.png`);
        }, 'image/png');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  async downloadBarcodesAsZip(products: Product[], pageNumber: number): Promise<void> {
    if (products.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const JsBarcode = (await import('jsbarcode')).default;
    const zip = new JSZip();

    const folderName = `barcodes-page-${ pageNumber }`;
    const folder = zip.folder(folderName);
    if (!folder) return;

    for (const product of products) {
      if (!product.codigoBarras) continue;

      const pngBlob = await this.generateBarcodeBlob(JsBarcode, product.codigoBarras);
      if (pngBlob) {
        folder.file(`${ product.codigoBarras }.png`, pngBlob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    this.triggerDownload(content, `${ folderName }.zip`);
  }

  async downloadBarcodesWithInfoAsZip(products: Product[], pageNumber: number): Promise<void> {
    if (products.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const JsBarcode = (await import('jsbarcode')).default;
    const zip = new JSZip();

    const folderName = `barcodes-info-page-${ pageNumber }`;
    const folder = zip.folder(folderName);
    if (!folder) return;

    for (const product of products) {
      if (!product.codigoBarras) continue;

      const pngBlob = await this.generateBarcodeWithInfoBlob(JsBarcode, product);
      if (pngBlob) {
        folder.file(`${ product.codigoBarras }-info.png`, pngBlob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    this.triggerDownload(content, `${ folderName }.zip`);
  }

  async downloadPriceLabel(product: Product): Promise<void> {
    const canvas = this.createPriceLabelCanvas(product);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const filename = product.codigoBarras || product.nombre || 'etiqueta';
      this.triggerDownload(pngBlob, `${ filename }-etiqueta.png`);
    }, 'image/png');
  }

  async downloadPriceLabelsAsZip(products: Product[], pageNumber: number): Promise<void> {
    if (products.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const folderName = `etiquetas-page-${ pageNumber }`;
    const folder = zip.folder(folderName);
    if (!folder) return;

    for (const product of products) {
      const pngBlob = await this.generatePriceLabelBlob(product);
      if (pngBlob) {
        const filename = product.codigoBarras || product.codigoInterno || product.id;
        folder.file(`${ filename }-etiqueta.png`, pngBlob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    this.triggerDownload(content, `${ folderName }.zip`);
  }

  private generatePriceLabelBlob(product: Product): Promise<Blob | null> {
    const canvas = this.createPriceLabelCanvas(product);
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
  }

  private createPriceLabelCanvas(product: Product): HTMLCanvasElement {
    const padding = 20;
    const canvasWidth = 300;
    const canvasHeight = 80;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';

    const productName = product.nombre || 'Producto';
    const maxWidth = canvasWidth - padding * 2;
    const truncatedName = this.truncateText(ctx, productName, maxWidth);
    ctx.fillText(truncatedName, canvasWidth / 2, padding + 14);

    const price = product.precioUnitarioVenta || 0;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`S/ ${ price.toFixed(2) }`, canvasWidth / 2, padding + 48);

    return canvas;
  }

  private async generateBarcodeBlob(JsBarcode: any, code: string): Promise<Blob | null> {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, String(code), {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,
      height: 60,
      width: 2,
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width || 600;
        canvas.height = img.height || 200;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = reject;
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(blob);
    });

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
  }

  private async generateBarcodeWithInfoBlob(
    JsBarcode: any,
    product: Product
  ): Promise<Blob | null> {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, String(product.codigoBarras), {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,
      height: 60,
      width: 2,
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const barcodeImg = new Image();
    await new Promise<void>((resolve, reject) => {
      barcodeImg.onload = () => resolve();
      barcodeImg.onerror = reject;
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      barcodeImg.src = URL.createObjectURL(blob);
    });

    const canvas = this.createBarcodeWithInfoCanvas(barcodeImg, product);

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
  }

  private createBarcodeWithInfoCanvas(
    barcodeImg: HTMLImageElement,
    product: Product
  ): HTMLCanvasElement {
    const padding = 20;
    const textHeight = 60;
    const barcodeWidth = barcodeImg.width || 300;
    const barcodeHeight = barcodeImg.height || 100;
    const canvasWidth = barcodeWidth + padding * 2;
    const canvasHeight = barcodeHeight + textHeight + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';

    const productName = product.nombre || 'Producto';
    const maxWidth = canvasWidth - padding * 2;
    const truncatedName = this.truncateText(ctx, productName, maxWidth);
    ctx.fillText(truncatedName, canvasWidth / 2, padding + 14);

    const price = product.precioUnitarioVenta || 0;
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`S/ ${ price.toFixed(2) }`, canvasWidth / 2, padding + 38);

    const barcodeX = (canvasWidth - barcodeWidth) / 2;
    const barcodeY = textHeight + padding;
    ctx.drawImage(barcodeImg, barcodeX, barcodeY);

    return canvas;
  }

  private truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    let truncated = text;
    while (ctx.measureText(truncated).width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    if (truncated.length < text.length) {
      truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
