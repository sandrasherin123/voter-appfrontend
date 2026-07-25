import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-candidate-descriptions-component',
  templateUrl: './candidate-descriptions-component.component.html',
  styleUrls: ['./candidate-descriptions-component.component.css']
})
export class CandidateDescriptionsComponentComponent implements OnInit {
  constituencyId!: number;
  descriptions: any[] = [];

  constructor(private route: ActivatedRoute,
    private searchService: SearchService,
    private location: Location) { }
  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    // ✅ read constituencyId from URL
    this.route.params.subscribe(params => {
      this.constituencyId = +params['constId'];
      this.loadDescriptions();
    });
  }

  loadDescriptions(): void {
    this.searchService.getDescriptionsByConstituency(this.constituencyId)
      .subscribe({
        next: (data) => {
          this.descriptions = data;
        },
        error: (err) => {
          console.error('Error loading descriptions', err);
        }
      });
  }

}
