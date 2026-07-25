import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-castvote',
  templateUrl: './castvote.component.html',
  styleUrls: ['./castvote.component.css']
})
export class CastvoteComponent implements OnInit, OnDestroy {

  candidates: any[] = [];
  constituencyId: string | null = null;
  electionId: string | null = null;
  voterId: string | null = null;
  baseUrl: string = "https://voter-appbackend-production.up.railway.app";

  private mediaStream: MediaStream | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(private http: HttpClient,
    private router: Router,
    private location: Location) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.constituencyId = sessionStorage.getItem('selectedConstituency');
    this.electionId = sessionStorage.getItem('elecId');
    this.voterId = sessionStorage.getItem('voterId');

    if (this.constituencyId && this.electionId && this.voterId) {
      this.loadCandidates(this.constituencyId, this.electionId);
      this.checkIfVoted(this.voterId, this.electionId);
    } else {
      console.error("Missing constituencyId or electionId in sessionStorage!");
    }

    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  checkIfVoted(voterId: string, electionId: string): void {
    this.http.get<boolean>(`${this.baseUrl}/check/${voterId}/${electionId}`)
      .subscribe(
        (alreadyVoted) => {
          if (alreadyVoted) {
            alert("You have already cast your vote in this election.");
            this.stopCamera();
            this.router.navigate(['/voter-dashboard']);
          } else {
            this.loadCandidates(this.constituencyId!, this.electionId!);
          }
        },
        (error) => {
          console.error("Error checking vote status:", error);
        }
      );
  }

  loadCandidates(constituencyId: string, electionId: string): void {
    this.http.get<any[]>(`${this.baseUrl}/getCandidates/${constituencyId}/${electionId}`)
      .subscribe(
        (data) => { this.candidates = data; },
        (error) => { console.error("Error fetching candidates:", error); }
      );
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.mediaStream = stream;
        this.videoElement.nativeElement.srcObject = stream;
      })
      .catch(err => console.error("Camera error:", err));
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  captureImage(): string {
    const context = this.canvasElement.nativeElement.getContext('2d');
    if (context) {
      context.drawImage(this.videoElement.nativeElement, 0, 0, 320, 240);
    }
    return this.canvasElement.nativeElement.toDataURL('image/png');
  }

  castVote(candidateId: string): void {
    const capturedImage = this.captureImage();

    const payload = {
      voterId: this.voterId,
      electionId: this.electionId,
      constituencyId: this.constituencyId,
      candidateId: candidateId,
      capturedImage: capturedImage
    };

    this.http.post(`${this.baseUrl}/castVote`, payload, { responseType: 'text' })
      .subscribe(
        (response) => {
          alert(response);
          this.stopCamera();
          sessionStorage.clear();

          window.history.pushState(null, '', window.location.href);
          window.onpopstate = () => {
            window.history.go(1);
          };

          this.router.navigate(['/login/voter']);
        },
        (error) => {
          console.error("Error casting vote:", error);
        }
      );
  }
}
