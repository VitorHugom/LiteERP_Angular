import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaLiberacaoComponent } from './busca-liberacao.component';

describe('BuscaLiberacaoComponent', () => {
  let component: BuscaLiberacaoComponent;
  let fixture: ComponentFixture<BuscaLiberacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscaLiberacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscaLiberacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
