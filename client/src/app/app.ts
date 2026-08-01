import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Toast Notifications -->
    <div class="toast-container">
      @for (toast of notification.toasts(); track toast.id) {
        <div class="toast"
             [class.toast-success]="toast.type === 'success'"
             [class.toast-error]="toast.type === 'error'"
             [class.toast-info]="toast.type === 'info'"
             [class.toast-exit]="toast.exiting"
             (click)="notification.removeToast(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            } @else if (toast.type === 'error') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            }
          </span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>

    <!-- Navigation (only for authenticated users) -->
    @if (auth.isAuthenticated()) {
      <nav class="app-nav">
        <div class="nav-inner">
          <a routerLink="/dashboard" class="nav-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#navGrad)"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6c5ce7"/><stop offset="1" stop-color="#a29bfe"/></linearGradient></defs>
            </svg>
            <span class="nav-brand">Splitly</span>
          </a>

          <div class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </a>
            <a routerLink="/groups" routerLinkActive="active" class="nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Groups
            </a>
          </div>

          <div class="nav-right">
            <a routerLink="/profile" routerLinkActive="active" class="nav-avatar-link">
              <div class="nav-avatar" [style.background]="auth.user() ? auth.getAvatarGradient(auth.user()!.name) : ''">
                {{ auth.user() ? auth.getUserInitials(auth.user()!.name) : '?' }}
              </div>
            </a>
            <button class="btn-icon nav-logout" (click)="auth.logout()" title="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </nav>
    }

    <main [class.has-nav]="auth.isAuthenticated()">
      <router-outlet />
    </main>
  `,
  styles: [`
    .app-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(10, 10, 15, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
    }

    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }

    .nav-brand {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .nav-links {
      display: flex;
      gap: var(--space-xs);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 8px 16px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all var(--transition-base);
      text-decoration: none;
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-glass);
    }
    .nav-link.active {
      color: var(--accent-purple-light);
      background: rgba(108, 92, 231, 0.1);
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .nav-avatar-link {
      text-decoration: none;
    }

    .nav-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.8rem;
      color: white;
      cursor: pointer;
      transition: transform var(--transition-base);
    }
    .nav-avatar:hover {
      transform: scale(1.1);
    }

    .nav-logout {
      opacity: 0.6;
      transition: all var(--transition-base);
    }
    .nav-logout:hover {
      opacity: 1;
      color: var(--color-danger);
    }

    main.has-nav {
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(10, 10, 15, 0.95);
        backdrop-filter: blur(20px);
        border-top: 1px solid var(--border-subtle);
        padding: var(--space-sm) var(--space-lg);
        justify-content: center;
        gap: var(--space-md);
        z-index: 1000;
      }

      main.has-nav {
        padding-bottom: 72px;
      }
    }
  `]
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    public notification: NotificationService
  ) {}
}
