import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediatorServiceService {
  private baseUrl = 'https://voterapp-backend1-production.up.railway.app';

  constructor(private http: HttpClient) { }

  // Admin login
  adminLogin(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' });
  }
}
