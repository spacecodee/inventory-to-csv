import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';

interface InventoryDB extends DBSchema {
  images: {
    key: string;
    value: {
      productId: string;
      files: { name: string; type: string; blob: Blob }[];
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ImagePersistenceService {
  private static readonly DB_NAME = 'inventory-images';
  private static readonly STORE_NAME = 'images';
  private _dbPromise?: Promise<IDBPDatabase<InventoryDB>>;

  private get dbPromise(): Promise<IDBPDatabase<InventoryDB>> {
    this._dbPromise ??= openDB<InventoryDB>(ImagePersistenceService.DB_NAME, 1, {
      upgrade: (db) => {
        db.createObjectStore(ImagePersistenceService.STORE_NAME, { keyPath: 'productId' });
      },
    });
    return this._dbPromise;
  }

  async saveImages(productId: string, files: File[]): Promise<void> {
    const fileData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        blob: new Blob([await file.arrayBuffer()], { type: file.type }),
      }))
    );

    const db = await this.dbPromise;
    await db.put(ImagePersistenceService.STORE_NAME, {
      productId,
      files: fileData,
    });
  }

  async getImages(productId: string): Promise<File[]> {
    const db = await this.dbPromise;
    const data = await db.get(ImagePersistenceService.STORE_NAME, productId);

    if (!data) return [];

    return data.files.map((f) => new File([f.blob], f.name, { type: f.type }));
  }

  async deleteImages(productId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(ImagePersistenceService.STORE_NAME, productId);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(ImagePersistenceService.STORE_NAME);
  }
}
