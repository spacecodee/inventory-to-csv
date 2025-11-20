import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronUp, lucideSettings2 } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmIconImports],
  providers: [provideIcons({ lucideSettings2, lucideChevronUp, lucideChevronDown })],
  template: `
    <div class="w-full max-w-2xl mx-auto p-6 mt-8 border-t border-border">
      <div class="flex justify-between items-center mb-4 cursor-pointer" (click)="toggleExpanded()">
        <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <ng-icon hlm name="lucideSettings2" size="sm"></ng-icon>
          Gestionar Categorías
        </h3>
        <ng-icon
          hlm
          [name]="expanded() ? 'lucideChevronUp' : 'lucideChevronDown'"
          class="text-muted-foreground"
          size="sm"
        ></ng-icon>
      </div>

      @if (expanded()) {
        <div
          class="bg-card rounded-xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-top-2"
        >
          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-muted-foreground mb-1"
              >Nueva Categoría</label
              >
              <input
                type="text"
                [(ngModel)]="newCategoryName"
                placeholder="Ej. Juegos de Mesa"
                class="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                (keyup.enter)="addCategory()"
              />
            </div>
            <div class="flex items-end">
              <button
                (click)="addCategory()"
                [disabled]="!newCategoryName.trim()"
                class="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Agregar
              </button>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-3">Categorías Disponibles</h4>
            <div class="flex flex-wrap gap-2">
              @for (category of categories(); track category.id) {
                <span
                  class="px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm border border-border"
                >
              {{ category.name }}
            </span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CategoryManagerComponent {
  private readonly categoryService = inject(CategoryService);

  categories = this.categoryService.categories;
  newCategoryName = '';
  expanded = signal(false);

  toggleExpanded() {
    this.expanded.update((v) => !v);
  }

  addCategory() {
    if (this.newCategoryName.trim()) {
      this.categoryService.addCategory(this.newCategoryName.trim());
      this.newCategoryName = '';
    }
  }
}
