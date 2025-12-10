import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { AI_MODELS, SystemConfigService } from '../../services/system-config.service';

@Component({
  selector: 'app-ai-model-settings-dialog',
  imports: [HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX })],
  template: `
    <dialog
      open
      class="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4 m-0 w-full h-full max-w-full max-h-full"
      (click)="onClose()"
      (keydown.escape)="onClose()"
    >
      <div class="fixed inset-0 bg-black/50"></div>
      <div
        class="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">Configurar Modelo de IA</h3>
          <button
            (click)="onClose()"
            class="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <ng-icon hlm name="lucideX" size="sm"></ng-icon>
          </button>
        </div>

        <div class="p-4 space-y-4">
          <div class="text-sm text-muted-foreground">
            <p>
              Selecciona el modelo de Google Gemini a utilizar para generar información de
              productos.
            </p>
          </div>

          <div class="space-y-2">
            <label for="modelSelect" class="text-xs font-medium text-muted-foreground"
            >Modelo Actual</label
            >
            <select
              id="modelSelect"
              [ngModel]="selectedModel()"
              (ngModelChange)="updateModel($event)"
              class="w-full px-3 py-2 text-sm rounded-lg bg-secondary/20 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              @for (model of availableModels; track model) {
                <option [value]="model">{{ model }}</option>
              }
            </select>
          </div>

          <div class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div class="text-xs text-muted-foreground space-y-1">
              <p class="font-medium text-foreground">Modelo Seleccionado:</p>
              <p class="font-mono text-blue-600 dark:text-blue-400">{{ selectedModel() }}</p>
            </div>
          </div>

          <div class="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg space-y-2">
            <p class="font-medium">Modelos Disponibles:</p>
            <div class="space-y-2">
              <div>
                <p class="font-medium text-foreground mb-1">Gemini:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>gemini-2.0-flash-lite - Rápido y económico</li>
                  <li>gemini-2.0-flash - Balance rendimiento/costo</li>
                  <li>gemini-2.5-pro - Mejor calidad</li>
                  <li>gemini-2.5-flash-lite - Rápido y económico v2.5</li>
                  <li>gemini-2.5-flash - Balance v2.5</li>
                  <li>gemini-3-pro-preview - Preview del modelo 3</li>
                </ul>
              </div>
              <div>
                <p class="font-medium text-foreground mb-1">Gemma:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>gemma-3-27b - Mejor rendimiento</li>
                  <li>gemma-3-12b - Balance rendimiento/costo</li>
                  <li>gemma-3-4b - Ligero y rápido</li>
                  <li>gemma-3-2b - Muy ligero</li>
                  <li>gemma-3-1b - Ultra ligero</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 p-4 border-t border-border">
          <button
            (click)="onClose()"
            class="flex-1 px-4 py-2 rounded-lg text-sm border border-border hover:bg-secondary/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onApply()"
            class="flex-1 px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiModelSettingsDialogComponent {
  protected readonly systemConfigService = inject(SystemConfigService);
  protected readonly availableModels = AI_MODELS;

  closeDialog = output<void>();
  modelChanged = output<string>();

  protected readonly selectedModel = signal<string>(this.systemConfigService.aiModel());

  protected updateModel(value: string) {
    this.selectedModel.set(value);
  }

  protected onApply() {
    this.systemConfigService.updateAiModel(this.selectedModel());
    this.modelChanged.emit(this.selectedModel());
    this.closeDialog.emit();
  }

  protected onClose() {
    this.closeDialog.emit();
  }
}
