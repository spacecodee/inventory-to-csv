import { Injectable, signal } from '@angular/core';

export type AiProvider = 'gemini' | 'openrouter';

export interface SystemConfig {
  igvPercentage: number;
  transportCost: number;
  aiProvider: AiProvider;
  aiModel: string;
  openrouterModel: string;
}

const STORAGE_KEY = 'system-config';

const DEFAULT_CONFIG: SystemConfig = {
  igvPercentage: 18,
  transportCost: 0,
  aiProvider: 'gemini',
  aiModel: 'gemini-2.5-flash',
  openrouterModel: '',
};

export const AI_PROVIDERS = ['gemini', 'openrouter'] as const;

export const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-pro-preview',
] as const;

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  private readonly configSignal = signal<SystemConfig>(this.loadFromStorage());

  readonly igvPercentage = () => this.configSignal().igvPercentage;
  readonly transportCost = () => this.configSignal().transportCost;
  readonly aiProvider = () => this.configSignal().aiProvider;
  readonly aiModel = () => this.configSignal().aiModel;
  readonly openrouterModel = () => this.configSignal().openrouterModel;

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

  updateAiProvider(provider: AiProvider): void {
    const current = this.configSignal();
    this.configSignal.set({ ...current, aiProvider: provider });
    this.saveToStorage();
  }

  updateAiModel(model: string): void {
    const current = this.configSignal();
    this.configSignal.set({ ...current, aiModel: model });
    this.saveToStorage();
  }

  updateOpenrouterModel(model: string): void {
    const current = this.configSignal();
    this.configSignal.set({ ...current, openrouterModel: model });
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
