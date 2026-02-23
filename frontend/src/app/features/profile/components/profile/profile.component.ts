import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Toast } from 'primeng/toast';

import { AuthService } from '../../../auth/services/auth.service';
import { ProfileService } from '../../services/profile.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TranslateModule, Avatar, Button, Card, InputText, Password, Toast],
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  readonly currentUser = this.authService.currentUser;
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);

  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  private readonly profileFormValue = toSignal(
    this.profileForm.valueChanges.pipe(startWith(this.profileForm.value)),
  );

  readonly memberSince = computed(() => {
    const date = this.currentUser()?.createdAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  });

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  readonly hasProfileChanges = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const fv = this.profileFormValue();
    return fv?.name !== user.name || fv?.email !== user.email;
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({ name: user.name, email: user.email });
    }
  }

  get nameControl(): AbstractControl {
    return this.profileForm.get('name')!;
  }

  get emailControl(): AbstractControl {
    return this.profileForm.get('email')!;
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.hasProfileChanges()) return;

    this.savingProfile.set(true);
    const { name, email } = this.profileForm.value;

    this.profileService.updateProfile({ name: name ?? undefined, email: email ?? undefined }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        const summary = this.translate.instant('PROFILE.UPDATE_SUCCESS');
        const detail = this.translate.instant('PROFILE.UPDATE_SUCCESS');
        this.messageService.add({ severity: 'success', summary, detail });
      },
      error: (err: { status?: number }) => {
        this.savingProfile.set(false);
        const detailKey = err?.status === 409 ? 'PROFILE.EMAIL_IN_USE' : 'PROFILE.UPDATE_ERROR';
        const detail = this.translate.instant(detailKey);
        const summary = this.translate.instant('PROFILE.ERROR_SUMMARY');
        this.messageService.add({ severity: 'error', summary, detail });
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.savingPassword.set(true);

    this.profileService.updatePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        const summary = this.translate.instant('PROFILE.PASSWORD_CHANGED');
        const detail = this.translate.instant('PROFILE.PASSWORD_CHANGED');
        this.messageService.add({ severity: 'success', summary, detail });
      },
      error: (err: { status?: number }) => {
        this.savingPassword.set(false);
        const detailKey =
          err?.status === 401
            ? 'PROFILE.PASSWORD_CURRENT_INCORRECT'
            : 'PROFILE.PASSWORD_ERROR';
        const detail = this.translate.instant(detailKey);
        const summary = this.translate.instant('PROFILE.ERROR_SUMMARY');
        this.messageService.add({ severity: 'error', summary, detail });
      },
    });
  }
}
