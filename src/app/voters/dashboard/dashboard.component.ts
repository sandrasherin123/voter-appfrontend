import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ChartOptions, ChartData } from 'chart.js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private http: HttpClient,
    private router: Router,
    private location: Location) { }
  goBack() {
    this.location.back();
  }

  descriptions: any[] = [];
  currentDescIndex: number = 0;
  slideshowInterval: any;
  constituencyId: string | null = null;
  electionDetails: any = null;
  constituency: any = null;
  electionDate: string | null = null;
  message: string = '';
  canVote: boolean = false;
  aadhaarId: string = '';
  showOtpForm: boolean = false;
  otp: string = '';
  showResults: boolean = false;
  results: any[] = [];

  ngOnInit(): void {
    this.constituencyId = sessionStorage.getItem('selectedConstituency');
    if (this.constituencyId) {
      this.checkActiveElection();
    }
  }

  checkActiveElection() {
    this.http.get<any>(`http://localhost:8080/active/${this.constituencyId}`)
      .subscribe({
        next: (response) => {
          if (response.status === 'ACTIVE') {
            this.electionDetails = response.election;
            this.constituency = response.constituency;
            this.electionDate = response.electionDate;
            this.message = '';

            sessionStorage.setItem('elecId', this.electionDetails.elecId);

            this.loadDescriptions(this.electionDetails.elecId, this.constituency.constId);
            this.fetchResults(this.electionDetails.elecId, this.constituency.constId);

            const voterId = sessionStorage.getItem('voterId');
            if (voterId) {
              this.checkVoterStatus(voterId, this.electionDetails.elecId);
            }
            const today = new Date();
            const endDate = new Date(this.electionDetails.endDate);

            if (today > endDate) {
              //this.fetchResults(this.electionDetails.elecId);
            } else {
              this.canVote = this.isToday(this.electionDate);
            }
          } else {
            this.resetElectionData('No active election for this constituency.');
          }
        },
        error: (err) => {
          console.error('Error checking active election:', err);
          this.resetElectionData('Something went wrong while fetching election data.');
        }
      });
  }

  fetchResults(elecId: number, constId: number) {
    this.http.get<any[]>(`http://localhost:8080/electionResult/${constId}/${elecId}`)
      .subscribe({
        next: (data) => {
          this.showResults = true;
          this.results = data;
        },
        error: (err) => {
          console.error("Error fetching results", err);
          this.message = "Failed to fetch results.";
        }
      });
  }

  loadDescriptions(elecId: number, constId: number) {
    this.http.get<any[]>(`http://localhost:8080/descriptions/${elecId}/${constId}`)
      .subscribe({
        next: (res) => {
          this.descriptions = res;
          if (this.descriptions.length > 0) {
            this.startSlideshow();
          }
        },
        error: (err) => console.error('Error loading descriptions:', err)
      });
  }

  startSlideshow() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
    this.slideshowInterval = setInterval(() => {
      this.currentDescIndex = (this.currentDescIndex + 1) % this.descriptions.length;
    }, 5000);
  }

  checkVoterStatus(voterId: string, electionId: string) {
    this.http.get<boolean>(`http://localhost:8080/check/${voterId}/${electionId}`)
      .subscribe({
        next: (hasVoted) => {
          if (hasVoted) {
            this.canVote = false;
            this.message = 'You have already voted in this election.';
          }
        },
        error: (err) => {
          console.error('Error checking voter status:', err);
        }
      });
  }
  private resetElectionData(msg: string) {
    this.electionDetails = null;
    this.constituency = null;
    this.electionDate = null;
    this.canVote = false;
    this.message = msg;
  }

  private isToday(dateString: string | null): boolean {
    if (!dateString) return false;
    const today = new Date();
    const checkDate = new Date(dateString);

    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }

  initiateOtp() {
    this.aadhaarId = sessionStorage.getItem('voterAadhaar') || '';

    if (!this.aadhaarId) {
      this.message = 'Aadhaar ID not found. Please login again.';
      return;
    }

    this.http.post<any>(`http://localhost:8080/generate/${this.aadhaarId}`, {})
      .subscribe({
        next: (res) => {
          alert(`OTP sent to mobile: ${res.mobileNumber}\nYour OTP is: ${res.otp}`);

          const enteredOtp = prompt('Enter OTP to cast your vote:');
          if (enteredOtp) {
            this.verifyOtp(enteredOtp);
          } else {
            this.message = 'OTP not entered. Vote cancelled.';
          }
        },
        error: (err) => {
          console.error(err);
          this.message = 'Failed to generate OTP. Try again.';
        }
      });
  }

  // Verify OTP
  verifyOtp(enteredOtp: string) {
    if (!enteredOtp) {
      this.message = 'Please enter OTP.';
      alert(this.message);
      return;
    }

    const formData = new URLSearchParams();
    formData.set('aadhaarId', this.aadhaarId);
    formData.set('otp', enteredOtp);

    this.http.post<any>('http://localhost:8080/verifyVoterOtp', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: (res) => {
        this.router.navigate(['/voters/castvote']);
      },
      error: (err) => {
        console.error(err);
        this.message = 'OTP verification failed. Try again.';
        alert(this.message);
      }
    });
  }



  cancelOtp() {
    this.showOtpForm = false;
    this.otp = '';
    this.message = 'OTP cancelled.';
  }

  
}
