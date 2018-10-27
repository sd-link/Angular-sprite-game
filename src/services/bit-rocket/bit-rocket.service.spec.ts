import { TestBed, inject } from '@angular/core/testing';

import { BitRocketService } from './bit-rocket.service';

describe('BitRocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BitRocketService]
    });
  });

  it('should be created', inject([BitRocketService], (service: BitRocketService) => {
    expect(service).toBeTruthy();
  }));
});
