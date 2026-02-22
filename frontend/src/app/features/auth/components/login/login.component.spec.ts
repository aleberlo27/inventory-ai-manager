import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import type { User } from '@shared/types';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let mockAuthService: { login: jest.Mock };
  let router: Router;

  beforeEach(() => {
    mockAuthService = { login: jest.fn() };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideZonelessChangeDetection(),
      ],
    });

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    // prevent real navigation in tests
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should have an invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid with a malformed email', () => {
    component.form.patchValue({ email: 'not-an-email', password: 'password123' });
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid with correct data', () => {
    component.form.patchValue({ email: 'test@example.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('should NOT call authService.login() when form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login() with correct credentials when form is valid', () => {
    mockAuthService.login.mockReturnValue(of({ token: 'tok', user: {} as User }));
    component.form.patchValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should navigate to /app/warehouses on successful login', () => {
    mockAuthService.login.mockReturnValue(of({ token: 'tok', user: {} as User }));
    component.form.patchValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/app/warehouses']);
  });

  it('should set errorMessage when login fails', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Email o contraseña incorrectos' } })),
    );
    component.form.patchValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessage()).toBe('Email o contraseña incorrectos');
  });
});
