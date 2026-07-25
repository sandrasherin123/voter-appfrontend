import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions, ChartData } from 'chart.js';
import { Location } from '@angular/common';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  searchTerm: string = "";
  elections: any[] = [];
  constituencies: any[] = [];
  results: any[] = [];
  selectedElectionId: number | null = null;

  selectedElection: any = null;
  selectedConstituency: any = null;

  // 🔹 Chart.js properties
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Votes' } },
      x: { title: { display: true, text: 'Candidates' } }
    }
  };

  barChartLabels: string[] = [];
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Votes',
        backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12'] // 🔹 multiple colors
      }
    ]
  };
  barChartColors = [{ backgroundColor: '#3498db' }];

  constructor(private http: HttpClient,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  searchElections(event: any) {
    const query = event.target.value;
    if (query.length >= 3) {
      this.http.get<any[]>(`https://voter-appbackend-production.up.railway.app/${query}`).subscribe({
        next: (data) => {
          this.elections = data;
          if (data.length === 0) this.constituencies = [];
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
      this.results = [];
    }
  }

  onElectionSelect(election: any) {
    if (election && election.elecId) {
      this.http.get<any[]>(`https://voter-appbackend-production.up.railway.app/${election.elecId}/constituenciesForResult`)
        .subscribe(data => this.constituencies = data);
      this.selectedConstituency = null;
      this.results = [];
    } else {
      this.constituencies = [];
      this.selectedConstituency = null;
      this.results = [];
    }
  }

  publishResults() {
    if (this.selectedElection && this.selectedConstituency) {
      const constituencyId = this.selectedConstituency.constituency.constId;
      const electionId = this.selectedElection.elecId;

      this.http.post(`https://voter-appbackend-production.up.railway.app/publish/${constituencyId}/${electionId}`, {}, { responseType: 'text' })
        .subscribe(() => alert("Results published successfully!"));
    } else {
      alert("Please select election and constituency");
    }
  }

  searchResults() {
    if (this.selectedElection && this.selectedConstituency) {
      const electionId = this.selectedElection.elecId;
      const constituencyId = this.selectedConstituency.constituency.constId;

      this.http.get<any[]>(`https://voter-appbackend-production.up.railway.app/electionResult/${constituencyId}/${electionId}`)
        .subscribe({
          next: (data) => {
            this.results = data;
            this.updateChart();
          },
          error: (err) => {
            console.error("Error fetching results", err);
            alert("Failed to fetch results");
          }
        });
    } else {
      alert("Please select election and constituency");
    }
  }

  // 🔹 Chart helpers
  updateChart() {
    this.barChartData = {
      labels: this.results.map(r => r.candidate.name),
      datasets: [
        {
          data: this.results.map(r => r.voteCount),
          label: 'Votes',
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12']
        }
      ]
    };
  }


}
