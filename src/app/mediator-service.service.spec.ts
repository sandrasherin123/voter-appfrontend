import { TestBed } from '@angular/core/testing';

import { MediatorServiceService } from './mediator-service.service';

describe('MediatorServiceService', () => {
  let service: MediatorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediatorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
