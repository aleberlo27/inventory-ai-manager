import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../../features/auth/services/auth.service';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: { isAuthenticated: signal(false) } },
      ],
    });
  });

  it('should return true when the user is authenticated', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isAuthenticated: signal(true) } });
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('should redirect to /auth/login when not authenticated', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isAuthenticated: signal(false) } });
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});

describe('guestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: { isAuthenticated: signal(false) } },
      ],
    });
  });

  it('should return true when the user is NOT authenticated', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isAuthenticated: signal(false) } });
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('should redirect to /app/warehouses when already authenticated', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isAuthenticated: signal(true) } });
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/app/warehouses');
  });
});
