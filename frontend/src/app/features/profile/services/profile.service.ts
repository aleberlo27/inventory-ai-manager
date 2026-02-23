import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

import type { User, UpdateProfileDto, ApiResponse } from '@shared/types';
import { APP_CONSTANTS } from '@shared/constants/app.constants';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  updateProfile(data: UpdateProfileDto): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${APP_CONSTANTS.API_URL}/auth/profile`, data)
      .pipe(
        map(res => res.data),
        tap(user => this.authService.updateCurrentUser(user)),
      );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .patch<ApiResponse<{ message: string }>>(`${APP_CONSTANTS.API_URL}/auth/password`, {
        currentPassword,
        newPassword,
      })
      .pipe(map(() => undefined));
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<ApiResponse<User>>(`${APP_CONSTANTS.API_URL}/auth/avatar`, formData)
      .pipe(
        map(res => res.data),
        tap(user => this.authService.updateCurrentUser(user)),
      );
  }
}
