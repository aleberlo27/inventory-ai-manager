import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
      <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Iniciar Sesión</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-gray-700">Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="correo@ejemplo.com"
              class="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            @if (emailControl.dirty && emailControl.invalid) {
              <small class="text-red-500">Introduce un email válido</small>
            }
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              placeholder="••••••"
              class="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            @if (passwordControl.dirty && passwordControl.invalid) {
              <small class="text-red-500">Mínimo 6 caracteres</small>
            }
          </div>

          @if (errorMessage()) {
            <div class="rounded bg-red-50 p-3 text-center text-sm text-red-600">
              {{ errorMessage() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading() ? 'Cargando...' : 'Iniciar sesión' }}
          </button>

          <a routerLink="/auth/register" class="text-center text-sm text-blue-600 hover:underline">
            ¿No tienes cuenta? Regístrate
          </a>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = signal('');
  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailControl(): AbstractControl {
    return this.form.get('email')!;
  }

  get passwordControl(): AbstractControl {
    return this.form.get('password')!;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.value as { email: string; password: string };

    this.authService.login({ email, password }).subscribe({
      next: () => this.router.navigate(['/app/warehouses']),
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err.error?.message ?? 'Email o contraseña incorrectos');
        this.loading.set(false);
      },
    });
  }
}
