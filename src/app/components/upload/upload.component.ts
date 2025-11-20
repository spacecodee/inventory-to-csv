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
    <div class="w-full max-w-2xl mx-auto p-6">
      <div
        class="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center hover:bg-secondary/20 transition-colors cursor-pointer relative"
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
            <ng-icon hlm name="lucideLoader2" class="text-primary animate-spin" size="xl"></ng-icon>
            <p class="text-lg font-medium text-foreground">Analizando imágenes con IA...</p>
            <p class="text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ng-icon hlm name="lucideUploadCloud" class="text-primary" size="lg"></ng-icon>
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
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  async processFiles(files: File[]) {
    if (files.length === 0) return;

    this.isProcessing.set(true);

    try {
      // Process files in parallel or sequence depending on load.
      // For now, let's do it one by one to simulate "thinking"
      for (const file of files) {
        const partialProduct = await this.aiService.analyzeImage(file);

        const newProduct: Product = {
          ...(partialProduct as Product),
          id: crypto.randomUUID(),
          imageFiles: [file],
        };

        this.inventoryService.addProduct(newProduct);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
