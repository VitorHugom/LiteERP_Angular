import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendasHomeComponent } from './vendas-home.component';

describe('VendasHomeComponent', () => {
  let component: VendasHomeComponent;
  let fixture: ComponentFixture<VendasHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendasHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendasHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
