import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatelogindashboardComponent } from './candidatelogindashboard.component';

describe('CandidatelogindashboardComponent', () => {
  let component: CandidatelogindashboardComponent;
  let fixture: ComponentFixture<CandidatelogindashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidatelogindashboardComponent]
    });
    fixture = TestBed.createComponent(CandidatelogindashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
