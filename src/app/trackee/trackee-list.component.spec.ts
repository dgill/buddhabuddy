import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackeeListComponent } from './trackee-list.component';

describe('TrackeeComponent', () => {
  let component: TrackeeListComponent;
  let fixture: ComponentFixture<TrackeeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackeeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
