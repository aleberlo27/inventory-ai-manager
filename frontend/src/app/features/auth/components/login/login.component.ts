import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../services/auth.service';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, PasswordModule],
  templateUrl: 'login.component.html',
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
        this.errorMessage.set(err.error?.message ?? 'AUTH.INVALID_CREDENTIALS');
        this.loading.set(false);
      },
    });
  }
}
