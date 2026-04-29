import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { API_BASE_URL } from '../app.config';
import {
  User,
  LoginRequest,
  LoginResponse,
  AuthState,
  RefreshTokenResponse,
  UserProfile,
} from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = inject(API_BASE_URL);
  private authState = signal<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  private readonly API_URL = `${this.baseUrl}/api`;

  readonly currentUser = this.authState.asReadonly();
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isLoading = computed(() => this.authState().isLoading);
  readonly error = computed(() => this.authState().error);
  readonly user = computed(() => this.authState().user);

  readonly currentUserProfile = computed<UserProfile>(() => {
    const user = this.authState().user;
    return {
      id: user?.id ?? '',
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      image: user?.image ?? '',
      userName: user?.userName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    };
  });

  showProfile = signal(false);

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const loginStatus = localStorage.getItem('loginStatus');
    const userStr = localStorage.getItem('currentUser');

    if (loginStatus === 'valid' && token) {
      let user: User | null = null;

      if (userStr) {
        try {
          user = JSON.parse(userStr) as User;
        } catch (error: unknown) {
          console.error('Failed to parse stored user:', error);
        }
      }

      this.authState.update((state) => ({
        ...state,
        user,
        token,
        refreshToken,
        isAuthenticated: true,
      }));

      if (!user) {
        this.getUserProfile().subscribe();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authState.update((state) => ({ ...state, isLoading: true, error: null }));

    return this.http.post<LoginResponse>(`${this.API_URL}/Auth/SignIn`, credentials).pipe(
      tap((response) => {
        const { token, refreshToken } = response;

        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('loginStatus', 'valid');

        this.authState.update((state) => ({
          ...state,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
        this.getUserProfile().subscribe();
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.resolveLoginError(error);

        this.authState.update((state) => ({
          ...state,
          isLoading: false,
          error: errorMessage,
        }));

        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private resolveLoginError(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Invalid username or password';
    if (error.status === 0) return 'Unable to connect to server';

    const errBody = error.error as { message?: string } | null;
    return errBody?.message ?? 'Login failed';
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/Auth/profile`).pipe(
      tap((user) => {
        this.authState.update((state) => ({ ...state, user }));
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError((error: unknown) => {
        console.error('Failed to fetch user profile:', error);
        return throwError(() => error);
      }),
    );
  }

  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<RefreshTokenResponse>(`${this.API_URL}/Auth/refreshToken`, { refreshToken })
      .pipe(
        tap((response) => {
          const token = response.token ?? response.accessToken ?? '';
          const newRefreshToken = response.refreshToken;

          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          this.authState.update((state) => ({
            ...state,
            token,
            refreshToken: newRefreshToken,
          }));
        }),
      );
  }

  clearError(): void {
    this.authState.update((state) => ({ ...state, error: null }));
  }

  logout(): void {
    this.clearAuthData();
    this.authState.set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginStatus');
  }

  getToken(): string | null {
    return this.authState().token;
  }

  getRefreshToken(): string | null {
    return this.authState().refreshToken;
  }

  getCurrentUser(): User | null {
    return this.authState().user;
  }
}
