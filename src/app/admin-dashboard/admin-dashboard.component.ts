import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  constructor(private router: Router,
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }

  navigateTo(section: string) {
    switch (section) {
      case 'election':
        this.router.navigate(['/admin/election']);
        break;
      case 'voters':
        this.router.navigate(['/admin/voters']);
        break;
      case 'candidates':
        this.router.navigate(['/admin/candidates']);
        break;
      case 'constituencies':
        this.router.navigate(['/admin/constituencies']);
        break;
      case 'results':
        this.router.navigate(['/admin/results']);
        break;
      case 'reports':
        this.router.navigate(['/admin/reports']);
        break;
      default:
        console.error('Unknown section:', section);
    }
  }

}
