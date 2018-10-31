import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoComponent } from './casino.component';

describe('CasinoComponent', () => {
  let component: CasinoComponent;
  let fixture: ComponentFixture<CasinoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasinoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
