import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartData, ChartType } from 'chart.js';
import { Location } from '@angular/common';

@Component({
  selector: 'app-candidatelogindashboard',
  templateUrl: './candidatelogindashboard.component.html',
  styleUrls: ['./candidatelogindashboard.component.css']
})
export class CandidatelogindashboardComponent implements OnInit {
  totalVoters = 0;
  votedVoters = 0;
  notVotedVoters = 0;

  pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Voted', 'Not Voted'],
    datasets: [{ data: [0, 0], backgroundColor: ['#4CAF50', '#F44336'] }]
  };
  pieChartType: ChartType = 'pie';

  descriptionText: string = '';
  saveMessage: string = '';
  results: any[] = [];

  constructor(private http: HttpClient,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    const selected = JSON.parse(sessionStorage.getItem("selectedElection")!);
    const candId = sessionStorage.getItem("candId");

    if (selected && candId) {
      const electionId = selected.electionId;
      const constituencyId = selected.constituencyId;

      this.fetchResults(electionId, constituencyId);
      // Load voter stats
      this.http.get<any>(`https://voterapp-backend1-production.up.railway.app/dashboard/election/${constituencyId}/constituency/${electionId}/voter-stats`)
        .subscribe({
          next: (res) => {
            this.totalVoters = res.totalVoters;
            this.votedVoters = res.votedVoters;
            this.notVotedVoters = this.totalVoters - this.votedVoters;

            this.pieChartData = {
              labels: ['Voted', 'Not Voted'],
              datasets: [{ data: [this.votedVoters, this.notVotedVoters], backgroundColor: ['#4CAF50', '#F44336'] }]
            };
          },
          error: (err) => console.error('Error fetching voter stats', err)
        });
    }
  }

  fetchResults(electionId: number, constituencyId: number) {
    this.http.get<any[]>(`https://voterapp-backend1-production.up.railway.app/electionResult/${constituencyId}/${electionId}`)
      .subscribe({
        next: (data) => {
          this.results = data;
        },
        error: (err) => {
          console.error("Error fetching results", err);
          alert("Failed to fetch results");
        }
      });
  }


  saveDescription() {
    const candId = sessionStorage.getItem("candId");
    const selected = JSON.parse(sessionStorage.getItem("selectedElection")!);

    if (!candId || !selected) {
      alert('Candidate or Election info missing!');
      return;
    }

    const payload = {
      candidate: { candId: Number(candId) },
      election: { elecId: selected.electionId },
      constituency: { constId: selected.constituencyId },
      description: this.descriptionText
    };

    this.http.post('https://voterapp-backend1-production.up.railway.app/addDescription', payload)
      .subscribe({
        next: () => {
          this.saveMessage = '✅ Description saved successfully!';
          this.descriptionText = '';

          // Auto clear after 3s
          setTimeout(() => this.saveMessage = '', 3000);
        },
        error: () => {
          this.saveMessage = '❌ Failed to save description.';
          setTimeout(() => this.saveMessage = '', 3000);
        }
      });
  }

}
