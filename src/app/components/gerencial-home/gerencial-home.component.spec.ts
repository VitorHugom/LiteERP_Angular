import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerencialHomeComponent } from './gerencial-home.component';

describe('GerencialHomeComponent', () => {
  let component: GerencialHomeComponent;
  let fixture: ComponentFixture<GerencialHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerencialHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerencialHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
