import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  private currentUser = signal<User | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  private loadUser() {
    const stored = localStorage.getItem('splitly_user');
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        this.logout();
      }
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('splitly_token');
  }

  register(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/register`, { name, email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  getProfile() {
    return this.http.get<{ user: User }>(`${this.API}/me`)
      .pipe(tap(res => {
        this.currentUser.set(res.user);
        localStorage.setItem('splitly_user', JSON.stringify(res.user));
      }));
  }

  logout() {
    localStorage.removeItem('splitly_token');
    localStorage.removeItem('splitly_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem('splitly_token', res.token);
    localStorage.setItem('splitly_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      'linear-gradient(135deg, #00cec9, #81ecec)',
      'linear-gradient(135deg, #e17055, #fdcb6e)',
      'linear-gradient(135deg, #fd79a8, #e84393)',
      'linear-gradient(135deg, #00b894, #55efc4)',
      'linear-gradient(135deg, #0984e3, #74b9ff)',
      'linear-gradient(135deg, #6c5ce7, #00cec9)',
      'linear-gradient(135deg, #fdcb6e, #e17055)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  }
}
