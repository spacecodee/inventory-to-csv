import { Injectable, signal } from '@angular/core';
import { Category, DEFAULT_CATEGORIES } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly categoriesSignal = signal<Category[]>([...DEFAULT_CATEGORIES]);

  readonly categories = this.categoriesSignal.asReadonly();

  addCategory(name: string, description?: string) {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      description,
    };
    this.categoriesSignal.update((cats) => [...cats, newCategory]);
  }

  getCategoryNames(): string[] {
    return this.categoriesSignal().map((c) => c.name);
  }
}
