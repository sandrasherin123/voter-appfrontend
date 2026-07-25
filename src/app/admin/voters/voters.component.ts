import { SearchService } from '../../services/search.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';



@Component({
  selector: 'app-voters',
  templateUrl: './voters.component.html',
  styleUrls: ['./voters.component.css']
})
export class VotersComponent implements OnInit {

  @ViewChild('addVoterForm') addVoterForm!: NgForm;

  voters: any[] = [];
  allConstituencies: any[] = [];

  constituenciesByType: { [key: string]: any[] } = {};
  selectedConstituencies: { [key: string]: number | number[] } = {};

  newVoter: any = {
    name: '',
    dob: '',
    email: '',
    phone: '',
    gender: '',
    photoUrl: '',
    address: '',
    aadhaar: { aadhaarId: null },
    constituencyIds: []
  };

  editVoterData: any = {};

  showAddForm = false;
  editMode = false;
  listVisible = false;
  searchAadhaar: string = '';
  foundVoter: any = null;

  lokSabhaConstituencies: any[] = [];
  assemblyConstituencies: any[] = [];
  localConstituencies: any[] = [];

  selectedLokSabha: number | null = null;
  selectedAssembly: number | null = null;
  selectedLocal: number | null = null;


  private baseUrl = 'https://voter-appbackend-production.up.railway.app';
  constructor(private http: HttpClient,
    private searchService: SearchService,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.loadConstituencies();
  }

  selectedFile: File | null = null;

