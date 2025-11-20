import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBox } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { UploadComponent } from './components/upload/upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UploadComponent, ProductListComponent, CategoryManagerComponent, HlmIconImports],
  providers: [provideIcons({ lucideBox })],
  template: `
    <div class="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <div
            class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm"
          >
            <ng-icon hlm name="lucideBox" size="lg"></ng-icon>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Inventory AI</h1>
            <p class="text-xs text-muted-foreground">Sistema de Catalogación Inteligente</p>
          </div>
        </div>
      </header>

      <main class="flex-1 py-8">
        <app-upload/>
        <app-category-manager/>
        <app-product-list/>
      </main>

      <footer class="border-t border-border py-6 bg-secondary/30">
        <div class="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {{ currentYear }} Inventory AI. Generación automática de inventarios.</p>
        </div>
      </footer>
    </div>
  `,
})
export class App {
  protected readonly title = signal('inventory-to-csv');
  protected readonly currentYear = new Date().getFullYear();
}
