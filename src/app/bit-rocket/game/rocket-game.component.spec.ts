import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RocketGameComponent } from './rocket-game.component';

describe('RocketGameComponent', () => {
  let component: RocketGameComponent;
  let fixture: ComponentFixture<RocketGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RocketGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RocketGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
