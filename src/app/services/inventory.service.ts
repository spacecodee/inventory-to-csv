import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/inventory.model';
import { ImagePersistenceService } from './image-persistence.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly imageService = inject(ImagePersistenceService);
  private readonly productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  addProduct(product: Product) {
    this.productsSignal.update((products) => {
      const newProducts = [...products, product];
      this.saveToStorage(newProducts);
      return newProducts;
    });

    if (product.imageFiles && product.imageFiles.length > 0) {
      this.imageService.saveImages(product.id, product.imageFiles).then(() => undefined);
    }
  }

  removeProduct(id: string) {
    this.productsSignal.update((products) => {
      const newProducts = products.filter((p) => p.id !== id);
      this.saveToStorage(newProducts);
      return newProducts;
    });
    this.imageService.deleteImages(id).then(() => undefined);
  }

  clearProducts() {
    this.productsSignal.set([]);
    localStorage.removeItem('inventory_products');
    this.imageService.clearAll().then(() => undefined);
  }

  async getProductImages(id: string): Promise<File[]> {
    return this.imageService.getImages(id);
  }

  private saveToStorage(products: Product[]) {
    // We don't save the File objects to localStorage, only the metadata
    const productsToSave = products.map(({ imageFiles, ...rest }) => rest);
    localStorage.setItem('inventory_products', JSON.stringify(productsToSave));
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('inventory_products');
    if (stored) {
      try {
        const products = JSON.parse(stored);
        this.productsSignal.set(products);
      } catch (e) {
        console.error('Failed to load products from storage', e);
      }
    }
  }
}
