import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService, Group } from '../../services/group.service';
import { ExpenseService, Expense } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="dashboard-page container animate-fade-in">
      <!-- Welcome Header -->
      <header class="dashboard-header">
        <div>
          <span class="text-accent font-semibold">Welcome back,</span>
          <h1>{{ auth.user()?.name }}</h1>
        </div>
        <a routerLink="/groups" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="12" y1="11" x2="22" y2="11"/><line x1="17" y1="6" x2="17" y2="16"/></svg>
          Manage Groups
        </a>
      </header>

      <!-- Stats Summary -->
      <section class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon purple-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Balance</span>
            <span class="stat-value" [class.text-success]="totalBalance() > 0" [class.text-danger]="totalBalance() < 0">
              {{ totalBalance() >= 0 ? '+' : '' }}{{ totalBalance() | number:'1.2-2' }}
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon green-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">You are owed</span>
            <span class="stat-value text-success">$ {{ totalOwed() | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon red-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">You owe</span>
            <span class="stat-value text-danger">$ {{ totalOwe() | number:'1.2-2' }}</span>
          </div>
        </div>
      </section>

      <div class="dashboard-content">
        <!-- Groups Section -->
        <div class="main-column">
          <div class="section-title-row">
            <h2>Your Groups</h2>
            <span class="badge">{{ groups().length }} total</span>
          </div>

          @if (loadingGroups()) {
            <div class="skeleton-list">
              <div class="skeleton-card glass-card-static" style="height: 100px; margin-bottom: 16px;"></div>
              <div class="skeleton-card glass-card-static" style="height: 100px; margin-bottom: 16px;"></div>
            </div>
          } @else if (groups().length === 0) {
            <div class="empty-state-card glass-card">
              <div class="empty-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>No groups yet</h3>
              <p>Create a group to start splitting bills with friends, family, or roommates.</p>
              <a routerLink="/groups" class="btn btn-secondary">Create a Group</a>
            </div>
          } @else {
            <div class="groups-grid">
              @for (group of groups(); track group._id) {
                <a [routerLink]="['/groups', group._id]" class="group-summary-card glass-card animate-scale-in">
                  <div class="group-card-header">
                    <div class="group-avatar" [style.background]="auth.getAvatarGradient(group.name)">
                      {{ auth.getUserInitials(group.name) }}
                    </div>
                    <div>
                      <h3>{{ group.name }}</h3>
                      <p class="description">{{ group.description || 'No description' }}</p>
                    </div>
                  </div>
                  <div class="group-card-footer">
                    <div class="members-avatars">
                      @for (member of group.members.slice(0, 4); track member._id) {
                        <div class="avatar-sm" [style.background]="auth.getAvatarGradient(member.name)" [title]="member.name">
                          {{ auth.getUserInitials(member.name) }}
                        </div>
                      }
                      @if (group.members.length > 4) {
                        <div class="avatar-sm-more">+{{ group.members.length - 4 }}</div>
                      }
                    </div>
                    <span class="view-details">
                      View details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                  </div>
                </a>
              }
            </div>
          }
        </div>

        <!-- Sidebar Activity / Recent Expenses -->
        <div class="sidebar-column">
          <h2>Recent Activity</h2>
          
          @if (loadingExpenses()) {
            <div class="skeleton-list">
              <div class="skeleton-card glass-card-static" style="height: 60px; margin-bottom: 12px;"></div>
              <div class="skeleton-card glass-card-static" style="height: 60px; margin-bottom: 12px;"></div>
            </div>
          } @else if (recentExpenses().length === 0) {
            <div class="empty-state-sidebar glass-card">
              <p>No recent expenses found.</p>
            </div>
          } @else {
            <div class="recent-expenses-list">
              @for (expense of recentExpenses(); track expense._id) {
                <div class="expense-activity-item glass-card-static">
                  <div class="expense-meta">
                    <span class="expense-desc">{{ expense.description }}</span>
                    <span class="expense-amount">$ {{ expense.amount | number:'1.2-2' }}</span>
                  </div>
                  <div class="expense-context">
                    <span>Paid by <strong>{{ expense.paidBy.name || 'Someone' }}</strong></span>
                    <span class="expense-date">{{ expense.date | date:'MMM d' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: var(--space-xl) var(--space-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2xl);
    }
    .dashboard-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
    }

    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-glass-strong);
      color: var(--text-primary);
    }

    .purple-glow {
      box-shadow: var(--shadow-glow-purple);
      color: var(--accent-purple-light);
    }
    .green-glow {
      color: var(--color-success);
      box-shadow: 0 0 30px rgba(0, 184, 148, 0.15);
    }
    .red-glow {
      color: var(--color-danger);
      box-shadow: 0 0 30px rgba(225, 112, 85, 0.15);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      font-family: var(--font-heading);
      letter-spacing: -0.02em;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-2xl);
    }

    .section-title-row {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .badge {
      background: var(--bg-glass-strong);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
    }

    .group-summary-card {
      padding: var(--space-lg);
      text-decoration: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 160px;
      transition: all var(--transition-base);
    }
    .group-summary-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md), var(--shadow-glow-purple);
      border-color: var(--border-accent);
    }

    .group-card-header {
      display: flex;
      gap: var(--space-md);
      align-items: flex-start;
    }
    .group-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-family: var(--font-heading);
    }
    .group-card-header h3 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .group-card-header .description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .group-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-md);
    }

    .members-avatars {
      display: flex;
      align-items: center;
    }
    .avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-full);
      border: 2px solid var(--bg-void);
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: bold;
      color: white;
    }
    .avatar-sm:first-child {
      margin-left: 0;
    }
    .avatar-sm-more {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-full);
      background: var(--bg-glass-strong);
      border: 2px solid var(--bg-void);
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .view-details {
      font-size: 0.85rem;
      color: var(--text-accent);
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .sidebar-column h2 {
      margin-bottom: var(--space-xl);
    }

    .recent-expenses-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .expense-activity-item {
      padding: var(--space-md);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .expense-meta {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
    }
    .expense-desc {
      color: var(--text-primary);
    }
    .expense-amount {
      color: var(--text-accent);
    }
    .expense-context {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .empty-state-card {
      padding: var(--space-3xl) var(--space-xl);
      text-align: center;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
    }
    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: var(--bg-glass-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      margin-bottom: var(--space-sm);
    }
    .empty-state-card h3 {
      font-size: 1.4rem;
    }
    .empty-state-card p {
      color: var(--text-secondary);
      max-width: 400px;
      margin-bottom: var(--space-md);
    }

    .empty-state-sidebar {
      padding: var(--space-xl);
      text-align: center;
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      font-size: 0.9rem;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        grid-template-columns: 1fr;
        gap: var(--space-2xl);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  groups = signal<Group[]>([]);
  recentExpenses = signal<Expense[]>([]);
  
  loadingGroups = signal(true);
  loadingExpenses = signal(true);

  // Computations for owe / owed
  totalOwed = signal(0); // You are owed
  totalOwe = signal(0);  // You owe
  totalBalance = computed(() => this.totalOwed() - this.totalOwe());

  constructor(
    public auth: AuthService,
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loadingGroups.set(true);
    this.loadingExpenses.set(true);

    this.groupService.getMyGroups().subscribe({
      next: (res) => {
        this.groups.set(res.group || []);
        this.loadingGroups.set(false);
        this.loadExpensesForGroups(res.group || []);
      },
      error: (err) => {
        this.loadingGroups.set(false);
        this.notify.error('Failed to load groups');
      }
    });
  }

  loadExpensesForGroups(groups: Group[]) {
    if (groups.length === 0) {
      this.loadingExpenses.set(false);
      return;
    }

    const currentUserId = this.auth.user()?._id;
    if (!currentUserId) {
      this.loadingExpenses.set(false);
      return;
    }

    // Load expenses for all groups in parallel
    const requests = groups.map(g => 
      this.expenseService.getGroupExpenses(g._id).pipe(
        catchError(() => of({ expense: [] as Expense[] }))
      )
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        let allExpenses: Expense[] = [];
        responses.forEach(res => {
          if (res && res.expense) {
            allExpenses = allExpenses.concat(res.expense);
          }
        });

        // Sort by date descending
        allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.recentExpenses.set(allExpenses.slice(0, 8)); // Top 8 recent expenses
        this.calculateBalances(allExpenses, currentUserId);
        this.loadingExpenses.set(false);
      },
      error: () => {
        this.loadingExpenses.set(false);
        this.notify.error('Failed to load recent activity');
      }
    });
  }

  calculateBalances(allExpenses: Expense[], currentUserId: string) {
    let owed = 0;
    let owe = 0;

    allExpenses.forEach(expense => {
      const paidById = expense.paidBy?._id || (expense.paidBy as any);
      const isPaidByMe = paidById === currentUserId;

      if (isPaidByMe) {
        // I paid. Others owe me.
        expense.participants.forEach(p => {
          const participantId = typeof p.user === 'object' ? p.user._id : p.user;
          if (participantId !== currentUserId) {
            owed += p.amount;
          }
        });
      } else {
        // Someone else paid. Let's see if I'm a participant and owe them.
        const myParticipation = expense.participants.find(p => {
          const participantId = typeof p.user === 'object' ? p.user._id : p.user;
          return participantId === currentUserId;
        });
        if (myParticipation) {
          owe += myParticipation.amount;
        }
      }
    });

    this.totalOwed.set(owed);
    this.totalOwe.set(owe);
  }
}
