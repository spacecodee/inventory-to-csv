import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';
import { Product } from '../models/inventory.model';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly categoryService = inject(CategoryService);
  private readonly genAI = new GoogleGenerativeAI(environment.googleGeminiApiKey);
  private readonly model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async analyzeImage(file: File): Promise<Partial<Product>> {
    try {
      const base64Data = await this.fileToGenerativePart(file);
      const categories = this.categoryService.getCategoryNames();

      const prompt = `
        Analiza esta imagen de un juguete o producto y extrae la siguiente información en formato JSON puro (sin markdown, sin \`\`\`json):

        Campos requeridos:
        - nombre: Nombre corto y descriptivo del producto.
        - categoria: Una de las siguientes categorías exactas: ${ categories.join(
        ', '
      ) }. Si no encaja, usa "Accesorios y Varios".
        - descripcion: Descripción comercial atractiva (máx 20 palabras).
        - genero: "H" (niño), "M" (niña), "MIX" (mixto) o "GEN" (genérico/adulto). Basado en colores y tipo de juguete.

        Responde SOLO con el objeto JSON.
      `;

      const result = await this.model.generateContent([prompt, base64Data]);
      const response = result.response;
      const text = response.text();

      // Clean up potential markdown code blocks if the model ignores the instruction
      const cleanJson = text.replaceAll('```json', '').replaceAll('```', '').trim();
      const data = JSON.parse(cleanJson);

      // Generate codes based on AI data
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const barcodePrefix = data.genero || 'GEN';
      const barcode = `${ barcodePrefix }${ randomCode }`;

      return {
        nombre: data.nombre,
        codigoInterno: `INT-${ randomCode }`,
        modelo: `MOD-${ randomCode }`,
        categoria: data.categoria,
        marca: 'GENERICA',
        descripcion: data.descripcion,
        nombreSecundario: `${ data.nombre } (Secundario)`,
        codigoBarras: barcode,
        // Default values
        codigoSunat: '',
        codigoTipoUnidad: 'NIU',
        codigoTipoMoneda: 'PEN',
        precioUnitarioVenta: 0,
        codigoTipoAfectacionIgvVenta: '10',
        tieneIgv: true,
        precioUnitarioCompra: 0,
        codigoTipoAfectacionIgvCompra: '10',
        stock: 0,
        stockMinimo: 0,
        codigoLote: '',
        fechaVencimiento: '',
        imagenes: [file.name],
      };
    } catch (error) {
      console.error('Error analyzing image with Gemini:', error);
      // Fallback to random generation if AI fails (or API key is invalid)
      return this.generateFallbackProduct(file);
    }
  }

  private async fileToGenerativePart(
    file: File
  ): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private generateFallbackProduct(file: File): Partial<Product> {
    const categories = this.categoryService.categories();
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomCode = Math.floor(10000 + Math.random() * 90000);

    return {
      nombre: `Producto ${ randomCode } (Fallback)`,
      codigoInterno: `INT-${ randomCode }`,
      modelo: `MOD-${ randomCode }`,
      categoria: randomCategory.name,
      marca: 'GENERICA',
      descripcion: 'Descripción generada automáticamente (Error AI).',
      nombreSecundario: `Producto ${ randomCode }`,
      codigoBarras: `GEN${ randomCode }`,
      codigoSunat: '',
      codigoTipoUnidad: 'NIU',
      codigoTipoMoneda: 'PEN',
      precioUnitarioVenta: 0,
      codigoTipoAfectacionIgvVenta: '10',
      tieneIgv: true,
      precioUnitarioCompra: 0,
      codigoTipoAfectacionIgvCompra: '10',
      stock: 0,
      stockMinimo: 0,
      codigoLote: '',
      fechaVencimiento: '',
      imagenes: [file.name],
    };
  }
}
