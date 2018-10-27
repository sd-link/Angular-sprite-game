import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RocketBackgroundComponent } from './rocket-background.component';

describe('RocketBackgroundComponent', () => {
  let component: RocketBackgroundComponent;
  let fixture: ComponentFixture<RocketBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RocketBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RocketBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
