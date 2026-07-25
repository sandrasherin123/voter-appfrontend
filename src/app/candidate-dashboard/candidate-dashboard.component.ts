import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-candidate-dashboard',
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.css']
})
export class CandidateDashboardComponent implements OnInit {
  mappings: any[] = [];
  selectedMapping: any = null;

  constructor(private http: HttpClient,
    private router: Router,
    private location: Location) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    const candId = sessionStorage.getItem("candId");
    if (candId) {
      this.http.get<any[]>(`http://localhost:8080/candidateMappings/${candId}`)
        .subscribe({
          next: (res) => {
            this.mappings = res;
          },
          error: (err) => {
            console.error("Error loading candidate mappings", err);
          }
        });
    }
  }

  onSelectMapping(mapping: any) {
    if (!mapping) return;

    sessionStorage.setItem("selectedElection", JSON.stringify({
      electionId: mapping.election.elecId,
      electionTitle: mapping.election.title,
      constituencyId: mapping.constituencyId
    }));

    this.router.navigate(['/candidate/candidateLoginDashboard']);
  }
}
