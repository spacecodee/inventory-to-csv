import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageOptimizationService {
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1440;
  private readonly WEBP_QUALITY = 0.8;

  async optimizeImage(file: File): Promise<File> {
    const canvas = await this.createCanvasFromFile(file);
    const resizedCanvas = this.resizeCanvas(canvas);
    return this.canvasToWebP(resizedCanvas, file.name);
  }

  async optimizeImages(files: File[]): Promise<File[]> {
    return Promise.all(files.map((file) => this.optimizeImage(file)));
  }

  private async createCanvasFromFile(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private resizeCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    let { width, height } = canvas;

    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
      const aspectRatio = width / height;

      if (width > height) {
        width = Math.min(width, this.MAX_WIDTH);
        height = Math.round(width / aspectRatio);
      } else {
        height = Math.min(height, this.MAX_HEIGHT);
        width = Math.round(height * aspectRatio);
      }

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;

      const ctx = resizedCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, width, height);
      }

      return resizedCanvas;
    }

    return canvas;
  }

  private canvasToWebP(canvas: HTMLCanvasElement, originalFilename: string): File {
    const webpFilename = this.getWebPFilename(originalFilename);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const file = new File([blob!], webpFilename, { type: 'image/webp' });
          resolve(file);
        },
        'image/webp',
        this.WEBP_QUALITY
      );
    }) as any;
  }

  private getWebPFilename(originalFilename: string): string {
    return originalFilename.replace(/\.[^.]+$/, '.webp');
  }

}
