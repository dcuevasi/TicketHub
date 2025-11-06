import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedTickets {
  items: Ticket[];
  total: number;
  page: number;
  per_page: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = 'http://127.0.0.1:8000/tickets';

  constructor(private http: HttpClient) {}

  list(page = 1, per_page = 20, filters?: TicketFilters): Observable<PaginatedTickets> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(per_page));
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.search) params = params.set('search', filters.search);
    }
    
    return this.http.get<PaginatedTickets>(this.apiUrl + '/', { params });
  }

  get(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl + '/', payload).pipe(delay(500));
  }

  update(id: number, payload: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, payload).pipe(delay(500));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(delay(500));
  }
}
