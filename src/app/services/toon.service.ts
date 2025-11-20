import { Injectable } from '@angular/core';
import { decode, encode } from '@toon-format/toon';
import { Category } from '../models/inventory.model';

@Injectable({
  providedIn: 'root',
})
export class ToonService {
  parseCategories(toonContent: string): Category[] {
    try {
      const data = decode(toonContent) as any;
      // The library returns the object structure.
      // We expect { context: {...}, categories: [...] }
      if (data && Array.isArray(data.categories)) {
        return data.categories;
      }
      return [];
    } catch (error) {
      console.error('Error parsing TOON content:', error);
      return [];
    }
  }

  generateToon(categories: Category[]): string {
    const data = {
      context: {
        app: 'Inventory AI',
        updated: new Date().toISOString().split('T')[0],
      },
      categories: categories,
    };
    return encode(data);
  }
}
