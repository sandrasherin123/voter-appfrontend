import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-voter-dashboard',
  templateUrl: './voter-dashboard.component.html',
  styleUrls: ['./voter-dashboard.component.css']
})
export class VoterDashboardComponent implements OnInit {
  voterId: string | null = null;
  constituencies: any[] = [];
  selectedConstituency: string = '';

  constructor(private router: Router,
    private http: HttpClient,
    private location: Location) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    // Get voterId from session
    this.voterId = sessionStorage.getItem('voterId');

    if (this.voterId) {
      this.loadConstituencies(this.voterId);
    }
  }

  loadConstituencies(voterId: string) {
    this.http.get<any[]>(`https://voter-appbackend-production.up.railway.app/${voterId}/constituencies`)
      .subscribe({
        next: (data) => {
          this.constituencies = data;
        },
        error: (err) => {
          console.error('Failed to load constituencies:', err);
        }
      });
  }

  submitConstituency() {
    if (!this.selectedConstituency) {
      alert('Please select a constituency');
      return;
    }

    sessionStorage.setItem('selectedConstituency', this.selectedConstituency);

    this.router.navigate(['/voters/dashboard']);
  }
}
