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

  async analyzeProduct(files: File[]): Promise<Partial<Product>> {
    try {
      const imagesParts = await Promise.all(files.map((f) => this.fileToGenerativePart(f)));
      const categories = this.categoryService.getCategoryNames();

      const prompt = `
        Analiza estas imágenes (${
        files.length
      } imágenes) que pertenecen a UN SOLO producto. Extrae la información en formato JSON puro.

        Categorías Disponibles:
        ${ categories.join(', ') }

        Instrucciones:
        1. Identifica el producto.
        2. Determina si encaja en alguna de las categorías disponibles.
        3. SI NO ENCAJA en ninguna: Crea una NUEVA categoría corta y descriptiva.
        4. Genera una descripción comercial.
        5. Determina el género/tipo (H=Hombre, M=Mujer, MIX=Unisex, NA=No Aplica, GEN=Genérico).
        6. La marca SIEMPRE debe ser "Genérica".

        Formato de respuesta JSON (sin markdown):
        {
          "nombre": "Nombre del producto",
          "categoria": "Categoría existente o NUEVA",
          "esNuevaCategoria": boolean,
          "descripcion": "Descripción...",
          "genero": "H/M/MIX/NA/GEN"
        }
      `;

      const result = await this.model.generateContent([prompt, ...imagesParts]);
      const response = result.response;
      const text = response.text();

      const cleanJson = text.replaceAll('```json', '').replaceAll('```', '').trim();
      const data = JSON.parse(cleanJson);

      // If AI suggests a new category, add it
      if (data.esNuevaCategoria && data.categoria) {
        this.categoryService.addCategory(data.categoria, 'Categoría generada por IA');
      }

      const randomCode = Math.floor(100 + Math.random() * 900); // 3 digits
      const checkDigit = Math.floor(Math.random() * 10); // 1 digit for validation

      let suffix = (data.genero || 'GEN').toUpperCase();
      const suffixMap: { [key: string]: string } = {
        'H': 'H',
        'M': 'M',
        'MIX': 'X',
        'NA': 'N',
        'GEN': 'G',
      };
      suffix = suffixMap[suffix] || 'G';

      const barcode = `${ randomCode }${ suffix }${ checkDigit }`;

      return {
        nombre: data.nombre,
        codigoInterno: `INT-${ randomCode }`,
        modelo: `MOD-${ randomCode }`,
        categoria: data.categoria,
        marca: 'Genérica',
        descripcion: data.descripcion,
        nombreSecundario: `${ data.nombre } (Secundario)`,
        codigoBarras: barcode,
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
        imagenes: files.map((f) => ({ url: '', filename: f.name })),
      };
    } catch (error) {
      console.error('Error analyzing product with Gemini:', error);
      return this.generateFallbackProduct(files[0]);
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
      imagenes: [{ url: '', filename: file.name }],
    };
  }
}
