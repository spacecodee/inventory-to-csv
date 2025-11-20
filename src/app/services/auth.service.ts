import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(null);
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly loadingSignal = signal<boolean>(true);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.checkSession().catch((error) => {
      console.error('Failed to initialize auth:', error);
      this.loadingSignal.set(false);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
      this.userSignal.set(session?.user ?? null);
    });
  }

  private async checkSession(): Promise<void> {
    const { data, error } = await this.supabase.client.auth.getSession();

    if (error) {
      console.error('Error checking session:', error);
      this.loadingSignal.set(false);
      return;
    }

    this.sessionSignal.set(data.session);
    this.userSignal.set(data.session?.user ?? null);
    this.loadingSignal.set(false);
  }

  async signIn(email: string, password: string): Promise<{ error: AuthError | null }> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session) {
      this.sessionSignal.set(data.session);
      this.userSignal.set(data.user);
      await this.router.navigate(['/']);
    }

    return { error };
  }

  async signUp(email: string, password: string): Promise<{ error: AuthError | null }> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });

    if (!error && data.session) {
      this.sessionSignal.set(data.session);
      this.userSignal.set(data.user);
      await this.router.navigate(['/']);
    }

    return { error };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return;
    }

    this.sessionSignal.set(null);
    this.userSignal.set(null);
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.sessionSignal() !== null;
  }
}
