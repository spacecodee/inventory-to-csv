import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideUploadCloud } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../models/inventory.model';
import { AiService } from '../../services/ai.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HlmIconImports],
  providers: [provideIcons({ lucideUploadCloud, lucideLoader2 })],
  template: `
    <div class="w-full h-full">
      <div
        class="border-2 border-dashed border-primary/30 rounded-xl p-6 sm:p-10 text-center hover:bg-secondary/20 transition-colors cursor-pointer relative min-h-[200px] sm:min-h-[250px] flex flex-col justify-center"
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
          <div class="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <ng-icon
              hlm
              [name]="loaderIcon"
              class="text-primary animate-spin"
              size="lg"
              class="sm:text-4xl"
            ></ng-icon>
            <p class="text-base sm:text-lg font-medium text-foreground">
              Analizando imágenes con IA...
            </p>
            <p class="text-xs sm:text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <ng-icon
                hlm
                [name]="uploadIcon"
                class="text-primary"
                size="sm"
                class="sm:text-2xl"
              ></ng-icon>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold text-foreground">Sube tus imágenes aquí</h3>
              <p class="text-sm sm:text-base text-muted-foreground mt-1">
                Arrastra y suelta o haz clic para seleccionar
              </p>
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
  private readonly notification = inject(NotificationService);

  isProcessing = signal(false);

  protected readonly loaderIcon: any = 'lucideLoader2';
  protected readonly uploadIcon: any = 'lucideUploadCloud';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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

    if (files.length > 2) {
      this.notification.error(
        'Máximo 2 imágenes',
        'Por favor, sube máximo 2 imágenes por producto.'
      );
      return;
    }

    this.isProcessing.set(true);

    try {
      const partialProduct = await this.notification.promise(this.aiService.analyzeProduct(files), {
        loading: 'Analizando imágenes con IA...',
        success: '¡Producto detectado correctamente!',
        error: 'Error al analizar las imágenes',
      });

      const newProduct: Product = {
        ...(partialProduct as Product),
        id: crypto.randomUUID(),
        imageFiles: files,
      };

      await this.inventoryService.addProduct(newProduct);
      this.notification.success(
        'Producto agregado',
        'El producto se ha guardado exitosamente en la base de datos.'
      );
    } catch (error) {
      console.error('Error processing files:', error);
      this.notification.error(
        'Error al procesar',
        'Ocurrió un error al procesar el producto. Intenta de nuevo.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}
