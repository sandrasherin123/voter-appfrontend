import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateDashboardComponent } from './candidate-dashboard.component';

describe('CandidateDashboardComponent', () => {
  let component: CandidateDashboardComponent;
  let fixture: ComponentFixture<CandidateDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidateDashboardComponent]
    });
    fixture = TestBed.createComponent(CandidateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
