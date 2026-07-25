import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-election',
  templateUrl: './election.component.html',
  styleUrls: ['./election.component.css']
})
export class ElectionComponent implements OnInit {
  baseUrl = 'http://localhost:8080';

  showActivateForm = false;
  showAddElectionType: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];

  electionTypes: ElectionType[] = [];

  // Add Election model
  newElection: any = {
    title: '',
    startDate: '',
    endDate: '',
    status: 'Active',   // default value to avoid empty string
    electionType: {
      et_id: 0
    }
  };

  showActivateElectionForm = false;
  elections: any[] = [];        // fetched from backend
  constituencies: any[] = [];   // fetched from backend

  activationData: any = {
    electionId: '',
    election: null,
    date: '',
    status: 'Active',
    constituencies: []
  };

  showEditElectionForm = false;
  searchTerm: string = '';
  editElection: any = null;

  private hideAllForms() {
    this.showAddElectionType = false;
    this.showActivateForm = false;
    this.showActivateElectionForm = false;
    this.showEditElectionForm = false;
  }

  searchResults: any[] = [];
  selectedSearchElection: any = null;
  selectedElection: any = null;

  constructor(private http: HttpClient,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {     // ✅ Correct signature
    this.loadElectionTypes();
  }

  loadElectionTypes() {
    this.http.get<ElectionType[]>(`${this.baseUrl}/getAllElectionTypes`)
      .subscribe({
        next: (data) => {
          this.electionTypes = data;
        },
        error: (err) => {
          console.error('Failed to load election types', err);
        }
      });
  }

  loadElections() {
    this.http.get<any[]>(`${this.baseUrl}/getAllActiveElections`)
      .subscribe({
        next: (data) => this.elections = data,
        error: (err) => console.error('Failed to load elections', err)
      });
  }

  onElectionSelect(selectedElection: any) {
    this.selectedElection = selectedElection;
    this.activationData.electionId = selectedElection.elecId;

    if (selectedElection && selectedElection.electionType) {
      const etId = selectedElection.electionType.et_id;
      this.loadConstituenciesByType(etId);
    }
  }
  // Fetch constituencies from backend
  loadConstituenciesByType(etId: number) {
    this.http.get<any[]>(`${this.baseUrl}/constituencies/byElectionType/${etId}`)
      .subscribe({
        next: (data) => {
          this.constituencies = data;
          console.log("Constituencies loaded:", data);
        },
        error: (err) => {
          console.error("Failed to load constituencies", err);
        }
      });
  }


  // Add Election Type
  newElectionType: ElectionType = {
    et_id: 0,              // Backend will auto-generate
    electionTypeId: 0,
    name: ''
  };

  toggleElectionType() {
    this.showAddElectionType = !this.showAddElectionType;
    if (this.showAddElectionType) {
      this.showActivateForm = false; // hide the other form
    }
    this.hideAllForms();
    this.showAddElectionType = true;
  }

  toggleElection() {
    this.showActivateForm = !this.showActivateForm;
    if (this.showActivateForm) {
      this.showAddElectionType = false; // hide the other form
    }
    this.hideAllForms();
    this.showActivateForm = true;
  }

  toggleActivateElection() {
    this.showActivateElectionForm = !this.showActivateElectionForm;
    if (this.showActivateElectionForm) {
      this.showActivateForm = false;
      this.showAddElectionType = false;
      this.loadElections();
    }
    this.hideAllForms();
    this.showActivateElectionForm = true;
  }

  toggleEditElection() {
    this.hideAllForms();
    this.showEditElectionForm = true;
  }

  addElectionType() {
    this.http.post(`${this.baseUrl}/addElectionType`, this.newElectionType, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Election Type added successfully', response);
          alert('Election Type saved!');
          this.resetForm();
        },
        error: (err) => {
          console.error('Error adding Election Type', err);
          alert('Failed to save Election Type.');
        }
      });
  }

  resetForm() {
    this.newElectionType = { et_id: 0, electionTypeId: 0, name: '' };
    this.showAddElectionType = false;
  }

  addElection() {
    const today = new Date();
    const startDate = new Date(this.newElection.startDate);
    const endDate = new Date(this.newElection.endDate);

    // Compare timestamps
    if (startDate.getTime() < today.setHours(0, 0, 0, 0)) {
      alert("Start Date must be today or later.");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      alert("End Date must be greater than Start Date.");
      return;
    }

    // API call
    this.http.post(`${this.baseUrl}/addElection`, this.newElection, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log(response);
          alert('Election saved successfully!');
          this.resetElectionForm();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to save election.');
        }
      });
  }

  resetElectionForm() {
    this.newElection = {
      title: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      electionType: {
        et_id: 0
      }
    };
    this.showActivateForm = false;
  }

  // Activate Election
  activateElection() {
    if (!this.selectedElection) {
      alert("Please select an election first.");
      return;
    }

    const activationDate = new Date(this.activationData.date);
    const startDate = new Date(this.selectedElection.startDate);
    const endDate = new Date(this.selectedElection.endDate);

    // Check if activation date is within start and end dates
    if (activationDate.getTime() < startDate.getTime() || activationDate.getTime() > endDate.getTime()) {
      alert(`Activation date must be between ${this.selectedElection.startDate} and ${this.selectedElection.endDate}`);
      return;
    }

    // Proceed with API call
    this.http.post(`${this.baseUrl}/activateElection`, this.activationData, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert('Election activated successfully!');
          console.log(res);
          this.resetActivateForm();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to activate election.');
        }
      });
  }

  resetActivateForm() {
    this.activationData = { electionId: '', date: '', status: 'Active', constituencies: [] };
    this.showActivateElectionForm = false;
  }

  onSearchChange() {
    if (this.searchTerm.length >= 3) {
      this.searchElection();
    } else {
      this.editElection = null;
    }
  }

  searchElection() {
    this.http.get<any[]>(`${this.baseUrl}/elections/${this.searchTerm}`)
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          if (data.length === 0) {
            alert("No elections found");
          }
        },
        error: (err) => {
          console.error("Search failed", err);
          alert("Error while searching election");
        }
      });
  }

  loadElectionDetails() {
    if (!this.selectedSearchElection) {
      alert("Please select an election");
      return;
    }

    this.editElection = JSON.parse(JSON.stringify(this.selectedSearchElection));
  }

  updateElection() {
    this.http.put(`${this.baseUrl}/updateElection/${this.editElection.elecId}`, this.editElection, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert("Election updated successfully!");
          console.log(res);
          this.editElection = null;
          this.showEditElectionForm = false;
        },
        error: (err) => {
          console.error(err);
          alert("Failed to update election.");
        }
      });
  }

}

export interface ElectionType {
  et_id: number;
  electionTypeId: number;
  name: string;
}
