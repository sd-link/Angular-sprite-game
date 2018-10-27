import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BitRocketComponent } from './bit-rocket.component';

describe('BitRocketComponent', () => {
  let component: BitRocketComponent;
  let fixture: ComponentFixture<BitRocketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BitRocketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BitRocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
