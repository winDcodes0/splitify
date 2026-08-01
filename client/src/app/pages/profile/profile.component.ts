import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  template: `
    <div class="profile-page container animate-fade-in">
      <header class="profile-header">
        <h1>Profile</h1>
        <p class="subtitle">Manage your personal account settings and stats</p>
      </header>

      <div class="profile-layout">
        <!-- Details Card -->
        <div class="profile-card glass-card">
          <div class="profile-avatar-large" [style.background]="auth.getAvatarGradient(auth.user()?.name || '')">
            {{ auth.getUserInitials(auth.user()?.name || '') }}
          </div>
          
          <div class="profile-info-section">
            <div class="info-group">
              <span class="label">Full Name</span>
              <span class="value">{{ auth.user()?.name }}</span>
            </div>
            
            <div class="info-group">
              <span class="label">Email Address</span>
              <span class="value">{{ auth.user()?.email }}</span>
            </div>

            <div class="info-group">
              <span class="label">Account Status</span>
              <span class="value-badge">Active</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-secondary" (click)="auth.logout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout from Device
            </button>
          </div>
        </div>

        <!-- Summary Stats Card -->
        <div class="profile-card glass-card">
          <h3>Your Splitly Stats</h3>
          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-label-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>Total Groups joined</span>
              </div>
              <span class="stat-number">{{ groupsCount() }}</span>
            </div>

            <div class="stat-item">
              <div class="stat-label-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Platform Role</span>
              </div>
              <span class="stat-badge">Premium Developer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--space-xl) var(--space-lg);
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: var(--space-2xl);
    }
    .profile-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .profile-header .subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: var(--space-2xl);
    }

    .profile-card {
      padding: var(--space-2xl);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xl);
    }

    .profile-avatar-large {
      width: 90px;
      height: 90px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-weight: 700;
      color: white;
      box-shadow: var(--shadow-glow-purple);
    }

    .profile-info-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .info-group {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--space-sm);
    }
    .info-group .label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .info-group .value {
      font-size: 1.05rem;
      color: var(--text-primary);
      margin-top: 2px;
    }
    .value-badge {
      display: inline-block;
      align-self: flex-start;
      margin-top: 4px;
      background: rgba(0, 184, 148, 0.15);
      color: var(--color-success);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .profile-actions {
      width: 100%;
      margin-top: var(--space-md);
    }
    .profile-actions .btn {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-sm);
    }

    .profile-card h3 {
      font-size: 1.15rem;
      width: 100%;
      text-align: left;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--space-sm);
    }

    .stats-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .stat-label-icon {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .stat-number {
      font-size: 1.4rem;
      font-weight: 700;
      font-family: var(--font-heading);
      color: var(--text-primary);
    }
    .stat-badge {
      background: rgba(108, 92, 231, 0.15);
      color: var(--accent-purple-light);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  groupsCount = signal(0);

  constructor(
    public auth: AuthService,
    private groupService: GroupService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.groupService.getMyGroups().subscribe({
      next: (res) => {
        this.groupsCount.set(res.group?.length || 0);
      },
      error: () => {
        this.notify.error('Could not load profile stats.');
      }
    });
  }
}
