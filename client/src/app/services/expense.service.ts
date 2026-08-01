import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './auth.service';

export interface ExpenseSplit {
  user: User | string;
  amount: number;
}

export interface Expense {
  _id: string;
  group: string;
  description: string;
  amount: number;
  paidBy: User;
  splitType: 'equal' | 'exact' | 'percentage';
  participants: ExpenseSplit[];
  date: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly API = 'http://localhost:3440/api/expense';

  constructor(private http: HttpClient) {}

  createExpense(data: {
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
    splitType: string;
    participants: { user: string; value: number }[];
  }) {
    return this.http.post<{ expense: Expense }>(this.API, data);
  }

  getGroupExpenses(groupId: string) {
    return this.http.post<{ expense: Expense[] }>(`${this.API}/group/${groupId}`, {});
  }

  deleteExpense(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
