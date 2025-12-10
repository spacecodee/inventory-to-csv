import { Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { Product } from '../models/inventory.model';

type BarcodeSize = 'small' | 'medium' | 'large';
type SortBy = 'name' | 'barcode' | 'createdDate';
type SortOrder = 'asc' | 'desc';

export interface PrintOptions {
  startDate?: Date;
  endDate?: Date;
  selectedProducts: Product[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  barcodeSize: BarcodeSize;
  includeProductName: boolean;
  includeProductCode: boolean;
}

interface PageDimensions {
  width: number;
  height: number;
  margin: number;
  contentWidth: number;
  contentHeight: number;
}

@Injectable({ providedIn: 'root' })
export class PdfPrintService {
  private getPageDimensions(): PageDimensions {
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;

    return {
      width: pdfWidth,
      height: pdfHeight,
      margin,
      contentWidth: pdfWidth - 2 * margin,
      contentHeight: pdfHeight - 2 * margin,
    };
  }

  private getBarcodeDimensions(size: BarcodeSize): { width: number; height: number } {
    switch (size) {
      case 'small':
        return { width: 40, height: 20 };
      case 'medium':
        return { width: 60, height: 30 };
      case 'large':
        return { width: 80, height: 40 };
    }
  }

  private getSortedAndFilteredProducts(options: PrintOptions): Product[] {
    let products = [...options.selectedProducts];

    if (options.startDate || options.endDate) {
      products = products.filter((p) => {
        const createdDate = new Date(p.createdAt);
        if (options.startDate && createdDate < options.startDate) return false;
        if (options.endDate) {
          const endDate = new Date(options.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (createdDate > endDate) return false;
        }
        return true;
      });
    }

    products.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (options.sortBy) {
        case 'name':
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case 'barcode':
          aValue = a.codigoBarras?.toLowerCase() || '';
          bValue = b.codigoBarras?.toLowerCase() || '';
          break;
        case 'createdDate':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (aValue < bValue) return options.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return options.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return products;
  }

  private calculateLayout(options: PrintOptions) {
    const dims = this.getPageDimensions();
    const barcodeSize = this.getBarcodeDimensions(options.barcodeSize);
    const containerWidth = barcodeSize.width + 20;
    const containerHeight = barcodeSize.height + 35;

    let itemsPerRow = Math.floor(dims.contentWidth / (containerWidth + 5));

    if (options.barcodeSize === 'small') {
      itemsPerRow = 3;
    }

    const itemsPerColumn = Math.floor(dims.contentHeight / (containerHeight + 5));
    const itemsPerPage = Math.max(1, itemsPerRow * itemsPerColumn);

    return {
      dims,
      containerWidth,
      containerHeight,
      itemsPerRow,
      itemsPerColumn,
      itemsPerPage,
    };
  }

  private async renderProductOnPage(
    pdf: jsPDF,
    product: Product,
    xPos: number,
    yPos: number,
    containerWidth: number,
    containerHeight: number,
    options: PrintOptions
  ): Promise<void> {
    pdf.setDrawColor(229, 231, 235);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(xPos, yPos, containerWidth, containerHeight, 'FD');

    let currentY = yPos + 8;

    if (options.includeProductName && product.nombre) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const maxWidth = containerWidth - 8;
      const lines = pdf.splitTextToSize(product.nombre, maxWidth);
      const lineHeight = 4;

      lines.forEach((line: string) => {
        const lineWidth = pdf.getTextWidth(line);
        const lineX = xPos + (containerWidth - lineWidth) / 2;
        pdf.text(line, lineX, currentY);
        currentY += lineHeight;
      });

      currentY += 2;
    }

    if (options.includeProductCode && product.codigoBarras) {
      try {
        const barcodeImg = await this.generateBarcodeImage(
          product.codigoBarras,
          options.barcodeSize
        );
        if (barcodeImg) {
          const imgWidth = containerWidth - 8;
          const imgHeight = (imgWidth * barcodeImg.height) / barcodeImg.width;
          const imgX = xPos + 4;
          pdf.addImage(barcodeImg.dataUrl, 'PNG', imgX, currentY, imgWidth, imgHeight);
        }
      } catch (error) {
        console.error('Error generating barcode:', error);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const textWidth = pdf.getTextWidth(product.codigoBarras);
        const textX = xPos + (containerWidth - textWidth) / 2;
        pdf.text(product.codigoBarras, textX, currentY);
      }
    }
  }

  private async generateBarcodeImage(
    code: string,
    size: BarcodeSize
  ): Promise<{ dataUrl: string; width: number; height: number } | null> {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    try {
      JsBarcode(svg, String(code), {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height: 60,
        width: 2,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
      });

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 300;
          canvas.height = img.height || 100;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('Cannot get canvas context'));
            return;
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);

          resolve({
            dataUrl,
            width: canvas.width,
            height: canvas.height,
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load barcode image'));
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Error creating barcode SVG:', error);
      return null;
    }
  }

  async generatePdf(options: PrintOptions): Promise<void> {
    const products = this.getSortedAndFilteredProducts(options);
    if (products.length === 0) {
      throw new Error('No hay productos para imprimir');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4',
    });

    const layout = this.calculateLayout(options);
    const totalPages = Math.ceil(products.length / layout.itemsPerPage);
    let currentProduct = 0;

    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) {
        pdf.addPage();
      }

      let yPos = layout.dims.margin;

      for (let row = 0; row < layout.itemsPerColumn && currentProduct < products.length; row++) {
        let xPos = layout.dims.margin;

        for (let col = 0; col < layout.itemsPerRow && currentProduct < products.length; col++) {
          const product = products[currentProduct];

          await this.renderProductOnPage(
            pdf,
            product,
            xPos,
            yPos,
            layout.containerWidth,
            layout.containerHeight,
            options
          );

          xPos += layout.containerWidth + 5;
          currentProduct++;
        }

        yPos += layout.containerHeight + 5;
      }

      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Página ${ page } de ${ totalPages }`,
        layout.dims.width - layout.dims.margin - 20,
        layout.dims.height - 5
      );
    }

    const filename = `productos-${ new Date().toISOString().split('T')[0] }.pdf`;
    pdf.save(filename);
  }
}
