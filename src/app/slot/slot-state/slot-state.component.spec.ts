import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotStateComponent } from './slot-state.component';

describe('SlotStateComponent', () => {
  let component: SlotStateComponent;
  let fixture: ComponentFixture<SlotStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
