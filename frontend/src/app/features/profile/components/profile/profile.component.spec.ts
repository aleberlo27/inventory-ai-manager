import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';
import type { User } from '@shared/types';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: undefined,
  createdAt: '2024-01-15T00:00:00.000Z',
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileService: { updateProfile: jest.Mock; updatePassword: jest.Mock };
  let mockAuthService: { currentUser: ReturnType<typeof signal<User | null>>; updateCurrentUser: jest.Mock };
  let mockMessageService: { add: jest.Mock; messageObserver: Subject<unknown>; clearObserver: Subject<unknown> };

  beforeEach(() => {
    mockProfileService = {
      updateProfile: jest.fn().mockReturnValue(of(mockUser)),
      updatePassword: jest.fn().mockReturnValue(of(undefined)),
    };
    mockAuthService = {
      currentUser: signal<User | null>(mockUser),
      updateCurrentUser: jest.fn(),
    };
    const msgSource = new Subject<unknown>();
    const clearSource = new Subject<unknown>();
    mockMessageService = {
      add: jest.fn(),
      messageObserver: msgSource,
      clearObserver: clearSource,
    };

    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should pre-fill profile form with current user data on init', () => {
      fixture.detectChanges();
      expect(component.profileForm.value.name).toBe('Test User');
      expect(component.profileForm.value.email).toBe('test@example.com');
    });

    it('should not pre-fill if no current user', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      expect(component.profileForm.value.name).toBe('');
      expect(component.profileForm.value.email).toBe('');
    });
  });

  describe('memberSince computed', () => {
    it('should return a formatted date string when user has createdAt', () => {
      fixture.detectChanges();
      expect(component.memberSince()).toBeTruthy();
      expect(component.memberSince()).toContain('2024');
    });

    it('should return an empty string when there is no user', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      expect(component.memberSince()).toBe('');
    });
  });

  describe('userInitials computed', () => {
    it('should return two-letter initials from name', () => {
      fixture.detectChanges();
      expect(component.userInitials()).toBe('TU');
    });

    it('should return single letter for single-word name', () => {
      mockAuthService.currentUser.set({ ...mockUser, name: 'Alice' });
      fixture.detectChanges();
      expect(component.userInitials()).toBe('A');
    });

    it('should return empty string when no user', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      expect(component.userInitials()).toBe('');
    });
  });

  describe('hasProfileChanges computed', () => {
    it('should return false right after form is pre-filled with user data', () => {
      fixture.detectChanges();
      expect(component.hasProfileChanges()).toBe(false);
    });

    it('should return true when form name differs from user name', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ name: 'Changed Name' });
      expect(component.hasProfileChanges()).toBe(true);
    });

    it('should return true when form email differs from user email', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ email: 'changed@example.com' });
      expect(component.hasProfileChanges()).toBe(true);
    });
  });

  describe('saveProfile()', () => {
    it('should call profileService.updateProfile with form values', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ name: 'New Name', email: 'new@example.com' });
      component.saveProfile();
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith({
        name: 'New Name',
        email: 'new@example.com',
      });
    });

    it('should NOT call updateProfile if profile form is invalid', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ name: '', email: 'test@example.com' });
      component.saveProfile();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('should NOT call updateProfile if there are no changes', () => {
      fixture.detectChanges();
      // Form is pre-filled with same values — no changes
      component.saveProfile();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('should show success toast after successful profile update', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ name: 'New Name', email: 'new@example.com' });
      component.saveProfile();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('should show error toast when profile update fails', () => {
      mockProfileService.updateProfile.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Error' } })),
      );
      fixture.detectChanges();
      component.profileForm.patchValue({ name: 'New Name', email: 'new@example.com' });
      component.saveProfile();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('should set savingProfile to false after success', () => {
      fixture.detectChanges();
      component.profileForm.patchValue({ name: 'New Name', email: 'new@example.com' });
      component.saveProfile();
      expect(component.savingProfile()).toBe(false);
    });
  });

  describe('changePassword()', () => {
    it('should call profileService.updatePassword with currentPassword and newPassword', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(mockProfileService.updatePassword).toHaveBeenCalledWith('current123', 'newpass456');
    });

    it('should NOT call updatePassword when passwords do not match', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'pass1',
        confirmPassword: 'pass2',
      });
      component.changePassword();
      expect(mockProfileService.updatePassword).not.toHaveBeenCalled();
    });

    it('should NOT call updatePassword when password form is invalid', () => {
      component.passwordForm.patchValue({
        currentPassword: '',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(mockProfileService.updatePassword).not.toHaveBeenCalled();
    });

    it('should reset the password form after successful change', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(component.passwordForm.value.currentPassword).toBeNull();
      expect(component.passwordForm.value.newPassword).toBeNull();
    });

    it('should show success toast after successful password change', () => {
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('should show 401 error toast when current password is incorrect', () => {
      mockProfileService.updatePassword.mockReturnValue(
        throwError(() => ({ status: 401, error: { message: 'Current password is incorrect' } })),
      );
      component.passwordForm.patchValue({
        currentPassword: 'wrongpass',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('should set savingPassword to false after error', () => {
      mockProfileService.updatePassword.mockReturnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } })),
      );
      component.passwordForm.patchValue({
        currentPassword: 'current123',
        newPassword: 'newpass456',
        confirmPassword: 'newpass456',
      });
      component.changePassword();
      expect(component.savingPassword()).toBe(false);
    });
  });
});
