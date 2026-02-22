import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

import type { User, AuthCredentials, RegisterData, AuthResponse, ApiResponse } from '@shared/types';
import { APP_CONSTANTS } from '@shared/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${APP_CONSTANTS.API_URL}/auth/login`, credentials)
      .pipe(
        map(res => res.data),
        tap(auth => this.saveSession(auth)),
      );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${APP_CONSTANTS.API_URL}/auth/register`, data)
      .pipe(
        map(res => res.data),
        tap(auth => this.saveSession(auth)),
      );
  }

  logout(): void {
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(APP_CONSTANTS.USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private saveSession(auth: AuthResponse): void {
    localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, auth.token);
    localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(auth.user));
    this.currentUserSignal.set(auth.user);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(APP_CONSTANTS.USER_KEY);
    if (userJson) {
      try {
        this.currentUserSignal.set(JSON.parse(userJson) as User);
      } catch {
        // invalid JSON — ignore
      }
    }
  }
}
