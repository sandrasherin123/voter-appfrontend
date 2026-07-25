import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private baseUrl = 'http://localhost:8080'; // adjust as needed

  constructor(private http: HttpClient) { }

  searchCandidates(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidates/${keyword}`);
  }

  searchElections(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/elections/${keyword}`);
  }

  searchConstituencies(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/constituencies/${keyword}`);
  }

  searchCandidatesByFilters(elecId: string, constId: string): Observable<any[]> {
    console.log("reached here");
    return this.http.get<any[]>(
      `${this.baseUrl}/candidate/search?elecId=${elecId}&constId=${constId}`
    );
  }

  getVoterConstituencies(vid: number) {
    return this.http.get<any[]>(`${this.baseUrl}/${vid}/constituencies`);
  }

  getVoterConstituenciesByType(vid: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${vid}/constituenciesByType`);
  }
  // ✅ Get candidate descriptions by constituency
  getDescriptionsByConstituency(constituencyId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/constituency/${constituencyId}`);
}

}
