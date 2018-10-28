import { TestBed, inject } from '@angular/core/testing';

import { SlotService } from './slot.service';

describe('SlotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlotService]
    });
  });

  it('should be created', inject([SlotService], (service: SlotService) => {
    expect(service).toBeTruthy();
  }));
});
