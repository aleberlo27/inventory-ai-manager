import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { TopbarComponent } from './topbar.component';
import { AuthService } from '../../../features/auth/services/auth.service';
import type { User } from '@shared/types';

const mockUser: User = {
  id: 'user-1',
  name: 'Juan Pérez',
  email: 'juan@test.com',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let mockAuthService: { currentUser: ReturnType<typeof signal<User | null>>; logout: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(() => {
    mockAuthService = {
      currentUser: signal<User | null>(mockUser),
      logout: jest.fn(),
    };
    mockRouter = { navigate: jest.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  describe('currentUser', () => {
    it('should expose the current user from authService', () => {
      expect(component.currentUser()).toEqual(mockUser);
    });
  });

  describe('userInitials', () => {
    it('should compute "JP" for "Juan Pérez"', () => {
      expect(component.userInitials()).toBe('JP');
    });

    it('should compute "A" for a single-word name "Ana"', () => {
      mockAuthService.currentUser.set({ ...mockUser, name: 'Ana' });
      expect(component.userInitials()).toBe('A');
    });

    it('should take only the first two initials for a three-word name', () => {
      mockAuthService.currentUser.set({ ...mockUser, name: 'María José García' });
      expect(component.userInitials()).toBe('MJ');
    });

    it('should return empty string when user is null', () => {
      mockAuthService.currentUser.set(null);
      expect(component.userInitials()).toBe('');
    });

    it('should return uppercase initials', () => {
      mockAuthService.currentUser.set({ ...mockUser, name: 'ana martínez' });
      expect(component.userInitials()).toBe('AM');
    });
  });

  describe('menuItems', () => {
    it('should contain "Mi Perfil" item', () => {
      const labels = component.menuItems.map(m => m.label).filter(Boolean);
      expect(labels).toContain('Mi Perfil');
    });

    it('should contain "Cerrar Sesión" item', () => {
      const labels = component.menuItems.map(m => m.label).filter(Boolean);
      expect(labels).toContain('Cerrar Sesión');
    });

    it('should have a separator between profile and logout', () => {
      const hasSeparator = component.menuItems.some(m => m.separator === true);
      expect(hasSeparator).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should call authService.logout()', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should navigate to /auth/login after logout', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
