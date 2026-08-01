import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  success(message: string) {
    this.addToast(message, 'success');
  }

  error(message: string) {
    this.addToast(message, 'error');
  }

  info(message: string) {
    this.addToast(message, 'info');
  }

  private addToast(message: string, type: Toast['type']) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => this.removeToast(id), 4000);
  }

  removeToast(id: number) {
    this.toasts.update(t =>
      t.map(toast => toast.id === id ? { ...toast, exiting: true } : toast)
    );
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 300);
  }
}
