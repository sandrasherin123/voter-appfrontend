import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstituenciesComponent } from './constituencies.component';

describe('ConstituenciesComponent', () => {
  let component: ConstituenciesComponent;
  let fixture: ComponentFixture<ConstituenciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConstituenciesComponent]
    });
    fixture = TestBed.createComponent(ConstituenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
