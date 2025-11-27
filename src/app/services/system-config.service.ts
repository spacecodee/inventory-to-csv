import { Injectable, signal } from '@angular/core';

export interface SystemConfig {
  igvPercentage: number;
  transportCost: number;
}

const STORAGE_KEY = 'system-config';

const DEFAULT_CONFIG: SystemConfig = {
  igvPercentage: 18,
  transportCost: 0,
};

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  private readonly configSignal = signal<SystemConfig>(this.loadFromStorage());

  readonly igvPercentage = () => this.configSignal().igvPercentage;
  readonly transportCost = () => this.configSignal().transportCost;

  private loadFromStorage(): SystemConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      console.error('Error loading system config from storage');
    }
    return DEFAULT_CONFIG;
  }

}
