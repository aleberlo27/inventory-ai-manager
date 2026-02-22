import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';

import { RegisterComponent, passwordMatchValidator } from './register.component';
import { AuthService } from '../../services/auth.service';
import type { User } from '@shared/types';

describe('passwordMatchValidator', () => {
  const buildGroup = (password: string, confirmPassword: string) => {
    const comp = new (class {
      get(key: string) {
        return { value: key === 'password' ? password : confirmPassword } as AbstractControl;
      }
    })();
    return comp as unknown as AbstractControl;
  };

  it('should return null when passwords match', () => {
    const group = buildGroup('password123', 'password123');
    expect(passwordMatchValidator(group)).toBeNull();
  });

  it('should return { passwordMismatch: true } when passwords do not match', () => {
    const group = buildGroup('password123', 'different');
    expect(passwordMatchValidator(group)).toEqual({ passwordMismatch: true });
  });
});

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let mockAuthService: { register: jest.Mock };
  let router: Router;

  beforeEach(() => {
    mockAuthService = { register: jest.fn() };

    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
    });

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should have an invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid when passwords do not match', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(component.form.invalid).toBe(true);
    expect(component.form.errors).toEqual({ passwordMismatch: true });
  });

  it('should be valid with correct matching data', () => {
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should NOT call authService.register() when form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should navigate to /app/warehouses on successful registration', () => {
    mockAuthService.register.mockReturnValue(of({ token: 'tok', user: {} as User }));
    component.form.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/app/warehouses']);
  });

  it('should set errorMessage when registration fails (e.g. duplicate email)', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { message: 'El email ya está registrado' } })),
    );
    component.form.patchValue({
      name: 'Test User',
      email: 'existing@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    component.onSubmit();
    expect(component.errorMessage()).toBe('El email ya está registrado');
  });
});
