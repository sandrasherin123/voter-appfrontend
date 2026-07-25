import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  searchTerm: string = "";
  elections: any[] = [];
  constituencies: any[] = [];
  voterStatuses: any[] = [];

  selectedElection: any = null;
  selectedConstituency: any = null;

  constructor(private http: HttpClient,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  // 🔹 Search elections by title
  searchElections(event: any) {
    const query = event.target.value;
    if (query.length >= 3) {
      this.http.get<any[]>(`http://localhost:8080/elections/${query}`).subscribe({
        next: (data) => {
          this.elections = data;
          if (data.length === 0) {
            this.constituencies = [];
            this.selectedElection = null;
          }
        },
        error: (err) => {
          console.error("Search failed", err);
          alert("Error while searching elections");
        }
      });
    } else {
      this.elections = [];
      this.constituencies = [];
      this.selectedElection = null;
      this.selectedConstituency = null;
      this.voterStatuses = [];
    }
  }


  // 🔹 Load constituencies for selected election
  onElectionSelect(election: any) {
    if (election && election.elecId) {
      this.http.get<any[]>(`http://localhost:8080/${election.elecId}/constituenciesForResult`)
        .subscribe(data => this.constituencies = data);

      this.selectedConstituency = null;
      this.voterStatuses = [];
    } else {
      this.constituencies = [];
      this.selectedConstituency = null;
      this.voterStatuses = [];
    }
  }

  // 🔹 Fetch voter report
  fetchReport() {
    if (this.selectedElection && this.selectedConstituency) {
      const electionId = this.selectedElection.elecId;
      const constituencyId = this.selectedConstituency.constituency.constId;

      this.http.get<any[]>(`http://localhost:8080/voters?electionId=${electionId}&constituencyId=${constituencyId}`)
        .subscribe({
          next: (data) => {
            this.voterStatuses = data;
          },
          error: (err) => {
            console.error("Error fetching report", err);
            alert("Failed to fetch voter report");
          }
        });
    } else {
      alert("Please select election and constituency");
    }
  }

  // 🔹 Convert photo byte[] to image URL
  getImage(photo: any): string {
    if (!photo) return 'assets/default-photo.png';
    return 'data:image/jpeg;base64,' + photo;
  }
}
