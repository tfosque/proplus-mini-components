import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsoFastnersComponent } from './iso-fastners.component';

describe('IsoFastnersComponent', () => {
  let component: IsoFastnersComponent;
  let fixture: ComponentFixture<IsoFastnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsoFastnersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsoFastnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
