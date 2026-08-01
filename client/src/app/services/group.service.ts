import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './auth.service';

export interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  members: User[];
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly API = 'http://localhost:3440/api/groups';

  constructor(private http: HttpClient) {}

  getMyGroups() {
    return this.http.get<{ group: Group[] }>(this.API);
  }

  getGroupById(id: string) {
    return this.http.post<{ group: Group }>(`${this.API}/${id}`, {});
  }

  createGroup(name: string, description: string, memberEmails: string[]) {
    return this.http.post<{ group: Group }>(this.API, { name, description, memberEmails });
  }

  addMember(groupId: string, email: string) {
    return this.http.post<{ group: Group }>(`${this.API}/${groupId}/members`, { email });
  }
}
