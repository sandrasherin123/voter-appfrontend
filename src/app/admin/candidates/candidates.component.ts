import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SearchService } from '../../services/search.service'; // 👈 Import service
import { Location } from '@angular/common';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {

  candidates: any[] = [];
  elections: any[] = [];
  newCandidate: any = {
    candidateId: '',
    name: '',
    dob: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    partyName: '',
  };

  selectedFile: File | null = null;

  // Search fields
  candidateSearch: string = '';
  electionSearch: string = '';
  constituencySearch: string = '';

  // Filtered results
  filteredCandidates: any[] = [];
  filteredElections: any[] = [];
  filteredConstituencies: any[] = [];

  // Mapping object
  mapping = { candidateId: '', electionId: '', constId: '' };

  showAddForm: boolean = false;
  showMapForm: boolean = false;
  showSearchForm: boolean = false;
  activeForm: string = '';


  private baseUrl = 'http://localhost:8080'; // adjust as needed

  constructor(
    private http: HttpClient,
    private searchService: SearchService, // 👈 Inject service
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.getAllCandidates();
    this.getAllElections();
  }

  // Toggle forms
  toggleForm(type: string) {
    this.showAddForm = type === 'add';
    this.showMapForm = type === 'map';
    this.showSearchForm = false;
    this.activeForm = type;
  }

  toggleCandidateSearch() {
    this.activeForm = 'search';
    this.showSearchForm = !this.showSearchForm;
    this.showAddForm = false;
    this.showMapForm = false;
  }
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCandidate.photoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Get all candidates
  getAllCandidates() {
    this.http.get<any[]>(`${this.baseUrl}/adminViewAll`).subscribe(
      (data) => (this.candidates = data),
      (error) => console.error('Error fetching candidates:', error)
    );
  }

  // Get all elections
  getAllElections() {
    this.http.get<any[]>(`${this.baseUrl}/elections`).subscribe(
      (data) => (this.elections = data),
      (error) => console.error('Error fetching elections:', error)
    );
  }

  // Add candidate
  addCandidate() {
    if (!this.newCandidate.dob) {
      alert("Please enter Date of Birth");
      return;
    }
    if (!this.newCandidate.name || !/^[a-zA-Z ]+$/.test(this.newCandidate.name)) {
      alert("Name should only contain letters and spaces.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.newCandidate.email || !emailRegex.test(this.newCandidate.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!this.newCandidate.phone || !phoneRegex.test(this.newCandidate.phone)) {
      alert("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
      return;
    }

    // ✅ Age validation
    const today = new Date();
    const dob = new Date(this.newCandidate.dob);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 25) {
      alert("Candidate must be at least 25 years old.");
      return;
    }

    // Continue with form submission
    const formData = new FormData();
    const candidateCopy = { ...this.newCandidate };
    delete candidateCopy.photo;

    formData.append(
      "candidate",
      new Blob([JSON.stringify(candidateCopy)], { type: "application/json" })
    );

    if (this.selectedFile) {
      formData.append("photo", this.selectedFile, this.selectedFile.name);
    }

    this.http.post(`${this.baseUrl}/addCandidate`, formData, { responseType: 'text' })
      .subscribe({
        next: () => {
          alert('Candidate added successfully');
          this.showAddForm = false;
          this.newCandidate = {};
          this.selectedFile = null;
          this.getAllCandidates();
        },
        error: (err) => console.error('Error adding candidate:', err)
      });
  }


  // Map candidate to election
  mapCandidate() {
    this.http.post(`${this.baseUrl}/assignCandidate`, this.mapping, { responseType: 'text' })
      .subscribe(
        () => {
          alert('Candidate mapped successfully');
          this.showMapForm = false;
          this.mapping = { candidateId: '', electionId: '', constId: '' };
        },
        (error) => console.error('Error mapping candidate:', error)
      );
  }

  // 🔍 AJAX search calls now use service
  onCandidateSearch() {
    if (this.candidateSearch.length >= 3) {
      this.searchService.searchCandidates(this.candidateSearch)
        .subscribe(
          data => this.filteredCandidates = data,
          error => console.error('Error searching candidates:', error)
        );
    } else {
      this.filteredCandidates = [];
    }
  }

  selectCandidate(candidate: any) {
    this.mapping.candidateId = candidate.candId;
    this.candidateSearch = candidate.name;
    this.filteredCandidates = [];
  }

  onElectionSearch() {
    if (this.electionSearch.length >= 3) {
      this.searchService.searchElections(this.electionSearch)
        .subscribe(
          data => this.filteredElections = data,
          error => console.error('Error searching elections:', error)
        );
    } else {
      this.filteredElections = [];
    }
  }

  selectElection(election: any) {
    this.mapping.electionId = election.elecId;
    this.electionSearch = election.title;
    this.filteredElections = [];
  }

  onConstituencySearch() {
    if (this.constituencySearch.length >= 3) {
      this.searchService.searchConstituencies(this.constituencySearch)
        .subscribe(
          data => this.filteredConstituencies = data,
          error => console.error('Error searching constituencies:', error)
        );
    } else {
      this.filteredConstituencies = [];
    }
  }

  selectConstituency(cons: any) {
    this.mapping.constId = cons.constId; // use string field
    this.constituencySearch = cons.name;
    this.filteredConstituencies = [];
  }

  searchCandidatesByFilters() {
    if (!this.mapping.electionId || !this.mapping.constId) {
      alert("Please select both election and constituency");
      return;
    }

    this.searchService.searchCandidatesByFilters(this.mapping.electionId, this.mapping.constId)
      .subscribe(
        data => this.candidates = data,
        error => console.error('Error searching candidates by filters:', error)
      );
  }

  deleteCandidateMapping(candidate: any) {
    if (!this.mapping.electionId || !this.mapping.constId) {
      alert("Please select election and constituency first");
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete ${candidate.name} from this constituency?`);
    if (!confirmDelete) return;

    const params = {
      candidateId: candidate.candId,
      electionId: this.mapping.electionId,
      constId: this.mapping.constId
    };

    this.http.post(`${this.baseUrl}/deleteCandidateMapping`, params, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert('Candidate mapping deleted successfully');
          // Refresh candidate list after deletion
          this.searchCandidatesByFilters();
        },
        error: (err) => console.error('Error deleting candidate mapping:', err)
      });
  }



}
