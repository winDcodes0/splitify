import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService, Group } from '../../services/group.service';
import { ExpenseService, Expense } from '../../services/expense.service';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

interface Settlement {
  from: User;
  to: User;
  amount: number;
}

interface MemberBalance {
  user: User;
  net: number; // positive = owed, negative = owes
}

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="group-detail-page container animate-fade-in">
      @if (loadingGroup()) {
        <div class="skeleton-header" style="height: 120px; margin-bottom: 30px;"></div>
        <div class="skeleton-layout">
          <div class="skeleton-card" style="height: 400px; flex: 2;"></div>
          <div class="skeleton-card" style="height: 400px; flex: 1;"></div>
        </div>
      } @else if (group(); as g) {
        <!-- Header -->
        <header class="group-header">
          <div class="group-header-left">
            <a routerLink="/dashboard" class="btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
            </a>
            <div class="group-avatar-large" [style.background]="auth.getAvatarGradient(g.name)">
              {{ auth.getUserInitials(g.name) }}
            </div>
            <div>
              <h1>{{ g.name }}</h1>
              <p class="description">{{ g.description || 'No description provided' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" (click)="openExpenseModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Expense
            </button>
          </div>
        </header>

        <!-- Layout -->
        <div class="detail-layout">
          <!-- Main Section: Expenses -->
          <div class="expenses-section">
            <div class="section-title-bar">
              <h2>Expenses</h2>
              <span class="badge">{{ expenses().length }} total</span>
            </div>

            @if (loadingExpenses()) {
              <div class="skeleton-list">
                <div class="skeleton-card glass-card-static" style="height: 70px; margin-bottom: 12px;"></div>
                <div class="skeleton-card glass-card-static" style="height: 70px; margin-bottom: 12px;"></div>
              </div>
            } @else if (expenses().length === 0) {
              <div class="empty-state-card glass-card">
                <div class="empty-icon-wrapper">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                </div>
                <h3>No expenses yet</h3>
                <p>Add your first expense to begin splitting costs with group members.</p>
                <button class="btn btn-secondary" (click)="openExpenseModal()">Add Expense</button>
              </div>
            } @else {
              <div class="expenses-list">
                @for (exp of expenses(); track exp._id) {
                  <div class="expense-card glass-card-static animate-scale-in">
                    <div class="expense-left">
                      <div class="expense-date-box">
                        <span class="month">{{ exp.createdAt | date:'MMM' }}</span>
                        <span class="day">{{ exp.createdAt | date:'d' }}</span>
                      </div>
                      <div>
                        <h3>{{ exp.description }}</h3>
                        <p class="paid-by">Paid by <strong>{{ exp.paidBy.name || 'Unknown' }}</strong></p>
                      </div>
                    </div>

                    <div class="expense-right">
                      <div class="expense-amount-details">
                        <span class="amount">$ {{ exp.amount | number:'1.2-2' }}</span>
                        <span class="split-type-badge">{{ exp.splitType }}</span>
                      </div>
                      @if (exp.paidBy._id === auth.user()?._id || g.createdBy === auth.user()?._id) {
                        <button class="btn-delete-expense" (click)="onDeleteExpense(exp._id)" title="Delete expense">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Sidebar: Members & Balances -->
          <div class="sidebar-section">
            <!-- Members -->
            <div class="sidebar-card glass-card">
              <div class="sidebar-header-row">
                <h3>Members ({{ g.members.length }})</h3>
                <button class="btn-icon-sm" (click)="showMemberModal.set(true)" title="Add Member">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>

              <div class="members-list">
                @for (m of g.members; track m._id) {
                  <div class="member-item">
                    <div class="avatar-sm" [style.background]="auth.getAvatarGradient(m.name)">
                      {{ auth.getUserInitials(m.name) }}
                    </div>
                    <div class="member-info">
                      <span class="name">{{ m.name }}</span>
                      <span class="email">{{ m.email }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Balances -->
            <div class="sidebar-card glass-card">
              <h3>Net Balances</h3>
              <div class="balances-list">
                @for (mb of memberBalances(); track mb.user._id) {
                  <div class="balance-item">
                    <div class="balance-user">
                      <div class="avatar-xs" [style.background]="auth.getAvatarGradient(mb.user.name)">
                        {{ auth.getUserInitials(mb.user.name) }}
                      </div>
                      <span>{{ mb.user.name }}</span>
                    </div>
                    <span class="balance-value" [class.text-success]="mb.net > 0" [class.text-danger]="mb.net < 0">
                      @if (mb.net > 0) {
                        is owed $ {{ mb.net | number:'1.2-2' }}
                      } @else if (mb.net < 0) {
                        owes $ {{ -mb.net | number:'1.2-2' }}
                      } @else {
                        settled up
                      }
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Settlements -->
            <div class="sidebar-card glass-card">
              <h3>Suggested Settlements</h3>
              <div class="settlements-list">
                @for (s of suggestedSettlements(); track $index) {
                  <div class="settlement-item">
                    <div class="settlement-path">
                      <span>{{ s.from.name }}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                      <span>{{ s.to.name }}</span>
                    </div>
                    <span class="settlement-amount">$ {{ s.amount | number:'1.2-2' }}</span>
                  </div>
                } @empty {
                  <div class="settlement-empty">
                    Everyone is fully settled up!
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Add Expense Modal -->
        @if (showExpenseModal()) {
          <div class="modal-overlay" (click)="closeExpenseModal()">
            <div class="modal-card glass-card animate-scale-in" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Add Expense</h2>
                <button class="btn-close" (click)="closeExpenseModal()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <form (ngSubmit)="onCreateExpense()" class="modal-form">
                <div class="form-group">
                  <label class="form-label" for="expenseDesc">Description</label>
                  <input
                    id="expenseDesc"
                    type="text"
                    class="form-input"
                    placeholder="e.g. Weekly Groceries"
                    [(ngModel)]="expenseDesc"
                    name="expenseDesc"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="expenseAmount">Amount ($)</label>
                  <input
                    id="expenseAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="form-input"
                    placeholder="0.00"
                    [(ngModel)]="expenseAmount"
                    (ngModelChange)="onAmountOrSplitChange()"
                    name="expenseAmount"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="paidBy">Paid By</label>
                  <select id="paidBy" class="form-input" [(ngModel)]="expensePaidBy" name="expensePaidBy">
                    @for (m of g.members; track m._id) {
                      <option [value]="m._id">{{ m.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Split Type</label>
                  <div class="split-type-tabs">
                    <button type="button" class="tab-btn" [class.active]="splitType === 'equal'" (click)="setSplitType('equal')">Equally</button>
                    <button type="button" class="tab-btn" [class.active]="splitType === 'exact'" (click)="setSplitType('exact')">Exact Amounts</button>
                    <button type="button" class="tab-btn" [class.active]="splitType === 'percentage'" (click)="setSplitType('percentage')">Percentages</button>
                  </div>
                </div>

                <!-- Calculator Split List -->
                <div class="form-group">
                  <label class="form-label">Split Details</label>
                  <div class="split-details-list">
                    @for (item of participantSplits; track item.member._id) {
                      <div class="split-detail-row">
                        <span class="member-name">{{ item.member.name }}</span>
                        
                        @if (splitType === 'equal') {
                          <span class="split-value-preview">$ {{ item.calculatedAmount | number:'1.2-2' }}</span>
                        } @else if (splitType === 'exact') {
                          <div class="input-with-unit">
                            <span class="unit">$</span>
                            <input
                              type="number"
                              step="0.01"
                              class="form-input-sm"
                              [(ngModel)]="item.inputValue"
                              (ngModelChange)="onAmountOrSplitChange()"
                              [name]="'split_' + item.member._id"
                            />
                          </div>
                        } @else if (splitType === 'percentage') {
                          <div class="input-with-unit">
                            <input
                              type="number"
                              class="form-input-sm"
                              [(ngModel)]="item.inputValue"
                              (ngModelChange)="onAmountOrSplitChange()"
                              [name]="'split_' + item.member._id"
                            />
                            <span class="unit">%</span>
                          </div>
                          <span class="split-value-preview font-semibold">$ {{ item.calculatedAmount | number:'1.2-2' }}</span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Error or validation preview -->
                  @if (splitErrorMsg()) {
                    <div class="split-error">{{ splitErrorMsg() }}</div>
                  }
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" (click)="closeExpenseModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="creatingExpense() || !!splitErrorMsg() || !expenseDesc || !expenseAmount">
                    @if (creatingExpense()) {
                      <div class="spinner spinner-sm"></div> Creating...
                    } @else {
                      Create Expense
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Add Member Modal -->
        @if (showMemberModal()) {
          <div class="modal-overlay" (click)="showMemberModal.set(false)">
            <div class="modal-card glass-card animate-scale-in" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Add Member</h2>
                <button class="btn-close" (click)="showMemberModal.set(false)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <form (ngSubmit)="onAddMember()" class="modal-form">
                <div class="form-group">
                  <label class="form-label" for="memberEmail">User Email</label>
                  <input
                    id="memberEmail"
                    type="email"
                    class="form-input"
                    placeholder="friend@example.com"
                    [(ngModel)]="memberEmail"
                    name="memberEmail"
                    required
                  />
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" (click)="showMemberModal.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="addingMember() || !memberEmail">
                    @if (addingMember()) {
                      <div class="spinner spinner-sm"></div> Adding...
                    } @else {
                      Add Member
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .group-detail-page {
      padding: var(--space-xl) var(--space-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--space-xl);
    }
    .group-header-left {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .btn-back {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--bg-glass-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      transition: all var(--transition-base);
    }
    .btn-back:hover {
      background: var(--bg-glass-hover);
      transform: translateX(-2px);
    }
    .group-avatar-large {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }
    .group-header h1 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .group-header .description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-2xl);
    }

    .section-title-bar {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .badge {
      background: var(--bg-glass-strong);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .expense-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-lg);
      transition: all var(--transition-base);
    }
    .expense-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-light);
      background: var(--bg-glass-hover);
    }

    .expense-left {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }
    .expense-date-box {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-md);
      background: var(--bg-glass-strong);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      line-height: 1.1;
    }
    .expense-date-box .month {
      font-size: 0.65rem;
      text-transform: uppercase;
      color: var(--text-secondary);
      font-weight: 700;
    }
    .expense-date-box .day {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .expense-left h3 {
      font-size: 1.05rem;
      color: var(--text-primary);
    }
    .expense-left .paid-by {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .expense-right {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }
    .expense-amount-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .expense-amount-details .amount {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: var(--font-heading);
    }
    .expense-amount-details .split-type-badge {
      font-size: 0.65rem;
      text-transform: uppercase;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
      font-weight: bold;
    }
    .btn-delete-expense {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-delete-expense:hover {
      color: var(--color-danger);
      background: rgba(225, 112, 85, 0.1);
    }

    /* Sidebar Section */
    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .sidebar-card {
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
    }
    .sidebar-card h3 {
      font-size: 1.1rem;
      margin-bottom: var(--space-md);
      color: var(--text-primary);
    }
    .sidebar-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-md);
    }
    .sidebar-header-row h3 {
      margin-bottom: 0;
    }

    .btn-icon-sm {
      background: var(--bg-glass-strong);
      border: 1px solid var(--border-subtle);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all var(--transition-base);
    }
    .btn-icon-sm:hover {
      background: var(--bg-glass-hover);
      color: var(--text-primary);
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .member-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .member-info {
      display: flex;
      flex-direction: column;
    }
    .member-info .name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .member-info .email {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .balances-list, .settlements-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .balance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .balance-user {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .avatar-xs {
      width: 22px;
      height: 22px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      font-weight: bold;
      color: white;
    }
    .balance-value {
      font-size: 0.85rem;
    }

    .settlement-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-glass-strong);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
    }
    .settlement-path {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }
    .settlement-amount {
      font-weight: 700;
      color: var(--accent-teal-light);
    }
    .settlement-empty {
      text-align: center;
      color: var(--text-tertiary);
      font-size: 0.85rem;
      padding: var(--space-sm) 0;
    }

    /* Modals & Forms */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 15, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: var(--space-md);
    }
    .modal-card {
      width: 100%;
      max-width: 500px;
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
    }
    .btn-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    .btn-close:hover {
      color: var(--text-primary);
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .split-type-tabs {
      display: flex;
      background: var(--bg-glass-strong);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 4px;
    }
    .tab-btn {
      flex: 1;
      background: none;
      border: none;
      padding: 8px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      transition: all var(--transition-fast);
    }
    .tab-btn.active {
      background: rgba(108, 92, 231, 0.15);
      color: var(--accent-purple-light);
      border: 1px solid var(--border-accent);
    }

    .split-details-list {
      background: var(--bg-glass);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-sm) var(--space-md);
      max-height: 200px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .split-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-xs) 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .split-detail-row:last-child {
      border-bottom: none;
    }
    .split-detail-row .member-name {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .input-with-unit {
      display: flex;
      align-items: center;
      background: var(--bg-glass-strong);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 2px 8px;
      max-width: 100px;
    }
    .input-with-unit input {
      background: none;
      border: none;
      color: var(--text-primary);
      width: 100%;
      text-align: right;
      font-size: 0.85rem;
      padding: 4px;
    }
    .input-with-unit .unit {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-weight: 600;
    }

    .split-value-preview {
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .split-error {
      color: var(--color-danger);
      font-size: 0.8rem;
      margin-top: var(--space-xs);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-md);
      margin-top: var(--space-md);
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

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GroupDetailComponent implements OnInit {
  groupId = '';
  group = signal<Group | null>(null);
  expenses = signal<Expense[]>([]);
  
  loadingGroup = signal(true);
  loadingExpenses = signal(true);

  // Computations
  memberBalances = signal<MemberBalance[]>([]);
  suggestedSettlements = signal<Settlement[]>([]);

  // Modals properties
  showExpenseModal = signal(false);
  creatingExpense = signal(false);
  
  showMemberModal = signal(false);
  addingMember = signal(false);
  memberEmail = '';

  // Expense form state
  expenseDesc = '';
  expenseAmount: number | null = null;
  expensePaidBy = '';
  splitType = 'equal';
  participantSplits: { member: User; inputValue: number; calculatedAmount: number }[] = [];
  splitErrorMsg = signal('');

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private groupService: GroupService,
    private expenseService: ExpenseService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params['id'];
      if (this.groupId) {
        this.fetchGroupDetails();
      }
    });
  }

  fetchGroupDetails() {
    this.loadingGroup.set(true);
    this.groupService.getGroupById(this.groupId).subscribe({
      next: (res) => {
        this.group.set(res.group);
        this.loadingGroup.set(false);
        this.fetchExpenses();
      },
      error: () => {
        this.loadingGroup.set(false);
        this.notify.error('Failed to load group details.');
      }
    });
  }

  fetchExpenses() {
    this.loadingExpenses.set(true);
    this.expenseService.getGroupExpenses(this.groupId).subscribe({
      next: (res) => {
        this.expenses.set(res.expense || []);
        this.loadingExpenses.set(false);
        this.processGroupBalances();
      },
      error: () => {
        this.loadingExpenses.set(false);
        this.notify.error('Failed to load expenses.');
      }
    });
  }

  processGroupBalances() {
    const g = this.group();
    if (!g) return;

    // Calculate balances for each member
    const balanceMap: { [id: string]: number } = {};
    g.members.forEach(m => balanceMap[m._id] = 0);

    this.expenses().forEach(exp => {
      const payerId = exp.paidBy?._id || (exp.paidBy as any);
      
      // Credit payer
      if (payerId in balanceMap) {
        balanceMap[payerId] += exp.amount;
      }

      // Debit participants
      exp.participants.forEach(p => {
        const pId = typeof p.user === 'object' ? p.user._id : p.user;
        if (pId in balanceMap) {
          balanceMap[pId] -= p.amount;
        }
      });
    });

    // Populate MemberBalances signal
    const mbList: MemberBalance[] = g.members.map(m => ({
      user: m,
      net: Math.round(balanceMap[m._id] * 100) / 100
    }));
    this.memberBalances.set(mbList);

    // Calculate suggested settlements
    this.calculateSettlements(mbList);
  }

  calculateSettlements(balances: MemberBalance[]) {
    // Clone balances for stateful reduction
    const locals = balances.map(b => ({ ...b, net: b.net }));
    const settlements: Settlement[] = [];

    // Separate into debtors (owes money < 0) and creditors (owed money > 0)
    let debtors = locals.filter(x => x.net < -0.01).sort((a, b) => a.net - b.net); // largest debt first
    let creditors = locals.filter(x => x.net > 0.01).sort((a, b) => b.net - a.net); // largest credit first

    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      const amountToPay = Math.min(-debtor.net, creditor.net);
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(amountToPay * 100) / 100
      });

      debtor.net += amountToPay;
      creditor.net -= amountToPay;

      // Filter out completed balances
      debtors = debtors.filter(x => x.net < -0.01);
      creditors = creditors.filter(x => x.net > 0.01);

      // Re-sort to maintain greedy approach
      debtors.sort((a, b) => a.net - b.net);
      creditors.sort((a, b) => b.net - a.net);
    }

    this.suggestedSettlements.set(settlements);
  }

  onDeleteExpense(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.notify.success('Expense deleted.');
          this.fetchExpenses();
        },
        error: () => {
          this.notify.error('Could not delete expense.');
        }
      });
    }
  }

  onAddMember() {
    if (!this.memberEmail.trim()) return;
    this.addingMember.set(true);

    this.groupService.addMember(this.groupId, this.memberEmail).subscribe({
      next: (res) => {
        this.addingMember.set(false);
        this.notify.success('Member added successfully.');
        this.showMemberModal.set(false);
        this.memberEmail = '';
        this.group.set(res.group);
        this.processGroupBalances();
      },
      error: (err) => {
        this.addingMember.set(false);
        this.notify.error(err.error?.message || 'Could not add member.');
      }
    });
  }

  // Expense form handling & splitting logic
  openExpenseModal() {
    const g = this.group();
    if (!g) return;

    this.expenseDesc = '';
    this.expenseAmount = null;
    this.expensePaidBy = this.auth.user()?._id || g.members[0]?._id;
    this.splitType = 'equal';
    this.splitErrorMsg.set('');

    // Pre-populate participants list
    this.participantSplits = g.members.map(m => ({
      member: m,
      inputValue: 0,
      calculatedAmount: 0
    }));

    this.showExpenseModal.set(true);
    this.onAmountOrSplitChange();
  }

  closeExpenseModal() {
    this.showExpenseModal.set(false);
  }

  setSplitType(type: string) {
    this.splitType = type;

    // Reset fields based on type
    if (type === 'equal') {
      this.participantSplits.forEach(p => p.inputValue = 0);
    } else if (type === 'exact') {
      const amt = this.expenseAmount || 0;
      const share = Math.round((amt / this.participantSplits.length) * 100) / 100;
      this.participantSplits.forEach(p => p.inputValue = share);
    } else if (type === 'percentage') {
      const pct = Math.round((100 / this.participantSplits.length) * 100) / 100;
      this.participantSplits.forEach(p => p.inputValue = pct);
    }

    this.onAmountOrSplitChange();
  }

  onAmountOrSplitChange() {
    const amount = this.expenseAmount || 0;
    const count = this.participantSplits.length;
    this.splitErrorMsg.set('');

    if (amount <= 0) {
      this.participantSplits.forEach(p => p.calculatedAmount = 0);
      return;
    }

    if (this.splitType === 'equal') {
      const share = Math.round((amount / count) * 100) / 100;
      let runningSum = 0;

      this.participantSplits.forEach((p, idx) => {
        if (idx === count - 1) {
          p.calculatedAmount = Math.round((amount - runningSum) * 100) / 100;
        } else {
          p.calculatedAmount = share;
          runningSum += share;
        }
      });
    } 
    else if (this.splitType === 'exact') {
      let totalInput = 0;
      this.participantSplits.forEach(p => {
        p.calculatedAmount = Number(p.inputValue) || 0;
        totalInput += p.calculatedAmount;
      });

      const diff = Math.abs(totalInput - amount);
      if (diff > 0.01) {
        this.splitErrorMsg.set(`Amounts sum ($${totalInput.toFixed(2)}) must equal total ($${amount.toFixed(2)})`);
      }
    } 
    else if (this.splitType === 'percentage') {
      let totalPercent = 0;
      this.participantSplits.forEach(p => {
        totalPercent += Number(p.inputValue) || 0;
      });

      const diff = Math.abs(totalPercent - 100);
      if (diff > 0.01) {
        this.splitErrorMsg.set(`Percentages sum (${totalPercent.toFixed(1)}%) must equal 100%`);
      }

      let runningSum = 0;
      this.participantSplits.forEach((p, idx) => {
        if (idx === count - 1) {
          p.calculatedAmount = Math.round((amount - runningSum) * 100) / 100;
        } else {
          const val = Math.round((amount * ((Number(p.inputValue) || 0) / 100)) * 100) / 100;
          p.calculatedAmount = val;
          runningSum += val;
        }
      });
    }
  }

  onCreateExpense() {
    this.onAmountOrSplitChange();
    if (this.splitErrorMsg()) return;
    if (!this.expenseDesc || !this.expenseAmount) return;

    this.creatingExpense.set(true);

    const payload = {
      groupId: this.groupId,
      description: this.expenseDesc,
      amount: this.expenseAmount,
      paidBy: this.expensePaidBy,
      splitType: this.splitType,
      participants: this.participantSplits.map(p => ({
        user: p.member._id,
        value: this.splitType === 'equal' ? 0 : p.inputValue
      }))
    };

    this.expenseService.createExpense(payload).subscribe({
      next: () => {
        this.creatingExpense.set(false);
        this.notify.success('Expense created!');
        this.closeExpenseModal();
        this.fetchExpenses();
      },
      error: (err) => {
        this.creatingExpense.set(false);
        this.notify.error(err.error?.message || 'Failed to create expense.');
      }
    });
  }
}
