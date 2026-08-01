import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService, Group } from '../../services/group.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="groups-page container animate-fade-in">
      <header class="groups-header">
        <div>
          <h1>Groups</h1>
          <p class="subtitle">Collaborate, track, and split expenses effortlessly</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Group
        </button>
      </header>

      <!-- Search & Filters -->
      <section class="filters-bar glass-card-static">
        <div class="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search groups..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterGroups()"
          />
        </div>
      </section>

      <!-- Groups Grid -->
      @if (loading()) {
        <div class="skeleton-grid">
          <div class="skeleton-card glass-card-static" style="height: 180px;"></div>
          <div class="skeleton-card glass-card-static" style="height: 180px;"></div>
          <div class="skeleton-card glass-card-static" style="height: 180px;"></div>
        </div>
      } @else if (filteredGroups().length === 0) {
        <div class="empty-state-card glass-card">
          <div class="empty-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <h3>No groups found</h3>
          <p>
            {{ searchQuery ? 'Try adjusting your search criteria.' : "Create your first group to start tracking expenses with your friends." }}
          </p>
          @if (!searchQuery) {
            <button class="btn btn-secondary" (click)="showCreateModal.set(true)">Create a Group</button>
          }
        </div>
      } @else {
        <div class="groups-grid">
          @for (group of filteredGroups(); track group._id) {
            <div class="group-card glass-card animate-scale-in">
              <a [routerLink]="['/groups', group._id]" class="group-card-click-area">
                <div class="group-card-top">
                  <div class="group-avatar" [style.background]="auth.getAvatarGradient(group.name)">
                    {{ auth.getUserInitials(group.name) }}
                  </div>
                  <div>
                    <h3>{{ group.name }}</h3>
                    <p class="description">{{ group.description || 'No description provided' }}</p>
                  </div>
                </div>

                <div class="members-summary">
                  <span class="label">Members ({{ group.members.length }})</span>
                  <div class="members-avatars">
                    @for (member of group.members.slice(0, 5); track member._id) {
                      <div class="avatar-sm" [style.background]="auth.getAvatarGradient(member.name)" [title]="member.name">
                        {{ auth.getUserInitials(member.name) }}
                      </div>
                    }
                    @if (group.members.length > 5) {
                      <div class="avatar-sm-more">+{{ group.members.length - 5 }}</div>
                    }
                  </div>
                </div>
              </a>

              <div class="group-card-action">
                <a [routerLink]="['/groups', group._id]" class="btn btn-secondary btn-sm">
                  View Dashboard
                </a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create Group Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-card glass-card animate-scale-in" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Create New Group</h2>
              <button class="btn-close" (click)="closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form (ngSubmit)="onCreateGroup()" class="modal-form">
              <div class="form-group">
                <label class="form-label" for="groupName">Group Name</label>
                <input
                  id="groupName"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Apartment 304, Trip to Tokyo"
                  [(ngModel)]="newGroupName"
                  name="groupName"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="groupDesc">Description</label>
                <textarea
                  id="groupDesc"
                  class="form-input"
                  rows="3"
                  placeholder="What is this group for?"
                  [(ngModel)]="newGroupDesc"
                  name="groupDesc"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Members (by email)</label>
                <div class="member-email-input-row">
                  <input
                    type="email"
                    class="form-input"
                    placeholder="friend@example.com"
                    [(ngModel)]="memberEmailInput"
                    name="memberEmailInput"
                  />
                  <button type="button" class="btn btn-secondary" (click)="addMemberEmail()">Add</button>
                </div>

                @if (newGroupEmails.length > 0) {
                  <div class="emails-tags">
                    @for (email of newGroupEmails; track email) {
                      <span class="email-tag">
                        {{ email }}
                        <button type="button" class="btn-remove-tag" (click)="removeMemberEmail(email)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="creating() || !newGroupName">
                  @if (creating()) {
                    <div class="spinner spinner-sm"></div> Creating...
                  } @else {
                    Create Group
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .groups-page {
      padding: var(--space-xl) var(--space-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .groups-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
    }
    .groups-header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .groups-header .subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    .filters-bar {
      padding: var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2xl);
    }
    .search-input-wrapper {
      position: relative;
      max-width: 360px;
      display: flex;
      align-items: center;
    }
    .search-input-wrapper svg {
      position: absolute;
      left: 12px;
      color: var(--text-tertiary);
    }
    .search-input-wrapper input {
      width: 100%;
      background: var(--bg-glass-strong);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 10px 12px 10px 40px;
      color: var(--text-primary);
      font-size: 0.9rem;
      transition: all var(--transition-base);
    }
    .search-input-wrapper input:focus {
      border-color: var(--border-accent);
      box-shadow: var(--shadow-glow-purple);
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
    }

    .group-card {
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 220px;
      transition: all var(--transition-base);
    }
    .group-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md), var(--shadow-glow-purple);
      border-color: var(--border-accent);
    }

    .group-card-click-area {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      flex: 1;
    }

    .group-card-top {
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
      flex-shrink: 0;
    }
    .group-card-top h3 {
      font-size: 1.15rem;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .group-card-top .description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .members-summary {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .members-summary .label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .members-avatars {
      display: flex;
      align-items: center;
    }
    .avatar-sm {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      border: 2px solid var(--bg-void);
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
      color: white;
    }
    .avatar-sm:first-child {
      margin-left: 0;
    }
    .avatar-sm-more {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      background: var(--bg-glass-strong);
      border: 2px solid var(--bg-void);
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .group-card-action {
      margin-top: var(--space-md);
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-md);
    }
    .group-card-action .btn {
      width: 100%;
    }

    /* Modal Overlay & Card */
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

    .member-email-input-row {
      display: flex;
      gap: var(--space-sm);
    }
    .member-email-input-row .form-input {
      flex: 1;
    }

    .emails-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: var(--space-sm);
    }
    .email-tag {
      background: rgba(108, 92, 231, 0.12);
      color: var(--accent-purple-light);
      border: 1px solid var(--border-accent);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-remove-tag {
      background: none;
      border: none;
      color: var(--accent-purple-light);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
    }
    .btn-remove-tag:hover {
      color: var(--color-danger);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-md);
      margin-top: var(--space-md);
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
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
  `]
})
export class GroupsComponent implements OnInit {
  groupsList = signal<Group[]>([]);
  filteredGroups = signal<Group[]>([]);
  searchQuery = '';
  loading = signal(true);

  // Create Group Modal properties
  showCreateModal = signal(false);
  creating = signal(false);
  newGroupName = '';
  newGroupDesc = '';
  memberEmailInput = '';
  newGroupEmails: string[] = [];

  constructor(
    public auth: AuthService,
    private groupService: GroupService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.fetchGroups();
  }

  fetchGroups() {
    this.loading.set(true);
    this.groupService.getMyGroups().subscribe({
      next: (res) => {
        this.groupsList.set(res.group || []);
        this.filterGroups();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to retrieve groups.');
      }
    });
  }

  filterGroups() {
    if (!this.searchQuery.trim()) {
      this.filteredGroups.set(this.groupsList());
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredGroups.set(
      this.groupsList().filter(g => 
        g.name.toLowerCase().includes(query) || 
        g.description?.toLowerCase().includes(query)
      )
    );
  }

  onCreateGroup() {
    if (!this.newGroupName.trim()) return;

    this.creating.set(true);
    this.groupService.createGroup(this.newGroupName, this.newGroupDesc, this.newGroupEmails).subscribe({
      next: (res) => {
        this.creating.set(false);
        this.notify.success(`Created group "${res.group.name}" successfully!`);
        this.closeModal();
        this.fetchGroups();
      },
      error: (err) => {
        this.creating.set(false);
        this.notify.error(err.error?.message || 'Could not create group.');
      }
    });
  }

  addMemberEmail() {
    const email = this.memberEmailInput.trim();
    if (!email) return;

    // Check pattern or duplicates
    if (this.newGroupEmails.includes(email)) {
      this.notify.info('Email has already been added to the list.');
      return;
    }

    this.newGroupEmails.push(email);
    this.memberEmailInput = '';
  }

  removeMemberEmail(email: string) {
    this.newGroupEmails = this.newGroupEmails.filter(e => e !== email);
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.newGroupName = '';
    this.newGroupDesc = '';
    this.memberEmailInput = '';
    this.newGroupEmails = [];
  }
}
