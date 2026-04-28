import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage, ReactiveFormsModule, NzCarouselModule, NzIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  readonly chefLogo = '/chef_green.png';

  showPassword = signal(false);
  notificationDismissed = signal(false);
  rememberMe = signal(false);

  loginStatus = computed(() => {
    const authState = this.authService.currentUser();
    if (authState.isLoading) return 'loading';
    if (authState.error) return 'invalid';
    if (authState.isAuthenticated) return 'valid';
    return null;
  });

  loggingIn = computed(() => this.authService.currentUser().isLoading);

  loginForm = this.fb.group({
    email: ['admin@mail.com', [Validators.required]],
    password: ['Admin@123', [Validators.required]],
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/home');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onRememberMeChange(event: Event): void {
    this.rememberMe.set((event.target as HTMLInputElement).checked);
  }

  dismissNotification(): void {
    this.notificationDismissed.set(true);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.notificationDismissed.set(false);
      const { email, password } = this.loginForm.getRawValue();

      this.authService.login({ userName: email, password: password }).subscribe({
        next: () => {
          setTimeout(() => this.router.navigateByUrl('/dashboard/home'), 1000);
        },
        error: (error: unknown) => {
          console.error('Login failed:', error);
        },
      });
    }
  }
}
