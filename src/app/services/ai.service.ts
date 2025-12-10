import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenRouter } from '@openrouter/sdk';
import { environment } from '../../environments/environment';
import { Product } from '../models/inventory.model';
import { CategoryService } from './category.service';
import { SystemConfigService } from './system-config.service';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly categoryService = inject(CategoryService);
  private readonly systemConfigService = inject(SystemConfigService);
  private readonly genAI = new GoogleGenerativeAI(environment.googleGeminiApiKey);

  private getGeminiModel() {
    const model = this.systemConfigService.aiModel();
    if (!model) {
      throw new Error('Gemini model not configured');
    }
    return this.genAI.getGenerativeModel({ model });
  }

  private getOpenrouterModel() {
    const model = this.systemConfigService.openrouterModel();
    if (!model) {
      throw new Error('OpenRouter model not configured');
    }
    return model;
  }

  async analyzeProduct(files: File[]): Promise<Partial<Product>> {
    try {
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

      const provider = this.systemConfigService.aiProvider();
      let text: string;

      if (provider === 'openrouter') {
        text = await this.analyzeWithOpenRouter(files, prompt);
      } else {
        text = await this.analyzeWithGemini(files, prompt);
      }

      const cleanJson = text.replaceAll('```json', '').replaceAll('```', '').trim();
      const data = JSON.parse(cleanJson);

      // If AI suggests a new category, add it
      if (data.esNuevaCategoria && data.categoria) {
        await this.categoryService.addCategory(data.categoria, 'Categoría generada por IA');
      }

      const randomCode = Math.floor(100 + Math.random() * 900); // 3 digits
      const checkDigit = Math.floor(Math.random() * 10); // 1 digit for validation

      let suffix = (data.genero || 'GEN').toUpperCase();
      const suffixMap: { [key: string]: string } = {
        H: 'H',
        M: 'M',
        MIX: 'X',
        NA: 'N',
        GEN: 'G',
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

  private async analyzeWithGemini(files: File[], prompt: string): Promise<string> {
    const imagesParts = await Promise.all(files.map((f) => this.fileToGenerativePart(f)));
    const model = this.getGeminiModel();
    const result = await model.generateContent([prompt, ...imagesParts]);
    return result.response.text();
  }

  private async analyzeWithOpenRouter(files: File[], prompt: string): Promise<string> {
    const apiKey = environment.openrouterApiKey;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'OpenRouter API key not configured. Please add your API key in the environment configuration.'
      );
    }

    const modelId = this.getOpenrouterModel();
    if (!modelId || modelId.trim() === '') {
      throw new Error(
        'OpenRouter model ID not configured. Please select a model in the AI settings.'
      );
    }

    try {
      const openrouter = new OpenRouter({ apiKey });

      const imageContents = await Promise.all(
        files.map(async (file) => ({
          type: 'image_url' as const,
          imageUrl: {
            url: `data:${ file.type };base64,${ await this.fileToBase64(file) }`,
          },
        }))
      );

      const messages = [
        {
          role: 'user' as const,
          content: [{ type: 'text' as const, text: prompt }, ...imageContents],
        },
      ];

      let fullText = '';
      const stream = await openrouter.chat.send({
        model: modelId,
        messages: messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullText += content;
        }
      }

      return fullText;
    } catch (error: any) {
      const errorMessage = error?.body?.error?.message || error?.message || '';

      if (error?.status === 404 && errorMessage.includes('image input')) {
        throw new Error(
          `El modelo "${ modelId }" NO soporta análisis de imágenes.\n\nUsa un modelo con capacidades de visión como:\n- google/gemini-2.0-flash-exp:free\n- meta-llama/llama-3.2-11b-vision-instruct:free\n- anthropic/claude-3.5-sonnet\n- openai/gpt-4o`
        );
      } else if (error?.status === 429) {
        throw new Error(
          `OpenRouter rate limit exceeded. This could mean:\n- Invalid or empty API key\n- Model "${ modelId }" doesn't exist or isn't available\n- Free tier limits reached\n\nPlease verify your API key and model ID in settings.`
        );
      } else if (error?.status === 401) {
        throw new Error('OpenRouter authentication failed. Please verify your API key is correct.');
      } else if (error?.status === 404) {
        throw new Error(
          `OpenRouter model "${ modelId }" not found. Please verify the model ID is correct.`
        );
      }
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
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

  regenerateCodes(): { codigoInterno: string; modelo: string; codigoBarras: string } {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const checkDigit = Math.floor(Math.random() * 10);
    const suffix = 'G';
    const barcode = `${ randomCode }${ suffix }${ checkDigit }`;

    return {
      codigoInterno: `INT-${ randomCode }`,
      modelo: `MOD-${ randomCode }`,
      codigoBarras: barcode,
    };
  }
}
