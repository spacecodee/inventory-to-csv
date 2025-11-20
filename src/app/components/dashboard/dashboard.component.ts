import { Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBox, lucideLogOut, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { CategoryManagerComponent } from '../category-manager/category-manager.component';
import { ProductListComponent } from '../product-list/product-list.component';
import { UploadComponent } from '../upload/upload.component';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-dashboard',
  imports: [UploadComponent, ProductListComponent, CategoryManagerComponent, HlmIconImports],
  providers: [provideIcons({ lucideBox, lucideLogOut, lucideMoon, lucideSun })],
  template: `
    <div class="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
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

          <div class="flex items-center gap-4">
            @if (authService.user(); as user) {
            <div class="text-right">
              <p class="text-sm font-medium text-foreground">{{ user.email }}</p>
              <p class="text-xs text-muted-foreground">Usuario activo</p>
            </div>
            }

            <button
              (click)="toggleTheme()"
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
              [attr.aria-label]="
                themeService.theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
              "
            >
              @if (themeService.theme() === 'dark') {
              <ng-icon hlm name="lucideSun" size="sm"></ng-icon>
              } @else {
              <ng-icon hlm name="lucideMoon" size="sm"></ng-icon>
              }
            </button>

            <button
              (click)="onLogout()"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <ng-icon hlm name="lucideLogOut" size="sm"></ng-icon>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 py-8">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2">
            <app-upload />
          </div>
          <div class="lg:col-span-1">
            <app-category-manager />
          </div>
        </div>
        <app-product-list />
      </main>

      <footer class="border-t border-border py-6 bg-secondary/30">
        <div class="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {{ currentYear }} Inventory AI. Generación automática de inventarios.</p>
        </div>
      </footer>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly currentYear = new Date().getFullYear();

  protected async onLogout(): Promise<void> {
    await this.authService.signOut();
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
