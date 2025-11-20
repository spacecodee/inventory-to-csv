import { inject, Injectable, signal } from '@angular/core';
import { Category, CategoryEntity, CategoryInsert } from '../models/inventory.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly supabase = inject(SupabaseService);

  private readonly categoriesSignal = signal<Category[]>([]);
  readonly categories = this.categoriesSignal.asReadonly();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    this.loadCategories().catch((error) => {
      console.error('Failed to initialize categories:', error);
    });
  }

  private async loadCategories(): Promise<void> {
    const { data, error } = await this.supabase.client
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

    if (error) {
      console.error('Error loading categories:', error);
      throw error;
    }

    const categories = data.map((entity: CategoryEntity) => this.mapEntityToCategory(entity));
    this.categoriesSignal.set(categories);
  }

  async addCategory(name: string, description: string = ''): Promise<void> {
    const currentCats = this.categoriesSignal();

    if (currentCats.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const categoryInsert: CategoryInsert = {
      name,
      description: description || null,
    };

    const { data, error } = await this.supabase.client
    .from('categories')
    .insert(categoryInsert)
    .select()
    .single();

    if (error) {
      console.error('Error adding category:', error);
      return;
    }

    const newCategory = this.mapEntityToCategory(data as CategoryEntity);
    this.categoriesSignal.update((cats) => [...cats, newCategory]);
  }

  getCategoryNames(): string[] {
    return this.categoriesSignal().map((c) => c.name);
  }

  private mapEntityToCategory(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description || undefined,
    };
  }
}