  onPhotoSelected(event: any, mode: 'add' | 'edit') {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (mode === 'add') {
          this.newVoter.photoUrl = e.target.result;
        } else {
          this.editVoterData.photoUrl = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  searchVoter() {
    const aadhaarPattern = /^[0-9]{12}$/;
    if (!aadhaarPattern.test(this.searchAadhaar)) {
      alert('Please enter a valid 12-digit Aadhaar ID.');
      return;
    }

    this.http.get<any>(`${this.baseUrl}/getVoterByAadhaar/${this.searchAadhaar}`)
      .subscribe({
        next: (data) => {
          if (data) {
            this.foundVoter = data;
          } else {
            alert('No voter found with this Aadhaar ID.');
            this.foundVoter = null;
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error fetching voter data.');
          this.foundVoter = null;
        }
      });
  }


  loadConstituencies() {
    this.http.get<any[]>(`${this.baseUrl}/constituencies/byElectionType/1`)
      .subscribe(data => this.lokSabhaConstituencies = data);

    this.http.get<any[]>(`${this.baseUrl}/constituencies/byElectionType/2`)
      .subscribe(data => this.assemblyConstituencies = data);

    this.http.get<any[]>(`${this.baseUrl}/constituencies/byElectionType/3`)
      .subscribe(data => this.localConstituencies = data);
  }


  getAllVoters() {
    this.http.get<any[]>(`${this.baseUrl}/voters`).subscribe(data => {
      this.voters = data;
      this.listVisible = true;
      this.showAddForm = false;
      this.editMode = false;
    });
  }

  showAddVoterForm() {
    this.showAddForm = true;
    this.listVisible = false;
    this.editMode = false;
  }

  activeAction: string = '';
  setAction(action: string) {
    this.activeAction = action;
  }

  addVoter() {
    if (!this.addVoterForm || this.addVoterForm.invalid) {
      return;
    }

    const namePattern = /^[A-Za-z ]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const aadhaarPattern = /^[0-9]{12}$/;   // ✅ corrected to 12
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.newVoter.name || !namePattern.test(this.newVoter.name)) {
      alert("Name should only contain alphabets.");
      return;
    }
    if (!this.newVoter.dob) {
      alert("Date of Birth is required.");
      return;
    }

    if (!this.isAgeValid(this.newVoter.dob, 18)) {
      alert("Voter must be at least 18 years old.");
      return;
    }
    if (!emailPattern.test(this.newVoter.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!phonePattern.test(this.newVoter.phone)) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    if (!this.newVoter.gender) {
      alert("Gender is required.");
      return;
    }
    if (!this.selectedFile) {
      alert("Photo is required.");
      return;
    }
    if (!this.newVoter.address) {
      alert("Address is required.");
      return;
    }
    if (!aadhaarPattern.test(this.newVoter.aadhaar.aadhaarId)) {
      alert("Aadhaar must be exactly 12 digits.");
      return;
    }
    if (!this.selectedLokSabha || !this.selectedAssembly || !this.selectedLocal) {
      alert("Please select ALL constituencies (Lok Sabha, Assembly, and Local Government).");
      return;
    }

    this.newVoter.constituencyIds = [
      this.selectedLokSabha,
      this.selectedAssembly,
      this.selectedLocal
    ];

    const formData = new FormData();
    formData.append("voter", new Blob([JSON.stringify(this.newVoter)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    }

    this.http.post(`${this.baseUrl}/addvoter`, formData, { responseType: 'text' }).subscribe({
      next: (res) => {
        alert(res);  // Success message from backend
        this.resetNewVoter();
        this.getAllVoters();
        this.activeAction = '';
      },
      error: (err) => {
        console.error("Error adding voter:", err);
        // Show the actual error message returned from backend
        if (err.error) {
          alert(err.error);  // e.g., "This Aadhaar ID is already registered for a voter."
        } else {
          alert("Failed to add voter.");  // fallback
        }
      }
    });
  }


  deleteVoter(vid: number) {
    if (confirm('Are you sure you want to delete this voter?')) {
      this.http.delete(`${this.baseUrl}/deletebyId/${vid}`, { responseType: 'text' }).subscribe(() => {
        alert('Voter deleted');
        this.getAllVoters();
        this.editMode = false;
        this.activeAction = '';
        this.foundVoter = null;
      });
    }
  }

  editVoter(voter: any) {
    // Close other forms
    this.editMode = true;
    this.showAddForm = false;
    this.listVisible = false;

    // Pre-fill voter data
    this.editVoterData = {
      ...voter,
      photoUrl: voter.photo ? 'data:image/jpeg;base64,' + this.arrayBufferToBase64(voter.photo) : ''
    };

    this.loadConstituencies();

    this.searchService.getVoterConstituenciesByType(voter.vid).subscribe({
      next: (data) => {
        this.constituenciesByType = data;

        this.selectedConstituencies = {};

        if (data['Lok sabha'] && data['Lok sabha'].length > 0) {
          this.selectedConstituencies['Lok sabha'] = data['Lok sabha'][0].constId;
        }
        if (data['Legislative'] && data['Legislative'].length > 0) {
          this.selectedConstituencies['Legislative'] = data['Legislative'][0].constId;
        }
        if (data['Panchayat Election'] && data['Panchayat Election'].length > 0) {
          this.selectedConstituencies['Panchayat Election'] = data['Panchayat Election'][0].constId;
        }
      },
      error: (err) => {
        console.error('Failed to load constituencies for voter', err);
      }
    });

  }


  updateVoter() {

    this.editVoterData.constituencyIds = [
      this.selectedConstituencies['Lok sabha'],
      this.selectedConstituencies['Legislative'],
      this.selectedConstituencies['Panchayat Election']
    ];

    const formData = new FormData();
    formData.append("voter", new Blob([JSON.stringify(this.editVoterData)], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append("photo", this.selectedFile);
    }

    this.http.put(`${this.baseUrl}/updatebyId/${this.editVoterData.vid}`, formData, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert(res);
          this.editMode = false;
          this.activeAction = '';
          this.getAllVoters();
          this.searchAadhaar = '';
          this.foundVoter = null;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update voter.');
        }
      });
  }

  cancelEdit() {
    this.editMode = false;
    this.foundVoter = null;
    this.editVoterData = {};
    this.searchAadhaar = '';
  }

  // Helper to convert byte[] to Base64
  arrayBufferToBase64(buffer: any) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  private resetNewVoter() {
    this.newVoter = {
      name: '',
      dob: '',
      email: '',
      phone: '',
      gender: '',
      photoUrl: '',
      address: '',
      aadhaar: { aadhaarId: null },
      constituencies: []
    };
  }
  private isAgeValid(dob: string, minAge: number = 18): boolean {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge;
  }



}
