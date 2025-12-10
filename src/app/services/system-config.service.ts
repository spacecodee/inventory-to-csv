import { Injectable, signal } from '@angular/core';

export interface SystemConfig {
  igvPercentage: number;
  transportCost: number;
  aiModel: string;
}

const STORAGE_KEY = 'system-config';

const DEFAULT_CONFIG: SystemConfig = {
  igvPercentage: 18,
  transportCost: 0,
  aiModel: 'gemini-2.5-flash',
};

export const AI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-pro-preview',
  'gemma-3-27b',
  'gemma-3-12b',
  'gemma-3-1b',
  'gemma-3-2b',
  'gemma-3-4b',
] as const;

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  private readonly configSignal = signal<SystemConfig>(this.loadFromStorage());

  readonly igvPercentage = () => this.configSignal().igvPercentage;
  readonly transportCost = () => this.configSignal().transportCost;
  readonly aiModel = () => this.configSignal().aiModel;

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

  updateAiModel(model: string): void {
    const current = this.configSignal();
    this.configSignal.set({ ...current, aiModel: model });
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.configSignal()));
    } catch {
      console.error('Error saving system config to storage');
    }
  }
}
