import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaixaHomeComponent } from './caixa-home.component';

describe('CaixaHomeComponent', () => {
  let component: CaixaHomeComponent;
  let fixture: ComponentFixture<CaixaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaixaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
