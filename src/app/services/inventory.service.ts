import { Injectable, signal } from '@angular/core';
import { Product } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();

  addProduct(product: Product) {
    this.productsSignal.update((products) => [...products, product]);
  }

  removeProduct(id: string) {
    this.productsSignal.update((products) => products.filter((p) => p.id !== id));
  }

  clearProducts() {
    this.productsSignal.set([]);
  }
}
