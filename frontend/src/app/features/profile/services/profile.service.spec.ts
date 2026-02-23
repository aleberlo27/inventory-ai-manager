import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { ProfileService } from './profile.service';
import { AuthService } from '../../auth/services/auth.service';
import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { User, UpdateProfileDto } from '@shared/types';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: undefined,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTesting: HttpTestingController;
  let mockAuthService: { currentUser: ReturnType<typeof signal<User | null>>; updateCurrentUser: jest.Mock };

  beforeEach(() => {
    mockAuthService = {
      currentUser: signal<User | null>(mockUser),
      updateCurrentUser: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(ProfileService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('updateProfile()', () => {
    it('should call PATCH /auth/profile with the provided data', () => {
      const dto: UpdateProfileDto = { name: 'New Name' };
      service.updateProfile(dto).subscribe();

      const req = httpTesting.expectOne(`${APP_CONSTANTS.API_URL}/auth/profile`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush({ data: mockUser });
    });

    it('should call authService.updateCurrentUser with the returned user', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      service.updateProfile({ name: 'Updated Name' }).subscribe();

      const req = httpTesting.expectOne(`${APP_CONSTANTS.API_URL}/auth/profile`);
      req.flush({ data: updatedUser });

      expect(mockAuthService.updateCurrentUser).toHaveBeenCalledWith(updatedUser);
    });

    it('should propagate a 409 error when email is already in use', () => {
      let capturedError: unknown;
      service.updateProfile({ email: 'taken@example.com' }).subscribe({
        error: err => (capturedError = err),
      });

      const req = httpTesting.expectOne(`${APP_CONSTANTS.API_URL}/auth/profile`);
      req.flush({ message: 'Email already in use' }, { status: 409, statusText: 'Conflict' });

      expect(capturedError).toBeDefined();
    });
  });

  describe('updatePassword()', () => {
    it('should call PATCH /auth/password with the correct body', () => {
      service.updatePassword('current123', 'newpass456').subscribe();

      const req = httpTesting.expectOne(`${APP_CONSTANTS.API_URL}/auth/password`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        currentPassword: 'current123',
        newPassword: 'newpass456',
      });
      req.flush({ data: { message: 'Password updated successfully' } });
    });

    it('should propagate a 401 error when current password is wrong', () => {
      let capturedError: unknown;
      service.updatePassword('wrongpass', 'newpass456').subscribe({
        error: err => (capturedError = err),
      });

      const req = httpTesting.expectOne(`${APP_CONSTANTS.API_URL}/auth/password`);
      req.flush(
        { message: 'Current password is incorrect' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(capturedError).toBeDefined();
    });
  });
});
