import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideUploadCloud } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { AiService } from '../../services/ai.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideUploadCloud, lucideLoader2 })],
  template: `
    <div class="w-full h-full">
      <div
        class="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center hover:bg-secondary/20 transition-colors cursor-pointer relative h-full flex flex-col justify-center"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          multiple
          accept="image/*"
          class="hidden"
          (change)="onFileSelected($event)"
        />

        @if (isProcessing()) {
          <div class="flex flex-col items-center justify-center gap-4">
            <ng-icon hlm [name]="loaderIcon" class="text-primary animate-spin" size="xl"></ng-icon>
            <p class="text-lg font-medium text-foreground">Analizando imágenes con IA...</p>
            <p class="text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ng-icon hlm [name]="uploadIcon" class="text-primary" size="lg"></ng-icon>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-foreground">Sube tus imágenes aquí</h3>
              <p class="text-muted-foreground mt-1">Arrastra y suelta o haz clic para seleccionar</p>
            </div>
            <p class="text-xs text-muted-foreground/70">Soporta JPG, PNG, WEBP</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class UploadComponent {
  private readonly aiService = inject(AiService);
  private readonly inventoryService = inject(InventoryService);

  isProcessing = signal(false);

  protected readonly loaderIcon: any = 'lucideLoader2';
  protected readonly uploadIcon: any = 'lucideUploadCloud';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Add visual feedback if needed
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      void this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      void this.processFiles(Array.from(input.files));
    }
  }

  async processFiles(files: File[]) {
    if (files.length === 0) return;

    // Limit to 2 files max per product as requested
    if (files.length > 2) {
      alert('Por favor, sube máximo 2 imágenes por producto.');
      return;
    }

    this.isProcessing.set(true);

    try {
      // Process all files as ONE product
      const partialProduct = await this.aiService.analyzeProduct(files);

      const newProduct: Product = {
        ...(partialProduct as Product),
        id: crypto.randomUUID(),
        imageFiles: files,
      };

      this.inventoryService.addProduct(newProduct);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
