import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-constituencies',
  templateUrl: './constituencies.component.html',
  styleUrls: ['./constituencies.component.css']
})
export class ConstituenciesComponent {
  showAddForm = false;
  showUpdateDeleteForm = false;

  newConstituency: any = { electionType: null };
  electionTypeId: number | null = null;
  electionTypes: any[] = [];

  matchingConstituencies: any[] = [];
  selectedConstituency: any = null;

  searchTerm: string = '';
  searchedConstituency: any = null;

  selectedElectionTypeId: number | null = null;

  private baseUrl = 'https://voter-appbackend-production.up.railway.app';

  constructor(private http: HttpClient,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.showUpdateDeleteForm = false;
      this.loadElectionTypes();
    }
  }

  toggleUpdateDeleteForm() {
    this.showUpdateDeleteForm = !this.showUpdateDeleteForm;
    if (this.showUpdateDeleteForm) {
      this.showAddForm = false;
      this.loadElectionTypes();
    }
  }

  loadElectionTypes() {
    this.http.get<any[]>(`${this.baseUrl}/getAllElectionTypes`).subscribe(
      data => this.electionTypes = data,
      error => console.error('Error fetching election types', error)
    );
  }

  addConstituency() {
    if (!this.electionTypeId) {
      alert('Please select Election Type');
      return;
    }
    const payload = { ...this.newConstituency, electionType: { electionTypeId: +this.electionTypeId } };
    this.http.post(`${this.baseUrl}/addConstituency`, payload, { responseType: 'text' }).subscribe(
      () => {
        alert('Constituency added successfully');
        this.newConstituency = { electionType: null };
        this.electionTypeId = null;
        this.showAddForm = false;
      },
      error => {
        alert('Error: ' + error.error); // shows "Constituency with same district, state, and election type already exists"
      }
    );
  }

  onSearchTermChange() {
    this.selectedConstituency = null;
    this.searchedConstituency = null;

    if (this.searchTerm.length >= 3) {
      this.http.get<any[]>(`${this.baseUrl}/searchConstituencyByName?name=${this.searchTerm}`)
        .subscribe(
          data => this.matchingConstituencies = data,
          error => console.error(error)
        );
    } else {
      this.matchingConstituencies = [];
    }
  }

  selectConstituency(c: any) {
    this.selectedConstituency = c;
    this.searchTerm = c.name;
    this.matchingConstituencies = [];
  }

  searchConstituency() {
    if (!this.selectedConstituency) return;
    const constId = this.selectedConstituency.constId;

    this.http.get<any>(`${this.baseUrl}/getConstituencyById?id=${constId}`)
      .subscribe(data => {
        this.searchedConstituency = data;
        this.selectedElectionTypeId = data.electionType?.et_id || null;
      });
  }
  updateConstituency() {
    if (!this.selectedElectionTypeId) {
      alert('Please select an Election Type');
      return;
    }

    // Send only minimal electionType object with et_id
    this.searchedConstituency.electionType = { et_id: this.selectedElectionTypeId };

    this.http.put(`${this.baseUrl}/updateConstituency`, this.searchedConstituency, { responseType: 'text' })
      .subscribe(() => {
        alert('Constituency updated successfully');
        this.searchTerm = ''; this.searchTerm = '';
        this.searchedConstituency = null;
        this.selectedConstituency = null;
        this.selectedElectionTypeId = null;

        // Close the update/delete form
        this.showUpdateDeleteForm = false;
      }, error => console.error(error));
  }



  deleteConstituency() {
    if (!this.searchedConstituency) return;

    this.http.delete(`${this.baseUrl}/deleteConstituency/${this.searchedConstituency.constId}`, { responseType: 'text' })
      .subscribe(() => {
        alert('Constituency deleted successfully');

        // Reset fields and close form
        this.searchedConstituency = null;
        this.searchTerm = '';
        this.selectedConstituency = null;
        this.selectedElectionTypeId = null;
        this.showUpdateDeleteForm = false;

      }, error => console.error(error));
  }

}
