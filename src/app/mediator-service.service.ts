import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediatorServiceService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Admin login
  adminLogin(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' });
  }
}
