import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg-mesh"></div>
      <div class="auth-bg-orb auth-bg-orb-1"></div>
      <div class="auth-bg-orb auth-bg-orb-2"></div>

      <div class="auth-container animate-scale-in">
        <a routerLink="/" class="auth-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to home
        </a>

        <div class="auth-card glass-card-static">
          <div class="auth-header">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#authGrad)"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="authGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6c5ce7"/><stop offset="1" stop-color="#a29bfe"/></linearGradient></defs>
            </svg>
            <h1>Welcome back</h1>
            <p>Sign in to your Splitly account</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="email">Email address</label>
              <input
                id="email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="password-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())">
                  @if (showPassword()) {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            @if (errorMsg()) {
              <div class="form-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {{ errorMsg() }}
              </div>
            }

            <button type="submit" class="btn btn-primary btn-lg auth-submit" [disabled]="loading()">
              @if (loading()) {
                <div class="spinner spinner-sm"></div>
                Signing in...
              } @else {
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              }
            </button>
          </form>

          <div class="auth-footer">
            Don't have an account? <a routerLink="/register">Create one</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .auth-bg-mesh {
      position: fixed;
      inset: 0;
      background: var(--gradient-mesh);
      pointer-events: none;
    }
    .auth-bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }
    .auth-bg-orb-1 {
      width: 500px;
      height: 500px;
      background: rgba(108, 92, 231, 0.1);
      top: -150px;
      left: -150px;
      animation: float 8s ease-in-out infinite;
    }
    .auth-bg-orb-2 {
      width: 400px;
      height: 400px;
      background: rgba(0, 206, 201, 0.07);
      bottom: -100px;
      right: -100px;
      animation: float 10s ease-in-out infinite reverse;
    }

    .auth-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: var(--space-lg);
    }

    .auth-back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: var(--space-lg);
      transition: color var(--transition-fast);
    }
    .auth-back:hover {
      color: var(--text-primary);
    }

    .auth-card {
      padding: var(--space-2xl);
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }
    .auth-header svg {
      margin-bottom: var(--space-md);
    }
    .auth-header h1 {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: var(--space-xs);
    }
    .auth-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .password-wrapper {
      position: relative;
    }
    .password-wrapper .form-input {
      width: 100%;
      padding-right: 44px;
    }
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 4px;
      transition: color var(--transition-fast);
    }
    .password-toggle:hover {
      color: var(--text-primary);
    }

    .auth-submit {
      width: 100%;
      margin-top: var(--space-sm);
    }
    .auth-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: var(--space-lg);
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .auth-footer a {
      color: var(--accent-purple-light);
      font-weight: 500;
    }

    .form-input {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');

  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.notify.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Invalid credentials');
      }
    });
  }
}
