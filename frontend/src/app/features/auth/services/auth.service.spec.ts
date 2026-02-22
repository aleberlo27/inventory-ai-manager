import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AuthService } from './auth.service';
import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { User } from '@shared/types';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockAuthResponse = { token: 'jwt-token', user: mockUser };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('should POST to /auth/login and return AuthResponse', () => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe(res => {
        expect(res.token).toBe('jwt-token');
        expect(res.user).toEqual(mockUser);
      });
      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: mockAuthResponse });
    });

    it('should save token and user to localStorage after login', () => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/login`).flush({ data: mockAuthResponse });

      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)).toBe('jwt-token');
      expect(JSON.parse(localStorage.getItem(APP_CONSTANTS.USER_KEY)!)).toEqual(mockUser);
    });

    it('should update currentUser signal after login', () => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/login`).flush({ data: mockAuthResponse });

      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should not save anything if login fails', () => {
      service.login({ email: 'wrong@example.com', password: 'wrong' }).subscribe({ error: () => {} });
      httpMock
        .expectOne(`${APP_CONSTANTS.API_URL}/auth/login`)
        .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('register()', () => {
    it('should POST to /auth/register and save session', () => {
      service
        .register({ email: 'test@example.com', password: 'password123', name: 'Test User' })
        .subscribe(res => {
          expect(res.token).toBe('jwt-token');
        });
      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: mockAuthResponse });

      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)).toBe('jwt-token');
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('logout()', () => {
    it('should clear localStorage and reset currentUser to null', () => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/login`).flush({ data: mockAuthResponse });

      service.logout();

      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(APP_CONSTANTS.USER_KEY)).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('getToken()', () => {
    it('should return the token from localStorage', () => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after successful login', () => {
      service.login({ email: 'test@example.com', password: 'password123' }).subscribe();
      httpMock.expectOne(`${APP_CONSTANTS.API_URL}/auth/login`).flush({ data: mockAuthResponse });

      expect(service.isAuthenticated()).toBe(true);
    });
  });
});

describe('AuthService - loadUserFromStorage', () => {
  afterEach(() => localStorage.clear());

  it('should restore user from localStorage when service is instantiated', () => {
    localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(mockUser));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    const freshService = TestBed.inject(AuthService);
    const ctrl = TestBed.inject(HttpTestingController);

    expect(freshService.currentUser()).toEqual(mockUser);
    expect(freshService.isAuthenticated()).toBe(true);

    ctrl.verify();
  });
});
