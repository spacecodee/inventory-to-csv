import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);

  protected readonly email = signal<string>('');
  protected readonly password = signal<string>('');
  protected readonly isSignUp = signal<boolean>(false);
  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  protected async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const result = this.isSignUp()
      ? await this.authService.signUp(this.email(), this.password())
      : await this.authService.signIn(this.email(), this.password());

    this.loading.set(false);

    if (result.error) {
      this.errorMessage.set(this.getErrorMessage(result.error.message));
    }
  }

  protected toggleMode(): void {
    this.isSignUp.update((value) => !value);
    this.errorMessage.set('');
  }

  private getErrorMessage(error: string): string {
    if (error.includes('Invalid login credentials')) {
      return 'Credenciales inválidas';
    }
    if (error.includes('Email not confirmed')) {
      return 'Por favor confirma tu email';
    }
    if (error.includes('User already registered')) {
      return 'El usuario ya está registrado';
    }
    return 'Error al autenticar. Inténtalo de nuevo';
  }
}
