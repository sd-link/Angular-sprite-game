import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RocketMessageComponent } from './rocket-message.component';

describe('RocketMessageComponent', () => {
  let component: RocketMessageComponent;
  let fixture: ComponentFixture<RocketMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RocketMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RocketMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
