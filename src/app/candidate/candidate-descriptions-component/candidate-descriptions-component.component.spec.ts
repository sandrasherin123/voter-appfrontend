import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateDescriptionsComponentComponent } from './candidate-descriptions-component.component';

describe('CandidateDescriptionsComponentComponent', () => {
  let component: CandidateDescriptionsComponentComponent;
  let fixture: ComponentFixture<CandidateDescriptionsComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CandidateDescriptionsComponentComponent]
    });
    fixture = TestBed.createComponent(CandidateDescriptionsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
