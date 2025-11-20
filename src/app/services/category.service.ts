import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../models/inventory.model';
import { ToonService } from './toon.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly toonService = inject(ToonService);
  private readonly http = inject(HttpClient);

  private readonly categoriesSignal = signal<Category[]>([]);
  readonly categories = this.categoriesSignal.asReadonly();

  constructor() {
    this.loadInitialCategories();
  }

  private loadInitialCategories() {
    // Try to load from localStorage first to persist user changes
    const storedToon = localStorage.getItem('categories.toon');

    if (storedToon) {
      const parsed = this.toonService.parseCategories(storedToon);
      this.categoriesSignal.set(parsed);
    } else {
      // Load from static file
      this.http.get('categories.toon', { responseType: 'text' }).subscribe({
        next: (content) => {
          const parsed = this.toonService.parseCategories(content);
          this.categoriesSignal.set(parsed);
          // Save to local storage for future persistence
          this.saveToLocal(parsed);
        },
        error: (err) => console.error('Failed to load categories.toon', err),
      });
    }
  }

  addCategory(name: string, description: string = '') {
    const currentCats = this.categoriesSignal();
    // Check if exists
    if (currentCats.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      description,
    };

    const updatedCats = [...currentCats, newCategory];
    this.categoriesSignal.set(updatedCats);
    this.saveToLocal(updatedCats);
  }

  getCategoryNames(): string[] {
    return this.categoriesSignal().map((c) => c.name);
  }

  private saveToLocal(categories: Category[]) {
    const toonContent = this.toonService.generateToon(categories);
    localStorage.setItem('categories.toon', toonContent);
  }
}
